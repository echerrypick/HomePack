import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { database } from '../server/billing';
import { editorialArticles } from '../content/editorial-articles';
import { validateArticleInput } from '../src/lib/articles';

const now = new Date().toISOString();
const publish = process.argv.includes('--publish');
const collection = database().collection('articles');
let created = 0;
let updated = 0;
let skipped = 0;

for (const source of editorialArticles) {
  const validated = validateArticleInput({ ...source, status: publish ? 'published' : source.status });
  if (!validated.input) throw new Error(`${source.slug}: ${validated.error}`);
  const matches = await collection.where('slug', '==', source.slug).limit(1).get();
  const existing = matches.docs[0];
  if (existing?.data().status === 'published' && !publish) {
    console.log(`Skipped published article: ${source.slug}`);
    skipped += 1;
    continue;
  }
  if (existing) {
    await existing.ref.set({
      ...validated.input,
      createdAt: existing.data().createdAt || now,
      createdBy: existing.data().createdBy || 'editorial-import',
      updatedAt: now,
      updatedBy: 'editorial-import',
      ...(publish ? {
        publishedAt: existing.data().publishedAt || now,
        publishedBy: existing.data().publishedBy || 'editorial-import',
      } : {}),
    });
    console.log(`Updated draft: ${source.slug}`);
    updated += 1;
  } else {
    await collection.doc(randomUUID()).create({
      ...validated.input,
      createdAt: now,
      updatedAt: now,
      createdBy: 'editorial-import',
      ...(publish ? { publishedAt: now, publishedBy: 'editorial-import' } : {}),
    });
    console.log(`Created draft: ${source.slug}`);
    created += 1;
  }
}

console.log(`Editorial ${publish ? 'publication' : 'import'} complete: ${created} created, ${updated} updated, ${skipped} published article(s) left unchanged.`);
