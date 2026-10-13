import test from 'node:test';
import assert from 'node:assert/strict';
import {membershipAccountType} from '../src/lib/plans';
const now=1000;
test('a retail user cannot gain business classification from a stored account preference',()=>{
 assert.equal(membershipAccountType({role:'free',accountType:'business'},now),'consumer');
});
test('paid membership remains business during scheduled cancellation until expiry',()=>{
 const profile={role:'agency',subscriptionStatus:'active',subscriptionExpiresAt:2000,subscriptionCancelAtPeriodEnd:true,accountType:'consumer'};
 assert.equal(membershipAccountType(profile,now),'business');
 assert.equal(membershipAccountType(profile,2000),'consumer');
});
test('cancelled or unpaid memberships return to retail; property purchases are unaffected',()=>{
 for(const status of ['canceled','past_due','unpaid','incomplete']) assert.equal(membershipAccountType({role:'subscription',subscriptionStatus:status,subscriptionExpiresAt:2000,accountType:'business'},now),'consumer');
});
test('simulated business entitlements are honoured only with an explicit local simulation flag',()=>{
 const profile={role:'free',developmentSubscriptionPlan:'agency',developmentSubscriptionExpiresAt:2000};
 assert.equal(membershipAccountType(profile,now),'consumer');assert.equal(membershipAccountType(profile,now,true),'business');
});
