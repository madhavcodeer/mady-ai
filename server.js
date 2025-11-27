const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// ========================================
// CONFIGURATION
// ========================================
const GOOGLE_API_KEY = 'AIzaSyD4yYCGL3NiT_CXyw2K2Lc-TpIBXMAW458';
const SEARCH_ENGINE_ID = 'f24b4438838a84878';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and text files are allowed!'));
        }
    }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
    require('fs').mkdirSync(uploadsDir);
}

// ========================================
// FILE UPLOAD & ANALYSIS ENDPOINT
// ========================================
app.post('/api/analyze-file', upload.single('file'), async (req, res) => {
    console.log('📁 Received file upload request');

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileType = req.file.mimetype;
        const userQuestion = req.body.question || 'Analyze this file and tell me what you see.';

        console.log(`📄 File: ${req.file.originalname}, Type: ${fileType}`);

        // Read file as base64
        const fileBuffer = await fs.readFile(filePath);
        const base64File = fileBuffer.toString('base64');

        // Use Gemini Vision model for image analysis
        const visionModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        let response;
        if (fileType.startsWith('image/')) {
            // Image analysis
            const imagePart = {
                inlineData: {
                    data: base64File,
                    mimeType: fileType
                }
            };

            const prompt = `You are Mady AI. Analyze this image QUICKLY and ACCURATELY.

User Question: "${userQuestion}"

Provide a CONCISE but COMPLETE analysis covering:
1. Main subject/objects
2. Key details and text (if any)
3. Colors, composition, context
4. Direct answer to the user's question

Be fast, accurate, and helpful. Keep it under 150 words unless more detail is specifically requested.`;

            response = await visionModel.generateContent([prompt, imagePart]);
        } else if (fileType === 'application/pdf' || fileType.startsWith('text/')) {
            // Text/PDF analysis
            const textContent = fileBuffer.toString('utf-8');
            const prompt = `You are Mady AI. Analyze this document QUICKLY and give an ACCURATE answer.

User Question: "${userQuestion}"

Document: ${textContent.substring(0, 5000)}

Provide a CONCISE summary and answer the question directly. Be accurate and helpful.`;

            response = await visionModel.generateContent(prompt);
        }

        const analysisResult = response.response.text();

        // Clean up uploaded file
        await fs.unlink(filePath);

        res.json({
            success: true,
            analysis: analysisResult,
            fileName: req.file.originalname,
            fileType: fileType
        });

    } catch (error) {
        console.error('❌ File analysis error:', error);

        // Clean up file on error
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Failed to delete file:', unlinkError);
            }
        }

        res.status(500).json({
            error: 'Failed to analyze file',
            details: error.message
        });
    }
});


