if (process.env.RUN_FIRESTORE_INTEGRATION !== '1') throw new Error('Set RUN_FIRESTORE_INTEGRATION=1 to run the isolated live Firestore test.');
import {Timestamp} from 'firebase-admin/firestore';
import dotenv from 'dotenv';import assert from 'node:assert/strict';import {randomBytes} from 'node:crypto';import {saveReport,listReports,readReport,saveJob,readJob,cleanupExpiredJobs} from '../../server/report-store';import {database} from '../../server/billing';
dotenv.config({quiet:true});
const uid='__report_storage_test_'+Date.now();const owner=database().collection('users').doc(uid);const address={houseNumber:'12',street:'Example Street',town:'Derby',postcode:'DE1 2AB'};
const job:any={id:'hp_storage_fixture',address,status:'completed',progress:100,currentStep:'Complete',steps:[],planningScope:'street',createdAt:Date.now(),completedAt:Date.now(),updatedAt:Date.now(),result:{propertyData:{address:'12 Example Street',data:'Official property record '.repeat(10000)},summary:'Storage test',logs:['Do not persist diagnostics']}};
try {
 const saved=await saveReport(uid,job);const firstChunk=owner.collection('reports').doc(saved.id).collection('reportChunks').doc('0');const first=(await firstChunk.get()).updateTime;
 const duplicate=await saveReport(uid,{...job,completedAt:job.completedAt+1});assert.equal(duplicate.id,saved.id);assert.ok((await firstChunk.get()).updateTime!.isEqual(first!),'duplicate content must not rewrite payload');
 const reopened=await readReport(uid,saved.id);assert.deepEqual(reopened!.result.propertyData,job.result.propertyData);assert.deepEqual(reopened!.result.logs,[]);assert.equal(await readReport(uid+'_other',saved.id),null);
 // One report per property/scope, even with repeated generation.
 assert.equal((await listReports(uid)).reports.length,1);
 // Verify cursor pagination, including equal completion times.
 await Promise.all(Array.from({length:20},(_,i)=>saveReport(uid,{...job,address:{...address,houseNumber:String(i+100)},completedAt:job.completedAt+2})));
 const page1=await listReports(uid);assert.equal(page1.reports.length,20);assert.ok(!('result' in page1.reports[0]));const page2=await listReports(uid,page1.nextCursor!);assert.equal(page2.reports.length,1);assert.equal(new Set([...page1.reports,...page2.reports].map(x=>x.id)).size,21);
 await saveJob(uid,job,saved.id);assert.equal((await readJob(uid,job.id))!.status,'completed');assert.equal(await readJob(uid+'_other',job.id),null);
 const pending={...job,id:'hp_interrupted_fixture',status:'processing',createdAt:Date.now()-11*60000};await saveJob(uid,pending);assert.equal((await readJob(uid,pending.id))!.status,'failed');
 // Exercise chunk shrinking and cleanup with incompressible synthetic content.
 const large=await saveReport(uid,{...job,completedAt:Date.now()+100,result:{propertyData:{data:randomBytes(1_200_000).toString('base64')},summary:'Large fixture'}});assert.ok(large.chunkCount>1);
 await saveReport(uid,{...job,completedAt:Date.now()+200});assert.equal((await owner.collection('reports').doc(saved.id).collection('reportChunks').get()).size,1);
 await owner.collection('reportJobs').doc(pending.id).update({expiresAt:Timestamp.fromMillis(Date.now()-1000)});
 await cleanupExpiredJobs();
 assert.equal((await owner.collection('reportJobs').doc(pending.id).get()).exists,false);
 assert.equal((await owner.collection('reportJobs').doc(job.id).get()).exists,true);
 assert.equal((await owner.collection('reports').doc(saved.id).get()).exists,true);
 console.log(JSON.stringify({passed:true,compression:{rawBytes:saved.rawBytes,storedBytes:saved.storedBytes},checks:['round trip','payload deduplication','owner isolation','bounded cursor pagination','durable completion','interruption detection','chunk cleanup','expired-job cleanup preserves reports and fresh jobs']}));
} finally {await database().recursiveDelete(owner);await database().terminate();console.log('Removed all temporary storage fixtures.');}
