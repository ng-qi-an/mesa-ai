import { createReactStyleSpec } from "@blocknote/react";
import { TypographySubtitle } from "./TypographySubtitle";

export const typographySubtitleStyle = createReactStyleSpec(
  {
    type: "typographySubtitle",
    propSchema: "boolean",
  },
  {
    render: ({ contentRef }) => (
      <TypographySubtitle contentRef={contentRef} />
    ),
  },
);
