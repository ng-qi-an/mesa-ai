import { createReactInlineContentSpec } from "@blocknote/react";
import {
  BlockNoteSchema,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";
import katex from "katex";
import MathExtensionBlock from "./MathExtensionBlock";
import { InlineMathContentSpec } from "./contentSpecs";
import { typographySubtitleStyle } from "./TypographySubtitleStyle";

export const InlineMath = createReactInlineContentSpec(
  InlineMathContentSpec,
  {
    render: (props) => {
      return <MathExtensionBlock props={props} />;
    },
    toExternalHTML: (props) => {
      const html = katex.renderToString(props.inlineContent.props.code, {
        throwOnError: false,
      });
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    },
  },
);

export const notebookSchema = BlockNoteSchema.create({
    inlineContentSpecs: {
        ...defaultInlineContentSpecs,
        inlineMath: InlineMath
    },
    styleSpecs: {
        ...defaultStyleSpecs,
        typographySubtitle: typographySubtitleStyle,
    },
})
