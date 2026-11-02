import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatTime, formatDate } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, leadId, message, language = "en" } = body;

    if (!leadId || !message) {
      return NextResponse.json(
        { success: false, error: "leadId and message are required" },
        { status: 400 }
      );
    }

    // 1. Get or create lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { project: true },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Record response time if this is first contact
    if (!lead.firstResponseAt) {
      const now = new Date();
      const elapsedSeconds = Math.max(
        5,
        Math.round((now.getTime() - new Date(lead.createdAt).getTime()) / 1000)
      );
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          firstResponseAt: now,
          responseTime: elapsedSeconds,
          status: lead.status === "NEW" ? "CONTACTED" : lead.status,
        },
      });
    }

    // 2. Get or create chat session
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          leadId: lead.id,
          language,
          status: "ACTIVE",
        },
        include: { messages: true },
      });
    }

    // 3. Save user's message
    const userMsg = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: message,
      },
    });

    // 4. Fetch knowledge base from Database
    const projects = await prisma.project.findMany({
      include: {
        factSheet: { where: { isActive: true } },
      },
    });

    const availableSlots = await prisma.visitSlot.findMany({
      where: {
        isActive: true,
        bookedCount: { lt: prisma.visitSlot.fields.maxCapacity },
      },
      include: { project: true },
      take: 8,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // 5. Check for immediate human handoff trigger
    const lower = message.toLowerCase();
    const handoffTriggers = [
      "human",
      "executive",
      "salesperson",
      "person",
      "talk to someone",
      "call me",
      "agent",
      "manager",
      "manas",
      "vyakti",
    ];
    const isExplicitHandoff = handoffTriggers.some((t) => lower.includes(t));

    if (isExplicitHandoff) {
      // Find an available sales exec
      const exec = await prisma.user.findFirst({
        where: { role: "SALES_EXEC" },
      });

      const execName = exec?.name || "Priya Sharma";
      const execPhone = exec?.phone || "+91 98765 43211";

      const handoffReply =
        language === "hi"
          ? `ज़रूर! मैंने हमारे वरिष्ठ बिक्री सलाहकार **${execName}** को आपका विवरण भेज दिया है। वे आपसे शीघ्र ही संपर्क करेंगे। आप चाहें तो उनसे सीधे ${execPhone} पर भी संपर्क कर सकते हैं।`
          : language === "gu"
          ? `ચોક્કસ! મેં અમારા વરિષ્ઠ સેલ્સ એક્ઝિક્યુટિવ **${execName}** ને તમારી વિગત મોકલી દીધી છે. તેઓ ટૂંક સમયમાં તમારો સંપર્ક કરશે. તમે સીધો ${execPhone} પર પણ સંપર્ક કરી શકો છો.`
          : `Certainly! I have forwarded your details to our senior sales consultant, **${execName}**. They will contact you shortly. You can also reach them directly at ${execPhone}.`;

      // Update lead & session
      if (exec) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { assignedToId: exec.id, status: "HANDED_OFF" },
        });
      }

      await prisma.chatSession.update({
        where: { id: session.id },
        data: {
          status: "HANDED_OFF",
          isFlagged: false,
          summary: `Buyer requested human sales consultant. Inquired: "${message}". Handed off to ${execName}.`,
        },
      });

      const assistantMsg = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: "assistant",
          content: handoffReply,
        },
      });

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        messages: [userMsg, assistantMsg],
        status: "HANDED_OFF",
      });
    }

    // 6. Generate AI response using Gemini or intelligent fact-sheet fallback
    let aiResponseText = "";
    let isFlagged = false;
    let flagReason = null;
    let toolCallData: any = null;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "your-gemini-api-key" && !apiKey.includes("your-")) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Build knowledge context
        const projectContext = projects
          .map((p) => {
            const facts = p.factSheet
              .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
              .join("\n\n");
            return `PROJECT: ${p.name}\nRERA NUMBER: ${p.reraNumber}\nLocation: ${p.location}\nPrice Range: ₹${p.priceMin}L - ₹${p.priceMax}L\nConfigurations: ${p.configs}\nAmenities: ${p.amenities}\n\nOFFICIAL FACT SHEET:\n${facts}`;
          })
          .join("\n\n=========================\n\n");

        const slotsContext = availableSlots
          .map(
            (s) =>
              `- Slot ID: ${s.id} | Project: ${s.project.name} | Date: ${s.date} | Time: ${s.startTime}-${s.endTime} | Available spots: ${s.maxCapacity - s.bookedCount}`
          )
          .join("\n");

        const prompt = `You are the official AI Lead-Response and Site-Visit Booking Assistant for "Aavkar Realty", a premier residential real estate developer in Ahmedabad.

STRICT OPERATING RULES:
1. ONLY state facts that appear in the official fact sheet below. If any detail is not in the fact sheet, you MUST state that our sales team will confirm it, and never guess.
2. NEVER quote any final price, discount, or custom deal. Refer to official base pricing and invite them to discuss specific unit pricing with a sales executive.
3. RERA COMPLIANCE: Whenever mentioning a project, display its registered RERA number.
4. DPDP COMPLIANCE: Be respectful of privacy and professional.
5. Inquire politely about their configuration preference (2 BHK or 3 BHK) and budget if not yet known.
6. Actively invite the buyer to book a site visit from the real available slots.
7. Respond in the requested language: "${language}" (en = English, hi = Hindi, gu = Gujarati).

KNOWLEDGE BASE:
${projectContext}

REAL FREE VISIT SLOTS:
${slotsContext}

CONVERSATION HISTORY:
${session.messages
  .slice(-6)
  .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
  .join("\n")}
USER: ${message}

Provide a helpful, polite, concise response matching the client's premium brand tone. If offering site visit slots, list 2-3 specific dates and times clearly.`;

        const result = await model.generateContent(prompt);
        aiResponseText = result.response.text();
      } catch (geminiError: any) {
        console.warn("Gemini API call failed or quota reached, using robust fact-sheet engine:", geminiError?.message);
      }
    }

    // Deterministic fallback / fact-sheet matching engine
    if (!aiResponseText) {
      aiResponseText = generateFactSheetResponse(
        message,
        projects,
        availableSlots,
        language,
        lead
      );
    }

    // Check if response indicates missing information or uncertainty
    if (
      aiResponseText.includes("our sales executive will confirm") ||
      aiResponseText.includes("team will provide more details") ||
      lower.includes("discount") ||
      lower.includes("negotiat") ||
      lower.includes("black money") ||
      lower.includes("cash")
    ) {
      isFlagged = true;
      flagReason = "Query requires sales head review: pricing or custom request";
    }

    // Save assistant message
    const assistantMsg = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: aiResponseText,
        toolCall: toolCallData ? JSON.stringify(toolCallData) : null,
      },
    });

    // Update session
    await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        isFlagged,
        flagReason,
        summary: `Interested in ${lead.wants || "residential apartments"}. Latest query: "${message.slice(0, 80)}"`,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      messages: [userMsg, assistantMsg],
      availableSlots: availableSlots.slice(0, 4),
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process message" },
      { status: 500 }
    );
  }
}

