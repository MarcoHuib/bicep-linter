import { SectionType } from "../types/sectionType";

export const SECTION_KEYWORDS: Set<string> = new Set([
    SectionType.Param,
    SectionType.Var,
    SectionType.Resource,
    SectionType.Module,
    SectionType.Output
]);
