import { Language } from "../types/Language";
import { SectionType } from "../types/sectionType";

export const TYPE_LABELS: Record<Language, Record<SectionType, string>> = {
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
