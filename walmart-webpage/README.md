# Project Spark: The Conversational Commerce Frontend

![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-10.x-purple?style=for-the-badge)

This repository contains the frontend implementation for Project Spark, a groundbreaking conversational commerce experience built for the Walmart Sparkathon. This is not just a website clone; it's a complete reimagining of the user journey, powered by a central, intelligent AI agent.

## The Vision: A Shopping Experience That Understands You

The core vision of Project Spark is to move beyond the limitations of traditional search bars and filters. We believe the future of e-commerce is conversational, personal, and immersive.

This frontend brings that vision to life by introducing **Spark**, an AI shopping assistant that users can talk to as naturally as a human expert. Instead of typing keywords, users can simply state their needs:
- "I need a dress for a summer wedding that's under $100."
- "What are the top-rated noise-cancelling headphones?"
- "Compare this laptop to the other one for me."

Spark understands, finds the right products, summarizes reviews, answers detailed questions, and can even help users visualize products in their own space using Augmented Reality (AR).

## ✨ Frontend Features & UI/UX

This Next.js application is designed to deliver a seamless and modern user experience.

#### 1. **Immersive Agent Experience**
-   Instead of a small popup, the agent is accessed via a large, friendly mascot button that navigates to a dedicated, full-screen agent interface at the `/agent` route. This removes distractions like the site's header and footer, creating a focused conversational environment.

#### 2. **Dynamic Two-State UI**
-   **Greeting View:** A beautiful, welcoming screen featuring the "Spark" mascot, designed to prompt the user for their initial request via voice or text.
-   **Results View:** Once the agent finds products, the UI fluidly transitions to a sophisticated two-column layout on web (and a stacked view on mobile). The agent's response and controls are on one side, while the product recommendations are displayed in a scrollable carousel on the other, just as envisioned in our design sketches.

#### 3. **Voice-First Interaction**
-   Utilizes the browser's **Web Speech API** for seamless voice input.
-   Provides clear, animated visual feedback when the microphone is active, so the user always knows when Spark is listening.

#### 4. **Rich Text & Data Display**
-   Agent responses are rendered using a Markdown component, correctly formatting bold text and lists to make the chat feel natural and readable.
-   Product cards are designed to clearly display key information, including a special "AR" badge if a 3D model is available.

#### 5. **Advanced State Management**
-   A central **React Context (`AgentContext.tsx`)** manages the entire state of the conversation, including messages, recommended products, and loading status, making it accessible to any component that needs it.

## 🛠️ Technology Stack

-   **Framework:** **Next.js 14** with the App Router
-   **Language:** **TypeScript**
-   **Styling:** **Tailwind CSS** for a utility-first, responsive design.
-   **Animation:** **Framer Motion** for fluid page transitions and micro-interactions.
-   **State Management:** **React Context API** for global agent state.
-   **API Communication:** **Axios** for robust requests to the backend agent.
-   **Voice Input:** In-browser **Web Speech API**.
