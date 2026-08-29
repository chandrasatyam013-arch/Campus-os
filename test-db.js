async function main() {
  try {
    const res = await fetch('https://campus-os-pi.vercel.app/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'capacitor://localhost' },
      body: JSON.stringify({ email: 'demo@campusos.internal' })
    });
    const text = await res.text();
    console.log(res.status, text);
    console.log('CORS Headers:', res.headers.get('Access-Control-Allow-Origin'));
  } catch (e) {
    console.error('Error:', e.message);
  }
}
main();
