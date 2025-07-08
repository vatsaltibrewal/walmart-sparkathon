import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
//import rateLimit from 'express-rate-limit';
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

// // Rate limiting
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
//     message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/chat', limiter);

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
                description: "Searches the product database with multiple optional filters. Use this for general searches like 'find me a t-shirt' or more specific ones like 'find a blue shirt under $50'. The query parameter will search across product names, brands, and categories. Returns products with ratings, availability, and images.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        query: {
                            type: Type.STRING,
                            description: "The user's primary search term (e.g., 'shirt', 'laptop', 'phone', 'tshirt'). This will search product names, brands, and categories."
                        },
                        category: {
                            type: Type.STRING,
                            description: "Optional specific category filter (e.g., 'T-Shirts', 'Laptops', 'Headphones'). Use exact category names when known."
                        },
                        priceRange: {
                            type: Type.OBJECT,
                            properties: {
                                min: { type: Type.NUMBER, description: "Minimum price" },
                                max: { type: Type.NUMBER, description: "Maximum price" }
                            }
                        },
                        limit: {
                            type: Type.NUMBER,
                            description: "Maximum number of products to return (default: 10)"
                        }
                    },
                    required: ["query"]
                }
            },
            {
                name: "getProductDetails",
                description: "Fetches all detailed information for a single, specific product using its unique product_id. Use this only after the user indicates interest in a specific product from a search result. Gets complete details including specifications, description, pricing, and availability.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        product_id: {
                            type: Type.NUMBER,
                            description: "The unique identifier of the product, obtained from a previous product search"
                        }
                    },
                    required: ["product_id"]
                }
            },
            {
                name: "getProductReviews",
                description: "Gets customer reviews for a specific product, identified by its product_id. Use this when the user asks what other people think, for a summary of opinions, or about the star ratings. Retrieves customer reviews and rating distribution for a product to help users understand customer satisfaction.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        product_id: {
                            type: Type.NUMBER,
                            description: "The unique identifier for the product"
                        }
                    },
                    required: ["product_id"]
                }
            },
            {
                name: "getProductsByCategory",
                description: "Gets products from a specific category when user browses by category rather than searching. Use when user wants to explore a category like 'show me electronics' or 'what's in home & garden'.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        category: {
                            type: Type.STRING,
                            description: "Category name (e.g., 'Electronics', 'Home & Garden', 'Clothing')"
                        },
                        limit: {
                            type: Type.NUMBER,
                            description: "Maximum products to return (default: 20)"
                        }
                    },
                    required: ["category"]
                }
            },
            {
                name: "getTrendingProducts",
                description: "Finds the top-rated, most popular products currently available. Use this when the user asks for 'what's popular', 'trending items', 'best-sellers', 'top-rated products', or needs recommendations. Gets popular/trending products based on ratings and reviews.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        limit: {
                            type: Type.NUMBER,
                            description: "Number of trending products to return (default: 10)"
                        }
                    }
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

const systemInstruction = `You are "Spark", Walmart's advanced AI shopping assistant. You help customers find products, compare options, and make informed purchasing decisions.

**Your Enhanced Capabilities:**
1. **Smart Product Search**: Use findProducts with filters for category, price range, and specific requirements
2. **Detailed Product Information**: Provide comprehensive product details including specifications and availability
3. **Review Analysis**: Summarize customer reviews and ratings to help decision-making
4. **Category Browsing**: Help users explore products by category
5. **Trending Recommendations**: Suggest popular and highly-rated products
6. **Price Comparison**: Help users find the best value within their budget
7. **Availability Checking**: Inform about delivery and pickup options

**Core Directives:**
1. **Be Conversational:** Do not just return data. Summarize it in a helpful, friendly way.
2. **NEVER Invent Information:** Your knowledge comes ONLY from the functions you can call. If the tools don't have the answer, say "I couldn't find that information for you, but I can try something else."
3. **Use the Right Tool:**
   - For general searches like "find a laptop" or "show me some t-shirts under $20", use **findProducts**.
   - If the user asks for details about a specific product you've already found, use its product_id with **getProductDetails**.
   - If the user asks for opinions or ratings on a specific product, use its product_id with **getProductReviews**.
   - If the user asks for "what's popular", "trending", or "top-rated", use **getTrendingProducts**.
   - If the user wants to browse by category, use **getProductsByCategory**.
4. **Stay On Topic:** Politely decline any questions not related to Walmart products or shopping.

**Enhanced Guidelines:**
- Always provide accurate, real-time information from the database
- When discussing prices, mention the currency and any availability constraints
- Summarize reviews constructively, highlighting both pros and cons
- Suggest alternatives when specific products aren't available
- Help users make informed decisions with product comparisons
- Be proactive in offering related products or better alternatives
- Handle phone number userIDs professionally (these may come from WhatsApp or SMS)

**Response Format:**
- Present product information clearly with key details
- Use bullet points for specifications and features
- Include pricing, ratings, and availability prominently
- Provide actionable next steps (view details, check reviews, etc.)
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