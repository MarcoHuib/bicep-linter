import * as vscode from 'vscode';
import { config } from '../config/initConfiguration';
import { createDiagnostic, formatMessage } from '../diagnostics/diagnosticHelpers';
import { SectionType } from '../types/sectionType';
import { LintRuleOperator } from './interfaces/lintRuleOperator';
import { currentLanguage } from '../constants/currentLanguage';
import { messages } from '../constants/messages';
import { invalidNameCharsMap } from '../mappers/invalidNameCharsMap';

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
            if (invalidNameCharsMap.has(char)) {
                return formatMessage(messages[currentLanguage].invalidCharacter, {
                    name: name,
                    char: char
                });
            }
        }
        return null;
    }
}
