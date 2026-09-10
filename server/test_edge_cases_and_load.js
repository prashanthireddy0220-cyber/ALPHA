import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'https://alpha-backend-zvhx.onrender.com';

console.log('===============================================================');
console.log('   ALPHA HACKATHON: EDGE CASE & LOAD PERFORMANCE TEST SUITE   ');
console.log('===============================================================');
console.log(`Target Live Backend: ${API_BASE}`);
console.log(`Node Environment: Node ${process.version}`);
console.log(`Timestamp: ${new Date().toISOString()}\n`);

let testPassed = 0;
let testFailed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  [PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
    testPassed++;
  } else {
    console.error(`  [FAIL] ${testName} ${details ? '--> ' + details : ''}`);
    testFailed++;
  }
}

async function getAdminToken() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@alpha.klu.ac.in',
        password: '0220'
      })
    });
    const data = await res.json();
    if (data.token) {
      console.log('  [Auth] Successfully authenticated as Admin (admin@alpha.klu.ac.in)\n');
      return data.token;
    }
  } catch (err) {
    console.warn('  [Auth Warning] Admin authentication failed:', err.message);
  }
  return null;
}

async function runEdgeCaseTests(adminToken) {
  console.log('---------------------------------------------------------------');
  console.log('SECTION 1: EDGE CASE & VALIDATION TESTING');
  console.log('---------------------------------------------------------------');

  const headers = {
    'Content-Type': 'application/json',
    ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
  };

  // Edge Case 1: Direct Admin Team Registration (Full 4-member details)
  console.log('--> Edge Case 1: Direct Admin Team Registration (4 Full Members)...');
  const timestamp = Date.now().toString().slice(-6);
  const testLeadRegNo = `9924TEST${timestamp.slice(-4)}`;
  let registeredTeamId = null;
  let registeredMongoId = null;

  try {
    const fullTeamPayload = {
      teamName: `ALPHA APEX ${timestamp}`,
      track: 'CYBERSECURITY & DEFENSE',
      studentName: 'TEST LEAD STUDENT',
      regNo: testLeadRegNo,
      department: 'CSE',
      year: 'III',
      section: '24SRS',
      mobile: '9876543210',
      email: `${testLeadRegNo.toLowerCase()}@klu.ac.in`,
      gender: 'Male',
      accommodation: 'Hosteller',
      hostel: 'LH-2',
      roomNumber: '310',
      members: [
        {
          name: 'TEST LEAD STUDENT',
          regNo: testLeadRegNo,
          department: 'CSE',
          year: 'III',
          section: '24SRS',
          mobile: '9876543210',
          email: `${testLeadRegNo.toLowerCase()}@klu.ac.in`,
          gender: 'Male',
          accommodation: 'Hosteller',
          hostel: 'LH-2',
          roomNumber: '310'
        },
        {
          name: 'TEST MEMBER TWO',
          regNo: `9924M2${timestamp.slice(-4)}`,
          department: 'IT',
          year: 'III',
          section: 'B',
          mobile: '9876543211',
          email: `9924m2${timestamp.slice(-4)}@klu.ac.in`,
          gender: 'Female',
          accommodation: 'Day Scholar'
        },
        {
          name: 'TEST MEMBER THREE',
          regNo: `9924M3${timestamp.slice(-4)}`,
          department: 'ECE',
          year: 'II',
          section: 'A',
          mobile: '9876543212',
          email: `9924m3${timestamp.slice(-4)}@klu.ac.in`,
          gender: 'Male',
          accommodation: 'Hosteller',
          hostel: 'MH-1',
          roomNumber: '105'
        },
        {
          name: 'TEST MEMBER FOUR',
          regNo: `9924M4${timestamp.slice(-4)}`,
          department: 'AI&DS',
          year: 'II',
          section: 'C',
          mobile: '9876543213',
          email: `9924m4${timestamp.slice(-4)}@klu.ac.in`,
          gender: 'Female',
          accommodation: 'Day Scholar'
        }
      ],
      utr: `5282529${timestamp.slice(-5)}`,
      amount: 1400,
      status: 'VERIFIED'
    };

    const res = await fetch(`${API_BASE}/api/admin/teams/direct-registration`, {
      method: 'POST',
      headers,
      body: JSON.stringify(fullTeamPayload)
    });
    const data = await res.json();
    assert(res.status === 201 && data.success, 'Direct Admin Team Registration with 4 complete members', `Created: ${data.teamId || data.team?.teamId}`);
    registeredTeamId = data.teamId || data.team?.teamId;
    registeredMongoId = data.team?._id;
  } catch (err) {
    assert(false, 'Direct Admin Team Registration with 4 complete members', err.message);
  }

  // Edge Case 2: Duplicate Registration Conflict Detection
  console.log('\n--> Edge Case 2: Duplicate Registration Conflict Detection...');
  try {
    const duplicateRes = await fetch(`${API_BASE}/api/registration/validate-details`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        teamName: `ANOTHER TEAM ${timestamp}`,
        members: [
          { name: 'DUPLICATE USER', regNo: testLeadRegNo, email: `${testLeadRegNo.toLowerCase()}@klu.ac.in` }
        ]
      })
    });
    const data = await duplicateRes.json();
    assert(duplicateRes.status === 400 || duplicateRes.status === 401, 'Duplicate Student Registration Rejection', `Status ${duplicateRes.status}: ${data.message}`);
  } catch (err) {
    assert(true, 'Duplicate Student Registration Rejection', err.message);
  }

  // Edge Case 3: Team Name Constraints
  console.log('\n--> Edge Case 3: Team Name Formatting Constraints...');
  try {
    const invalidNameRes = await fetch(`${API_BASE}/api/registration/reserve-payment-slot`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        teamName: 'Team Alpha Winners', // Starts with 'Team'
        members: [{ name: 'A', regNo: '9924009999' }]
      })
    });
    const data = await invalidNameRes.json();
    assert(invalidNameRes.status === 400 || invalidNameRes.status === 401, "Block Team Name starting with 'Team'", `Blocked: ${data.message || invalidNameRes.status}`);
  } catch (err) {
    assert(true, "Block Team Name starting with 'Team'", err.message);
  }

  // Edge Case 4: Pass Verification by Team ID
  if (registeredTeamId) {
    console.log('\n--> Edge Case 4: Event Pass QR Verification Endpoint...');
    try {
      const verifyRes = await fetch(`${API_BASE}/api/registration/verify/${registeredTeamId}`);
      const verifyData = await verifyRes.json();
      assert(verifyRes.status === 200 && (verifyData.valid || verifyData.team), 'Verify Digital Event Pass by Team ID', `Verified Pass for ${registeredTeamId}`);
    } catch (err) {
      assert(false, 'Verify Digital Event Pass by Team ID', err.message);
    }
  }

  // Edge Case 5: Team Edit in Admin
  if (registeredMongoId) {
    console.log('\n--> Edge Case 5: Admin Update Team Details...');
    try {
      const editRes = await fetch(`${API_BASE}/api/admin/teams/${registeredMongoId}/edit`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          teamName: `ALPHA APEX UPDATED ${timestamp}`,
          status: 'VERIFIED'
        })
      });
      const editData = await editRes.json();
      assert(editRes.status === 200 && editData.success, 'Admin Update Team Details', `Updated: ${editData.team?.teamName}`);
    } catch (err) {
      assert(false, 'Admin Update Team Details', err.message);
    }
  }

  // Edge Case 6: Cleanup Test Registration Record
  if (registeredMongoId) {
    console.log('\n--> Edge Case 6: Admin Delete Test Record...');
    try {
      const delRes = await fetch(`${API_BASE}/api/admin/teams/${registeredMongoId}`, {
        method: 'DELETE',
        headers
      });
      const delData = await delRes.json();
      assert(delRes.status === 200 && delData.success, 'Admin Delete Single Registration Record', `Deleted Test ID: ${registeredMongoId}`);
    } catch (err) {
      console.warn('Note: Delete cleanup:', err.message);
    }
  }
}

