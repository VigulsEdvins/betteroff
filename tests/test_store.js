const assert = require('assert');
const storeModule = require('../site-data.js');

const { TLB_DEFAULT_DATA, TLB_MEDIA_LIBRARY, TLBStore } = storeModule;

console.log('Testing site-data.js...');

// 1. Data Structure Integrity
assert(TLB_DEFAULT_DATA, 'TLB_DEFAULT_DATA must exist');
assert(TLB_DEFAULT_DATA.meta, 'meta must exist');
assert.strictEqual(TLB_DEFAULT_DATA.meta.siteTitle, 'THE LOOKBACK — Better Off®');
assert(Array.isArray(TLB_DEFAULT_DATA.tracks), 'tracks must be an array');
assert.strictEqual(TLB_DEFAULT_DATA.tracks.length, 15, 'must have 15 tracks');
assert(Array.isArray(TLB_DEFAULT_DATA.articles), 'articles must be an array');
assert.strictEqual(TLB_DEFAULT_DATA.articles.length, 81, 'must have 81 articles');
assert(TLB_DEFAULT_DATA.about, 'about must exist');
assert.strictEqual(TLB_DEFAULT_DATA.about.pillars.length, 3, 'must have 3 about pillars');

// 2. Media Library Integrity
assert(Array.isArray(TLB_MEDIA_LIBRARY), 'TLB_MEDIA_LIBRARY must be an array');
assert(TLB_MEDIA_LIBRARY.length > 0, 'media library must not be empty');

// 3. TLBStore Methods
const data = TLBStore.get();
assert.strictEqual(data.articles.length, 81);

// Test getArticleBySlug
const art1 = TLBStore.getArticleBySlug('99-cents-only-store-gallery-exhibition');
assert(art1, 'Must find article by slug 99-cents-only-store-gallery-exhibition');
assert.strictEqual(art1.month, 'MARCH');
assert.strictEqual(art1.tag, 'INSPIRE');

// Test addArticle
const newArt = {
  id: 'test_123',
  slug: 'test-article',
  title: 'Test Article Title',
  month: 'APRIL',
  tag: 'SHOWCASE',
  date: '2026-04-15',
  cover: './assets/images/defective-units-vol-1.webp'
};
TLBStore.addArticle(newArt);
const foundNew = TLBStore.getArticleBySlug('test-article');
assert(foundNew, 'Must find newly added article');
assert.strictEqual(foundNew.title, 'Test Article Title');

// Test updateArticle
const updated = TLBStore.updateArticle('test_123', { title: 'Updated Test Title' });
assert.strictEqual(updated, true);
assert.strictEqual(TLBStore.getArticleBySlug('test-article').title, 'Updated Test Title');

// Test deleteArticle
const deleted = TLBStore.deleteArticle('test_123');
assert.strictEqual(deleted, true);
assert.strictEqual(TLBStore.getArticleBySlug('test-article'), null);

// Test JSON export and import
const jsonStr = TLBStore.exportJSON();
assert(typeof jsonStr === 'string');
assert(jsonStr.includes('Better Off®'));

// Reset back to default
TLBStore.reset();
assert.strictEqual(TLBStore.get().articles.length, 81);

console.log('PASS: All 12 unit tests for site-data.js passed successfully!');
