import * as vscode from 'vscode';
import { config } from '../config/configuration';
import { checkAllowedNameChars } from '../diagnostics/naming';
import { createDiagnostic } from '../diagnostics/diagnosticHelpers';
import { SectionType } from '../types/sectionType';
import { LintRuleOperator } from './interfaces/lintRuleOperator';

export class AllowedCharsCheck implements LintRuleOperator {
    appliesTo(_section: SectionType): boolean {
        return config.checkAllowedNameChars;
    }

    run(name: string, line: string, _section: SectionType, lineNumber: number): vscode.Diagnostic[] {
        const issue = checkAllowedNameChars(name);
        if (!issue) return [];

        const start = line.indexOf(name);
        const end = start + name.length;

        return [createDiagnostic(lineNumber, start, end, issue)];
    }
}
