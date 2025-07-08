# Project Spark: The Headless AI Shopping Assistant

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express)
![Google Gemini](https://img.shields.io/badge/Google-Gemini%202.5-4285F4?style=for-the-badge&logo=google)
![AWS DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-232F3E?style=for-the-badge&logo=amazon-aws)

This repository contains the backend and core intelligence for **Project Spark**, our entry for the Walmart Sparkathon. This is not just a chatbot; it's a production-ready, **headless AI agent** designed to serve as a centralized brain for reimagining the customer experience.

## The Vision: A Paradigm Shift in Customer Interaction

The current e-commerce paradigm is built around search bars and filters. It's functional, but it's not personal. It forces the customer to adapt to the machine.

Our vision is to flip that model. We've built an AI agent that adapts to the *customer*. It allows users to communicate naturally, using voice or text, to express complex needs, get personalized advice, and perform actions. This agent is designed to be the single, intelligent point of contact for any customer query, from product discovery to post-purchase support.

## The "Headless" Architecture: Build Once, Deploy Everywhere

The most critical design decision was to build Spark as a **headless agent**. This means the core logic, memory, and AI capabilities are completely decoupled from any single frontend.

This architecture makes the agent incredibly scalable and versatile. The same powerful brain can be connected to:
- A demo web application (as included in this project)
- A **WhatsApp** or SMS service (via Twilio)
- The official Walmart mobile app
- In-store interactive kiosks
- Voice assistants like Google Assistant or Alexa

This is the future of customer service: a single, consistent, and intelligent experience, no matter where the customer chooses to interact.

## 🧠 Key Agent Capabilities

### 1. Advanced Conversational Understanding
Powered by Google's Gemini 1.5 model, the agent can understand the nuances of human language, including context, intent, and conversational history.

### 2. Deep Product Knowledge via Function Calling
The agent doesn't "know" anything on its own, which prevents hallucination. Instead, it uses a robust set of tools (functions) to interact with our databases in real-time.

**Available Tools:**
- `findProducts`: Conducts complex, multi-filter searches.
- `getProductDetails`: Retrieves detailed specifications for a specific product.
- `getProductReviews`: Fetches and can summarize customer opinions.
- `getProductsByCategory`: An optimized query for category-specific browsing.
- `getTrendingProducts`: Identifies best-sellers and top-rated items.

### 3. Stateful Personalization & Memory
Every conversation is stored and linked to a `userId`. The agent uses this chat history to provide personalized, context-aware responses, remembering past searches and preferences to feel like a true personal assistant.

### 4. Proactive Task & Reasoning Engine
The architecture supports proactive tasks. For example, the agent can be taught to monitor an out-of-stock item and trigger a notification when it becomes available, creating a magical customer experience.

## 🏗️ Architectural Diagram

```
+-------------------------------------------------+
|               FRONTENDS ("The Faces")           |
|  [Web App]   [WhatsApp]   [In-Store Kiosk]      |
|      |             |              |             |
+------|-------------|--------------|-------------+
       |             |              |
       +-------------+--------------+
                     | (Secure API Call)
+--------------------v----------------------------+
|                                                 |
|        SPARK AI AGENT (This Repository)         |
|        (Node.js Server with Gemini API)         |
|                                                 |
|   +-----------------------------------------+   |
|   | Tools: findProducts(), getReviews()...  |   |
|   +-----------------------------------------+   |
|                                                 |
+--------------------^----------------------------+
                     |
+--------------------|----------------------------+
|                                                 |
|        DATA SOURCES & MEMORY (AWS DynamoDB)     |
|    [Product Catalog DB] [Chat History DB]       |
|                                                 |
+-------------------------------------------------+
```

## 🛠️ Technology Stack

-   **Runtime:** Node.js v18+ (using ES Modules)
-   **Server:** Express.js
-   **AI Model:** Google Gemini 2.5 Flash (via `@google/genai`)
-   **Database:** Amazon DynamoDB (using `@aws-sdk/client-dynamodb` v3)
-   **Configuration:** `dotenv` for secure environment variable management
-   **CORS:** `cors` middleware to allow cross-origin requests

## 🔌 API Documentation

The agent exposes a single, primary endpoint for all interactions.

### `POST /chat`

This endpoint is the main entry point for the agent.

**Request Body:**
```json
{
  "message": "I'm looking for a t-shirt that's good for hiking.",
  "userId": "user_12345"
}
```

**Success Response (200 OK):**
```json
{
  "reply": "Of course! I found an 'Eco-Soft Organic Cotton T-Shirt' from GreenThread that's highly rated. It's made from 100% organic cotton, so it's very breathable. Would you like to know more about it?"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Sorry, I'm having some trouble right now. Please try again later."
}
```

## 🗺️ Future Roadmap

-   **Compositional Function Calling:** Implement multi-step reasoning where the agent can call one function, analyze the result, and then call a second function to complete a complex task (e.g., "find the most popular laptop and then tell me its detailed specs").
-   **Integrate More Tools:** Connect to other Walmart APIs for order tracking, store hours, or appointment scheduling.
-   **Enhanced State Management:** Implement more sophisticated session management to handle things like a user's shopping cart directly within the conversation.
