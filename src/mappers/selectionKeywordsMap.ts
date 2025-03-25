import { SectionType } from "../types/sectionType";

export const selectionKeywordsMap: Set<string> = new Set([
    SectionType.Param,
    SectionType.Var,
    SectionType.Resource,
    SectionType.Module,
    SectionType.Output
]);
