import { BasicTextStyleButton, BlockTypeSelect, ColorStyleButton, FileCaptionButton, FileReplaceButton, FormattingToolbar, NestBlockButton, TableCellMergeButton, TextAlignButton, UnnestBlockButton, useBlockNoteEditor, useComponentsContext } from "@blocknote/react";
import LinkDialog from "./LinkDialog";
import { useState } from "react";
import { Link, Sparkle } from "lucide-react";

export default function CustomFormattingToolbar() {
    const Components = useComponentsContext();
    const editor = useBlockNoteEditor();
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    if (!Components) {
        throw new Error("Comoponents context is not available. Please ensure that you have wrapped your application with the ShadCNComponentsProvider.");
    }
    return <FormattingToolbar>
        <BlockTypeSelect key={"blockTypeSelect"} />
        <TableCellMergeButton key={"tableCellMergeButton"} />

        <FileCaptionButton key={"fileCaptionButton"} />
        <FileReplaceButton key={"replaceFileButton"} />

        <BasicTextStyleButton basicTextStyle={"bold"} key={"boldStyleButton"} />
        <BasicTextStyleButton basicTextStyle={"italic"} key={"italicStyleButton"} />
        <BasicTextStyleButton basicTextStyle={"underline"} key={"underlineStyleButton"}/>
        <BasicTextStyleButton basicTextStyle={"strike"} key={"strikeStyleButton"} />

        <TextAlignButton textAlignment={"left"} key={"textAlignLeftButton"} />
        <TextAlignButton textAlignment={"center"} key={"textAlignCenterButton"} />
        <TextAlignButton textAlignment={"right"} key={"textAlignRightButton"} />

        <ColorStyleButton key={"colorStyleButton"} />

        <NestBlockButton key={"nestBlockButton"} />
        <UnnestBlockButton key={"unnestBlockButton"} />
        <LinkDialog open={showLinkDialog} setOpen={setShowLinkDialog} isForCreate={true} onUrlChange={(x)=> editor.createLink(x)} />
        {editor.isEditable && <Components.FormattingToolbar.Button key="linkButton" mainTooltip="Create link" secondaryTooltip="Ctrl+K" onClick={() => setShowLinkDialog(true)}>
            <Link className="size-3.5"/>
        </Components.FormattingToolbar.Button>}
        <Components.FormattingToolbar.Button key="aiButton" mainTooltip="Attach to chat" onClick={() => {return}}>
            <Sparkle className="size-3.5"/>
        </Components.FormattingToolbar.Button>
    </FormattingToolbar>
}
