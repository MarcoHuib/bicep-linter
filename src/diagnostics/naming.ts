import { CURRENT_LANGUAGE } from "../constants/CURRENT_LANGUAGE";
import { MESSAGES } from "../constants/MESSAGES";
import { TYPE_LABELS } from "../constants/TYPE_LABELS";
import { INVALID_NAME_CHARS } from "../mappers/INVALID_NAME_CHARS";
import { SectionType } from "../types/sectionType";
import { formatMessage } from "./diagnosticHelpers";

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

export {
    checkPrefix,
    checkAllowedNameChars
}