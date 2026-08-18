async function check() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=');
  const data = await res.json();
  const generateModels = (data.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent'));
  console.log('Supported generateContent models:');
  generateModels.forEach(m => console.log(m.name));
}
check();
