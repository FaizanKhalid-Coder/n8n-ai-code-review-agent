# AI Code Reviewer (VS Code Extension)

Automatic code review on save. Save a file → the extension sends the code to
your n8n webhook → Gemini reviews it → a side panel shows a quality score,
issues, and a one-click "fixed code" you can accept or copy.

## 1. Install dependencies

Open a terminal **inside this folder** and run:

```bash
npm install
```

This downloads TypeScript and the VS Code type definitions needed to build
the extension.

## 2. Compile

```bash
npm run compile
```

This turns `src/extension.ts` into `out/extension.js`, which is what VS Code
actually runs.

(Optional, while developing: run `npm run watch` instead — it recompiles
automatically every time you save a change to the extension's own code.)

## 3. Run it inside VS Code

1. Open this `ai-code-reviewer` folder in VS Code (`File > Open Folder...`).
2. Press **F5** (or `Run > Start Debugging`).
3. A **new VS Code window** opens — this is the "Extension Development Host,"
   a sandbox with your extension already loaded.

## 4. Point it at your n8n webhook

In the **new window** that opened:

1. Open Settings (`Ctrl+,`).
2. Search for **"AI Code Reviewer"**.
3. Paste your n8n **Production Webhook URL** into `aiCodeReviewer.webhookUrl`.
   (This is the same URL from your Webhook node's "Production URL" tab.)

## 5. Try it

1. In that same sandbox window, open or create any code file (e.g. a `.py`
   or `.cpp` file).
2. Write some code, then press **Ctrl+S** to save.
3. The review panel opens automatically on the side, showing:
   - A **quality score** (0–10)
   - A **summary**
   - A list of **issues** (color-coded by severity)
   - **Suggested fixed code**, with buttons to **Copy** it or
     **Accept & Apply** it directly into your editor
4. Click **"Re-run Review"** anytime to review the current file again without
   saving a new change.

You can also trigger a review manually without saving, via the Command
Palette (`Ctrl+Shift+P`) → **"AI Code Reviewer: Review Current File"**.

## 6. Turning off auto-review-on-save

If you'd rather trigger reviews manually instead of on every save, go to
Settings → **AI Code Reviewer** → uncheck `aiCodeReviewer.reviewOnSave`.

## 7. Installing it permanently (not just for testing)

Once you're happy with it, you can package it into a real, installable
extension file:

```bash
npm install -g @vscode/vsce
vsce package
```

This creates a file like `ai-code-reviewer-0.1.0.vsix`. Install it in any VS
Code with:

```bash
code --install-extension ai-code-reviewer-0.1.0.vsix
```

Or via the UI: Extensions panel → `...` menu → **"Install from VSIX..."**.

## Troubleshooting

- **"No webhook URL configured"** → you haven't set
  `aiCodeReviewer.webhookUrl` in Settings yet (Step 4).
- **Panel shows raw text instead of score/issues** → your n8n AI Agent isn't
  returning structured JSON yet. Make sure "Require Specific Output Format"
  is enabled on the AI Agent node, and the Respond to Webhook node's
  Response Body is `{{ $json.output }}`.
- **"Webhook returned status 404"** → you're using the **Test URL** instead
  of the **Production URL**, or the workflow isn't Published/Active in n8n.
- **Nothing happens on save** → check `aiCodeReviewer.reviewOnSave` is
  enabled, and that you saved a real file on disk (not an unsaved/untitled
  document).
