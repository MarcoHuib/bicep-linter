import * as vscode from 'vscode';
import { activateExtension } from './extensionEntry';

export function activate(context: vscode.ExtensionContext) {
  activateExtension(context);
}
export function deactivate() {}