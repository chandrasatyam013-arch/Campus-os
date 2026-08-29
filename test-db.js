async function main() {
  console.log('EMAIL_HOST:', !!process.env.EMAIL_HOST);
  console.log('EMAIL_USER:', !!process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD:', !!process.env.EMAIL_PASSWORD);
  console.log('EMAIL_PORT:', !!process.env.EMAIL_PORT);
  console.log('EMAIL_FROM:', !!process.env.EMAIL_FROM);
}
main();
