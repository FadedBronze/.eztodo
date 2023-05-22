import * as vscode from "vscode";
import { TodoEditorProvider } from "./TodoEditorProvider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(TodoEditorProvider.register(context));
}

// This method is called when your extension is deactivated
export function deactivate() {}
