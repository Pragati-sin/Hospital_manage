/**
 * test-concurrency.js
 * ====================
 * Academic Verification Script for Double-Booking Prevention
 *
 * This script:
 * 1. Connects to MongoDB and seeds an Admin, Doctor (with User), and Patient (with User)
 * 2. Logs in as the Patient to obtain a JWT
 * 3. Fires TWO simultaneous POST /api/appointments requests for the EXACT same
 *    doctor + date + timeSlot using Promise.allSettled
 * 4. Asserts: one succeeds (201), one fails (409 Conflict)
 * 5. Prints results for academic evaluators
 *
 * Usage: node test-concurrency.js
 * Prerequisite: Backend server must be running on http://localhost:5000
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

// ── Utility: make HTTP request ──────────────────────────────────────────────
function makeRequest(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const body = data ? JSON.stringify(data) : null;
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => (responseData += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── ANSI Colors ─────────────────────────────────────────────────────────────
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function banner(text) {
  console.log(`\n${CYAN}${BOLD}${'═'.repeat(60)}${RESET}`);
  console.log(`${CYAN}${BOLD}  ${text}${RESET}`);
  console.log(`${CYAN}${BOLD}${'═'.repeat(60)}${RESET}\n`);
}

// ── Main Test ───────────────────────────────────────────────────────────────
async function runConcurrencyTest() {
  banner('HOSPITAL MANAGEMENT SYSTEM — CONCURRENCY TEST');

  try {
    // Step 1: Register a patient user
    console.log(`${YELLOW}[Step 1]${RESET} Registering test patient...`);
    const patientReg = await makeRequest('POST', '/api/auth/register', {
      name: 'Test Patient',
      email: `test.patient.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Patient',
      phone: '9876543210',
    });

    if (patientReg.status !== 201 && patientReg.status !== 200) {
      console.log(`${RED}[FAIL]${RESET} Could not register patient:`, patientReg.data);
      process.exit(1);
    }

    const patientToken = patientReg.data.token;
    const patientUserId = patientReg.data.user?._id || patientReg.data.user?.id;
    console.log(`${GREEN}[OK]${RESET} Patient registered. User ID: ${patientUserId}`);

    // Step 2: Register an admin to create a doctor
    console.log(`\n${YELLOW}[Step 2]${RESET} Registering admin user...`);
    const adminReg = await makeRequest('POST', '/api/auth/register', {
      name: 'Test Admin',
      email: `test.admin.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Admin',
      phone: '9876543211',
    });

    const adminToken = adminReg.data.token;
    console.log(`${GREEN}[OK]${RESET} Admin registered.`);

    // Step 3: Create a department
    console.log(`\n${YELLOW}[Step 3]${RESET} Creating department...`);
    const deptRes = await makeRequest(
      'POST',
      '/api/departments',
      { name: `Cardiology-${Date.now()}`, description: 'Heart and cardiovascular care' },
      adminToken
    );

    const departmentId = deptRes.data.department?._id || deptRes.data.data?._id || deptRes.data._id;
    console.log(`${GREEN}[OK]${RESET} Department created: ${departmentId}`);

    // Step 4: Create a doctor
    console.log(`\n${YELLOW}[Step 4]${RESET} Creating doctor...`);
    const doctorRes = await makeRequest(
      'POST',
      '/api/doctors',
      {
        name: 'Dr. Test Doctor',
        email: `test.doctor.${Date.now()}@example.com`,
        password: 'password123',
        phone: '9876543212',
        department: departmentId,
        specialization: 'Cardiologist',
        experience: 10,
        consultationFee: 500,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        shiftStart: '09:00',
        shiftEnd: '17:00',
      },
      adminToken
    );

    const doctorId = doctorRes.data.doctor?._id || doctorRes.data.data?._id || doctorRes.data._id;
    console.log(`${GREEN}[OK]${RESET} Doctor created: ${doctorId}`);

    // Step 5: Fire TWO simultaneous appointment requests
    banner('FIRING TWO SIMULTANEOUS BOOKING REQUESTS');

    const appointmentDate = '2026-10-15';
    const timeSlot = '10:00-10:30';

    console.log(`${YELLOW}Target:${RESET}  Doctor=${doctorId}`);
    console.log(`${YELLOW}Date:${RESET}    ${appointmentDate}`);
    console.log(`${YELLOW}Slot:${RESET}    ${timeSlot}`);
    console.log(`\n${YELLOW}Sending two requests simultaneously...${RESET}\n`);

    const appointmentPayload = {
      doctor: doctorId,
      department: departmentId,
      date: appointmentDate,
      timeSlot: timeSlot,
      reasonForVisit: 'Concurrency test',
    };

    const [result1, result2] = await Promise.allSettled([
      makeRequest('POST', '/api/appointments', appointmentPayload, patientToken),
      makeRequest('POST', '/api/appointments', appointmentPayload, patientToken),
    ]);

    // Step 6: Analyze results
    banner('TEST RESULTS');

    const res1 =
      result1.status === 'fulfilled' ? result1.value : { status: 'error', data: result1.reason };
    const res2 =
      result2.status === 'fulfilled' ? result2.value : { status: 'error', data: result2.reason };

    console.log(`${BOLD}Request 1:${RESET} Status ${res1.status}`);
    console.log(`  Response: ${JSON.stringify(res1.data, null, 2)}\n`);

    console.log(`${BOLD}Request 2:${RESET} Status ${res2.status}`);
    console.log(`  Response: ${JSON.stringify(res2.data, null, 2)}\n`);

    // Verify: exactly one 201 and one 409
    const statuses = [res1.status, res2.status].sort();
    const hasSuccess = statuses.includes(201);
    const hasConflict = statuses.includes(409);

    if (hasSuccess && hasConflict) {
      console.log(
        `${GREEN}${BOLD}╔══════════════════════════════════════════════════════════╗${RESET}`
      );
      console.log(
        `${GREEN}${BOLD}║  ✅ TEST PASSED: Double-booking successfully prevented!  ║${RESET}`
      );
      console.log(
        `${GREEN}${BOLD}║                                                          ║${RESET}`
      );
      console.log(
        `${GREEN}${BOLD}║  • One request succeeded (201 Created)                   ║${RESET}`
      );
      console.log(
        `${GREEN}${BOLD}║  • One request was rejected (409 Conflict)               ║${RESET}`
      );
      console.log(
        `${GREEN}${BOLD}║  • Compound unique index is working correctly            ║${RESET}`
      );
      console.log(
        `${GREEN}${BOLD}╚══════════════════════════════════════════════════════════╝${RESET}`
      );
      process.exit(0);
    } else {
      console.log(
        `${RED}${BOLD}╔══════════════════════════════════════════════════════════╗${RESET}`
      );
      console.log(
        `${RED}${BOLD}║  ❌ TEST FAILED: Double-booking was NOT prevented!       ║${RESET}`
      );
      console.log(
        `${RED}${BOLD}║  Statuses: ${statuses.join(', ')}                                  ║${RESET}`
      );
      console.log(
        `${RED}${BOLD}╚══════════════════════════════════════════════════════════╝${RESET}`
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n${RED}[ERROR]${RESET} Test failed with error:`, error.message);
    process.exit(1);
  }
}

runConcurrencyTest();