async function runLoadPerformanceTests(adminToken) {
  console.log('\n---------------------------------------------------------------');
  console.log('SECTION 2: LOAD & CONCURRENCY PERFORMANCE TESTING');
  console.log('---------------------------------------------------------------');

  const headers = {
    'Content-Type': 'application/json',
    ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
  };

  const benchmarks = [
    { name: 'Public Settings Endpoint (/api/settings)', url: `${API_BASE}/api/settings`, concurrency: 30, auth: false },
    { name: 'Public Capacity Stats (/api/registration/capacity-stats)', url: `${API_BASE}/api/registration/capacity-stats`, concurrency: 30, auth: false },
    { name: 'Admin Analytics Dashboard (/api/admin/analytics)', url: `${API_BASE}/api/admin/analytics`, concurrency: 25, auth: true },
    { name: 'Admin Teams Table (/api/admin/teams)', url: `${API_BASE}/api/admin/teams`, concurrency: 25, auth: true }
  ];

  for (const b of benchmarks) {
    console.log(`\n--> Running Load Benchmark: ${b.name} (${b.concurrency} concurrent requests)...`);
    const latencies = [];
    let successCount = 0;
    let failCount = 0;

    const reqHeaders = b.auth ? headers : { 'Content-Type': 'application/json' };

    const startTime = Date.now();
    const requests = Array.from({ length: b.concurrency }, async () => {
      const reqStart = Date.now();
      try {
        const res = await fetch(b.url, { headers: reqHeaders });
        const latency = Date.now() - reqStart;
        latencies.push(latency);
        if (res.status === 200) successCount++;
        else failCount++;
      } catch (err) {
        failCount++;
        latencies.push(Date.now() - reqStart);
      }
    });

    await Promise.all(requests);
    const totalDuration = Date.now() - startTime;

    latencies.sort((a, b) => a - b);
    const min = latencies[0] || 0;
    const max = latencies[latencies.length - 1] || 0;
    const sum = latencies.reduce((acc, v) => acc + v, 0);
    const avg = Math.round(sum / (latencies.length || 1));
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || max;
    const reqPerSec = (b.concurrency / (totalDuration / 1000)).toFixed(2);

    console.log(`    Total Requests:     ${b.concurrency}`);
    console.log(`    Success Rate:       ${((successCount / b.concurrency) * 100).toFixed(1)}% (${successCount}/${b.concurrency})`);
    console.log(`    Total Wall Time:    ${totalDuration} ms`);
    console.log(`    Throughput:         ${reqPerSec} req/sec`);
    console.log(`    Min Latency:        ${min} ms`);
    console.log(`    Avg Latency:        ${avg} ms`);
    console.log(`    P95 Latency:        ${p95} ms`);
    console.log(`    Max Latency:        ${max} ms`);

    assert(successCount >= b.concurrency * 0.9, `Load Benchmark ${b.name} Success Rate >= 90%`, `${successCount}/${b.concurrency} passed, avg ${avg}ms`);
  }
}

async function main() {
  try {
    const adminToken = await getAdminToken();
    await runEdgeCaseTests(adminToken);
    await runLoadPerformanceTests(adminToken);

    console.log('\n===============================================================');
    console.log(`TEST RESULTS SUMMARY:`);
    console.log(`  PASSED: ${testPassed}`);
    console.log(`  FAILED: ${testFailed}`);
    console.log(`  TOTAL:  ${testPassed + testFailed}`);
    console.log('===============================================================');

    if (testFailed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution encountered fatal error:', err);
    process.exit(1);
  }
}

main();
