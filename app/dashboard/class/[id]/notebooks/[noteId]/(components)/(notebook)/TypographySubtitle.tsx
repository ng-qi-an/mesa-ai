import type { RefCallback } from "react";

type TypographySubtitleProps = {
  contentRef: RefCallback<HTMLElement>;
};

export function TypographySubtitle({
  contentRef,
}: TypographySubtitleProps) {
  return <span ref={contentRef} className="typography-subtitle" />;
}
