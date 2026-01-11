# Accessibility Extension for Indian Classrooms

## Overview
A comprehensive browser extension providing assistive technologies for students with disabilities in Indian educational settings.

## Features

### Universal Features (All Students)
- 🤖 **AI Companion**: Always-on conversational assistant
- 📊 **Feedback Collection**: Real-time understanding/doubt reporting

### Disability-Specific Tools

#### 🔊 Hearing Impaired (The "Visualizer")
- Live transcription overlay
- Emotion and keyword detection

#### 👁️ Visually Impaired (The "Describer")
- Semantic screen reader
- AI-powered image descriptions

#### 🎯 ADHD (The "Focus Tunnel")
- Blinder mode with reading mask
- Bionic reading
- TL;DR summaries

#### ✋ Motor Disabilities (The "Big Click")
- Hit-area expansion
- Voice navigation

## Setup Instructions

### 1. Install Dependencies
```bash
cd accessibility-extension
npm install
```

### 2. Configure Supabase
Get the Supabase credentials from your friend and update `utils/supabase-client.js`

### 3. Load Extension in Browser

**Chrome/Edge:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `accessibility-extension` folder

## Project Structure
- `background/` - Service worker
- `content/` - Scripts injected into pages
- `popup/` - Extension popup UI
- `features/` - All accessibility features
- `utils/` - Shared utilities
- `assets/` - Icons and media

## Development
1. Edit files
2. Reload extension in browser
3. Test on web pages
4. Check console for errors

## License
MIT
