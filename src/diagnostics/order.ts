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

export { checkSectionOrder };