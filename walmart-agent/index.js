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
                description: "Searches the product database with multiple optional filters. Use this for general searches like 'find me a t-shirt' or more specific ones like 'find a blue shirt under $50'. Returns products with ratings, availability, and images.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        query: {
                            type: Type.STRING,
                            description: "The user's primary search term (e.g., 'shirt', 'laptop', 'phone')"
                        },
                        category: {
                            type: Type.STRING,
                            description: "Optional category filter (e.g., 'Electronics', 'Clothing', 'Home & Garden')"
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

const toolFunctions = {
    findProducts: db.findProducts,
    getProductDetails: db.getProductDetails,
    getProductReviews: db.getProductReviews,
    getTrendingProducts: db.getTrendingProducts
};

// Enhanced chat endpoint with better error handling and full functionality
app.post('/chat', async (req, res) => {
    try {
        const { message, userId, sessionId } = req.body;

        if (!message || !userId) {
            return res.status(400).json({ 
                error: "Message and userId are required.",
                code: "MISSING_REQUIRED_FIELDS"
            });
        }

        // Validate userId format (phone number or email)
        const userIdRegex = /^(\+?[\d\s\-\(\)]+|[\w\.-]+@[\w\.-]+\.\w+)$/;
        if (!userIdRegex.test(userId)) {
            return res.status(400).json({
                error: "Invalid userId format. Use phone number or email.",
                code: "INVALID_USER_ID"
            });
        }

        const history = await db.getChatHistory(userId);
        
        const contents = [
            ...history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.parts[0].text }]
            })),
            {
                role: 'user',
                parts: [{ text: message }]
            }
        ];

        const config = {
            tools: tools
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: config,
            systemInstruction: systemInstruction
        });

        let finalReply;

        if (response.functionCalls && response.functionCalls.length > 0) {
            const functionCall = response.functionCalls[0];
            
            // Call the appropriate tool function
            const toolResponse = await toolFunctions[functionCall.name](functionCall.args);
            
            // Prepare function response
            const functionResponsePart = {
                name: functionCall.name,
                response: { result: toolResponse }
            };

            // Add the assistant's response with function call to contents
            contents.push(response.candidates[0].content);
            
            // Add the function response to contents
            contents.push({
                role: 'user',
                parts: [{ functionResponse: functionResponsePart }]
            });

            // Get the final response after function call
            const finalResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: contents,
                config: config,
                systemInstruction: systemInstruction
            });

            finalReply = finalResponse.text;
        } else if (response.text) {
            finalReply = response.text;
        } else {
            finalReply = "I'm not sure how to respond to that. Could you please rephrase your question about Walmart products?";
        }

        // Save messages with session metadata
        await db.saveChatMessage(userId, 'user', message, { sessionId });
        await db.saveChatMessage(userId, 'model', finalReply, { sessionId });

        res.json({ 
            reply: finalReply,
            sessionId: sessionId || `session_${Date.now()}`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Error in /chat endpoint:", error);
        res.status(500).json({ 
            error: "I'm experiencing technical difficulties. Please try again in a moment.",
            code: "INTERNAL_SERVER_ERROR"
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// Get user's chat history endpoint
app.get('/chat/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50 } = req.query;
        
        const history = await db.getChatHistory(userId, parseInt(limit));
        res.json({ history, count: history.length });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});

app.listen(PORT, () => {
    console.log(`🤖 Walmart AI Agent server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});