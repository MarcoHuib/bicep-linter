import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { defaultConfig } from './defaultConfig';
import { LinterConfig } from './linterConfig';

let config: LinterConfig;

const configFile = '**/bicep-linter.config.json';

function initConfiguration(context: vscode.ExtensionContext) {

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
}

export { initConfiguration, config};