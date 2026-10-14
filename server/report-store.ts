import { FieldPath, Timestamp } from 'firebase-admin/firestore';
import { database } from './billing';
import { decodeReport, encodeReport, reportIdFor } from './report-codec';

const reports = (uid: string) => database().collection('users').doc(uid).collection('reports');
const jobs = (uid: string) => database().collection('users').doc(uid).collection('reportJobs');
export async function saveReport(uid: string, job: any) {
  const id = reportIdFor(job.address, job.planningScope || 'street');
  const ref = reports(uid).doc(id);
  const encoded = encodeReport(job.result);
  const { houseNumber = '', street = '', town = '', postcode } = job.address;
  const address = { houseNumber, street, town, postcode };
  const summary = { id, address, addressString: `${houseNumber} ${street}, ${town}, ${postcode}`.trim(), completedAt: job.completedAt, hash: encoded.hash, chunkCount: encoded.chunks.length, storedBytes: encoded.storedBytes, rawBytes: encoded.rawBytes, schema: 1, planningScope: job.planningScope || 'street' };
  await database().runTransaction(async transaction => {
    const previous = await transaction.get(ref);
    const old = previous.data();
    // A slower, older generation must not overwrite a newer report.
    if (old && old.completedAt > summary.completedAt) return;
    if (old?.hash !== encoded.hash) {
      encoded.chunks.forEach((bytes, index) => transaction.set(ref.collection('reportChunks').doc(String(index)), { bytes }));
      for (let i = encoded.chunks.length; i < (old?.chunkCount || 0); i++) transaction.delete(ref.collection('reportChunks').doc(String(i)));
    }
    transaction.set(ref, summary);
  });
  return summary;
}
export async function listReports(uid: string, cursor?: { at: number; id: string }) {
  let query = reports(uid).orderBy('completedAt', 'desc').orderBy(FieldPath.documentId(), 'desc').limit(20);
  if (cursor) query = query.startAfter(cursor.at, cursor.id);
  const page = await query.get();
  const items = page.docs.map(doc => { const { chunkCount, rawBytes, storedBytes, schema, ...summary } = doc.data(); return summary; });
  const last = items.at(-1);
  return { reports: items, nextCursor: page.size === 20 && last ? { at: last.completedAt, id: last.id } : null };
}
export async function readReport(uid: string, id: string) {
  const ref = reports(uid).doc(id);
  // One consistent snapshot prevents mixing old/new chunks during regeneration.
  return database().runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const summary = snapshot.data();
    if (!summary) return null;
    const chunks = await transaction.getAll(...Array.from({ length: summary.chunkCount }, (_, i) => ref.collection('reportChunks').doc(String(i))));
    return { address: summary.address, result: decodeReport(chunks.map(doc => doc.get('bytes')), summary.hash), hash: summary.hash };
  }, { readOnly: true });
}
export async function saveJob(uid: string, job: any, reportId?: string) {
  const { result, ...state } = job;
  await jobs(uid).doc(job.id).set({ ...state, expiresAt: Timestamp.fromMillis(Date.now() + 7 * 86400_000), ...(reportId ? { reportId } : {}) });
}
export async function readJob(uid: string, id: string) {
  const snapshot = await jobs(uid).doc(id).get();
  const job = snapshot.data();
  if (!job) return null;
  if (job.status === 'completed' && job.reportId) {
    const saved = await readReport(uid, job.reportId);
    if (!saved) throw new Error('Saved report is unavailable. Please contact support.');
    return { ...job, reportHash: saved.hash, result: saved.result };
  }
  if (job.status === 'processing' && Date.now() - job.createdAt > 10 * 60_000) {
    // Persisted checkpoints survive restart. An abandoned job is retryable, never falsely complete.
    const failed = { ...job, status: 'failed', error: 'Generation was interrupted. Please retry this property; no additional payment is needed.', updatedAt: Date.now() };
    await jobs(uid).doc(id).set(failed);
    return failed;
  }
  return job;
}

// Billing-disabled projects cannot enable Firestore TTL. Keep cleanup bounded and indexed.
export async function cleanupExpiredJobs(now = Date.now()) {
  let removed = 0;
  for (let page = 0; page < 10; page++) {
    const expired = await database().collectionGroup('reportJobs')
      .where('expiresAt', '<=', Timestamp.fromMillis(now)).orderBy('expiresAt').limit(100).get();
    if (expired.empty) break;
    const batch = database().batch();
    for (const doc of expired.docs) {
      if (!/^users\/[^/]+\/reportJobs\/[^/]+$/.test(doc.ref.path)) throw new Error('Unexpected job cleanup path.');
      batch.delete(doc.ref);
    }
    await batch.commit();
    removed += expired.size;
    if (expired.size < 100) break;
  }
  return removed;
}
