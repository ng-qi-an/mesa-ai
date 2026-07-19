'use client';

import { Extension } from "@tiptap/core";
import { type BlockNoteEditor } from "@blocknote/core";

const mathMigrationRegex = /(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g;

export const InlineMathInputRule = Extension.create({
  name: "inlineMathInputRule",
  addInputRules() {
    return [
      {
        undoable: true,
        find: /(?<!\$)\$\$([^$\n]+)\$\$(?!\$)$/,
        handler: ({ state, range, match, chain }) => {
          const code = match[1];
          chain()
            .deleteRange(range)
            .insertContentAt(range.from, {
              type: "inlineMath",
              attrs: { code },
            })
            .run();
        },
      },
    ];
  },
});


function migrateInlineContentArray(content: any[]) {
  const newContent: any[] = [];
  let changed = false;

  for (const item of content) {
    if (item.type === "text") {
      const regex = new RegExp(mathMigrationRegex);
      let lastIndex = 0;
      let match;
      let found = false;

      while ((match = regex.exec(item.text)) !== null) {
        found = true;
        if (match.index > lastIndex) {
          newContent.push({ type: "text", text: item.text.slice(lastIndex, match.index), styles: item.styles });
        }
        newContent.push({ type: "inlineMath", props: { code: match[0].slice(1, -1) } });
        lastIndex = regex.lastIndex;
      }

      if (found) {
        changed = true;
        if (lastIndex < item.text.length) {
          newContent.push({ type: "text", text: item.text.slice(lastIndex), styles: item.styles });
        }
      } else {
        newContent.push(item);
      }
    } else {
      newContent.push(item);
    }
  }

  return { newContent, changed };
}

export function migrateDollarMathToInlineMath(editor: BlockNoteEditor<any, any, any>) {
  const walk = (blocks: any[]) => {
    for (const block of blocks) {
      if (Array.isArray(block.content)) {
        const { newContent, changed } = migrateInlineContentArray(block.content);
        if (changed) editor.updateBlock(block, { content: newContent });
      } else if (block.content?.type === "tableContent") {
        let tableChanged = false;
        const newRows = block.content.rows.map((row: any) => ({
          cells: row.cells.map((cell: any) => {
            const { newContent, changed } = migrateInlineContentArray(cell.content);
            if (changed) tableChanged = true;
            return { ...cell, content: newContent };
          }),
        }));

        if (tableChanged) {
          editor.updateBlock(block, {
            content: { ...block.content, rows: newRows },
          });
        }
      }

      if (block.children?.length) walk(block.children);
    }
  };

  walk(editor.document);
}