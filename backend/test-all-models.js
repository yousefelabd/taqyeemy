const models = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-2.5-flash',
  'gemini-pro'
];

async function testAll() {
  for (const m of models) {
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
      });
      const data = await res.json();
      if (res.ok) {
        console.log('SUCCESS with model:', m);
        return;
      } else {
        console.log('FAIL model ' + m + ':', data.error ? data.error.message : res.status);
      }
    } catch (e) {
      console.log('ERR with model ' + m + ':', e.message);
    }
  }
}
testAll();
