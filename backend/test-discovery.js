const apiKey = 'AQ.Ab8RN6K2jdTHz3CF2PX6w4a57h7sZ9BEJGOiPCQNwgdPs_QHJA';

const versions = ['v1beta', 'v1'];
const models = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-001',
  'gemini-1.5-flash-002',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-2.5-flash',
  'gemini-pro'
];

async function run() {
  for (const v of versions) {
    for (const m of models) {
      try {
        const url = 'https://generativelanguage.googleapis.com/' + v + '/models/' + m + ':generateContent';
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say hello in one word' }] }]
          })
        });
        const data = await res.json();
        if (res.ok) {
          console.log('SUCCESS with ' + v + ' and ' + m + '!');
          console.log('Response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
          return;
        } else {
          console.log('FAIL ' + v + '/' + m + ' (' + res.status + '): ' + (data.error ? data.error.message.slice(0, 90) : 'unknown'));
        }
      } catch (e) {
        console.log('ERR: ' + e.message);
      }
    }
  }
}

run();
