import * as vscode from "vscode";

export class TodoEditorProvider implements vscode.CustomTextEditorProvider {
  static viewType = "easy-todo.todoBoard";
  context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new TodoEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      TodoEditorProvider.viewType,
      provider
    );
    return providerRegistration;
  }

  resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): void | Thenable<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    webviewPanel.webview.onDidReceiveMessage((e) => {
      console.log(e.newData);
      updateTextDocument(document, e.newData);
    });

    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    webviewPanel.webview.postMessage({
      text: document.getText(),
    });
  }

  getHtmlForWebview(webview: vscode.Webview): string {
    // The CSS file from the React build output
    const stylesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "webview",
        "dist",
        "assets",
        "index.css"
      )
    );

    // The JS file from the React build output
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "webview",
        "dist",
        "assets",
        "index.js"
      )
    );

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Easy Todo</title>
          
          <link rel="stylesheet" href="${stylesUri}">
          <script type="module" defer src=${scriptUri}></script>
          <script>
            const vscode = acquireVsCodeApi();
          </script>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `;
  }
}

function updateTextDocument(document: vscode.TextDocument, json: any) {
  const edit = new vscode.WorkspaceEdit();

  // Just replace the entire document every time for this example extension.
  // A more complete extension should compute minimal edits instead.
  edit.replace(
    document.uri,
    new vscode.Range(0, 0, document.lineCount, 0),
    JSON.stringify(json, null, 2)
  );

  return vscode.workspace.applyEdit(edit);
}
