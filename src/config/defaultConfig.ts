import { Language } from "../types/language";
import { LinterConfig } from "./linterConfig";

export const defaultConfig: LinterConfig = {
    checkSectionOrder: true,
    sectionOrder: { param: 1, var: 2, resource: 3, module: 4, output: 5 },
    checkPrefix: {
        enabled: true,
        types: { param: true, var: true, resource: true, module: true, output: true },
        prefixes: { param: 'par', var: 'var', resource: 'res', module: 'mod', output: 'out' }
    },
    checkAllowedNameChars: true,
    language: Language.EN
};
