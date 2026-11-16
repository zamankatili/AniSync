import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Feed maliyet kilidi.
 *
 * `forumPosts` bir dönem limitsiz dinleniyordu: her istemci tüm koleksiyonu
 * ilk yüklemede ve her değişimde okuyordu. Bu test, canlı dinleyicinin
 * sayfa boyutuyla sınırlı kaldığını ve eski sayfaların `startAfter` ile
 * istendiğini doğrular.
 */
const source = readFileSync(resolve(process.cwd(), 'src/context/AppStore.tsx'), 'utf8');
const compact = source.replace(/\s+/g, ' ');

describe('forum feed pagination', () => {
  it('caps the live listener with a page size', () => {
    expect(compact).toContain(
      "collection(db, 'forumPosts'), orderBy('createdAt', 'desc'), limit(FORUM_PAGE_SIZE)",
    );
  });

  it('does not leave an unbounded forumPosts listener behind', () => {
    expect(
      compact.match(/query\(collection\(db, 'forumPosts'\), orderBy\('createdAt', 'desc'\)\)/),
    ).toBeNull();
  });

  it('loads older posts with startAfter + getDocs', () => {
    expect(compact).toContain('startAfter(cursor)');
    expect(compact).toContain('const snapshot = await getDocs(pageQuery)');
  });

  it('exposes hasMore and loading state to the feed UIs', () => {
    expect(compact).toContain('forumPosts, forumHasMore, forumMoreLoading, loadMoreForumPosts');
  });
});
