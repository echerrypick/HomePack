async function testDirectly() {
  const postcode = 'DE723UA';
  const normalizedPostcode = postcode.toUpperCase().replace(/\s+/g, '');
  console.log(`Testing Ofcom Direct for ${normalizedPostcode}...`);
  
  const response = await fetch(`https://checker.ofcom.org.uk/api/get-broadband-coverage/${normalizedPostcode}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "application/json",
      "Referer": "https://checker.ofcom.org.uk/en-gb/broadband-coverage"
    }
  });
  
  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Response:', text.substring(0, 1000));
}

testDirectly();
