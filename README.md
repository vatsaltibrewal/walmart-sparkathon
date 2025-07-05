# Project Spark: Your Personal Walmart Shopping Assistant

![Walmart Sparkathon](https://img.shields.io/badge/Walmart-Sparkathon%202025-blue)
![Category](https://img.shields.io/badge/Category-Reimagining%20Customer%20Experience-brightgreen)
![Technology](https://img.shields.io/badge/Technology-AI%20%7C%20AR%20%7C%20Voice-orange)

**Project Spark** is our entry for the Walmart Sparkathon, designed for the "Reimagining Customer Experience with Emerging Technologies" category. It's a hyper-personalized, voice-first AI shopping assistant that redefines how customers discover, evaluate, and purchase products at Walmart.

## The Vision: Beyond the Search Bar

Traditional e-commerce relies on impersonal search bars and endless scrolling. Customers know what they *need*, but finding what they *want* is a challenge. We envisioned a new experience: what if every customer had a dedicated, expert Walmart sales assistant available 24/7, on any device?

Project Spark is that assistant. It's an AI agent that a customer can talk to naturally, just like a person. It listens to their needs, understands their intent, and acts as a trusted guide through Walmart's vast product catalog. It's not just a chatbot; it's a conversational companion designed to make shopping faster, more intuitive, and infinitely more personal.

## ✨ Core Features

Our platform is built on a foundation of cutting-edge technologies to create a truly next-generation shopping experience.

### 🗣️ **Conversational Product Discovery**
-   **Natural Language Understanding:** Users can speak or type complex requests like, *"I'm looking for a durable, waterproof laptop bag that's good for travel and under $50."*
-   **Intelligent Filtering:** The AI agent intelligently translates conversational requests into precise searches, filtering by brand, specifications, price, and more.

### 🧠 **AI-Powered Insights & Summarization**
-   **Review Analysis:** Ask "What do people think of this product?" and the AI will read through dozens of top reviews and provide a concise summary of the pros and cons.
-   **Comparison Mode:** Ask the agent to *"Compare this laptop with that one,"* and it will generate a side-by-side summary of key differences in features, price, and ratings.

### ❤️ **Deep Personalization & Memory**
-   **Continuous Conversation:** Spark remembers your past interactions. It can reference previous searches and suggestions to offer more relevant help over time.
-   **Proactive Notifications:** If a desired item (like a red dress) is out of stock, the user can ask Spark to monitor it. The agent will proactively message the user via WhatsApp or email when the item is available again.

### **Augmented Reality (AR) Pre-Purchase Experience**
-   **View in Your Space:** For products like furniture or electronics, users can instantly view a 3D model in their own room using their smartphone camera.
-   **Virtual Try-On (Future-Ready):** The architecture supports integrating virtual try-on technology, allowing users to see how a t-shirt or accessory might look on them.

### 🌱 **Value-Driven Shopping**
-   **Sustainability Focus:** Users can ask for "eco-friendly" or "sustainably-sourced" products. The AI will highlight items with relevant certifications and explain their environmental benefits, aligning with Walmart's core values.

### 🌐 **Omnichannel Architecture**
-   **Headless AI Brain:** Spark is built as a centralized, "headless" AI agent. This means the same intelligent brain can be connected to any frontend—our demo web app, a WhatsApp chat, an in-store kiosk, or even integrated into the official Walmart app.

## 🏗️ Architectural Overview

We designed Project Spark as a robust and scalable platform. The "brain" is a separate backend service, allowing for a consistent user experience across any channel.

```
+-------------------------------------------------+
|               FRONTENDS ("The Faces")           |
|                                                 |
|  [Demo Web Page]   [WhatsApp]   [In-Store Kiosk]|
|        |               |              |         |
+--------|---------------|--------------|---------+
         |               |              |
         +---------------+--------------+
                         | (Secure API Call)
+------------------------v------------------------+
|                                                 |
|        AI AGENT BACKEND ("The Brain")           |
|        (Node.js Server with Gemini API)         |
|                                                 |
|   +-----------------------------------------+   |
|   | Tools: searchProducts(), getReviews()...|   |
|   +-----------------------------------------+   |
|                                                 |
+------------------------^------------------------+
                         |
+------------------------|------------------------+
|                                                 |
|           DATA SOURCES & MEMORY (AWS)           |
|    [DynamoDB Products] [DynamoDB Chat History]  |
|                                                 |
+-------------------------------------------------+
```

## 🛠️ Technology Stack

We chose a modern, reliable, and scalable tech stack based on JavaScript and best-in-class cloud services.

-   **Frontend:** React / Next.js, Web Speech API (for voice)
-   **Backend:** Node.js, Express.js
-   **AI & Natural Language:** Google Gemini 2.5 Flash
-   **Database:** Amazon DynamoDB (for product catalog and chat history)
-   **Deployment:** Vercel (for frontend), AWS (for database)

## 🗺️ Future Roadmap

-   **Deeper In-Store Integration:** Use store-specific APIs to provide aisle numbers and real-time local stock information.
-   **Enhanced Accessibility:** Implement adjustable voice speed, high-contrast themes, and screen-reader compatibility.
-   **Advanced AR:** Move from "View in Your Space" to full, interactive virtual try-ons for apparel and accessories.
-   **Vector Database Integration:** Augment function calling with a vector database (like Pinecone or AWS OpenSearch) to enable searching by abstract concepts (e.g., "an outfit for a summer wedding").

---

Thank you for considering Project Spark!


Made with ❤️ by Vatsal & Aditya
