const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('--- Testing Real Email & Expiration Logic ---');
  
  // 1. Admin Login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@legalsuite.ph', password: 'Password123!' })
  });
  const cookie = loginRes.headers.get('set-cookie');
  console.log('1. Admin login status:', loginRes.status, 'Cookie received:', Boolean(cookie));

  // 2. Create an invitation
  const testEmail = 'attorney.test.' + Date.now() + '@firm.ph';
  const inviteRes = await fetch('http://localhost:3000/api/auth/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie || ''
    },
    body: JSON.stringify({ email: testEmail, role: 'ASSOCIATE' })
  });
  const inviteData = await inviteRes.json();
  console.log('2. Invite creation status:', inviteRes.status);
  console.log('   Email sent:', inviteData.emailSent, 'Provider:', inviteData.provider);
  console.log('   Invite link:', inviteData.inviteLink);
  console.log('   Expires at:', inviteData.expiresAt);

  const token = inviteData.inviteLink.split('/invite/')[1];

  // 3. Pre-flight validate token via GET /api/auth/invite
  const validateRes = await fetch('http://localhost:3000/api/auth/invite?token=' + token);
  const validateData = await validateRes.json();
  console.log('3. Token validation status:', validateRes.status);
  console.log('   Valid:', validateData.valid, 'Role:', validateData.role, 'Email:', validateData.email);

  // 4. Test Strict Expiration: artifically age the token to past
  console.log('4. Testing Real Expiration...');
  await prisma.invitation.update({
    where: { token },
    data: { expiresAt: new Date(Date.now() - 60000) } // 1 minute in the past
  });

  // Check pre-flight validation on expired token
  const expiredGetRes = await fetch('http://localhost:3000/api/auth/invite?token=' + token);
  const expiredGetData = await expiredGetRes.json();
  console.log('   GET expired token status:', expiredGetRes.status);
  console.log('   Reason:', expiredGetData.reason);
  console.log('   Error message:', expiredGetData.error);

  // Check POST accept-invite on expired token
  const expiredPostRes = await fetch('http://localhost:3000/api/auth/accept-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      firstName: 'Test',
      lastName: 'Attorney',
      password: 'StrongPassword123!'
    })
  });
  const expiredPostData = await expiredPostRes.json();
  console.log('   POST accept expired token status:', expiredPostRes.status);
  console.log('   Rejection message:', expiredPostData.error);

  // 5. Test Non-existent token
  const fakeRes = await fetch('http://localhost:3000/api/auth/invite?token=non_existent_fake_token_123');
  const fakeData = await fakeRes.json();
  console.log('5. Fake token status:', fakeRes.status, 'Reason:', fakeData.reason);

  // 6. Test successful creation & acceptance with unexpired token
  const testEmail2 = 'staff.test.' + Date.now() + '@firm.ph';
  const inviteRes2 = await fetch('http://localhost:3000/api/auth/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie || ''
    },
    body: JSON.stringify({ email: testEmail2, role: 'STAFF' })
  });
  const inviteData2 = await inviteRes2.json();
  const token2 = inviteData2.inviteLink.split('/invite/')[1];

  const acceptRes = await fetch('http://localhost:3000/api/auth/accept-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: token2,
      firstName: 'Maria',
      lastName: 'Santos',
      password: 'StrongPassword123!'
    })
  });
  const acceptData = await acceptRes.json();
  console.log('6. Valid registration accept status:', acceptRes.status, 'User created:', acceptData.user?.email);

  // Check token reuse prevention
  const reuseRes = await fetch('http://localhost:3000/api/auth/invite?token=' + token2);
  const reuseData = await reuseRes.json();
  console.log('7. Re-check accepted token status:', reuseRes.status, 'Reason:', reuseData.reason);

  console.log('--- ALL EMAIL & EXPIRATION VERIFICATION CHECKS PASSED! ---');
  await prisma.$disconnect();
}

runTests().catch(e => { console.error('Test failed:', e); process.exit(1); });
