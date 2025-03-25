import * as vscode from 'vscode';
import { config } from "../config/initConfiguration";
import { createDiagnostic, formatMessage } from "../diagnostics/diagnosticHelpers";
import { SectionType } from "../types/sectionType";
import { LintRuleOperator } from "./interfaces/lintRuleOperator";
import { typeLabels } from '../constants/typeLabels';
import { currentLanguage } from '../constants/currentLanguage';
import { messages } from '../constants/messages';

export class PrefixCheck implements LintRuleOperator {
    appliesTo(section: SectionType): boolean {
        return config.checkPrefix.enabled && config.checkPrefix.types[section];
    }

    run(name: string, line: string, section: SectionType, lineNumber: number): vscode.Diagnostic[] {
        const expectedPrefix = config.checkPrefix.prefixes[section];
        const issue = this.checkPrefix(name, expectedPrefix, section);
        if (!issue) return [];

        const start = line.indexOf(name);
        const end = start + name.length;

        return [createDiagnostic(lineNumber, start, end, issue)];
    }

    private checkPrefix(name: string, requiredPrefix: string, sectionType: SectionType): string | null {
        if (!name.startsWith(requiredPrefix)) {
            const typeLabel = typeLabels[currentLanguage][sectionType];
            return formatMessage(messages[currentLanguage].prefixMissing, {
                type: typeLabel,
                name: name,
                prefix: requiredPrefix
            });
        }
        return null;
    }
}