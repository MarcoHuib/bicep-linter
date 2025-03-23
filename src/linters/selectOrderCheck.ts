import * as vscode from 'vscode';
import { checkSectionOrder } from '../diagnostics/order';
import { DocumentLintRule } from './interfaces/documentRuleOperator';
import { config } from '../config/configuration';

export class SectionOrderCheck implements DocumentLintRule {
    enabled(): boolean {
        return config.checkSectionOrder;
    }

    run(lines: string[]): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const issues = checkSectionOrder(lines);
        
        for (const issue of issues) {
            diagnostics.push(
                new vscode.Diagnostic(
                    new vscode.Range(issue.line, 0, issue.line, lines[issue.line].length),
                    issue.message,
                    vscode.DiagnosticSeverity.Warning
                )
            );
        }

        return diagnostics;
    }
}
