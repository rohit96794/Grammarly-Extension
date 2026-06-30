# Quick Translator Pro 🚀

Quick Translator Pro is a lightweight, super-fast Chrome Extension built on Manifest V3. It acts like an AI-powered writing assistant (similar to Grammarly) that instantly improves or translates your text into three standard English variations: **Professional (Formal)**, **Casual (Friendly)**, and **Simple**.

---

## ✨ Features
* **Floating AI Bubble (G Icon):** Appears automatically at the bottom-right corner of any focused text box, input, textarea, or content-editable field (like WhatsApp Web or Gmail).
* **Keyboard Shortcut Support:** Hit `Ctrl + Shift + Y` (Mac: `Cmd + Shift + Y`) to fetch suggestions instantly.
* **3 Writing Modes:** Pick the best response type depending on your audience:
  * 💼 **Professional:** Perfect for emails, office chats, and formal documents.
  * ✨ **Casual:** Great for friendly conversations and social media.
  * ⚡ **Simple:** Short, crisp, and direct text updates.
* **Zero Layout Breakage:** Renders dynamically inside the web page context using vanilla JavaScript overlays.
* **Smart Model Fallback:** Intelligent automated switching between Gemini 2.5, 2.0, 1.5, and Gemma pipelines in case of network traffic or heavy demand.

---

## 🛠️ Installation & API Setup Guide

Since this extension runs entirely locally on your machine without middleware servers, **you will need to provide your own Gemini API Key** from Google AI Studio (which offers a highly generous free tier).

Follow these simple steps to get started:

### Step 1: Get Your Free Gemini API Key
1. Go to [Google AI Studio (API Keys Page)](https://aistudio.google.com/api-keys).
2. Log in with your standard Google Account.
3. Click on the **"Create API Key"** button.
4. Locate your new key, click the **Copy icon (`content_copy`)** to copy the full string to your clipboard. 
   > **Note:** The real API key starts with `AIzaSy...` or `AQ...`. Do not just manually select text off the preview table; use the dedicated copy button.
