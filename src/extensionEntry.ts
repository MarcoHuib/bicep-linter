import * as vscode from 'vscode';
import { initConfiguration } from './config/configuration';
import { LintEngine } from './linters/lintEngine';

function activateExtension(context: vscode.ExtensionContext): void {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('bicep-linter');
    context.subscriptions.push(diagnosticCollection);

    initConfiguration(context, diagnosticCollection);

    const engine = new LintEngine();

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(doc => {
            if (doc.languageId === 'bicep') {
                const diagnostics = engine.lintDocument(doc);
                diagnosticCollection.set(doc.uri, diagnostics);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(doc => {
            if (doc.languageId === 'bicep') {
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

export { activateExtension };
