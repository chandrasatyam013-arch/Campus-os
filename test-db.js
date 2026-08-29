async function main() {
  try {
    const loginRes = await fetch('https://campus-os-pi.vercel.app/api/auth/demo', { method: 'POST' });
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    console.log('--- POST w/ Auth ---');
    const res = await fetch('https://campus-os-pi.vercel.app/api/copilotkit', { 
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] })
    });
    console.log(res.status, await res.text().then(t => t.slice(0, 200)));
  } catch (e) {
    console.error('Error:', e.message);
  }
}
main();
