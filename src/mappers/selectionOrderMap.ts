import { SectionType } from "../types/sectionType";

export const selectionOrderMap: Record<SectionType, number> = {
    [SectionType.Param]: 1,
    [SectionType.Var]: 2,
    [SectionType.Resource]: 3,
    [SectionType.Module]: 4,
    [SectionType.Output]: 5
};
