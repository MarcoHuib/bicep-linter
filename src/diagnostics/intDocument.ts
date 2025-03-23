import * as vscode from 'vscode';
import { extractSectionType, extractName, createDiagnostic, isCommentLine } from './diagnosticHelpers';
import { checkPrefix, checkAllowedNameChars } from './naming';
import { checkSectionOrder } from './order';
import { config } from '../config/configuration';


export function lintDocument(document: vscode.TextDocument): vscode.Diagnostic[] {
    if (document.languageId !== 'bicep') { return []; }
    
    const text = document.getText();
    const lines = text.split(/\r?\n/);
    const diagnostics: vscode.Diagnostic[] = [];

    for (const [lineNumber, line] of lines.entries()) {
        if (isCommentLine(line)) { continue; }
        
        const sectionType = extractSectionType(line);
        if (!sectionType) {continue;}

        const name = extractName(line);
        if (!name) {continue;}

        const start = line.indexOf(name);
        const end = start + name.length;

        // Check: prefix
        if (config.checkPrefix.enabled && config.checkPrefix.types[sectionType]) {
            const expectedPrefix = config.checkPrefix.prefixes[sectionType];
            const prefixIssue = checkPrefix(name, expectedPrefix, sectionType);
            if (prefixIssue) {
                diagnostics.push(createDiagnostic(lineNumber, start, end, prefixIssue));
            }
        }

        // Check: allowed characters
        if (config.checkAllowedNameChars) {
            const charIssue = checkAllowedNameChars(name);
            if (charIssue) {
                diagnostics.push(createDiagnostic(lineNumber, start, end, charIssue));
            }
        }
    }

    // Section order validation
    const orderIssues = checkSectionOrder(lines);
    for (const issue of orderIssues) {
        diagnostics.push(createDiagnostic(issue.line, 0, lines[issue.line].length, issue.message));
    }

    return diagnostics;
}