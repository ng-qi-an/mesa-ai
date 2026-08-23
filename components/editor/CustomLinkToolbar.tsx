import { DeleteLinkButton, LinkToolbar, LinkToolbarProps, OpenLinkButton, useBlockNoteEditor, useComponentsContext } from "@blocknote/react";
import LinkDialog from "./LinkDialog";
import { useState } from "react";

export default function CustomLinkToolbar(props: LinkToolbarProps) {
    const Components = useComponentsContext();
    const editor = useBlockNoteEditor();
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    if (!Components) {
        throw new Error("Comoponents context is not available. Please ensure that you have wrapped your application with the ShadCNComponentsProvider.");
    }
    return <LinkToolbar {...props}>
        <LinkDialog initialUrl={props.url} open={showLinkDialog} setOpen={setShowLinkDialog} isForCreate={false} onUrlChange={(x)=>{
            editor.editLink(x, props.text);
        }} />
        <Components.FormattingToolbar.Button mainTooltip="Edit" onClick={() => setShowLinkDialog(true)}>
            Edit link
        </Components.FormattingToolbar.Button>
        <OpenLinkButton url={props.url} />
        <DeleteLinkButton
            range={props.range}
            setToolbarOpen={props.setToolbarOpen}
        />
  </LinkToolbar>
}
