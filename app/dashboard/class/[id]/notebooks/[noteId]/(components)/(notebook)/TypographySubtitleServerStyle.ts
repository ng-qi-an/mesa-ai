import { createStyleSpec } from "@blocknote/core";

export const typographySubtitleServerStyle = createStyleSpec(
  {
    type: "typographySubtitle",
    propSchema: "boolean",
  },
  {
    render: () => {
      const dom = document.createElement("span");
      dom.className = "typography-subtitle";
      return { dom, contentDOM: dom };
    },
    toExternalHTML: () => {
      const dom = document.createElement("span");
      dom.className = "typography-subtitle";
      return { dom, contentDOM: dom };
    },
  },
);
