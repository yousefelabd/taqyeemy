const apiKey = 'AQ.Ab8RN6K2jdTHz3CF2PX6w4a57h7sZ9BEJGOiPCQNwgdPs_QHJA';

async function testHeader() {
  console.log('Testing with x-goog-api-key header...');
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello, respond with OK.' }] }]
      })
    });
    const data = await res.json();
    console.log('Header response status:', res.status);
    console.log('Response body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

testHeader();
