import { Language } from "../types/language";
import { SectionType } from "../types/sectionType";

export interface LinterConfig {
    checkSectionOrder: boolean;
    sectionOrder: Record<SectionType, number>;
    checkPrefix: {
        enabled: boolean;
        types: Record<SectionType, boolean>;
        prefixes: Record<SectionType, string>;
    };
    checkAllowedNameChars: boolean;
    language: Language;
}
