import * as vscode from 'vscode';
import { initConfiguration } from './config/initConfiguration';
import { LintEngine } from './linters/lintEngine';
import { languageType } from './constants/languageType';
import { diagnosticName } from './constants/diagnosticName';

export function activateExtension(context: vscode.ExtensionContext): void {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection(diagnosticName);
    context.subscriptions.push(diagnosticCollection);

    initConfiguration(context);

    const engine = new LintEngine(languageType);

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(doc => {
            if (doc.languageId === languageType) {
                const diagnostics = engine.lintDocument(doc);
                diagnosticCollection.set(doc.uri, diagnostics);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(doc => {
            if (doc.languageId === languageType) {
                const diagnostics = engine.lintDocument(doc);
                diagnosticCollection.set(doc.uri, diagnostics);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => {
            diagnosticCollection.delete(doc.uri);
        })
    );
}
