
import { lookupOfcomMobile, lookupOfcomBroadband } from './src/lib/ofcomScraper';
import { scrapeCoverage as scrapeSiginfoCoverage } from './src/lib/siginfoScraper';

async function test() {
  const postcode = 'DE72 3UA';
  const houseNumber = '1';
  const street = 'Main Street';

  console.log('--- Testing Siginfo ---');
  try {
    const siginfo = await scrapeSiginfoCoverage(postcode);
    console.log('Siginfo Success:', siginfo.operators.length, 'operators found');
  } catch (e) {
    console.error('Siginfo Failed:', e);
  }

  console.log('\n--- Testing Ofcom Mobile ---');
  try {
    const ofcomMobile = await lookupOfcomMobile(houseNumber, street, postcode);
    console.log('Ofcom Mobile Success:', ofcomMobile.success, ofcomMobile.error || '');
    if (ofcomMobile.mobile) console.log('Providers:', ofcomMobile.mobile.map(p => p.operator).join(', '));
  } catch (e) {
    console.error('Ofcom Mobile Failed:', e);
  }

  console.log('\n--- Testing Ofcom Broadband ---');
  try {
    const ofcomBroadband = await lookupOfcomBroadband(houseNumber, street, postcode);
    console.log('Ofcom Broadband Success:', ofcomBroadband.success, ofcomBroadband.error || '');
    if (ofcomBroadband.broadband) console.log('Speeds:', ofcomBroadband.broadband.map(b => b.type).join(', '));
  } catch (e) {
    console.error('Ofcom Broadband Failed:', e);
  }
}

test();
