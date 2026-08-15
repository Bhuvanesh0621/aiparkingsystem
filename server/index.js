require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/api/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Amount is in paisa (INR)
    const options = {
      amount: Math.round(amount * 100), // ensure integer
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Could not create order" });
  }
});

const PORT = process.env.PORT || 3001;

// Removed global AI instance since it will be instantiated per-request

app.post("/api/chat", async (req, res) => {
  try {
    const { message, context, history } = req.body;
    const authHeader = req.headers.authorization;
    const clientKey = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const apiKey = clientKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.json({ 
        text: "**Configuration Required!** ⚠️\n\nTo make me a fully-fledged AI that can answer all your questions, please provide an API Key (Gemini or Groq).", 
        action: null 
      });
    }

    const systemInstruction = `You are the SmartPark AI Assistant. You are helpful, friendly, and concise. Use bolding to emphasize important details.

Current Parking Status Context:
- Available Slots: ${context.availableSlots} (${context.evSlots} are EV slots)
- User's Active Booking: ${context.activeBooking ? `Slot ${context.activeBooking.slotNumber} on Floor ${context.activeBooking.floor} with vehicle ${context.activeBooking.vehicleNumber}` : "None"}
- User Wallet Balance: ₹${context.walletBalance || 0}
- Current Base Pricing: Bike: ₹20/hr, Car: ₹50/hr, SUV: ₹70/hr, EV: ₹80/hr. (Note: A 1.5x surge multiplier applies if the garage is >80% full).

If the user wants to do an action like book a slot, report an issue, find their car, or see their QR pass, you MUST use the corresponding tool. Do NOT provide instructions on how to do it manually if a tool exists. If they ask about their current booking, use the context provided.`;

    let textResponse = "";
    let action = null;

    const isGroq = apiKey.startsWith("gsk_");

    if (isGroq) {
      // Groq Implementation
      const tools = [
        { type: "function", function: { name: "book_slot", description: "Help the user book a parking slot or reserve a parking space.", parameters: { type: "object", properties: {} } } },
        { type: "function", function: { name: "find_car", description: "Open the 3D map to help the user locate their parked car.", parameters: { type: "object", properties: {} } } },
        { type: "function", function: { name: "show_qr", description: "Show the user their digital QR pass for their active booking.", parameters: { type: "object", properties: {} } } },
        { type: "function", function: { name: "report_issue", description: "Open the form for the user to report an incident, problem, or broken equipment.", parameters: { type: "object", properties: {} } } }
      ];

      const groqHistory = [{ role: "system", content: systemInstruction }];
      (history || []).forEach(msg => {
        groqHistory.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text });
      });
      groqHistory.push({ role: 'user', content: message });

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: groqHistory,
          tools: tools,
          tool_choice: "auto",
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "Groq API Error");

      const responseMessage = data.choices[0].message;
      textResponse = responseMessage.content || "";

      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        const funcName = responseMessage.tool_calls[0].function.name;
        if (funcName === "book_slot") action = { type: "link", payload: "/booking", label: "Book a Slot" };
        else if (funcName === "find_car") action = { type: "find-car", label: "Navigate to Car" };
        else if (funcName === "show_qr") action = { type: "qr", label: "Show QR Pass" };
        else if (funcName === "report_issue") action = { type: "report", label: "Report Incident" };
      }
    } else {
      // Gemini Implementation
      const ai = new GoogleGenAI({ apiKey });
      const tools = [{
        functionDeclarations: [
          { name: "book_slot", description: "Help the user book a parking slot or reserve a parking space." },
          { name: "find_car", description: "Open the 3D map to help the user locate their parked car." },
          { name: "show_qr", description: "Show the user their digital QR pass for their active booking." },
          { name: "report_issue", description: "Open the form for the user to report an incident, problem, or broken equipment." }
        ]
      }];

      const formattedHistory = (history || []).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      formattedHistory.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedHistory,
        config: { systemInstruction, tools, temperature: 0.7 }
      });

      if (response.text) textResponse = response.text;
      else if (response.candidates && response.candidates[0] && response.candidates[0].content.parts[0].text) {
        textResponse = response.candidates[0].content.parts[0].text;
      }

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.functionCall) {
          const funcName = part.functionCall.name;
          if (funcName === "book_slot") action = { type: "link", payload: "/booking", label: "Book a Slot" };
          else if (funcName === "find_car") action = { type: "find-car", label: "Navigate to Car" };
          else if (funcName === "show_qr") action = { type: "qr", label: "Show QR Pass" };
          else if (funcName === "report_issue") action = { type: "report", label: "Report Incident" };
        }
      }
    }

    res.json({ text: textResponse, action });
  } catch (error) {
    console.error("AI API Error:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
