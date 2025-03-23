import * as vscode from 'vscode';
import { config } from "../config/configuration";
import { createDiagnostic, formatMessage } from "../diagnostics/diagnosticHelpers";
import { SectionType } from "../types/sectionType";
import { LintRuleOperator } from "./interfaces/lintRuleOperator";
import { TYPE_LABELS } from '../constants/TYPE_LABELS';
import { CURRENT_LANGUAGE } from '../constants/CURRENT_LANGUAGE';
import { MESSAGES } from '../constants/MESSAGES';

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
            const typeLabel = TYPE_LABELS[CURRENT_LANGUAGE][sectionType];
            return formatMessage(MESSAGES[CURRENT_LANGUAGE].prefixMissing, {
                type: typeLabel,
                name: name,
                prefix: requiredPrefix
            });
        }
        return null;
    }
}