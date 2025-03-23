import { Language } from "../types/language";
import { LintMessages } from "../types/lintMessages";

export const MESSAGES: Record<Language, LintMessages> = {
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
