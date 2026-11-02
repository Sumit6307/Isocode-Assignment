import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.visitBooking.deleteMany();
  await prisma.visitSlot.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.factSheetEntry.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Rajesh Mehta",
      email: "admin@aavkarrealty.com",
      password: hashedPassword,
      role: "ADMIN",
      phone: "+919876543210",
    },
  });

  const salesExec1 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@aavkarrealty.com",
      password: hashedPassword,
      role: "SALES_EXEC",
      phone: "+919876543211",
    },
  });

  const salesExec2 = await prisma.user.create({
    data: {
      name: "Amit Desai",
      email: "amit@aavkarrealty.com",
      password: hashedPassword,
      role: "SALES_EXEC",
      phone: "+919876543212",
    },
  });

  const salesExec3 = await prisma.user.create({
    data: {
      name: "Neha Patel",
      email: "neha@aavkarrealty.com",
      password: hashedPassword,
      role: "SALES_EXEC",
      phone: "+919876543213",
    },
  });

  const buyer = await prisma.user.create({
    data: {
      name: "Hardik Patel",
      email: "buyer@example.com",
      password: hashedPassword,
      role: "BUYER",
      phone: "+919876500001",
    },
  });

  console.log("✅ Users created");

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: "Shubh Residency",
      slug: "shubh-residency",
      reraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000/A1/260126",
      location: "Shela, Ahmedabad",
      address: "Near Shela Lake, Off SG Highway, Shela, Ahmedabad - 380058",
      city: "Ahmedabad",
      lat: 23.0120,
      lng: 72.4700,
      description: "A premium residential project offering spacious 2 & 3 BHK apartments with modern amenities. Located in the rapidly developing Shela area near SG Highway, offering excellent connectivity and serene living.",
      priceMin: 65,
      priceMax: 95,
      configs: "2 BHK, 3 BHK",
      amenities: "Swimming Pool, Clubhouse, Gymnasium, Children's Play Area, Landscaped Gardens, 24/7 Security, Power Backup, Covered Parking, Jogging Track, Indoor Games Room",
      totalUnits: 240,
      availableUnits: 82,
      status: "ACTIVE",
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Aarambh Heights",
      slug: "aarambh-heights",
      reraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD/RAA10001/B2/150226",
      location: "Bopal, Ahmedabad",
      address: "Near Bopal Lake, South Bopal, Ahmedabad - 380058",
      city: "Ahmedabad",
      lat: 23.0225,
      lng: 72.4650,
      description: "An elegant residential development with thoughtfully designed 2 & 3 BHK apartments. Located in the prime Bopal neighbourhood, offering a perfect blend of connectivity and peaceful living.",
      priceMin: 78,
      priceMax: 120,
      configs: "2 BHK, 3 BHK",
      amenities: "Rooftop Infinity Pool, Sky Lounge, Yoga Deck, Co-working Space, EV Charging, Smart Home Ready, Multipurpose Hall, Badminton Court, Library, Senior Citizen Area",
      totalUnits: 180,
      availableUnits: 124,
      status: "ACTIVE",
    },
  });

  console.log("✅ Projects created");

  // Create fact sheets
  const factSheetData = [
    // Project 1 - Shubh Residency
    { projectId: project1.id, question: "What are the available configurations?", answer: "We offer spacious 2 BHK (1,150 - 1,250 sq ft) and 3 BHK (1,550 - 1,750 sq ft) apartments.", category: "Specifications", sortOrder: 1 },
    { projectId: project1.id, question: "What is the price range?", answer: "2 BHK apartments start from ₹65 lakh and 3 BHK apartments range from ₹82 lakh to ₹95 lakh (ex-showroom). Please speak with our sales team for the exact pricing of available units.", category: "Pricing", sortOrder: 2 },
    { projectId: project1.id, question: "What is the RERA registration number?", answer: "Our RERA registration number is PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000/A1/260126. You can verify this on the Gujarat RERA website.", category: "Legal", sortOrder: 3 },
    { projectId: project1.id, question: "Where is the project located?", answer: "Shubh Residency is located near Shela Lake, off SG Highway, Shela, Ahmedabad - 380058. It is 10 minutes from the SG Highway and 20 minutes from the airport.", category: "Location", sortOrder: 4 },
    { projectId: project1.id, question: "What amenities are available?", answer: "We offer a swimming pool, clubhouse, gymnasium, children's play area, landscaped gardens, 24/7 security, power backup, covered parking, jogging track, and indoor games room.", category: "Amenities", sortOrder: 5 },
    { projectId: project1.id, question: "When is the expected possession?", answer: "Expected possession is December 2027. Construction is currently on track and progressing well.", category: "General", sortOrder: 6 },
    { projectId: project1.id, question: "What is the construction status?", answer: "As of October 2026, Towers A and B structure work is complete. Tower C is at the 8th floor. Interior and finishing work is underway in Towers A and B.", category: "General", sortOrder: 7 },
    { projectId: project1.id, question: "Are home loans available?", answer: "Yes, the project is approved by SBI, HDFC, ICICI, and Bank of Baroda. We can assist with the loan application process.", category: "Pricing", sortOrder: 8 },
    { projectId: project1.id, question: "What is the booking amount?", answer: "The booking amount is ₹2 lakh, which is adjustable against the total cost. Please connect with our sales team for the detailed payment plan.", category: "Pricing", sortOrder: 9 },
    { projectId: project1.id, question: "Is there parking available?", answer: "Yes, one covered parking per 2 BHK and two covered parking spaces per 3 BHK are included in the price.", category: "Specifications", sortOrder: 10 },

    // Project 2 - Aarambh Heights
    { projectId: project2.id, question: "What are the available configurations?", answer: "We offer premium 2 BHK (1,250 - 1,400 sq ft) and 3 BHK (1,700 - 1,950 sq ft) apartments with modern finishes.", category: "Specifications", sortOrder: 1 },
    { projectId: project2.id, question: "What is the price range?", answer: "2 BHK apartments start from ₹78 lakh and 3 BHK apartments range from ₹98 lakh to ₹1.2 crore (ex-showroom). Please speak with our sales team for the exact pricing of available units.", category: "Pricing", sortOrder: 2 },
    { projectId: project2.id, question: "What is the RERA registration number?", answer: "Our RERA registration number is PR/GJ/AHMEDABAD/AHMEDABAD/RAA10001/B2/150226. You can verify this on the Gujarat RERA website.", category: "Legal", sortOrder: 3 },
    { projectId: project2.id, question: "Where is the project located?", answer: "Aarambh Heights is located near Bopal Lake, South Bopal, Ahmedabad - 380058. It is 5 minutes from South Bopal Circle and 15 minutes from the SG Highway.", category: "Location", sortOrder: 4 },
    { projectId: project2.id, question: "What amenities are available?", answer: "We offer a rooftop infinity pool, sky lounge, yoga deck, co-working space, EV charging stations, smart home ready apartments, multipurpose hall, badminton court, library, and senior citizen area.", category: "Amenities", sortOrder: 5 },
    { projectId: project2.id, question: "When is the expected possession?", answer: "Expected possession is March 2028. The project was launched in February 2026.", category: "General", sortOrder: 6 },
    { projectId: project2.id, question: "What smart home features are included?", answer: "All apartments come smart home ready with provisions for automated lighting, AC control, video door phone, and a home automation app. The smart home kit is optional at ₹1.5 lakh for 2 BHK and ₹2 lakh for 3 BHK.", category: "Specifications", sortOrder: 7 },
    { projectId: project2.id, question: "Are home loans available?", answer: "Yes, the project is pre-approved by SBI, HDFC, ICICI, Axis Bank, and Kotak Mahindra. Our team will help you with the loan process.", category: "Pricing", sortOrder: 8 },
    { projectId: project2.id, question: "What is the booking amount?", answer: "The booking amount is ₹2.5 lakh, adjustable against the total cost. Please connect with our sales team for the detailed payment plan.", category: "Pricing", sortOrder: 9 },
    { projectId: project2.id, question: "Is there EV charging?", answer: "Yes, we have EV charging stations in the basement parking area, available for all residents. Each 3 BHK unit gets a dedicated EV charging point.", category: "Amenities", sortOrder: 10 },
  ];

  for (const entry of factSheetData) {
    await prisma.factSheetEntry.create({ data: entry });
  }

  console.log("✅ Fact sheets created");

  // Create visit slots (next 14 days, 3 slots per day per project)
  const today = new Date();
  const slots = [];
  for (let day = 0; day < 14; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split("T")[0];

    // Skip Sundays (day 0)
    if (date.getDay() === 0) continue;

    const timeSlots = [
      { start: "10:00", end: "11:30" },
      { start: "14:00", end: "15:30" },
      { start: "16:00", end: "17:30" },
    ];

    for (const project of [project1, project2]) {
      for (const ts of timeSlots) {
        slots.push({
          projectId: project.id,
          date: dateStr,
          startTime: ts.start,
          endTime: ts.end,
          maxCapacity: 3,
          bookedCount: 0,
          isActive: true,
        });
      }
    }
  }

  for (const slot of slots) {
    await prisma.visitSlot.create({ data: slot });
  }

  console.log("✅ Visit slots created");

  // Create leads with realistic data
  const leadSources = ["property_portal", "social_media", "website", "hoarding", "walk_in"];
  const leadData = [
    // From sample data
    { leadId: "LD-58210", name: "Hardik Patel", phone: "+919876500001", email: "hardik.patel@gmail.com", source: "property_portal", projectId: project1.id, wants: "3 BHK", status: "SITE_VISIT_BOOKED", budget: "₹85-95 lakh", responseTime: 90, language: "gu" },
    { leadId: "LD-58211", name: "Nidhi Shah", phone: "+919876500002", email: "nidhi.shah@gmail.com", source: "social_media", projectId: project2.id, wants: "2 BHK", status: "NEW", budget: "₹75-85 lakh", responseTime: null, language: "en" },
    { leadId: "LD-58224", name: "Kavita Joshi", phone: "+919876500003", email: "kavita.j@yahoo.com", source: "hoarding", projectId: project2.id, wants: "2 BHK", status: "VISITED", budget: "₹80-90 lakh", responseTime: 180, language: "hi" },
    // Additional realistic leads
    { leadId: "LD-58225", name: "Rahul Trivedi", phone: "+919876500004", email: "rahul.t@gmail.com", source: "website", projectId: project1.id, wants: "2 BHK", status: "CONTACTED", budget: "₹65-75 lakh", responseTime: 240, language: "en" },
    { leadId: "LD-58226", name: "Meera Iyer", phone: "+919876500005", email: "meera.iyer@outlook.com", source: "property_portal", projectId: project2.id, wants: "3 BHK", status: "QUALIFIED", budget: "₹1-1.2 crore", responseTime: 60, language: "en" },
    { leadId: "LD-58227", name: "Jayesh Modi", phone: "+919876500006", email: "jayesh.modi@gmail.com", source: "social_media", projectId: project1.id, wants: "3 BHK", status: "HANDED_OFF", budget: "₹85-95 lakh", responseTime: 45, language: "gu" },
    { leadId: "LD-58228", name: "Sonal Bhatt", phone: "+919876500007", email: "sonal.b@gmail.com", source: "hoarding", projectId: project1.id, wants: "2 BHK", status: "NEW", budget: "₹65-70 lakh", responseTime: null, language: "hi" },
    { leadId: "LD-58229", name: "Vikram Chauhan", phone: "+919876500008", email: "vikram.c@yahoo.com", source: "walk_in", projectId: project2.id, wants: "3 BHK", status: "SITE_VISIT_BOOKED", budget: "₹1-1.15 crore", responseTime: 30, language: "en" },
    { leadId: "LD-58230", name: "Anita Kulkarni", phone: "+919876500009", email: "anita.k@gmail.com", source: "property_portal", projectId: project1.id, wants: "2 BHK", status: "CONTACTED", budget: "₹68-78 lakh", responseTime: 320, language: "hi" },
    { leadId: "LD-58231", name: "Dharmesh Solanki", phone: "+919876500010", email: "dharmesh.s@gmail.com", source: "social_media", projectId: project2.id, wants: "2 BHK", status: "NEW", budget: "₹78-85 lakh", responseTime: null, language: "gu" },
    { leadId: "LD-58232", name: "Pooja Raval", phone: "+919876500011", email: "pooja.r@hotmail.com", source: "website", projectId: project1.id, wants: "3 BHK", status: "QUALIFIED", budget: "₹90-95 lakh", responseTime: 150, language: "en" },
    { leadId: "LD-58233", name: "Karan Thakkar", phone: "+919876500012", email: "karan.t@gmail.com", source: "property_portal", projectId: project2.id, wants: "3 BHK", status: "VISITED", budget: "₹1.05-1.2 crore", responseTime: 75, language: "en" },
    { leadId: "LD-58234", name: "Ruchi Parikh", phone: "+919876500013", email: "ruchi.p@gmail.com", source: "hoarding", projectId: project1.id, wants: "2 BHK", status: "NEW", budget: "₹65-72 lakh", responseTime: null, language: "gu" },
    { leadId: "LD-58235", name: "Manish Agarwal", phone: "+919876500014", email: "manish.a@outlook.com", source: "social_media", projectId: project1.id, wants: "3 BHK", status: "CONTACTED", budget: "₹88-95 lakh", responseTime: 200, language: "hi" },
    { leadId: "LD-58236", name: "Deepa Nair", phone: "+919876500015", email: "deepa.nair@gmail.com", source: "website", projectId: project2.id, wants: "2 BHK", status: "SITE_VISIT_BOOKED", budget: "₹80-90 lakh", responseTime: 55, language: "en" },
    // More leads for dashboard data
    { leadId: "LD-58237", name: "Suresh Prajapati", phone: "+919876500016", email: "suresh.p@gmail.com", source: "property_portal", projectId: project1.id, wants: "2 BHK", status: "CLOSED", budget: "₹65-70 lakh", responseTime: 600, language: "gu" },
    { leadId: "LD-58238", name: "Bhavna Jain", phone: "+919876500017", email: "bhavna.j@gmail.com", source: "walk_in", projectId: project2.id, wants: "3 BHK", status: "HANDED_OFF", budget: "₹1.1-1.2 crore", responseTime: 20, language: "en" },
    { leadId: "LD-58239", name: "Nilesh Patel", phone: "+919876500018", email: "nilesh.np@gmail.com", source: "social_media", projectId: project1.id, wants: "2 BHK", status: "CONTACTED", budget: "₹67-75 lakh", responseTime: 280, language: "gu" },
    { leadId: "LD-58240", name: "Swati Deshmukh", phone: "+919876500019", email: "swati.d@yahoo.com", source: "property_portal", projectId: project2.id, wants: "2 BHK", status: "NEW", budget: "₹78-88 lakh", responseTime: null, language: "hi" },
    { leadId: "LD-58241", name: "Gaurav Saxena", phone: "+919876500020", email: "gaurav.s@gmail.com", source: "website", projectId: project1.id, wants: "3 BHK", status: "VISITED", budget: "₹90-95 lakh", responseTime: 100, language: "en" },
  ];

  const execIds = [salesExec1.id, salesExec2.id, salesExec3.id];

  for (let i = 0; i < leadData.length; i++) {
    const ld = leadData[i];
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 14));
    createdAt.setHours(Math.floor(Math.random() * 14) + 8);

    await prisma.lead.create({
      data: {
        ...ld,
        assignedToId: ld.status !== "NEW" ? execIds[i % 3] : null,
        consentGiven: true,
        firstResponseAt: ld.responseTime ? new Date(createdAt.getTime() + ld.responseTime * 1000) : null,
        createdAt,
        updatedAt: createdAt,
      },
    });
  }

  console.log("✅ Leads created");

  // Create a visit booking for the first lead (Hardik Patel - from sample data)
  const hardikLead = await prisma.lead.findUnique({ where: { leadId: "LD-58210" } });
  const tomorrowSlots = await prisma.visitSlot.findFirst({
    where: {
      projectId: project1.id,
      startTime: "10:00",
      bookedCount: { lt: 3 },
    },
  });

  if (hardikLead && tomorrowSlots) {
    await prisma.visitBooking.create({
      data: {
        slotId: tomorrowSlots.id,
        leadId: hardikLead.id,
        status: "BOOKED",
      },
    });
    await prisma.visitSlot.update({
      where: { id: tomorrowSlots.id },
      data: { bookedCount: { increment: 1 } },
    });
  }

  // Create booking for Vikram Chauhan
  const vikramLead = await prisma.lead.findUnique({ where: { leadId: "LD-58229" } });
  const vikramSlot = await prisma.visitSlot.findFirst({
    where: {
      projectId: project2.id,
      startTime: "14:00",
      bookedCount: { lt: 3 },
    },
  });

  if (vikramLead && vikramSlot) {
    await prisma.visitBooking.create({
      data: {
        slotId: vikramSlot.id,
        leadId: vikramLead.id,
        status: "BOOKED",
      },
    });
    await prisma.visitSlot.update({
      where: { id: vikramSlot.id },
      data: { bookedCount: { increment: 1 } },
    });
  }

  // Create booking for Deepa Nair
  const deepaLead = await prisma.lead.findUnique({ where: { leadId: "LD-58236" } });
  const deepaSlot = await prisma.visitSlot.findFirst({
    where: {
      projectId: project2.id,
      startTime: "16:00",
      bookedCount: { lt: 3 },
    },
  });

  if (deepaLead && deepaSlot) {
    await prisma.visitBooking.create({
      data: {
        slotId: deepaSlot.id,
        leadId: deepaLead.id,
        status: "BOOKED",
      },
    });
    await prisma.visitSlot.update({
      where: { id: deepaSlot.id },
      data: { bookedCount: { increment: 1 } },
    });
  }

  // Mark Kavita Joshi as visited
  const kavitaLead = await prisma.lead.findUnique({ where: { leadId: "LD-58224" } });
  if (kavitaLead) {
    const kavitaSlot = await prisma.visitSlot.findFirst({
      where: { projectId: project2.id },
    });
    if (kavitaSlot) {
      await prisma.visitBooking.create({
        data: {
          slotId: kavitaSlot.id,
          leadId: kavitaLead.id,
          status: "VISITED",
          visitedAt: new Date(Date.now() - 2 * 86400000),
        },
      });
      await prisma.visitSlot.update({
        where: { id: kavitaSlot.id },
        data: { bookedCount: { increment: 1 } },
      });
    }
  }

  // Create sample chat sessions
  if (hardikLead) {
    const session = await prisma.chatSession.create({
      data: {
        leadId: hardikLead.id,
        status: "ACTIVE",
        language: "gu",
        summary: "Interested in 3 BHK at Shubh Residency. Budget ₹85-95 lakh. Site visit booked.",
      },
    });

    const chatMessages = [
      { sessionId: session.id, role: "assistant", content: "Hello! Welcome to Aavkar Realty. I'm here to help you find your dream home. 🏠\n\nWe have two beautiful projects in Ahmedabad:\n\n1. **Shubh Residency** - Shela (2 & 3 BHK, ₹65L - ₹95L)\n2. **Aarambh Heights** - Bopal (2 & 3 BHK, ₹78L - ₹1.2Cr)\n\nWhich project interests you, or would you like to know more about both?" },
      { sessionId: session.id, role: "user", content: "I'm looking for a 3 BHK in Shela area. What's the price?" },
      { sessionId: session.id, role: "assistant", content: "Great choice! **Shubh Residency** in Shela offers spacious 3 BHK apartments ranging from **1,550 to 1,750 sq ft**.\n\nThe 3 BHK apartments are priced from **₹82 lakh to ₹95 lakh** (ex-showroom). For the exact pricing of available units, our sales team can share the detailed breakup.\n\n📋 RERA: PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000/A1/260126\n\nWould you like to:\n- Know about the amenities and specifications?\n- **Book a site visit** to see the project?\n- Talk to a sales executive for detailed pricing?" },
      { sessionId: session.id, role: "user", content: "I'd like to book a site visit" },
      { sessionId: session.id, role: "assistant", content: "Wonderful! I'd love to arrange a site visit for you at Shubh Residency. 🏗️\n\nHere are the available slots:\n\n📅 **Tomorrow (Nov 1)**\n- 🕐 10:00 AM - 11:30 AM (2 spots left)\n- 🕐 2:00 PM - 3:30 PM (3 spots)\n- 🕐 4:00 PM - 5:30 PM (3 spots)\n\nWhich slot works best for you?" },
      { sessionId: session.id, role: "user", content: "Tomorrow 10 AM works for me" },
      { sessionId: session.id, role: "assistant", content: "✅ **Site visit booked!**\n\n📅 **Date:** November 1, 2026\n🕐 **Time:** 10:00 AM - 11:30 AM\n📍 **Location:** Shubh Residency, Near Shela Lake, Off SG Highway\n\nYou'll receive reminders:\n- 📱 24 hours before the visit\n- 📱 2 hours before the visit\n\nOur executive **Priya Sharma** will be there to welcome you. Is there anything specific you'd like to see during the visit?" },
    ];

    for (const msg of chatMessages) {
      await prisma.chatMessage.create({ data: msg });
    }
  }

  console.log("✅ Chat sessions created");
  console.log("🎉 Seed completed successfully!");

  console.log("\n📋 Demo Login Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin:       admin@aavkarrealty.com / password123");
  console.log("Sales Exec:  priya@aavkarrealty.com / password123");
  console.log("Buyer:       buyer@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

