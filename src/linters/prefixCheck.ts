import * as vscode from 'vscode';
import { config } from "../config/configuration";
import { createDiagnostic } from "../diagnostics/diagnosticHelpers";
import { checkPrefix } from "../diagnostics/naming";
import { SectionType } from "../types/sectionType";
import { LintRuleOperator } from "./interfaces/lintRuleOperator";

export class PrefixCheck implements LintRuleOperator {
    appliesTo(section: SectionType): boolean {
        return config.checkPrefix.enabled && config.checkPrefix.types[section];
    }

    run(name: string, line: string, section: SectionType, lineNumber: number): vscode.Diagnostic[] {
        const expectedPrefix = config.checkPrefix.prefixes[section];
        const issue = checkPrefix(name, expectedPrefix, section);
        if (!issue) return [];

        const start = line.indexOf(name);
        const end = start + name.length;

        return [createDiagnostic(lineNumber, start, end, issue)];
    }
}