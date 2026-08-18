const { createClient } = require('@supabase/supabase-js');

const url = 'https://uprsjgttzowqxkkjmbzu.supabase.co';
const anonKey = 'sb_publishable_97lp5EVZ0tK6dTt0JIRuEg_ZhwrWAox';

const client = createClient(url, anonKey);

async function test() {
  console.log('Testing Supabase signInWithPassword latency...');
  const start = Date.now();
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: 'nonexistent_test_123@gmail.com',
      password: 'wrongpassword',
    });
    const elapsed = Date.now() - start;
    console.log('Result in ' + elapsed + 'ms:');
    console.log('Data:', data);
    console.log('Error:', error ? error.message : null);
  } catch (err) {
    console.error('Exception in ' + (Date.now() - start) + 'ms:', err);
  }
}

test();
