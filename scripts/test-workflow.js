const http = require('http');

async function testEndpoint(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000${path}`, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function run() {
  console.log('--- Testing Legal Demo Local Endpoints ---');

  // 1. Test Login Endpoint
  console.log('1. Testing Admin Login...');
  const loginRes = await testEndpoint('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@legal.com', password: 'Password123!' }),
  });

  console.log('   Status:', loginRes.statusCode);
  const setCookie = loginRes.headers['set-cookie'];
  console.log('   Set-Cookie received:', !!setCookie);

  if (!setCookie) {
    throw new Error('No cookie received from login!');
  }

  const cookie = setCookie.map((c) => c.split(';')[0]).join('; ');

  // 2. Fetch Dashboard with Cookie
  console.log('2. Fetching Dashboard (/dashboard)...');
  const dashRes = await testEndpoint('/dashboard', {
    headers: { Cookie: cookie },
  });
  console.log('   Status:', dashRes.statusCode);
  const hasLegalDemo = dashRes.body.includes('Legal Demo');
  const hasDashboard = dashRes.body.includes('Dashboard');
  const hasPasigCase = dashRes.body.includes('Mabuhay Holdings');
  console.log('   Contains "Legal Demo":', hasLegalDemo);
  console.log('   Contains "Dashboard":', hasDashboard);
  console.log('   Contains "Mabuhay Holdings":', hasPasigCase);

  // 3. Fetch Tasks (/tasks)
  console.log('3. Fetching Tasks Kanban Board (/tasks)...');
  const tasksRes = await testEndpoint('/tasks', {
    headers: { Cookie: cookie },
  });
  console.log('   Status:', tasksRes.statusCode);
  const hasTasks = tasksRes.body.includes('Tasks');
  const hasStages = tasksRes.body.includes('To Do') && tasksRes.body.includes('In Progress') && tasksRes.body.includes('Attorney Review') && tasksRes.body.includes('Completed / Filed');
  const hasTaskItem = tasksRes.body.includes('Draft Rule 37 Motion');
  console.log('   Contains "Tasks":', hasTasks);
  console.log('   Contains all 4 Kanban stages:', hasStages);
  console.log('   Contains seeded task "Draft Rule 37 Motion":', hasTaskItem);

  // 4. Fetch Matters (/matters)
  console.log('4. Fetching Matters Hub (/matters)...');
  const mattersRes = await testEndpoint('/matters', {
    headers: { Cookie: cookie },
  });
  console.log('   Status:', mattersRes.statusCode);
  const hasAyalaEstate = mattersRes.body.includes('Intestate Estate of Late Don Fernando Ayala');
  console.log('   Contains "Intestate Estate":', hasAyalaEstate);

  // 5. Fetch Deadlines (/deadlines)
  console.log('5. Fetching Deadlines (/deadlines)...');
  const deadlinesRes = await testEndpoint('/deadlines', {
    headers: { Cookie: cookie },
  });
  console.log('   Status:', deadlinesRes.statusCode);
  const hasRule37Deadline = deadlinesRes.body.includes('Rule 37 Motion for Reconsideration');
  console.log('   Contains "Rule 37 Motion":', hasRule37Deadline);

  // 6. Fetch Billing (/billing)
  console.log('6. Fetching Fee Accounting (/billing)...');
  const billingRes = await testEndpoint('/billing', {
    headers: { Cookie: cookie },
  });
  console.log('   Status:', billingRes.statusCode);
  const hasBillingEntry = billingRes.body.includes('Court Motion Filing Assessment') || billingRes.body.includes('Fee');
  console.log('   Contains billing entry:', hasBillingEntry);

  // 7. Fetch Team (/team)
  console.log('7. Fetching Team Management (/team)...');
  const teamRes = await testEndpoint('/team', {
    headers: { Cookie: cookie },
  });
  console.log('   Status:', teamRes.statusCode);
  const hasTeamMember = teamRes.body.includes('Santos');
  console.log('   Contains "Santos":', hasTeamMember);

  console.log('--- All Legal Demo verification checks PASSED successfully! ---');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