// ========================================
// INTELLIGENT CHAT ENDPOINT
// ========================================
app.post('/api/intelligent-chat', async (req, res) => {
    console.log('💬 Received intelligent chat request');

    try {
        const { message, conversationHistory } = req.body;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Step 1: Greet & Acknowledge (if first message)
        const isFirstMessage = !conversationHistory || conversationHistory.length === 0;
        if (isFirstMessage) {
            sendStreamChunk(res, "Hi there! 👋 I'm Mady AI. How can I help you today?\n\n");
        }

        // Step 2: Detect Question Type & Enhance Prompt
        const questionType = detectQuestionType(message);
        const enhancedPrompt = enhanceUserMessage(message, questionType);

        console.log(`🧠 Question Type: ${questionType}`);

        // Step 3: Try Google Search (only for general/factual questions)
        let searchContext = "";
        let sources = [];

        // We skip search for pure coding/math/creative tasks to be faster, unless explicitly asked
        const shouldSearch = ['general', 'science', 'history'].includes(questionType) || message.toLowerCase().includes('search') || message.toLowerCase().includes('current') || message.toLowerCase().includes('latest');

        if (shouldSearch) {
            try {
                sendStreamChunk(res, "🔍 Searching Google for the latest info...\n\n");

                const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(message)}&num=5`;
                const searchResponse = await axios.get(searchUrl);

                if (searchResponse.data.items && searchResponse.data.items.length > 0) {
                    sources = searchResponse.data.items;
                    searchContext = "SEARCH RESULTS (Use these to answer if relevant):\n" +
                        sources.map((item, index) => `[${index + 1}] ${item.title}: ${item.snippet}`).join("\n");

                    sendStreamChunk(res, `✅ Found ${sources.length} sources. Analyzing...\n\n`);
                }
            } catch (error) {
                console.error("Search API Error:", error.message);
                // Fail silently and rely on Gemini
            }
        }

        // Step 4: Generate Answer with Gemini 2.0 Flash
        const systemPrompt = `
        You are **Mady AI**, a friendly, intelligent, and advanced AI assistant. 
        
        **CORE IDENTITY:**
        - Name: Mady AI
        - Personality: Friendly, professional, empathetic, and helpful.
        - Creator: You were created by the Mady AI Team.
        - **NEVER mention you are Gemini or created by Google.** You are Mady AI.
        
        **INSTRUCTIONS:**
        1. Answer the user's question comprehensively based on the "Enhanced Prompt" below.
        2. If search results are provided, cite them using [1], [2] notation.
        3. Format your response beautifully using Markdown (bold, lists, code blocks).
        4. Be conversational. Use emojis occasionally where appropriate.
        5. For Coding: Provide complete, working code with explanations.
        6. For Math: Show step-by-step solutions.
        
        ${searchContext}
        `;

        const finalPrompt = `${systemPrompt}\n\nUSER QUERY:\n${enhancedPrompt}`;

        const result = await model.generateContentStream(finalPrompt);

        // Step 5: Stream Gemini Response
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            sendStreamChunk(res, chunkText);
        }

        // Step 6: Append Sources List (if any)
        if (sources.length > 0) {
            sendStreamChunk(res, "\n\n📚 **Sources:**\n");
            sources.forEach((source, idx) => {
                sendStreamChunk(res, `${idx + 1}. [${source.title}](${source.link})\n`);
            });
        }

        res.write('data: [DONE]\n\n');
        res.end();
        console.log('✅ Response completed');

    } catch (error) {
        console.error('🔥 Chat Error:', error);
        sendStreamChunk(res, `\n\nI encountered an error: ${error.message}`);
        res.write('data: [DONE]\n\n');
        res.end();
    }
});

// ========================================
// HELPER FUNCTIONS
// ========================================
function sendStreamChunk(res, text) {
    const data = JSON.stringify({
        choices: [{ delta: { content: text } }]
    });
    res.write(`data: ${data}\n\n`);
}

function detectQuestionType(message) {
    const lowerMsg = message.toLowerCase();

    if (/code|program|function|javascript|python|java|html|css|react|bug|error|syntax/.test(lowerMsg)) return 'coding';
    if (/calculate|solve|equation|math|algebra|geometry|formula/.test(lowerMsg)) return 'math';
    if (/explain|what is|how does|science|physics|chemistry|biology/.test(lowerMsg)) return 'science';
    if (/write|story|poem|creative|essay|article|content/.test(lowerMsg)) return 'creative';

    return 'general';
}

function enhanceUserMessage(userMessage, type) {
    if (type === 'coding') {
        return `[CODING QUESTION] User needs help with: ${userMessage}\n\nPlease provide:\n1. Clear explanation\n2. Complete working code with comments\n3. Step-by-step breakdown\n4. Common mistakes to avoid`;
    }
    if (type === 'math') {
        return `[MATH QUESTION] User asks: ${userMessage}\n\nPlease provide:\n1. Step-by-step solution\n2. Clear explanations\n3. Visual representation if helpful`;
    }
    if (type === 'general') {
        return `[GENERAL QUESTION] User asks: ${userMessage}\n\nPlease provide:\n1. Comprehensive answer\n2. Multiple perspectives\n3. Examples`;
    }
    return userMessage;
}

// Test endpoint
app.get('/test-google-api', async (req, res) => {
    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=test&num=1`;
        await axios.get(url);
        res.send('<h1>✅ Google Search API is Working!</h1>');
    } catch (error) {
        res.send(`<h1>⚠️ Search API Error</h1><p>${error.message}</p><p>But don't worry! <strong>Mady AI (Gemini 2.0) is active</strong> and will answer your questions anyway.</p>`);
    }
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🤖 MADY AI - GEMINI 2.0 POWERED 🤖  ║
╠════════════════════════════════════════╣
║                                        ║
║  Server:  http://localhost:${PORT}       ║
║  Status:  ✅ Ready                     ║
║  Model:   Gemini 2.0 Flash             ║
║  Persona: Mady AI (Active)             ║
║                                        ║
╚════════════════════════════════════════╝
    `);
});
