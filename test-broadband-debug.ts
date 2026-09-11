
import { lookupOfcomBroadband } from './src/lib/ofcomScraper';

async function test() {
  const postcode = 'DE72 3UA';
  const houseNumber = '1';
  const street = 'Main Street';

  console.log('\n--- Testing Ofcom Broadband Debugging ---');
  try {
    const result = await lookupOfcomBroadband(houseNumber, street, postcode);
    console.log('Success:', result.success);
    if (!result.success) console.log('Error:', result.error);
  } catch (e) {
    console.error('Failed:', e);
  }
}

test();
