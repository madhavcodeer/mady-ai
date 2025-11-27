# 🔧 Mady AI - Google Search Setup Guide

## 🎯 What Changed?

Mady AI is now **100% Google-powered**! Instead of using OpenAI or Gemini APIs, it:
- **Searches Google** for every question
- **Reads multiple web sources** (5-10 articles per query)
- **Synthesizes information** from reliable sources
- **Cites sources** with clickable links
- **Responds conversationally** like a human expert

**No more API limits. No more paid subscriptions. Pure web intelligence.**

---

## 🚀 Quick Start (2 Steps)

### **Step 1: Get Google API Credentials**

You need 2 things from Google:

#### **A. Google Custom Search API Key**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the API key (starts with `AIza...`)

#### **B. Custom Search Engine ID**

1. Go to: https://programmablesearchengine.google.com/controlpanel/create
2. Create a new search engine:
   - **Sites to search:** Leave blank (search entire web)
   - **Name:** Mady AI Search
3. Click **"Create"**
4. Go to **"Edit search engine"** → **"Setup"** → **"Basics"**
5. Turn ON **"Search the entire web"**
6. Copy your **Search engine ID** (looks like: `a1b2c3d4e5f6g7h8i`)

---

### **Step 2: Add Keys to Server**

1. Open `server.js` in your code editor
2. Find lines 10-11:
   ```javascript
   const GOOGLE_API_KEY = ''; // User will add this
   const SEARCH_ENGINE_ID = ''; // User will add this
   ```
3. Paste your keys:
   ```javascript
   const GOOGLE_API_KEY = 'AIzaSyABC123...'; // Your API key
   const SEARCH_ENGINE_ID = 'a1b2c3d4e5f6g7h8i'; // Your search engine ID
   ```
4. Save the file
5. Restart the server:
   ```bash
   node server.js
   ```

---

## ✅ That's It!

Now Mady AI will:
1. **Search Google** with 3 different queries for every question
2. **Fetch and read** the top 5-10 results
3. **Analyze content** from reliable sources
4. **Synthesize** a comprehensive answer
5. **Cite sources** with links

---

## 🎭 How It Works

### Example Conversation:

**You:** "What's the weather in Agra today?"

**Mady AI:**
```
Hi there! 👋 That's a great question! 

Let me search Google for the latest information...

🔍 Analyzing 5 sources...

Based on my research across multiple reliable sources, here's what I found:

**The current weather in Agra is partly cloudy with a temperature of 28°C (82°F). 
Humidity is at 45% with light winds of 12 km/h. The forecast shows temperatures 
reaching 32°C by afternoon with clear skies.**

📋 **Key Details:**

1. Temperature: 28°C (82°F) currently, reaching 32°C later
2. Conditions: Partly cloudy transitioning to clear
3. Humidity: 45% (comfortable)
4. Wind: 12 km/h from the northwest

📚 **Sources I checked:**

1. [Weather.com - Agra Weather](https://weather.com/...)
2. [AccuWeather - Agra Forecast](https://accuweather.com/...)
3. [India Meteorological Department](https://mausam.imd.gov.in/...)

Hope this helps! Let me know if you have more questions! 😊
```

---

## 🔍 Advanced Features

### Multi-Query Search Strategy

For every question, Mady AI generates 3 optimized search queries:

**Question:** "How to bake chocolate chip cookies?"

**Generated Queries:**
1. "How to bake chocolate chip cookies?"
2. "How to bake chocolate chip cookies tutorial"
3. "How to bake chocolate chip cookies step by step guide"

This ensures comprehensive coverage!

---

### Source Credibility Scoring

Mady AI ranks sources by credibility:

**High Credibility (0.9):**
- .gov, .edu domains
- Wikipedia
- WHO, NIH, CDC
- BBC, Reuters
- Nature, ScienceDirect

**Medium Credibility (0.6):**
- .com, .org domains

**Lower Credibility (0.4):**
- Other domains

---

### Deep Content Analysis

Instead of just reading snippets, Mady AI:
1. **Fetches full webpage content**
2. **Removes ads, scripts, navigation**
3. **Extracts main article text**
4. **Analyzes up to 5000 characters per source**
5. **Combines information intelligently**

---

## 🆓 Free Tier Limits

Google Custom Search API is **FREE** for:
- **100 queries per day**
- **10,000 queries per month** (with billing enabled)

Perfect for personal use!

---

## 🎨 UI Features

### Research Progress Indicators

Mady AI shows you what it's doing:
- "Let me search Google for the latest information..."
- "🔍 Analyzing 5 sources..."
- Real-time streaming of the answer

### Source Citations

Every answer includes:
- **Clickable source links**
- **Source titles**
- **Credibility indicators**

---

## 🔧 Troubleshooting

### "Google API not configured"

**Solution:** Add your API keys to `server.js` (lines 10-11)

### "Quota exceeded"

**Solution:** You've hit the free tier limit (100/day). Wait 24 hours or upgrade.

### "No results found"

**Solution:** Try rephrasing your question or check your internet connection.

---

## 🚀 Next Steps

1. **Get your Google API credentials** (5 minutes)
2. **Add them to server.js** (1 minute)
3. **Restart the server** (`node server.js`)
4. **Start chatting!**

---

## 💡 Pro Tips

1. **Ask specific questions** for better results
2. **Use natural language** - Mady understands context
3. **Follow up questions** work great - Mady remembers the conversation
4. **Check sources** - Click the links to verify information

---

## 🎯 Why Google-Powered?

✅ **Always up-to-date** - Real-time web search  
✅ **No API costs** - 100 free queries/day  
✅ **Transparent** - See exactly where info comes from  
✅ **Comprehensive** - Reads 5-10 sources per question  
✅ **Conversational** - Warm, friendly responses  

**Mady AI: The smartest chatbot powered by the world's best search engine.**
