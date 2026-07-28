import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

interface ReviewIssue {
  severity: string;
  description: string;
}

interface ReviewResult {
  score?: number;
  summary?: string;
  issues?: ReviewIssue[];
  fixedCode?: string;
  raw?: string;
  error?: string;
}

let panel: vscode.WebviewPanel | undefined;
let lastReviewedDocument: vscode.TextDocument | undefined;

export function activate(context: vscode.ExtensionContext) {
  // Command: manually trigger a review of the active file
  context.subscriptions.push(
    vscode.commands.registerCommand('aiCodeReviewer.reviewCurrentFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('AI Code Reviewer: Open a file first.');
        return;
      }
      runReview(context, editor.document);
    })
  );

  // Command: just open/focus the panel without running a new review
  context.subscriptions.push(
    vscode.commands.registerCommand('aiCodeReviewer.openPanel', () => {
      createOrShowPanel(context);
    })
  );

  // Auto-review on save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      const config = vscode.workspace.getConfiguration('aiCodeReviewer');
      const reviewOnSave = config.get<boolean>('reviewOnSave', true);
      if (!reviewOnSave) {
        return;
      }
      // Skip non-file documents (settings.json, output panels, etc.)
      if (document.uri.scheme !== 'file') {
        return;
      }
      runReview(context, document);
    })
  );
}

async function runReview(context: vscode.ExtensionContext, document: vscode.TextDocument) {
  const config = vscode.workspace.getConfiguration('aiCodeReviewer');
  const webhookUrl = config.get<string>('webhookUrl', '');

  if (!webhookUrl) {
    vscode.window.showErrorMessage(
      'AI Code Reviewer: No webhook URL configured. Set "aiCodeReviewer.webhookUrl" in Settings.'
    );
    return;
  }

  lastReviewedDocument = document;
  const targetPanel = createOrShowPanel(context);
  targetPanel.webview.postMessage({ type: 'loading' });

  const code = document.getText();
  const fileName = document.fileName.split(/[\\/]/).pop() || 'untitled';
  const language = document.languageId;

  try {
    const result = await sendToWebhook(webhookUrl, { code, fileName, language });
    targetPanel.webview.postMessage({ type: 'result', payload: result });
  } catch (err: any) {
    const message = err?.message || 'Unknown error contacting n8n webhook.';
    targetPanel.webview.postMessage({ type: 'result', payload: { error: message } });
    vscode.window.showErrorMessage(`AI Code Reviewer: ${message}`);
  }
}

