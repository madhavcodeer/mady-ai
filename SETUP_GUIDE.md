# 🔧 FIXING THE API CONNECTION ISSUE

## ❌ The Problem
OpenAI's API doesn't allow direct calls from browsers due to CORS (Cross-Origin Resource Sharing) security restrictions.

## ✅ The Solution
We've created a **backend proxy server** that handles API calls securely.

---

## 🚀 SETUP INSTRUCTIONS (3 Steps)

### **Step 1: Enable PowerShell Scripts**

Open PowerShell **as Administrator** and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Type `Y` and press Enter.

---

### **Step 2: Install Dependencies**

Open a **new terminal** in the `mady-ai` folder and run:
```bash
npm install
```

This will install:
- `express` - Web server
- `cors` - CORS handling
- `dotenv` - Environment variables

---

### **Step 3: Start the Backend Server**

**Option A: Using npm**
```bash
npm start
```

**Option B: Using the batch file**
```bash
start-server.bat
```

You should see:
```
╔════════════════════════════════════════╗
║     🤖 MADY AI SERVER RUNNING 🤖      ║
╠════════════════════════════════════════╣
║                                        ║
║  Server:  http://localhost:3000       ║
║  Status:  ✅ Ready                     ║
║  API:     OpenAI GPT-4                 ║
║                                        ║
╚════════════════════════════════════════╝
```

---

## 🌐 Access the Application

Once the server is running:

1. Open your browser
2. Go to: **http://localhost:3000**
3. Click "Try Mady AI"
4. Start chatting!

---

## 🔍 Troubleshooting

### Problem: "npm is not recognized"
**Solution:** Install Node.js from https://nodejs.org/

### Problem: "Cannot find module 'express'"
**Solution:** Run `npm install` in the mady-ai folder

### Problem: "Port 3000 is already in use"
**Solution:** 
1. Find the process: `netstat -ano | findstr :3000`
2. Kill it: `taskkill /PID <process_id> /F`
3. Or change the port in `server.js` (line 5)

### Problem: "Failed to fetch"
**Solution:** Make sure the backend server is running on port 3000

---

## 📁 Project Structure

```
mady-ai/
├── server.js           ← Backend proxy server
├── package.json        ← Dependencies
├── index.html          ← Frontend
├── js/
│   └── app.js          ← Updated to use proxy
├── css/
│   └── style.css
└── start-server.bat    ← Quick start script
```

---

## 🎯 How It Works

```
Browser → Frontend (localhost:3000)
          ↓
          Backend Server (Node.js)
          ↓
          OpenAI API
          ↓
          Backend Server
          ↓
Browser ← Streaming Response
```

The backend server:
1. Receives requests from the frontend
2. Adds the API key securely
3. Forwards to OpenAI
4. Streams the response back

---

## 🔒 Security Note

Your API key is now stored in `server.js` on the backend, not exposed to the browser. This is much more secure!

---

## ✅ Quick Start Checklist

- [ ] Enable PowerShell scripts
- [ ] Run `npm install`
- [ ] Run `npm start`
- [ ] Open http://localhost:3000
- [ ] Start chatting!

---

## 💡 Alternative: Use Python Server

If you don't have Node.js, you can use the simple Python server for static files:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/setup-api-key.html

**Note:** This won't fix the CORS issue, but you can configure the API key through the UI.

---

**Need help? The server must be running for the chat to work!**