// Built-in intelligent Fact-Sheet QA Engine
function generateFactSheetResponse(
  query: string,
  projects: any[],
  availableSlots: any[],
  language: string,
  lead: any
): string {
  const q = query.toLowerCase();

  // 1. Booking intent
  if (
    q.includes("book") ||
    q.includes("visit") ||
    q.includes("slot") ||
    q.includes("appointment") ||
    q.includes("muqalaat") ||
    q.includes("joee")
  ) {
    const slotsText = availableSlots
      .slice(0, 3)
      .map(
        (s) =>
          `• **${formatDate(s.date)}** at **${formatTime(s.startTime)}** (${s.project.name})`
      )
      .join("\n");

    if (language === "hi") {
      return `साइट विज़िट बुक करने में मुझे बहुत खुशी होगी! 🏠\n\nहमारे पास उपलब्ध आगामी स्लॉट यहाँ हैं:\n${slotsText}\n\nआप नीचे दिए गए स्लॉट पिकर से सीधे अपनी पसंदीदा तारीख और समय चुन सकते हैं। हमारी टीम आपको 24 घंटे और 2 घंटे पहले व्हाट्सएप/एसएमएस रिमाइंडर भेजेगी!`;
    }
    if (language === "gu") {
      return `સાઇટ મુલાકાત બુક કરવામાં મને આનંદ થશે! 🏠\n\nઅમારી પાસે ઉપલબ્ધ આગામી સ્લોટ:\n${slotsText}\n\nતમે નીચે આપેલા સ્લોટમાંથી તમારી અનુકૂળતા મુજબ સમય પસંદ કરી શકો છો.`;
    }
    return `I would be delighted to arrange a site visit for you! 🏠\n\nHere are our upcoming free slots:\n${slotsText}\n\nYou can select any of these slots directly using the booking cards below. You'll receive instant location pins and reminders 24 hours & 2 hours before the visit!`;
  }

  // 2. Pricing intent
  if (
    q.includes("price") ||
    q.includes("cost") ||
    q.includes("rate") ||
    q.includes("bhav") ||
    q.includes("kimat") ||
    q.includes("lakh") ||
    q.includes("crore")
  ) {
    if (language === "hi") {
      return `हमारे प्रोजेक्ट्स की शुरुआती कीमतें इस प्रकार हैं:\n\n• **शुभ रेजिडेंसी (शीला)**: ₹65 लाख से ₹95 लाख (2 और 3 BHK)\n  RERA: PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000/A1/260126\n• **आरंभ हाइट्स (बोપલ)**: ₹78 लाख से ₹1.2 करोड़ (2 और 3 BHK)\n  RERA: PR/GJ/AHMEDABAD/AHMEDABAD/RAA10001/B2/150226\n\n*नोट: रेरा नियमों के अनुसार अंतिम कीमत यूनिट और फ्लोर के आधार पर तय होती है। हमारे बिक्री सलाहकार आपको विस्तृत लागत पत्रक (Cost Sheet) प्रदान करेंगे।* क्या आप 2 BHK में रुचि रखते हैं या 3 BHK में?`;
    }
    if (language === "gu") {
      return `અમારા પ્રોજેક્ટ્સના ભાવો:\n\n• **શુભ રેસિડેન્સી (શેલા)**: ₹65 લાખ થી ₹95 લાખ (2 અને 3 BHK)\n  RERA: PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000/A1/260126\n• **આરંભ હાઇટ્સ (બોપલ)**: ₹78 લાખ થી ₹1.2 કરોડ (2 અને 3 BHK)\n  RERA: PR/GJ/AHMEDABAD/AHMEDABAD/RAA10001/B2/150226\n\nતમને 2 BHK કે 3 BHK માં રસ છે?`;
    }
    return `Here is our official pricing overview:\n\n• **Shubh Residency (Shela)**: ₹65 Lakh to ₹95 Lakh (2 & 3 BHK)\n  *RERA: PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000/A1/260126*\n• **Aarambh Heights (Bopal)**: ₹78 Lakh to ₹1.2 Crore (2 & 3 BHK)\n  *RERA: PR/GJ/AHMEDABAD/AHMEDABAD/RAA10001/B2/150226*\n\n*Per RERA standards, exact prices depend on floor rise and unit selection. Our sales team does not quote negotiated discounts via chat.* Would you prefer a 2 BHK or 3 BHK layout?`;
  }

  // 3. Location intent
  if (
    q.includes("location") ||
    q.includes("where") ||
    q.includes("address") ||
    q.includes("kaha") ||
    q.includes("shela") ||
    q.includes("bopal")
  ) {
    return `Both projects are located in Ahmedabad's prime western growth corridor:\n\n1. **Shubh Residency**: Near Shela Lake, off SG Highway, Shela, Ahmedabad - 380058 (10 min to SG Highway)\n2. **Aarambh Heights**: Near Bopal Lake, South Bopal, Ahmedabad - 380058 (5 min to South Bopal Circle)\n\nBoth locations offer top schools, hospitals, and seamless connectivity. Would you like to schedule a site visit to tour the area?`;
  }

  // 4. Amenities intent
  if (
    q.includes("amenit") ||
    q.includes("gym") ||
    q.includes("pool") ||
    q.includes("club") ||
    q.includes("parking") ||
    q.includes("ev")
  ) {
    return `Our communities are planned with world-class lifestyle amenities:\n\n• **Clubhouse & Swimming Pool** (Rooftop infinity pool at Aarambh Heights)\n• **Fully equipped Gymnasium & Yoga Deck**\n• **Children's play park & Senior Citizen sitting zones**\n• **EV Charging stations & Covered parking for every unit**\n• **24/7 Multi-tier security & 100% Power backup for common areas**\n\nWould you like to visit our show apartment and experience the amenities firsthand?`;
  }

  // 5. RERA / Legal
  if (q.includes("rera") || q.includes("legal") || q.includes("approved")) {
    return `All our projects are fully RERA approved with all clearances in place:\n\n• **Shubh Residency**: RERA No. \`PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000/A1/260126\`\n• **Aarambh Heights**: RERA No. \`PR/GJ/AHMEDABAD/AHMEDABAD/RAA10001/B2/150226\`\n\nBoth projects are also pre-approved for home loans by SBI, HDFC, ICICI, and Bank of Baroda.`;
  }

  // 6. Generic greeting / Fact sheet check
  for (const proj of projects) {
    for (const item of proj.factSheet) {
      const qWords = item.question.toLowerCase().split(" ");
      const matches = qWords.filter((w: string) => w.length > 3 && q.includes(w));
      if (matches.length >= 2) {
        return `${item.answer}\n\n*Reference: ${proj.name} (RERA: ${proj.reraNumber})*\n\nCan I help you book a visit to view this in person?`;
      }
    }
  }

  // 7. Unknown question fallback -> honest limit & handoff option
  if (language === "hi") {
    return `धन्यवाद! यह विशिष्ट विवरण वर्तमान तथ्य पत्रक (Fact Sheet) में उपलब्ध नहीं है। गलत जानकारी से बचने के लिए, हमारे वरिष्ठ बिक्री प्रबंधक आपसे संपर्क करके सटीक विवरण देंगे।\n\nक्या आप एक साइट विज़िट बुक करना चाहेंगे या किसी सेल्स एग्जीक्यूटिव से सीधे बात करना चाहेंगे?`;
  }
  if (language === "gu") {
    return `આભાર! આ વિગત અમારા ફેક્ટ શીટમાં નથી. સાચી વિગત આપવા માટે અમારા સેલ્સ મેનેજર તમારો સંપર્ક કરશે.\n\nશું તમે સાઇટ વિઝિટ બુક કરવા માંગો છો?`;
  }

  return `Thank you for your inquiry! This specific detail is not recorded in our official sales fact sheet. To ensure you receive 100% accurate information per RERA guidelines, our senior sales executive will confirm this for you.\n\nIn the meantime, would you like to **book a site visit** to explore the property, or have a sales consultant call you directly?`;
}

