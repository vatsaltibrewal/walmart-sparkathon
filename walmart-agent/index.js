import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI, Type } from '@google/genai';
import * as db from './db.js';
import 'dotenv/config';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/chat', limiter);

app.use(express.json());

const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Enhanced tools with comprehensive function definitions
const tools = [
  {
    functionDeclarations: [
      {
        name: "findProducts",
        description: "Searches the product catalog for items matching a user's query. Use this as the first step when a user is looking for something. Can filter by text, category, and price.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "STRING", description: "The user's search query (e.g., 'running shoes', 'laptop')." },
            category: { type: "STRING", description: "An optional product category to narrow the search." },
            priceRange: {
              type: "OBJECT", properties: {
                min: { type: "NUMBER", description: "Minimum price." },
                max: { type: "NUMBER", description: "Maximum price." }
              }
            }
          },
          required: ["query"]
        }
      },
      {
        name: "getProductDetails",
        description: "Fetches ALL details for a single product ID. Use this when a user asks for more information, specifications, or to 'tell me more' about a specific item you've already found.",
        parameters: {
          type: "OBJECT",
          properties: { product_id: { type: "NUMBER", description: "The unique ID of the product." } },
          required: ["product_id"]
        }
      },
      {
        name: "getProductReviews",
        description: "Retrieves customer reviews for a single product ID. Use this when a user asks 'what do people think?', 'are the reviews good?', or wants a summary of opinions.",
        parameters: {
          type: "OBJECT",
          properties: { product_id: { type: "NUMBER", description: "The unique ID of the product." } },
          required: ["product_id"]
        }
      },
      {
        name: "getTrendingProducts",
        description: "Returns a list of the current best-selling or top-rated products. Use this when a user asks for 'what's popular?', 'trending items', or 'top products' without specifying a category.",
        parameters: { type: "OBJECT", properties: {} } // No parameters needed
      },
      {
        name: "getProductsByCategory",
        description: "A highly efficient function to browse all items in an EXACT category. Prefer this over 'findProducts' if the user asks to see 'all laptops' or 'all t-shirts'.",
        parameters: {
            type: "OBJECT",
            properties: { category: { type: "STRING", description: "The exact product category name." } },
            required: ["category"]
        }
      }
    ]
  }
];

const fnMap = {
  findProducts     : db.findProducts,
  getProductDetails: db.getProductDetails,
  getProductReviews: db.getProductReviews,
  getProductsByCategory: db.getProductsByCategory,
  getTrendingProducts: db.getTrendingProducts
};

const systemInstruction = `You are "Spark", a friendly, knowledgeable, and slightly enthusiastic AI shopping assistant for Walmart. Your primary goal is to help users find the perfect product by having a natural, helpful conversation.

**Your Core Persona & Rules:**
1.  **Be Conversational:** Do not just dump data. Introduce yourself, ask clarifying questions, and present information in a friendly, easy-to-understand way.
2.  **Guide the User:** Proactively guide the conversation. After finding products, ask the user if they'd like to know more details or hear about reviews.
3.  **Summarize, Don't List:** When you get data back from a tool (especially reviews), your job is to *summarize* it. For example, if you get back positive and negative reviews, summarize them like this: "It seems people really love the performance, but a few mentioned that it's a bit pricey."
4.  **Explain, Don't Assume:** If you get back technical specs, briefly explain what they mean in a simple way. (e.g., "It has 16GB of RAM, which is great for multitasking and running demanding applications smoothly.")
5.  **Always Use Your Tools:** You have NO internal knowledge of products. You MUST use a tool to answer any product-related question. If a tool returns an error or no results, you must inform the user that you couldn't find the information and ask them to try a different search.
6.  **Admit Your Limits:** If the user asks for something you cannot do (e.g., "place the order for me"), politely state that you can help them find the product and add it to their cart, but you can't complete the purchase.
`;

app.post("/chat", async (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res
      .status(400)
      .json({ error: "Both message and userId are required" });
  }

  console.log({ userId, message }, "Incoming chat request");

  try {
    // 1️⃣ Build conversation history in correct format
    const history = await db.getChatHistory(userId);
    const contents = [
      // Add conversation history
      ...history.map(h => ({
        role: h.role,
        parts: [{ text: h.parts[0].text }]
      })),
      // Add current user message
      { role: "user", parts: [{ text: message }] }
    ];

    // 2️⃣ FIRST PASS: Ask Gemini which function to call (if any)
    let resp1;
    try {
      resp1 = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: { tools },
        systemInstruction
      });
    } catch (e) {
      console.error("Error in first Gemini call:", e);
      throw e;
    }

    // 3️⃣ Check if there are function calls in the response
    let finalReply = "";
    let toolResult = null;

    if (resp1.functionCalls && resp1.functionCalls.length > 0) {
      // 3a. Execute the function call
      const functionCall = resp1.functionCalls[0];
      const { name, args } = functionCall;
      
      console.log(`Function to call: ${name}`);
      console.log(`Arguments: ${JSON.stringify(args)}`);

      if (fnMap[name]) {
        try {
          toolResult = await fnMap[name](args);
          console.log(`Function result:`, toolResult);
        } catch (funcError) {
          console.error(`Error executing function ${name}:`, funcError);
          toolResult = { error: `Failed to execute ${name}` };
        }
      } else {
        console.error(`Unknown function: ${name}`);
        toolResult = { error: `Unknown function: ${name}` };
      }

      // 3b. Add the model's response with function call to conversation
      contents.push({
        role: "model",
        parts: [{ functionCall: functionCall }]
      });

      // 3c. Add the function response to conversation
      contents.push({
        role: "user",
        parts: [{
          functionResponse: {
            name: name,
            response: { result: toolResult }
          }
        }]
      });

      // 3d. SECOND PASS: Get human-friendly response
      let resp2;
      try {
        resp2 = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config: { tools },
          systemInstruction
        });
        finalReply = (resp2.text || "").trim();
      } catch (e) {
        console.error("Error in second Gemini call:", e);
        finalReply = "I was able to get the information, but had trouble formatting the response. Please try again.";
      }

    } else {
      // 4️⃣ No function call: just use the direct text response
      finalReply = (resp1.text || "").trim();
    }

    // Handle empty responses
    if (!finalReply) {
      finalReply = "I'm sorry, I didn't understand that. Could you please rephrase your question?";
    }

    // 5️⃣ Save conversation history
    await db.saveChatMessage(userId, "user", message);
    await db.saveChatMessage(userId, "model", finalReply);

    // 6️⃣ Return response
    res.json({
      reply: finalReply,
      data: toolResult
    });

  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ 
      error: "Internal error, please try again.",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Health check
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});