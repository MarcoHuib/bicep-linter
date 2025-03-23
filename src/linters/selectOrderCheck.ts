import * as vscode from 'vscode';
import { DocumentLintRule } from './interfaces/documentRuleOperator';
import { config } from '../config/configuration';
import { CURRENT_LANGUAGE } from '../constants/CURRENT_LANGUAGE';
import { MESSAGES } from '../constants/MESSAGES';
import { TYPE_LABELS } from '../constants/TYPE_LABELS';
import { cleanLine, extractSectionType, formatMessage } from '../diagnostics/diagnosticHelpers';
import { SECTION_ORDER_MAP } from '../mappers/SECTION_ORDER_MAP';
import { LintIssue } from '../types/lintIssue';
import { SectionType } from '../types/sectionType';

export class SectionOrderCheck implements DocumentLintRule {
    public enabled(): boolean {
        return config.checkSectionOrder;
    }

    public run(lines: string[]): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const issues = this.checkSectionOrder(lines);
        
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

    private checkSectionOrder(lines: string[]): LintIssue[] {
        const issues: LintIssue[] = [];
        let lastOrder = 0;
        let lastType: SectionType | null = null;
        for (let i = 0; i < lines.length; ++i) {
            const line = cleanLine(lines[i]);
            if (!line) {
                continue;
            }
            const sectionType = extractSectionType(line);
            if (sectionType) {
                const order = SECTION_ORDER_MAP[sectionType];
                if (order < lastOrder && lastType !== null) {
                    const message = formatMessage(MESSAGES[CURRENT_LANGUAGE].sectionOrder, {
                        current: TYPE_LABELS[CURRENT_LANGUAGE][sectionType],
                        previous: TYPE_LABELS[CURRENT_LANGUAGE][lastType]
                    });
                    issues.push({ line: i, message: message });
                } else if (order >= lastOrder) {
                    lastOrder = order;
                    lastType = sectionType;
                }
            }
        }
        return issues;
    }
}
