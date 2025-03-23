import { Language } from "../types/Language";
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
