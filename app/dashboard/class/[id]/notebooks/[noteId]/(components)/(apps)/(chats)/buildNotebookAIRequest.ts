import { BlockNoteEditor } from "@blocknote/core";
import { AIExtension, buildAIRequest } from "@blocknote/xl-ai";
import { RefObject } from "react";
import { showNotebookAICursor } from "./notebookAICursor";

export function buildNotebookAIRequest(editor: BlockNoteEditor<any, any, any>, notebookEditedRef: RefObject<boolean>) {
    return buildAIRequest({
        editor: editor,
        useSelection: true,
        deleteEmptyCursorBlock: false,
        onStart: ()=>{
            // Runs when the ai chooses to write
            notebookEditedRef.current = true;
            const extension = editor.getExtension(AIExtension);
            if (!extension) {
                return;
            }
            showNotebookAICursor(editor, editor.getTextCursorPosition().block.id);
            extension.openAIMenuAtBlock(editor.getTextCursorPosition().block.id);
            extension.setAIResponseStatus("ai-writing");
        },
        onBlockUpdated: (blockId: string)=>{
            // Runs when the blocks start generating
            showNotebookAICursor(editor, blockId);
            const extension = editor.getExtension(AIExtension);
            if (!extension) {
                return;
            }
            extension.setAIResponseStatus("ai-writing");
            const aiState = extension.store.state.aiMenuState;
            if (aiState !== "closed") {
                extension.store.setState({
                    aiMenuState: {
                        blockId,
                        status: "ai-writing",
                    },
                });
            }
        },
    });
}