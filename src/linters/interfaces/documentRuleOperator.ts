import * as vscode from 'vscode';

export interface DocumentLintRule {
    enabled(): boolean;
    run(lines: string[]): vscode.Diagnostic[];
}
