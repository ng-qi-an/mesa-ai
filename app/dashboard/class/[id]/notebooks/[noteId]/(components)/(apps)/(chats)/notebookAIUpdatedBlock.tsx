import type { BlockNoteEditor } from "@blocknote/core";

const updatedAttribute = "data-mesa-ai-updated";

export function markNotebookAIUpdatedBlock(
  editor: BlockNoteEditor<any, any, any>,
  blockId: string,
) {
  const blockElement = editor.domElement?.querySelector<HTMLElement>(
    `[data-node-type="blockContainer"][data-id="${CSS.escape(blockId)}"]`,
  );
  console.log("marking block as updated", blockId);
  blockElement?.setAttribute(updatedAttribute, "true");
}

export function clearNotebookAIUpdatedBlocks(
  editor: BlockNoteEditor<any, any, any>,
) {
  console.log("clearing updated blocks!");
  editor.domElement
    ?.querySelectorAll<HTMLElement>(`[${updatedAttribute}="true"]`)
    .forEach((element) => {
      element.removeAttribute(updatedAttribute);
    });
}