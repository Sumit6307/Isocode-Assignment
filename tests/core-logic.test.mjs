import test from "node:test";
import assert from "node:assert/strict";

// Helper functions under test
function generateLeadId() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `LD-${num}`;
}

function normalizePhone(phone) {
  return phone.replace(/[\s-]/g, "");
}

function checkDuplicateLead(existingLeads, newLead) {
  const cleanPhone = normalizePhone(newLead.phone);
  return existingLeads.some(
    (l) =>
      normalizePhone(l.phone) === cleanPhone ||
      (newLead.email && l.email && l.email.toLowerCase() === newLead.email.toLowerCase())
  );
}

function canBookSlot(slot, leadId) {
  if (!slot.isActive) return { allowed: false, reason: "SLOT_INACTIVE" };
  if (slot.bookedCount >= slot.maxCapacity) return { allowed: false, reason: "SLOT_FULL" };
  if (slot.bookings && slot.bookings.some((b) => b.leadId === leadId && b.status !== "CANCELLED")) {
    return { allowed: false, reason: "ALREADY_BOOKED" };
  }
  return { allowed: true };
}

function verifyReraCompliance(text, validReraNumbers) {
  return validReraNumbers.some((num) => text.includes(num));
}

function getResponseBucket(seconds) {
  if (seconds === null || seconds === undefined) return "UNREACHED";
  if (seconds <= 120) return "FAST_AI"; // < 2 min
  if (seconds <= 300) return "ON_TARGET"; // 2-5 min
  return "SLOW_MANUAL"; // > 5 min
}

function formatCurrency(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

// TEST SUITE
test("1. Lead ID Generation - format LD-XXXXX", () => {
  const id = generateLeadId();
  assert.match(id, /^LD-\d{5}$/, "Lead ID must match LD-XXXXX pattern");
});

test("2. Duplicate Lead Detection - catches matching phone numbers despite spacing/dashes", () => {
  const existingLeads = [
    { id: "1", name: "Hardik Patel", phone: "+919876500001", email: "hardik@example.com" },
    { id: "2", name: "Nidhi Shah", phone: "+919876500002", email: "nidhi@example.com" },
  ];

  const duplicate1 = { name: "Hardik P", phone: "+91 98765-00001", email: "diff@example.com" };
  assert.equal(checkDuplicateLead(existingLeads, duplicate1), true, "Should identify duplicate phone with spaces");

  const duplicate2 = { name: "Nidhi S", phone: "+919999999999", email: "nidhi@example.com" };
  assert.equal(checkDuplicateLead(existingLeads, duplicate2), true, "Should identify duplicate email");

  const uniqueLead = { name: "Amit Kumar", phone: "+919876599999", email: "amit@example.com" };
  assert.equal(checkDuplicateLead(existingLeads, uniqueLead), false, "Unique lead must not be flagged");
});

test("3. Concurrency & Double-Booking Prevention - strictly enforces slot maxCapacity", () => {
  const fullSlot = {
    id: "slot-1",
    date: "2026-11-02",
    startTime: "10:00",
    maxCapacity: 3,
    bookedCount: 3,
    isActive: true,
    bookings: [],
  };

  const res1 = canBookSlot(fullSlot, "lead-999");
  assert.equal(res1.allowed, false);
  assert.equal(res1.reason, "SLOT_FULL");

  const openSlot = {
    id: "slot-2",
    date: "2026-11-02",
    startTime: "14:00",
    maxCapacity: 3,
    bookedCount: 2,
    isActive: true,
    bookings: [{ leadId: "lead-100", status: "BOOKED" }],
  };

  const res2 = canBookSlot(openSlot, "lead-200");
  assert.equal(res2.allowed, true, "Should allow booking when space is open");

  // Lead trying to double book same slot
  const res3 = canBookSlot(openSlot, "lead-100");
  assert.equal(res3.allowed, false);
  assert.equal(res3.reason, "ALREADY_BOOKED");
});

test("4. RERA Compliance Verification - project answers contain official registration ID", () => {
  const registeredNumbers = [
    "PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000/A1/260126",
    "PR/GJ/AHMEDABAD/AHMEDABAD/RAA10001/B2/150226",
  ];

  const compliantMessage =
    "Shubh Residency (Shela) offers 3 BHK apartments starting at ₹82L. RERA Registration: PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000/A1/260126.";
  assert.equal(verifyReraCompliance(compliantMessage, registeredNumbers), true);

  const nonCompliantMessage = "Visit our 3 BHK apartments in Shela for ₹82L.";
  assert.equal(verifyReraCompliance(nonCompliantMessage, registeredNumbers), false);
});

test("5. Lead Response Time SLA Classification", () => {
  assert.equal(getResponseBucket(45), "FAST_AI"); // Under 2 min
  assert.equal(getResponseBucket(120), "FAST_AI");
  assert.equal(getResponseBucket(180), "ON_TARGET"); // 3 min
  assert.equal(getResponseBucket(600), "SLOW_MANUAL"); // 10 min
  assert.equal(getResponseBucket(null), "UNREACHED");
});

test("6. Indian Real Estate Currency Formatting", () => {
  assert.equal(formatCurrency(6500000), "₹65.00 L");
  assert.equal(formatCurrency(12000000), "₹1.20 Cr");
});
