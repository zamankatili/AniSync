/**
 * Kozmik sohbet odaları — resmi + topluluk odaları.
 *
 * Kurallar (istemcide + Firestore rules'da birlikte uygulanır):
 * - Resmi odalar kodda tanımlıdır: herkes okur/yazar.
 * - Kalfa ve üzeri (>= 500 karma / Lv5) doğrudan oda açabilir.
 *   Her oda yine AI moderasyon filtresinden geçer; uygunsuzsa oylamaya/reddeye düşer.
 * - 500 XP altı herkes "oda isteği" açabilir: 50 oy + moderatör onayı gerekir.
 * - Moderatör/admin istekleri görür, onaylar veya reddeder.
 */
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  limit,
  query,
  orderBy,
  where,
  serverTimestamp,
  runTransaction,
  arrayUnion,
  updateDoc,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';
import { apiUrl } from './apiBase';
import { computeOtakuLevel } from './otakuLevel';
import { useQuizStore } from '../store/useQuizStore';
import type { WatchlistItem } from '../types';

/** Doğrudan oda açma eşiği — Kalfa (Lv5) ≈ 500 XP. */
export const DIRECT_ROOM_MIN_XP = 500;
/** İstek odalarının açılması için gereken oy sayısı. */
export const ROOM_VOTE_THRESHOLD = 50;

export interface OfficialRoom {
  id: string;
  name: string;
  topic: string;
  icon: string;
  badge: string;
  isOfficial: true;
}

export interface CommunityRoom {
  id: string;
  name: string;
  topic: string;
  icon: string;
  createdAt?: Timestamp | null;
  createdBy: { uid: string; name: string };
  karmaAtCreation?: number;
  source?: 'direct' | 'approved';
  isOfficial: false;
}

export const OFFICIAL_ROOMS: OfficialRoom[] = [
  { id: 'genel', name: 'genel-sohbet', topic: 'Anime dünyası, öneriler ve günlük geyik', icon: '💬', badge: 'ANA ODA', isOfficial: true },
  { id: 'haftalik-spoiler', name: 'haftalik-spoiler', topic: 'Yeni çıkan bölümler, mangalar ve teoriler', icon: '🍿', badge: 'SPOILER', isOfficial: true },
  { id: 'one-piece-spoiler', name: 'one-piece-spoiler', topic: 'One Piece: manhwa, bölümler, sikiyet, spoiler', icon: '⚓', badge: 'ONE PIECE SPOILER', isOfficial: true },
  { id: 'bolum-odasi', name: 'bolum-odasi', topic: 'Bu haftanın bölümleri — canlı sohbet, hızlı paylaşım', icon: '📺', badge: 'BÖLÜM', isOfficial: true },
  { id: 'muzik', name: 'muzik-ve-lofi', topic: 'Anime OST, radyo şarkıları ve favori açılışlar', icon: '🎧', badge: 'OST & LOFI', isOfficial: true },
  { id: 'vs-tartisma', name: 'guc-karsilastirma', topic: 'Karakter güç seviyeleri ve vs tartışmaları', icon: '⚔️', badge: 'VS ARENA', isOfficial: true },
  { id: 'etkinlik', name: 'online-etkinlikler', topic: 'Haftalık izleme geceleri ve canlı topluluk sohbeti', icon: '🎉', badge: 'CANLI ETKİNLİK', isOfficial: true },
];

export type RoomStatus = 'pending' | 'approved' | 'rejected';
export type AiVerdict = 'ok' | 'flagged';

export interface RoomRequest {
  id: string;
  name: string;
  topic: string;
  icon: string;
  status: RoomStatus;
  requestedBy: { uid: string; name: string; karma: number };
  votes: number;
  voters: string[];
  createdAt?: Timestamp;
  aiVerdict: AiVerdict;
  aiReason: string;
  modNote?: string;
}

export const roomsDb = db;

/** Kullanıcının güncel karma/XP'si (quiz puanı dahil) — tek yerden hesaplanır. */
export const computeUserKarma = (watchlist: WatchlistItem[]): number => {
  const { arcadeHighScore, dailyStreak } = useQuizStore.getState();
  return computeOtakuLevel(watchlist, arcadeHighScore > 0 || dailyStreak > 0, arcadeHighScore).karma;
};

export const isDirectRoomEligible = (karma: number): boolean => karma >= DIRECT_ROOM_MIN_XP;

