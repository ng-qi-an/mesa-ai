// schema.server.ts — used by ServerBlockNoteEditor
import { createInlineContentSpec, BlockNoteSchema, defaultInlineContentSpecs } from "@blocknote/core";
import katex from "katex";
import { InlineMathContentSpec } from "./contentSpecs";

export const InlineMathServer = createInlineContentSpec(
  InlineMathContentSpec,    
  {
    // Non-React: build the DOM node manually, no React root involved
    render: (inlineContent) => {
      const dom = document.createElement("span");
      dom.textContent = inlineContent.props.code;
      return { dom };
    },
    toExternalHTML: (inlineContent) => {
      const dom = document.createElement("span");
      dom.innerHTML = katex.renderToString(inlineContent.props.code, {
        throwOnError: false,
      });
      return { dom };
    },
  },
);

export const notebookSchemaServer = BlockNoteSchema.create({
  inlineContentSpecs: { ...defaultInlineContentSpecs, inlineMath: InlineMathServer },
});