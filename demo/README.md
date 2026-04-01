# ArchitectAI - Frontend Setup

## 🚀 Quick Start

### Prerequisites
- Node.js installed on your system
- Your backend server running on `http://localhost:5000`

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Frontend Server**
   ```bash
   npm start
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

4. **Make sure your backend is running**
   Your backend should be running on `http://localhost:5000`

## 🔧 Alternative Solutions

### Option 1: Use Python Server (if you don't have Node.js)
```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

### Option 2: Use Live Server (VS Code extension)
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` and "Open with Live Server"

### Option 3: Fix CORS in Backend
Add this to your Express backend:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3000', 'file://'],
  methods: ['GET', 'POST']
}));
```

## 🐛 Troubleshooting

### CORS Error
- Make sure you're accessing via `http://localhost:3000` not `file://`
- Ensure your backend has CORS headers

### Backend Connection Error
- Verify your backend is running on port 5000
- Check that `http://localhost:5000/generate` is accessible

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9
```

## 🎯 Usage
1. Enter your project idea
2. Specify expected users and budget
3. Select relevant features
4. Click "Generate Architecture"
5. View your AWS architecture blueprint!

## 📁 File Structure
```
demo/
├── index.html          # Main frontend file
├── solution.html        # Deep dive page
├── server.js           # Frontend server
├── package.json        # Node dependencies
└── README.md           # This file
```
