import test from 'node:test';import assert from 'node:assert/strict';import {selectBestEpcCertificate as select} from '../server/epc-match';
test('EPC matching never substitutes a single neighbour, range, flat or same-number different street',()=>{
 for(const addressLine1 of ['23 High View Close','21-23 High View Close','Flat 1, 21 High View Close','21 Other Street']) assert.equal(select([{addressLine1}], '21 High View Close'),null);
 assert.equal(select([{addressLine1:'FIRST FLOOR OFFICES',addressLine2:'21 High View Close'}],'21 High View Close'),null);
});
test('matches non-domestic address line two and chooses the latest exact certificate',()=>{
 const a={addressLine2:'21 High View Close',registrationDate:'2016-01-07'},b={addressLine1:'21 HIGH VIEW CLOSE',registrationDate:'2020-01-01'};
 assert.equal(select([a,b],'21 High View Close'),b);assert.equal(select([a],'21 High View Close'),a);
});
