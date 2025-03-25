import * as vscode from 'vscode';
import { selectionKeywordsMap } from '../mappers/selectionKeywordsMap';
import { SectionType } from '../types/sectionType';
import { diagnosticName } from '../constants/diagnosticName';

// Helper functions
function createDiagnostic(line: number, startChar: number, endChar: number, message: string, 
    severity: vscode.DiagnosticSeverity = vscode.DiagnosticSeverity.Warning): vscode.Diagnostic {
    const range = new vscode.Range(line, startChar, line, endChar);
    const diagnostic = new vscode.Diagnostic(range, message, severity);
    diagnostic.source = diagnosticName;
    return diagnostic;
}

function cleanLine(line: string): string {
    // Remove any single-line comment and trim whitespace
    const commentIndex = line.indexOf('//');
    if (commentIndex !== -1) {
        line = line.substring(0, commentIndex);
    }
    return line.trim();
}

function isCommentLine(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.length === 0 || trimmed.startsWith('//');
}

function extractName(line: string): string | null {
    const cleaned = cleanLine(line);
    const parts = cleaned.split(/\s+/);
    return parts.length >= 2 ? parts[1] : null;
}

function extractSectionType(line: string): SectionType | null {
    const firstWord = line.trim().split(/\s+/, 1)[0];
    return selectionKeywordsMap.has(firstWord) ? firstWord as SectionType : null;
}

function formatMessage(template: string, values: Record<string, string>): string {
    return template.replace(/\{([^}]+)\}/g, (_, key) =>
        values[key] !== undefined ? values[key] : `{${key}}`
    );
}

export {
    createDiagnostic,
    cleanLine,
    isCommentLine,
    extractName,
    extractSectionType,
    formatMessage
};