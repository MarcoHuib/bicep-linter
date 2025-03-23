import * as vscode from 'vscode';
import { initConfiguration } from './config/configuration';
import { lintDocument } from './diagnostics/intDocument';

// Exported functions
function activateExtension(context: vscode.ExtensionContext): void {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('bicep-linter');
    context.subscriptions.push(diagnosticCollection);

    initConfiguration(context, diagnosticCollection);

    // Lint on opening a Bicep document
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(doc => {
            if (doc.languageId === 'bicep') {
                const diagnostics = lintDocument(doc);
                diagnosticCollection.set(doc.uri, diagnostics);
            }
        })
    );

    // Lint on saving a Bicep document
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(doc => {
            if (doc.languageId === 'bicep') {
                const diagnostics = lintDocument(doc);
                diagnosticCollection.set(doc.uri, diagnostics);
            }
        })
    );

    // Clean up diagnostics on document close
    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => {
            diagnosticCollection.delete(doc.uri);
        })
    );
}

export {activateExtension};