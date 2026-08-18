const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AQ.Ab8RN6K2jdTHz3CF2PX6w4a57h7sZ9BEJGOiPCQNwgdPs_QHJA');

async function main() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello in Arabic');
    console.log('Gemini Response:', result.response.text());
  } catch (err) {
    console.error('Error with Gemini call:', err);
  }
}

main();