/** Kalfa (Lv5) ve üzeriyse true; değilse false. İstek açılmalı. */
export const roomEligibility = (karma: number) => ({
  canDirectCreate: isDirectRoomEligible(karma),
});

export interface ModerationResult {
  ok: boolean;
  verdict: AiVerdict;
  reason: string;
}

/** AI moderasyon filtresine sorar; key yoksa AI unavailable olarak işaretler. */
export async function moderateRoomProposal(name: string, topic: string): Promise<ModerationResult> {
  try {
    const token = await auth?.currentUser?.getIdToken();
    if (!token) {
      // Giriş zorunlu — moderasyona gidemeyiz; yine de pending'e düşeriz, admin görür.
      return { ok: false, verdict: 'flagged', reason: 'unauthenticated' };
    }
    const res = await fetch(apiUrl('/api/moderate-room'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, topic }),
    });
    if (!res.ok) {
      // AI ulaşılamadı — direkt onay verme; manuel incelemeye düşer.
      return { ok: false, verdict: 'flagged', reason: `ai-${res.status}` };
    }
    const data = await res.json();
    return {
      ok: data.ok === true,
      verdict: data.ok === true ? 'ok' : 'flagged',
      reason: typeof data.reason === 'string' ? data.reason.slice(0, 180) : 'no-reason',
    };
  } catch {
    return { ok: false, verdict: 'flagged', reason: 'ai-unavailable' };
  }
}

/** Doğrudan oda açma (Kalfa+) — yine moderasyondan geçer. */
export async function createRoomDirect(
  name: string,
  topic: string,
  icon: string,
  createdBy: { uid: string; name: string },
  karmaAtCreation: number,
): Promise<string> {
  const ref = await addDoc(collection(roomsDb, 'chatRooms'), {
    name,
    topic,
    icon,
    createdAt: serverTimestamp(),
    createdBy,
    karmaAtCreation,
    source: 'direct',
  });
  return ref.id;
}

/** Oda isteği aç — herkes açabilir; 50 oy + moderatör onayı gerekir. */
export async function submitRoomRequest(
  name: string,
  topic: string,
  icon: string,
  requestedBy: { uid: string; name: string; karma: number },
  verdict: AiVerdict,
  reason: string,
): Promise<string> {
  const ref = await addDoc(collection(roomsDb, 'roomRequests'), {
    name,
    topic,
    icon,
    requestedBy,
    status: 'pending',
    votes: 0,
    voters: [],
    createdAt: serverTimestamp(),
    aiVerdict: verdict,
    aiReason: reason,
    modNote: '',
  });
  return ref.id;
}

/** Oy kullanır; sonucu numaralı döner: 'ok' | 'voted' | 'closed' | 'missing'. */
export async function voteForRoomRequest(requestId: string, uid: string): Promise<string> {
  const ref = doc(roomsDb, 'roomRequests', requestId);
  return runTransaction(roomsDb, async (txn) => {
    const snap = await txn.get(ref);
    if (!snap.exists()) return 'missing';
    const data = snap.data() as RoomRequest;
    if (data.status !== 'pending') return 'closed';
    if ((data.voters ?? []).includes(uid)) return 'voted';
    txn.update(ref, { voters: arrayUnion(uid), votes: (data.votes ?? 0) + 1 });
    return 'ok';
  });
}

/** Moderatör/admin: isteği onaylar → gerçek oda oluşur, istek approved olur. */
export async function approveRoomRequest(request: RoomRequest, moderatorUid: string, modNote = ''): Promise<string> {
  const batch = writeBatch(roomsDb);
  const roomRef = doc(roomsDb, 'chatRooms', `${request.id}`);
  batch.set(roomRef, {
    name: request.name,
    topic: request.topic,
    icon: request.icon,
    createdAt: serverTimestamp(),
    createdBy: { uid: request.requestedBy.uid, name: request.requestedBy.name },
    karmaAtCreation: request.requestedBy.karma,
    source: 'approved',
  });
  batch.update(doc(roomsDb, 'roomRequests', request.id), {
    status: 'approved',
    modNote,
    approvedBy: moderatorUid,
    approvedAt: serverTimestamp(),
  });
  await batch.commit();
  return roomRef.id;
}

/** Moderatör/admin: isteği reddeder. */
export async function rejectRoomRequest(requestId: string, moderatorUid: string, modNote = ''): Promise<void> {
  await updateDoc(doc(roomsDb, 'roomRequests', requestId), {
    status: 'rejected',
    modNote,
    rejectedBy: moderatorUid,
  });
}
