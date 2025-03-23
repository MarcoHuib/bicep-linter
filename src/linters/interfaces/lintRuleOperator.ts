import * as vscode from 'vscode';
import { SectionType } from "../../types/sectionType";

export interface LintRuleOperator {
    appliesTo(section: SectionType): boolean;
    run(name: string, line: string, section: SectionType, lineNumber: number): vscode.Diagnostic[];
}
