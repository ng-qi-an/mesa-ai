import SectionsPanel from "../SectionsPanel";
import SourcesPanel from "../SourcesPanel";

export default function LeftNotebookSidebar(){
    return <div className="h-full flex flex-col gap-5 shrink-0">
        <SectionsPanel/>
    </div>
}