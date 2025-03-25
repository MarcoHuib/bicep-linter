import * as vscode from 'vscode';

export interface DocumentRuleOperator {
    enabled(): boolean;
    run(lines: string[]): vscode.Diagnostic[];
}
