import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { defaultConfig } from './defaultConfig';
import { LinterConfig } from './linterConfig';
import { lintDocument } from '../diagnostics/intDocument';

let config: LinterConfig;

const configFile = '**/bicep-linter.config.json';

function initConfiguration(context: vscode.ExtensionContext, diagnosticCollection: vscode.DiagnosticCollection) {

    const rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0]?.uri?.path : '';
    const configFilePath = path.join(rootPath, '**', configFile);

    function loadConfig() {
        if (fs.existsSync(configFilePath)) {
            config = { ...defaultConfig, ...JSON.parse(fs.readFileSync(configFilePath, 'utf8')) };
        } else {
            config = defaultConfig;
        }
    }

    loadConfig();

    const watcher = vscode.workspace.createFileSystemWatcher(configFilePath);
    watcher.onDidChange(loadConfig);
    watcher.onDidCreate(loadConfig);
    watcher.onDidDelete(loadConfig);
    context.subscriptions.push(watcher);

    // Initial lint for the currently open document (if any)
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === 'bicep') {
        const doc = vscode.window.activeTextEditor.document;
        diagnosticCollection.set(doc.uri, lintDocument(doc));
    }
}

export { initConfiguration, config};