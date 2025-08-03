# Diff2Commit

![stars](https://img.shields.io/github/stars/ivanreeve/text-compression-library)
![watchers](https://img.shields.io/github/watchers/ivanreeve/text-compression-library)
![contributors](https://img.shields.io/github/contributors/ivanreeve/text-compression-library)
![commits](https://img.shields.io/github/commit-activity/w/ivanreeve/text-compression-library/main)

Say goodbye to "fix stuff" and "updates" commits! This clever Gemini-powered tool takes one look at your messy diffs and magically transforms them into articulate, meaningful commit messages that actually tell the story of what you built. No more staring at the terminal wondering how to describe that complex refactor or bug fix—just let AI do the heavy lifting while you focus on writing great code. Your future self (and your teammates) will thank you for having a git history that reads like poetry instead of cryptic hieroglyphics.

## ✨ Features

- **AI-Powered Analysis**: Leverages Google's Gemini AI to understand code changes contextually
- **Drag & Drop Interface**: Simply drop your `.diff` files into the web interface
- **Smart Commit Messages**: Generates both concise subjects and detailed descriptions
- **Copy-Ready Output**: One-click copying for immediate use in your git workflow
- **No Setup Required**: Web-based tool that works instantly

## 🚀 Quick Start

### Option 1: Use the Live Demo
Visit [diff2commit.vercel.app](https://diff2commit.vercel.app) and start generating commit messages immediately!

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/diff2commit.git
cd diff2commit

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Gemini API key to .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## 📝 How to Use

1. **Generate a diff file** from your git repository:
   ```bash
   git diff > my-changes.diff
   # or for staged changes:
   git diff --cached > my-changes.diff
   ```

2. **Upload your diff file** using one of these methods:
   - Drag and drop the `.diff` file onto the upload area
   - Click "Choose File" to browse and select your diff file
   
   > **Important**: The file must be a valid git diff starting with `diff --git`

3. **Generate commit message** by clicking the "Generate" button

4. **Copy and use** the generated subject and description in your commit:
   ```bash
   git commit -m "Generated subject" -m "Generated description"
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key in the API Keys section
4. Add the key to your `.env.local` file

> **Note**: The application uses Gemini 2.5 Flash model for optimal performance and cost-effectiveness.

## 🛠️ Development

This project is built with:

- **Next.js 14** (App Router) - React framework for production
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern React component library
- **Google Gemini 2.5 Flash** - AI model for code analysis
- **Vercel** - Deployment platform

### Project Structure

```
diff2commit/
├── src/
│   ├── app/
│   │   ├── api/process/
│   │   │   └── route.js         # API endpoint for Gemini integration
│   │   ├── globals.css          # Global styles and Tailwind imports
│   │   ├── layout.js            # Root layout component
│   │   └── page.jsx             # Main application page
│   ├── components/ui/           # shadcn/ui components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   ├── skeleton.jsx
│   │   └── textarea.jsx
│   └── lib/
│       ├── system_instructions.txt  # AI prompt instructions
│       └── utils.js             # Utility functions
├── public/                      # Static assets
└── components.json              # shadcn/ui configuration
```

### API Endpoint

The `/api/process` endpoint accepts POST requests with multipart form data containing a diff file:

```javascript
// Request (FormData)
const formData = new FormData();
formData.append('file', diffFile);

// Response
{
  "subject": "Brief commit subject",
  "description": "Detailed commit description"
}
```

### File Upload Requirements

- **File format**: `.diff` or `.patch` files
- **Content validation**: Must start with `diff --git`
- **Upload method**: Multipart form data via drag & drop or file picker

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/diff2commit)

1. Connect your GitHub repository to Vercel
2. Add your `GEMINI_API_KEY` environment variable in Vercel's dashboard
3. Deploy automatically on every push to main

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: Use the Next.js build command
- **Railway**: Connect your GitHub repo
- **AWS Amplify**: Deploy with the Next.js preset

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powering the intelligent commit message generation
- The Next.js team for the excellent React framework
- Vercel for seamless deployment and hosting
