import * as vscode from 'vscode';

type Language = 'nl' | 'en';

type Messages = {
  sectionOrderError: string;
  prefixError: string;
  typeError: string;
};

const MESSAGES: Record<Language, Messages> = {
  nl: {
    sectionOrderError: "`{token}`-sectie staat buiten de voorgeschreven volgorde.",
    prefixError: "Naam `{name}` moet beginnen met prefix `{prefix}`.",
    typeError: "Gebruik geen ongetype `{type}`. Definieer een specifiek type voor dit {keyword}."
  },
  en: {
    sectionOrderError: "`{token}` section is out of the prescribed order.",
    prefixError: "Name `{name}` must start with prefix `{prefix}`.",
    typeError: "Do not use untyped `{type}`. Define a specific type for this {keyword}."
  }
};

let language: Language = 'nl';

export function activate(context: vscode.ExtensionContext): void {
  const diagnostics: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection('bicepHungarianLinter');
  context.subscriptions.push(diagnostics);

  vscode.workspace.textDocuments.forEach(lintDocument);

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(lintDocument),
    vscode.workspace.onDidChangeTextDocument(e => lintDocument(e.document)),
    vscode.workspace.onDidCloseTextDocument(doc => diagnostics.delete(doc.uri))
  );
}

export function deactivate(): void {}

export function lintDocument(doc: vscode.TextDocument): void {
  if (doc.languageId !== 'bicep') {
    return;
  }

  const diagList: vscode.Diagnostic[] = [];
  let currentSectionOrder = 0;

  for (let i = 0; i < doc.lineCount; i++) {
    const line: vscode.TextLine = doc.lineAt(i);
    const trimmed: string = cleanLine(line.text);
    if (!trimmed) { continue; }

    const firstToken: string = trimmed.split(/\s+/, 1)[0];
    const order: number | undefined = sectionOrder[firstToken];
    if (order !== undefined) {
      checkSectionOrder(order, currentSectionOrder, firstToken, i, diagList);
      currentSectionOrder = Math.max(currentSectionOrder, order);
    }

    const tokens: string[] = trimmed.split(/\s+/, 4);
    if (tokens.length < 2) { continue; }

    const name: string = tokens[1].replace(/[:,=]?$/, "");
    checkPrefix(tokens[0], name, line.text, i, diagList);
    checkTypeConstraint(tokens, name, line.text, i, diagList);
  }

  vscode.languages.createDiagnosticCollection('bicepHungarianLinter').set(doc.uri, diagList);
}

export function cleanLine(text: string): string {
  let trimmed: string = text.trim();
  if (!trimmed || trimmed.startsWith('//')) { return ''; }
  while (trimmed.startsWith('@')) {
    const closeIdx: number = trimmed.indexOf(')');
    if (closeIdx === -1) { break; }
    trimmed = trimmed.substring(closeIdx + 1).trim();
  }
  return trimmed || '';
}

export function checkSectionOrder(order: number, currentOrder: number, token: string, line: number, diagList: vscode.Diagnostic[]): void {
  if (order < currentOrder) {
    diagList.push(new vscode.Diagnostic(
      new vscode.Range(line, 0, line, token.length),
      MESSAGES[language].sectionOrderError.replace('{token}', token),
      vscode.DiagnosticSeverity.Warning
    ));
  }
}

export function checkPrefix(keyword: string, name: string, textLine: string, line: number, diagList: vscode.Diagnostic[]): void {
  const expectedPrefix: string | undefined = prefixRules[keyword];
  if (expectedPrefix && !name.startsWith(expectedPrefix)) {
    const nameStartCol: number = textLine.indexOf(name, textLine.indexOf(keyword));
    diagList.push(new vscode.Diagnostic(
      new vscode.Range(line, nameStartCol, line, nameStartCol + name.length),
      MESSAGES[language].prefixError.replace('{name}', name).replace('{prefix}', expectedPrefix),
      vscode.DiagnosticSeverity.Warning
    ));
  }
}

export function checkTypeConstraint(tokens: string[], name: string, textLine: string, line: number, diagList: vscode.Diagnostic[]): void {
  if ((tokens[0] === "param" || tokens[0] === "output" || tokens[0] === "type") && tokens.length >= 3) {
    const typeToken: string = tokens[2].replace(/[:,=]?$/, "");
    if (["object", "array"].includes(typeToken)) {
      const typeIndex: number = textLine.indexOf(typeToken, textLine.indexOf(name) + name.length);
      diagList.push(new vscode.Diagnostic(
        new vscode.Range(line, typeIndex, line, typeIndex + typeToken.length),
        MESSAGES[language].typeError.replace('{type}', typeToken).replace('{keyword}', tokens[0]),
        vscode.DiagnosticSeverity.Warning
      ));
    }
  }
}

export const sectionOrder: Record<string, number> = {
  "import": 1,
  "metadata": 2,
  "targetScope": 3,
  "param": 4,
  "var": 5,
  "resource": 6,
  "module": 6,
  "output": 7,
  "type": 8,
  "func": 9
};

export const prefixRules: Record<string, string> = {
  "param": "par",
  "var": "var",
  "resource": "res",
  "module": "mod",
  "output": "out",
  "type": "type",
  "func": "func"
};
