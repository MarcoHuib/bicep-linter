import * as vscode from 'vscode';
import { extractName, extractSectionType, isCommentLine } from '../diagnostics/diagnosticHelpers';
import { AllowedCharsCheck } from './allowCharsCheck';
import { LintRuleOperator } from './interfaces/lintRuleOperator';
import { PrefixCheck } from './prefixCheck';
import { SectionOrderCheck } from './selectOrderCheck';
import { DocumentLintRule } from './interfaces/documentRuleOperator';

export class LintEngine {
    private lineOperators: LintRuleOperator[] = [
        new PrefixCheck(),
        new AllowedCharsCheck()
    ];
    private documentOperators: DocumentLintRule[] = [
        new SectionOrderCheck()
    ]

    public lintDocument(document: vscode.TextDocument): vscode.Diagnostic[] {
        if (document.languageId !== 'bicep') return [];

        const text = document.getText();
        const lines = text.split(/\r?\n/);
        const diagnostics: vscode.Diagnostic[] = [];

        this.lineCheck(lines, diagnostics);

        this.documentWideCheck(lines, diagnostics);

        return diagnostics;
    }

    private lineCheck(lines: string[], diagnostics: vscode.Diagnostic[]) {
        for (const [lineNumber, line] of lines.entries()) {
            if (isCommentLine(line)) continue;

            const sectionType = extractSectionType(line);
            if (!sectionType) continue;

            const name = extractName(line);
            if (!name) continue;

            for (const operator of this.lineOperators) {
                if (!operator.appliesTo(sectionType)) continue;

                const results = operator.run(name, line, sectionType, lineNumber);
                diagnostics.push(...results);
            }
        }
    }

    private documentWideCheck(lines: string[], diagnostics: vscode.Diagnostic[]) {
        for (const operator of this.documentOperators) {
            if (!operator.enabled()) continue;
    
            const orderDiagnostics = operator.run(lines);
            diagnostics.push(...orderDiagnostics);
        }
    }
}
