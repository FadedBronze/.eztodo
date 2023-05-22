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

    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: "update",
        text: document.getText(),
      });
    }

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() === document.uri.toString()) {
          updateWebview();
        }
      }
    );

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    updateWebview();
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
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `;
  }
}
