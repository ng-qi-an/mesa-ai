import type { BlockNoteEditor } from "@blocknote/core";

const cursorAttribute = "data-mesa-ai-writing";

export function showNotebookAICursor(
  editor: BlockNoteEditor<any, any, any>,
  blockId: string,
) {
  const editorElement = editor.domElement;

  if (!editorElement) {
    return;
  }

  clearNotebookAICursor(editor);
    console.log("showing cursor for block", blockId);

  const blockElement = editorElement.querySelector<HTMLElement>(
    `[data-node-type="blockContainer"][data-id="${CSS.escape(blockId)}"]`,
  );

  blockElement?.setAttribute(cursorAttribute, "true");
}

export function clearNotebookAICursor(
  editor: BlockNoteEditor<any, any, any>,
) {
    console.log("clearing cursor!");
  editor.domElement
    ?.querySelectorAll<HTMLElement>(`[${cursorAttribute}="true"]`)
    .forEach((element) => {
      element.removeAttribute(cursorAttribute);
    });
}