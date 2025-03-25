import * as vscode from 'vscode';
import { DocumentRuleOperator } from './interfaces/documentRuleOperator';
import { config } from '../config/initConfiguration';
import { currentLanguage } from '../constants/currentLanguage';
import { messages } from '../constants/messages';
import { typeLabels } from '../constants/typeLabels';
import { cleanLine, extractSectionType, formatMessage } from '../diagnostics/diagnosticHelpers';
import { selectionOrderMap } from '../mappers/selectionOrderMap';
import { LintIssue } from '../types/lintIssue';
import { SectionType } from '../types/sectionType';

export class SectionOrderCheck implements DocumentRuleOperator {
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
                const order = selectionOrderMap[sectionType];
                if (order < lastOrder && lastType !== null) {
                    const message = formatMessage(messages[currentLanguage].sectionOrder, {
                        current: typeLabels[currentLanguage][sectionType],
                        previous: typeLabels[currentLanguage][lastType]
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