function sendToWebhook(
  webhookUrl: string,
  body: { code: string; fileName: string; language: string }
): Promise<ReviewResult> {
  return new Promise((resolve, reject) => {
    let url: URL;
    try {
      url = new URL(webhookUrl);
    } catch {
      reject(new Error('The configured webhook URL is not valid.'));
      return;
    }

    const payload = JSON.stringify(body);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 60000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (!res.statusCode || res.statusCode >= 400) {
            reject(new Error(`Webhook returned status ${res.statusCode}: ${data.slice(0, 200)}`));
            return;
          }
          try {
            const parsed = JSON.parse(data);
            // n8n may wrap the review under an "output" key depending on how
            // the Respond to Webhook node was configured.
            const review = parsed.output ? parsed.output : parsed;
            resolve(typeof review === 'string' ? { raw: review } : review);
          } catch {
            // Not JSON — treat the raw text as the review body.
            resolve({ raw: data });
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Request to n8n webhook timed out after 60s.'));
    });
    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

function createOrShowPanel(context: vscode.ExtensionContext): vscode.WebviewPanel {
  if (panel) {
    panel.reveal(vscode.ViewColumn.Beside);
    return panel;
  }

  panel = vscode.window.createWebviewPanel(
    'aiCodeReviewer',
    'AI Code Review',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  panel.webview.html = getWebviewHtml();

  panel.onDidDispose(() => {
    panel = undefined;
  });

  panel.webview.onDidReceiveMessage(async (message) => {
    switch (message.type) {
      case 'rerun': {
        const editor = vscode.window.activeTextEditor;
        const doc = lastReviewedDocument || editor?.document;
        if (doc) {
          runReview(context, doc);
        } else {
          vscode.window.showWarningMessage('AI Code Reviewer: No file to re-review yet.');
        }
        break;
      }
      case 'copyFixedCode': {
        await vscode.env.clipboard.writeText(message.code || '');
        vscode.window.showInformationMessage('AI Code Reviewer: Fixed code copied to clipboard.');
        break;
      }
      case 'acceptFixedCode': {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage('AI Code Reviewer: No active editor to apply changes to.');
          return;
        }
        const doc = editor.document;
        const fullRange = new vscode.Range(
          doc.positionAt(0),
          doc.positionAt(doc.getText().length)
        );
        await editor.edit((editBuilder) => {
          editBuilder.replace(fullRange, message.code || '');
        });
        vscode.window.showInformationMessage('AI Code Reviewer: Applied fixed code to the editor.');
        break;
      }
    }
  });

  return panel;
}

function getWebviewHtml(): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  body {
    font-family: var(--vscode-font-family);
    color: var(--vscode-foreground);
    background-color: var(--vscode-editor-background);
    padding: 16px;
  }
  h2 { margin-top: 0; }
  .score-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    font-size: 20px;
    font-weight: bold;
    color: white;
  }
  .score-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .summary { opacity: 0.9; line-height: 1.5; }
  .issue {
    border-left: 3px solid var(--vscode-editorWarning-foreground, #cca700);
    padding: 8px 12px;
    margin-bottom: 8px;
    background: rgba(127,127,127,0.08);
    border-radius: 4px;
  }
  .issue.High { border-left-color: #f14c4c; }
  .issue.Medium { border-left-color: #cca700; }
  .issue.Low { border-left-color: #3794ff; }
  .severity {
    font-weight: bold;
    text-transform: uppercase;
    font-size: 11px;
    margin-right: 6px;
  }
  pre {
    background: var(--vscode-textCodeBlock-background, #1e1e1e);
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
  button {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    padding: 6px 14px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 8px;
    margin-top: 8px;
  }
  button:hover { background: var(--vscode-button-hoverBackground); }
  .loading { opacity: 0.7; font-style: italic; }
  .error {
    color: var(--vscode-errorForeground, #f14c4c);
    border: 1px solid var(--vscode-errorForeground, #f14c4c);
    padding: 10px;
    border-radius: 4px;
  }
  section { margin-bottom: 20px; }
</style>
</head>
<body>
  <div id="app">
    <p class="loading">Save a file (Ctrl+S) or click "Re-run Review" to get started.</p>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'loading') {
        render({ loading: true });
      } else if (message.type === 'result') {
        render({ data: message.payload });
      }
    });

    function scoreColor(score) {
      if (score >= 8) return '#2ea043';
      if (score >= 5) return '#cca700';
      return '#f14c4c';
    }

    function render({ loading, data }) {
      const app = document.getElementById('app');

      if (loading) {
        app.innerHTML = '<p class="loading">Reviewing code with Gemini...</p>';
        return;
      }

      if (!data) {
        app.innerHTML = '<p class="loading">No review yet.</p>';
        return;
      }

      if (data.error) {
        app.innerHTML =
          '<div class="error"><strong>Something went wrong:</strong><br/>' +
          escapeHtml(data.error) +
          '</div>' +
          rerunButtonHtml();
        attachHandlers(null);
        return;
      }

      if (data.raw && !data.score) {
        app.innerHTML =
          '<h2>Review</h2><pre>' + escapeHtml(data.raw) + '</pre>' + rerunButtonHtml();
        attachHandlers(null);
        return;
      }

      const score = typeof data.score === 'number' ? data.score : null;
      const issues = Array.isArray(data.issues) ? data.issues : [];
      const fixedCode = data.fixedCode || '';

      let html = '';

      if (score !== null) {
        html +=
          '<div class="score-row">' +
          '<div class="score-badge" style="background:' + scoreColor(score) + '">' + score + '/10</div>' +
          '<div><strong>Code Quality Score</strong></div>' +
          '</div>';
      }

      if (data.summary) {
        html += '<section><h2>Summary</h2><p class="summary">' + escapeHtml(data.summary) + '</p></section>';
      }

      if (issues.length) {
        html += '<section><h2>Issues Found (' + issues.length + ')</h2>';
        for (const issue of issues) {
          const sev = issue.severity || 'Low';
          html +=
            '<div class="issue ' + sev + '"><span class="severity">' + sev + '</span>' +
            escapeHtml(issue.description || '') + '</div>';
        }
        html += '</section>';
      }

      if (fixedCode) {
        html +=
          '<section><h2>Suggested Fixed Code</h2><pre id="fixedCodeBlock">' +
          escapeHtml(fixedCode) +
          '</pre>' +
          '<button id="copyBtn">Copy Fixed Code</button>' +
          '<button id="acceptBtn">Accept &amp; Apply to Editor</button>' +
          '</section>';
      }

      html += rerunButtonHtml();
      app.innerHTML = html;
      attachHandlers(fixedCode);
    }

    function rerunButtonHtml() {
      return '<button id="rerunBtn">Re-run Review</button>';
    }

    function attachHandlers(fixedCode) {
      const rerunBtn = document.getElementById('rerunBtn');
      if (rerunBtn) {
        rerunBtn.addEventListener('click', () => vscode.postMessage({ type: 'rerun' }));
      }
      const copyBtn = document.getElementById('copyBtn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () =>
          vscode.postMessage({ type: 'copyFixedCode', code: fixedCode })
        );
      }
      const acceptBtn = document.getElementById('acceptBtn');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', () =>
          vscode.postMessage({ type: 'acceptFixedCode', code: fixedCode })
        );
      }
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  </script>
</body>
</html>`;
}

export function deactivate() {}
