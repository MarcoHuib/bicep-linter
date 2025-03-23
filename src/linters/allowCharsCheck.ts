import * as vscode from 'vscode';
import { config } from '../config/configuration';
import { createDiagnostic, formatMessage } from '../diagnostics/diagnosticHelpers';
import { SectionType } from '../types/sectionType';
import { LintRuleOperator } from './interfaces/lintRuleOperator';
import { CURRENT_LANGUAGE } from '../constants/CURRENT_LANGUAGE';
import { MESSAGES } from '../constants/MESSAGES';
import { INVALID_NAME_CHARS } from '../mappers/INVALID_NAME_CHARS';

export class AllowedCharsCheck implements LintRuleOperator {
    appliesTo(_section: SectionType): boolean {
        return config.checkAllowedNameChars;
    }

    run(name: string, line: string, _section: SectionType, lineNumber: number): vscode.Diagnostic[] {
        const issue = this.checkAllowedNameChars(name);
        if (!issue) return [];

        const start = line.indexOf(name);
        const end = start + name.length;

        return [createDiagnostic(lineNumber, start, end, issue)];
    }

    private checkAllowedNameChars(name: string): string | null {
        for (const char of name) {
            if (INVALID_NAME_CHARS.has(char)) {
                return formatMessage(MESSAGES[CURRENT_LANGUAGE].invalidCharacter, {
                    name: name,
                    char: char
                });
            }
        }
        return null;
    }
}
