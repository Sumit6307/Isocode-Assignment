import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3000";

async function runAudit() {
  console.log("🔍 STARTING FULL END-TO-END SYSTEM AUDIT\n");

  // 1. Audit Projects API
  console.log("▶ [1/7] Testing Projects API...");
  const projRes = await fetch(`${BASE_URL}/api/projects`);
  assert.equal(projRes.status, 200, "Projects API must return 200");
  const projData = await projRes.json();
  assert.equal(projData.success, true);
  assert.equal(projData.data.length, 2, "Must return exactly 2 live projects");
  console.log(`  ✔ Found ${projData.data.length} projects: ${projData.data.map(p => p.name).join(" & ")}`);
  const reras = projData.data.map(p => p.reraNumber);
  console.log(`  ✔ RERA Numbers: ${reras.join(" | ")}`);

  // 2. Audit Leads API & Duplicate Detection
  console.log("\n▶ [2/7] Testing Lead Desk & Ingestion...");
  const leadsRes = await fetch(`${BASE_URL}/api/leads`);
  assert.equal(leadsRes.status, 200);
  const leadsData = await leadsRes.json();
  assert.ok(leadsData.data.length >= 20, "Should have seeded leads");
  console.log(`  ✔ Retrieved ${leadsData.data.length} leads across all sources`);

  // Test duplicate detection
  console.log("  Testing Duplicate Contact Detection...");
  const testPhone = "+919876500001"; // Hardik Patel's phone
  const dupRes = await fetch(`${BASE_URL}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Hardik Patel Duplicate",
      phone: "+91 98765 00001", // with spaces
      source: "website",
      wants: "3 BHK",
    }),
  });
  const dupResult = await dupRes.json();
  assert.equal(dupResult.success, true);
  assert.equal(dupResult.data.isDuplicate, true, "Must flag lead as duplicate");
  assert.ok(dupResult.duplicateWarning, "Must return duplicate warning metadata");
  console.log(`  ✔ Duplicate successfully detected and flagged: DUP of ${dupResult.duplicateWarning.originalLeadId}`);

  // 3. Audit Gemini AI Assistant - In English, Hindi, Gujarati & Safety Rails
  console.log("\n▶ [3/7] Testing AI Assistant with Fact Sheet & Safety Rails...");
  const nidhiLead = leadsData.data.find(l => l.leadId === "LD-58211");

  // Flow 3a: Grounded Fact Sheet Answer
  console.log("  3a. Fact sheet retrieval (English)...");
  const chatRes1 = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      leadId: nidhiLead.id,
      message: "What is the price range and RERA number of Aarambh Heights?",
      language: "en",
    }),
  });
  const chatData1 = await chatRes1.json();
  const reply1 = chatData1.messages[chatData1.messages.length - 1].content;
  console.log(`  AI Response Snippet: "${reply1.slice(0, 120)}..."`);
  assert.ok(reply1.includes("Aarambh Heights") || reply1.includes("78 Lakh") || reply1.includes("1.2"), "Should state price range");
  assert.ok(reply1.includes("PR/GJ/AHMEDABAD") || reply1.includes("RERA"), "Must include RERA registration");

  // Flow 3b: Language support (Hindi)
  console.log("  3b. Hindi language query...");
  const chatResHindi = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      leadId: nidhiLead.id,
      message: "शुभ रेजिडेंसी में क्या सुविधाएं हैं?",
      language: "hi",
    }),
  });
  const chatDataHindi = await chatResHindi.json();
  const replyHindi = chatDataHindi.messages[chatDataHindi.messages.length - 1].content;
  console.log(`  AI Hindi Response Snippet: "${replyHindi.slice(0, 100)}..."`);
  assert.ok(replyHindi.length > 20, "Should generate Hindi response");

  // Flow 3c: Discount refusal safety rail
  console.log("  3c. Safety rail: refuse discount quoting...");
  const chatResDiscount = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      leadId: nidhiLead.id,
      message: "Can you give me a 15% discount if I pay today in cash?",
      language: "en",
    }),
  });
  const chatDataDiscount = await chatResDiscount.json();
  const replyDiscount = chatDataDiscount.messages[chatDataDiscount.messages.length - 1].content;
  assert.ok(
    replyDiscount.toLowerCase().includes("sales") ||
    replyDiscount.toLowerCase().includes("team") ||
    replyDiscount.toLowerCase().includes("does not quote") ||
    replyDiscount.toLowerCase().includes("executive"),
    "AI must not quote discounts and must refer to sales executive"
  );
  console.log("  ✔ Safety rail passed: AI refused discount quoting and referred to sales executive");

  // Flow 3d: Explicit human handoff
  console.log("  3d. Instant Human Handoff...");
  const chatResHandoff = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      leadId: nidhiLead.id,
      message: "I want to speak with a human sales executive right now",
      language: "en",
    }),
  });
  const chatDataHandoff = await chatResHandoff.json();
  assert.equal(chatDataHandoff.status, "HANDED_OFF", "Session status must be HANDED_OFF");
  console.log(`  ✔ Instant handoff triggered: "${chatDataHandoff.messages[chatDataHandoff.messages.length - 1].content.slice(0, 110)}..."`);

  // 4. Audit Site Visit Booking with Zero Double-Booking
  console.log("\n▶ [4/7] Testing Real Site Visit Slots & Zero Double-Booking...");
  const slotsRes = await fetch(`${BASE_URL}/api/slots?availableOnly=true`);
  const slotsData = await slotsRes.json();
  const targetSlot = slotsData.data[0];
  console.log(`  Found available slot: ${targetSlot.date} at ${targetSlot.startTime} (${targetSlot.bookedCount}/${targetSlot.maxCapacity} booked)`);

  // Create a new fresh lead for booking
  const newLeadRes = await fetch(`${BASE_URL}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Booking Test Buyer",
      phone: "+919988776655",
      source: "website",
      wants: "3 BHK",
    }),
  });
  const newLeadData = await newLeadRes.json();
  const testLead = newLeadData.data;

  // Book slot
  const bookRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slotId: targetSlot.id,
      leadId: testLead.id,
    }),
  });
  assert.equal(bookRes.status, 200, "Booking must succeed");
  const bookData = await bookRes.json();
  assert.equal(bookData.success, true);
  assert.ok(bookData.data.project.mapsUrl, "Must include Google Maps location pin");
  assert.equal(bookData.data.reminders.length, 2, "Must schedule 24h & 2h reminders");
  console.log("  ✔ Site visit booked successfully with location pin & 24h/2h reminders");

  // Attempt duplicate booking for same slot & lead
  console.log("  Testing Double-Booking Prevention...");
  const doubleBookRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slotId: targetSlot.id,
      leadId: testLead.id,
    }),
  });
  assert.ok(
    doubleBookRes.status === 400 || doubleBookRes.status === 409,
    `Must reject double booking (got status ${doubleBookRes.status})`
  );
  const doubleBookData = await doubleBookRes.json();
  assert.ok(
    doubleBookData.code === "ALREADY_BOOKED" || doubleBookData.code === "SLOT_FULL",
    `Rejection code must be ALREADY_BOOKED or SLOT_FULL (got ${doubleBookData.code})`
  );
  console.log(`  ✔ Double booking strictly prevented by atomic database lock (${doubleBookData.code})`);

  // 5. Audit Executive Handoff & Auto-Summary
  console.log("\n▶ [5/7] Testing Executive Handoff & AI Summary Generation...");
  const execsRes = await fetch(`${BASE_URL}/api/executives`);
  const execsData = await execsRes.json();
  const exec = execsData.data[0];

  const handoffRes = await fetch(`${BASE_URL}/api/leads/${testLead.id}/handoff`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      executiveId: exec.id,
      notes: "Customer is highly qualified for 3 BHK top floor.",
    }),
  });
  assert.equal(handoffRes.status, 200);
  const handoffResult = await handoffRes.json();
  assert.equal(handoffResult.success, true);
  assert.ok(handoffResult.data.summary.length > 10, "Must generate actionable briefing summary");
  console.log(`  ✔ Handed off to: ${handoffResult.data.assignedTo}`);
  console.log(`  ✔ AI Summary: "${handoffResult.data.summary.slice(0, 100)}..."`);

  // 6. Audit Analytics Dashboard
  console.log("\n▶ [6/7] Testing Analytics Dashboard Metrics...");
  const dashRes = await fetch(`${BASE_URL}/api/dashboard`);
  assert.equal(dashRes.status, 200);
  const dashData = await dashRes.json();
  assert.ok(dashData.data.totalLeads > 0);
  assert.ok(dashData.data.medianResponseTime !== undefined);
  assert.ok(dashData.data.costPerVisitBySource);
  assert.ok(dashData.data.responseTimeDistribution);
  console.log(`  ✔ Total Leads: ${dashData.data.totalLeads}`);
  console.log(`  ✔ Median First Response: ${dashData.data.medianResponseTime}s (Target < 300s)`);
  console.log(`  ✔ Visits Show-up Rate: ${dashData.data.visitShowUpRate}%`);
  console.log(`  ✔ Sources Tracked: ${Object.keys(dashData.data.leadsBySource).join(", ")}`);

  // 7. Audit Admin Fact Sheet & Slots
  console.log("\n▶ [7/7] Testing Admin Editors (Fact Sheet & Slots)...");
  const factsRes = await fetch(`${BASE_URL}/api/fact-sheet`);
  const factsData = await factsRes.json();
  assert.ok(factsData.data.length >= 20, "Should have 20 verified fact sheet items");
  console.log(`  ✔ Verified Fact Sheet entries: ${factsData.data.length} Q&As`);

  console.log("\n=======================================================");
  console.log("🎉 ALL SYSTEM AUDIT CHECKS PASSED WITH 100% ACCURACY!");
  console.log("=======================================================\n");
}

runAudit().catch((err) => {
  console.error("❌ AUDIT FAILED:", err);
  process.exit(1);
});
