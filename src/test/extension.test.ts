import * as assert from 'assert';
import * as vscode from 'vscode';
import { checkSectionOrder, checkPrefix, checkTypeConstraint } from '../extension';

suite('Linter Test Suite', () => {
    vscode.window.showInformationMessage('Start linter tests.');

    test('Detecteert verkeerde sectievolgorde', () => {
        // Arrange
        const diagnostics: vscode.Diagnostic[] = [];

        // Act
        checkSectionOrder(4, 5, "param", 0, diagnostics);

        // Assert
        assert.strictEqual(diagnostics.length, 1);
        assert.strictEqual(diagnostics[0].message.includes("sectie staat buiten de voorgeschreven volgorde"), true);
    });

    test('Detecteert ontbrekende prefix', () => {
        // Arrange
        const diagnostics: vscode.Diagnostic[] = [];
        const codeLine = "param myVariable string";

        // Act
        checkPrefix("param", "myVariable", codeLine, 0, diagnostics);

        // Assert
        assert.strictEqual(diagnostics.length, 1);
        assert.strictEqual(diagnostics[0].message.includes("moet beginnen met prefix"), true);
    });

    test('Detecteert ongetype object', () => {
        // Arrange
        const diagnostics: vscode.Diagnostic[] = [];
        const codeLine = "param myParam object";

        // Act
        checkTypeConstraint(["param", "myParam", "object"], "myParam", codeLine, 0, diagnostics);

        // Assert
        assert.strictEqual(diagnostics.length, 1);
        assert.strictEqual(diagnostics[0].message.includes("Gebruik geen ongetype"), true);
    });

    test('Geen fout bij correct gebruik', () => {
        // Arrange
        const diagnostics: vscode.Diagnostic[] = [];

        // Act
        checkSectionOrder(3, 2, "param", 0, diagnostics);
        checkPrefix("param", "parMyVariable", "param parMyVariable string", 0, diagnostics);
        checkTypeConstraint(["param", "parMyParam", "string"], "parMyParam", "param parMyParam string", 0, diagnostics);

        // Assert
        assert.strictEqual(diagnostics.length, 0);
    });
});
