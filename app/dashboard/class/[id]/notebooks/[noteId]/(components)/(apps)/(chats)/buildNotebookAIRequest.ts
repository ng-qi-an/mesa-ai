import { BlockNoteEditor, ShowSelectionExtension } from "@blocknote/core";
import { AIExtension, AIRequest, buildAIRequest } from "@blocknote/xl-ai";
import { RefObject } from "react";
import { showNotebookAICursor } from "./notebookAICursor";
import { markNotebookAIUpdatedBlock } from "./notebookAIUpdatedBlock";

export async function buildNotebookAIRequest(editor: BlockNoteEditor<any, any, any>, notebookEditedRef: RefObject<boolean>, beforeNotebookEditRef: RefObject<any[] | null>) {
    const hasSelection = Boolean(editor.getSelection());
    console.log("Building AI request. Has selection:", hasSelection);
    let aiRequest: AIRequest | undefined;
    aiRequest = await buildAIRequest({
        editor: editor,
        useSelection: hasSelection,
        deleteEmptyCursorBlock: !hasSelection,
        onStart: ()=>{
            // Runs when the ai chooses to write
            console.log("AI is starting to write, setting notebookEditedRef to true and saving pre-edit document state");
            notebookEditedRef.current = true;
            beforeNotebookEditRef.current = [...editor.document];
            const extension = editor.getExtension(AIExtension);
            if (!extension) {
                return;
            }
            const initialCursorBlockId = editor.getTextCursorPosition().block.id;
            extension.openAIMenuAtBlock(initialCursorBlockId);
            extension.setAIResponseStatus("ai-writing");
            const emptyCursorBlockId = aiRequest?.emptyCursorBlockToDelete;
            if (
                emptyCursorBlockId &&
                editor.getBlock(emptyCursorBlockId)
            ) {
                console.log("Removing empty cursor block:", emptyCursorBlockId);
                editor.removeBlocks([emptyCursorBlockId]);
            }
            editor.getExtension(ShowSelectionExtension)?.showSelection(false, "notebook-chat");
            showNotebookAICursor(editor, initialCursorBlockId);
        },
        onBlockUpdated: (blockId: string)=>{
            // Runs when the blocks start generating
            showNotebookAICursor(editor, blockId);
            markNotebookAIUpdatedBlock(editor, blockId);
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
    console.log("Built BlockNote AI request:", {
        hasSelection,
        emptyCursorBlockToDelete: aiRequest.emptyCursorBlockToDelete,
    });
    return aiRequest;
}