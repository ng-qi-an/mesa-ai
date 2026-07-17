import { CustomInlineContentConfig } from "@blocknote/core";

export const InlineMathContentSpec: CustomInlineContentConfig = {
    type: "inlineMath",
    propSchema: {
        code: { default: "" }, // the raw LaTeX source
    },
    content: "none", // it's a self-contained widget, not editable rich text
}