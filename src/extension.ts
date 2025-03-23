import * as vscode from 'vscode';

// Exported functions
export function activate(context: vscode.ExtensionContext): void {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('bicep-linter');
    context.subscriptions.push(diagnosticCollection);

    // Initial lint for the currently open document (if any)
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === 'bicep') {
        const doc = vscode.window.activeTextEditor.document;
        diagnosticCollection.set(doc.uri, lintDocument(doc));
    }

    // Lint on opening a Bicep document
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(doc => {
            if (doc.languageId === 'bicep') {
                const diagnostics = lintDocument(doc);
                diagnosticCollection.set(doc.uri, diagnostics);
            }
        })
    );

    // Lint on saving a Bicep document
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(doc => {
            if (doc.languageId === 'bicep') {
                const diagnostics = lintDocument(doc);
                diagnosticCollection.set(doc.uri, diagnostics);
            }
        })
    );

    // Clean up diagnostics on document close
    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => {
            diagnosticCollection.delete(doc.uri);
        })
    );
}

export function deactivate(): void {
    // Nothing to do on deactivate for this extension
}

export function lintDocument(document: vscode.TextDocument): vscode.Diagnostic[] {
    if (document.languageId !== 'bicep') {
        return [];
    }
    const text = document.getText();
    const lines = text.split(/\r?\n/);
    const diagnostics: vscode.Diagnostic[] = [];

    for (const [lineNumber, line] of lines.entries()) {
        const lineContent = cleanLine(line);
        if (!lineContent) {
            continue;
        }
        const sectionType = extractSectionType(lineContent);
        if (sectionType) {
            // Naming convention checks based on the type of Bicep declaration
            if (sectionType === SectionType.Resource || sectionType === SectionType.Module) {
                const name = extractName(lineContent);
                if (name) {
                    const prefixIssue = checkPrefix(name, EXPECTED_PREFIX, sectionType);
                    if (prefixIssue) {
                        const start = line.indexOf(name);
                        diagnostics.push(createDiagnostic(lineNumber, start, start + name.length, prefixIssue));
                    }
                    const charIssue = checkAllowedNameChars(name);
                    if (charIssue) {
                        const start = line.indexOf(name);
                        diagnostics.push(createDiagnostic(lineNumber, start, start + name.length, charIssue));
                    }
                }
            }
            if (sectionType === SectionType.Param || sectionType === SectionType.Var || sectionType === SectionType.Output) {
                const name = extractName(lineContent);
                if (name) {
                    const charIssue = checkAllowedNameChars(name);
                    if (charIssue) {
                        const start = line.indexOf(name);
                        diagnostics.push(createDiagnostic(lineNumber, start, start + name.length, charIssue));
                    }
                }
            }
        }
    }

    // Section order validation after processing all lines
    const orderIssues = checkSectionOrder(lines);
    for (const issue of orderIssues) {
        diagnostics.push(createDiagnostic(issue.line, 0, lines[issue.line].length, issue.message));
    }

    return diagnostics;
}

// Validation functions
function checkPrefix(name: string, requiredPrefix: string, sectionType: SectionType): string | null {
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

function checkAllowedNameChars(name: string): string | null {
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

interface LintIssue {
    line: number;
    message: string;
}

function checkSectionOrder(lines: string[]): LintIssue[] {
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
            const order = SECTION_ORDER_MAP[sectionType];
            if (order < lastOrder && lastType !== null) {
                const message = formatMessage(MESSAGES[CURRENT_LANGUAGE].sectionOrder, {
                    current: TYPE_LABELS[CURRENT_LANGUAGE][sectionType],
                    previous: TYPE_LABELS[CURRENT_LANGUAGE][lastType]
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

// Helper functions
function cleanLine(line: string): string {
    // Remove any single-line comment and trim whitespace
    const commentIndex = line.indexOf('//');
    if (commentIndex !== -1) {
        line = line.substring(0, commentIndex);
    }
    return line.trim();
}

function extractName(line: string): string | null {
    const cleaned = cleanLine(line);
    const parts = cleaned.split(/\s+/);
    return parts.length >= 2 ? parts[1] : null;
}

function extractSectionType(line: string): SectionType | null {
    const firstWord = line.trim().split(/\s+/, 1)[0];
    return SECTION_KEYWORDS.has(firstWord) ? firstWord as SectionType : null;
}

function formatMessage(template: string, values: Record<string, string>): string {
    return template.replace(/\{([^}]+)\}/g, (_, key) =>
        values[key] !== undefined ? values[key] : `{${key}}`
    );
}

function createDiagnostic(line: number, startChar: number, endChar: number, message: string, 
    severity: vscode.DiagnosticSeverity = vscode.DiagnosticSeverity.Warning): vscode.Diagnostic {
    const range = new vscode.Range(line, startChar, line, endChar);
    const diagnostic = new vscode.Diagnostic(range, message, severity);
    diagnostic.source = 'bicep-linter';
    return diagnostic;
}

// Configuration
enum Language {
    NL = 'NL',
    EN = 'EN'
}

enum SectionType {
    Param = 'param',
    Var = 'var',
    Resource = 'resource',
    Module = 'module',
    Output = 'output'
}

interface LintMessages {
    prefixMissing: string;
    invalidCharacter: string;
    sectionOrder: string;
}

const TYPE_LABELS: Record<Language, Record<SectionType, string>> = {
    [Language.NL]: {
        [SectionType.Param]: 'parameter',
        [SectionType.Var]: 'variabele',
        [SectionType.Resource]: 'resource',
        [SectionType.Module]: 'module',
        [SectionType.Output]: 'output'
    },
    [Language.EN]: {
        [SectionType.Param]: 'parameter',
        [SectionType.Var]: 'variable',
        [SectionType.Resource]: 'resource',
        [SectionType.Module]: 'module',
        [SectionType.Output]: 'output'
    }
};

const MESSAGES: Record<Language, LintMessages> = {
    [Language.NL]: {
        prefixMissing: "De naam van {type} '{name}' moet beginnen met '{prefix}'.",
        invalidCharacter: "De naam '{name}' bevat ongeldig teken: '{char}'.",
        sectionOrder: "De sectie '{current}' mag niet na sectie '{previous}' komen."
    },
    [Language.EN]: {
        prefixMissing: "The name of {type} '{name}' must start with '{prefix}'.",
        invalidCharacter: "The name '{name}' contains an invalid character: '{char}'.",
        sectionOrder: "The section '{current}' cannot come after section '{previous}'."
    }
};

const SECTION_ORDER_MAP: Record<SectionType, number> = {
    [SectionType.Param]: 1,
    [SectionType.Var]: 2,
    [SectionType.Resource]: 3,
    [SectionType.Module]: 4,
    [SectionType.Output]: 5
};

const SECTION_KEYWORDS: Set<string> = new Set([
    SectionType.Param, 
    SectionType.Var, 
    SectionType.Resource, 
    SectionType.Module, 
    SectionType.Output
]);

const INVALID_NAME_CHARS: Set<string> = new Set(['_', '-']);

const EXPECTED_PREFIX: string = 'pre';

const CURRENT_LANGUAGE: Language = Language.NL;

