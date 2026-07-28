<div align="center">

# 🤖 AI Code Review Agent

### Intelligent AI-Powered Code Reviews Directly Inside VS Code

An AI-powered Code Review Agent that integrates **VS Code**, **n8n**, and **Google Gemini** to automatically analyze code quality, detect bugs, identify security issues, suggest improvements, and generate optimized code in real time.

<p align="center">

![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/n8n-ai-code-review-agent?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/n8n-ai-code-review-agent?style=for-the-badge)
![GitHub repo size](https://img.shields.io/github/repo-size/YOUR_USERNAME/n8n-ai-code-review-agent?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/YOUR_USERNAME/n8n-ai-code-review-agent?style=for-the-badge)
![License](https://img.shields.io/github/license/YOUR_USERNAME/n8n-ai-code-review-agent?style=for-the-badge)

</p>

</div>

---

# 📖 Overview

Instead of copying code into an AI chatbot every time you need feedback, this project brings AI-powered code reviews directly into your development workflow.

Simply save your file inside **Visual Studio Code**, and the AI automatically reviews your code through an **n8n workflow** powered by **Google Gemini**.

The result is an instant, structured review with quality scores, bug detection, security analysis, performance suggestions, and AI-generated fixes.

---

# ✨ Features

- 🔍 Automatic code review
- ⚡ Real-time analysis
- 🤖 Google Gemini integration
- 🔐 Security vulnerability detection
- 🐞 Bug & logic error detection
- 🚀 Performance optimization suggestions
- ⭐ Code Quality Score (0–10)
- 📊 Severity-based issue categorization
- 💡 AI-generated improved code
- 🖥️ Professional VS Code sidebar
- 📋 Structured JSON responses
- 🔄 Fully automated n8n workflow

---

# 📸 Screenshots

## VS Code Extension and AI Review Report

<img width="911" height="497" alt="image" src="https://github.com/user-attachments/assets/bd61daf4-4715-4915-9292-b2bc4217f012" />


---

## n8n Workflow

<img width="959" height="376" alt="image" src="https://github.com/user-attachments/assets/a51dab92-98d0-4814-9a70-0971bbd45864" />


---

# 🏗 Architecture

```text
                    ┌────────────────────┐
                    │    Visual Studio    │
                    │        Code         │
                    └──────────┬──────────┘
                               │
                         Ctrl + S
                               │
                               ▼
                 ┌────────────────────────┐
                 │ VS Code Extension      │
                 └──────────┬─────────────┘
                            │
                            ▼
                  ┌─────────────────────┐
                  │     n8n Workflow    │
                  └──────────┬──────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │ Google Gemini API      │
                └──────────┬─────────────┘
                           │
                           ▼
             AI Analysis + Structured JSON
                           │
                           ▼
              ┌─────────────────────────┐
              │ VS Code Review Panel    │
              └─────────────────────────┘
```

---

# ⚙️ Tech Stack

| Technology | Purpose |
|------------|---------|
| TypeScript | VS Code Extension |
| Node.js | Backend Runtime |
| n8n | Workflow Automation |
| Google Gemini API | AI Code Review |
| REST API | Communication |
| JSON | Structured Responses |

---

# 📂 Project Structure

```text
n8n-ai-code-review-agent/

├── vscode-extension/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
├── n8n-workflow/
│   └── workflow.json
│
├── screenshots/
│   ├── vscode-extension.png
│   ├── n8n-workflow.png
│   └── review-panel.png
│
├── README.md
└── LICENSE
```

---

# 🚀 Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/n8n-ai-code-review-agent.git

cd n8n-ai-code-review-agent
```

---

## 2️⃣ Install Extension Dependencies

```bash
cd vscode-extension

npm install
```

---

## 3️⃣ Import n8n Workflow

Open n8n

Import

```
workflow.json
```

---

## 4️⃣ Configure Environment

Create

```
.env
```

Add

```env
GEMINI_API_KEY=YOUR_API_KEY
```

---

## 5️⃣ Run Extension

```bash
npm run compile
```

Press

```
F5
```

to launch the Extension Development Host.

---

# 🚀 Usage

1. Open VS Code
2. Start the Extension
3. Open a source file
4. Press **Ctrl + S**
5. Wait a few seconds
6. View AI Review
7. Copy or Apply Suggested Fixes

---

# 📊 AI Review Output

The AI returns a structured report including:

```json
{
  "score": 9,
  "issues": [
    {
      "severity": "High",
      "title": "Potential SQL Injection",
      "fix": "Use parameterized queries."
    }
  ],
  "improvedCode": "..."
}
```

---

# 🎯 Roadmap

- [ ] Multi-language support
- [ ] GitHub Pull Request Reviews
- [ ] Inline AI Suggestions
- [ ] AI Chat Mode
- [ ] Multiple LLM Support
- [ ] Review History
- [ ] Team Collaboration
- [ ] Dark/Light Themes
- [ ] Export Reports
- [ ] Docker Deployment

---

# 🤝 Contributing

Contributions are always welcome.

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

# 📜 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Faizan Khalid**

Backend Developer • AI Automation Enthusiast • Computer Science Student

- 💼 LinkedIn: https://www.linkedin.com/in/faizan-khalid-b95140395/
- 🌐 GitHub: https://github.com/FaizanKhalid-Coder

---

<div align="center">

⭐ If you found this project useful, don't forget to star the repository!

</div>
