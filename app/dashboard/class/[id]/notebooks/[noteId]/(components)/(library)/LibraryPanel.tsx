import { useNotebook } from "@/components/providers/notebook-provider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowDown, ArrowUp, Box, ChevronLeft, FileIcon, Filter, ListFilter, ListTodo, ListTree, MessageSquare, Plus, Search, Upload, WalletCards } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import getNotebookItems from "../../(actions)/getNotebookItems";
import { toast } from "sonner";
import { groupedTime, GroupedTimeGroup } from "@/lib/utils/groupedTime";
import LibraryItemGroup from "./LibraryItemGroup";
import { QuizSelect } from "@/lib/schemas/schema";
import { relativeTime } from "@/lib/utils/relativeTime";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FileSelectorDialog from "@/components/file-browser/dialogs/FileSelectorDialog";
import { addNotebookFiles } from "../../(actions)/addNotebookFiles";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useTabs } from "@/components/providers/tabs-provider";

export default function LibraryPanel(){
    const [selectedType, setSelectedType] = useState<string>("all");
    const [selectedSort, setSelectedSort] = useState<string>("modified");
    const [selectedGroup, setSelectedGroup] = useState<string>("item");
    const [selectedSortDirection, setSelectedSortDirection] = useState<string>("desc");
    const [loadingItems, setLoadingItems] = useState<boolean>(true);
    const [items, setItems] = useState<Record<string, any[]>>({});
    const [sortedItems, setSortedItems] = useState<Record<string, any[]>>({});
    const {files, noteId, setFiles} = useNotebook();
    const [showFileSelector, setShowFileSelector] = useState(false);
    const { selectedSideTab } = useTabs();
    useEffect(()=>{
        if (selectedSideTab == "library") {
            (async()=>{
                const raw = await getNotebookItems(noteId);

                if (raw) {
                    setItems(raw);
                } else {
                    toast.error("Failed to load notebook items. Please refresh and try again.")
                }
            })();
        }
    }, [selectedSideTab])
    useEffect(()=>{
        if (Object.keys(items).length > 0) {
            setSortedItems(groupAndFilterItems(items, selectedType, selectedGroup, selectedSort, selectedSortDirection));
            setLoadingItems(false);
        }
    }, [items, selectedType, selectedGroup, selectedSort, selectedSortDirection])
    function groupAndFilterItems(items: Record<string, any[]>, selectedType: string, selectedGroup: string, selectedSort: string,  selectedSortDirection: string){
        const filterItems = selectedType === "all" ? items : items[selectedType] ? {[selectedType]: items[selectedType]} : {};
        Object.keys(filterItems).map((key)=>{
            filterItems[key].map((item)=>{
                return item.type = key;
            })
        })
        var groupedItems = filterItems;
        var dateGroupedItems:GroupedTimeGroup<any>[] = [];
        if (selectedGroup == "modified") {
            groupedItems = {}
            dateGroupedItems = groupedTime(Object.values(filterItems).flat(), Object.values(filterItems).flat().map((item) => item.dateModified));
        } else if (selectedGroup === "created") {
            groupedItems = {}
            dateGroupedItems = groupedTime(Object.values(filterItems).flat(), Object.values(filterItems).flat().map((item) => item.dateCreated));
        }
        dateGroupedItems.map((group)=>{
            groupedItems[group.label] = group.items;
        })
        console.log("Grouped items", groupedItems);
        const sortedItems = {...groupedItems}
        Object.keys(groupedItems).map((key)=>{
            sortedItems[key].sort((a, b)=>{
                if (selectedSort === "modified") {
                    return selectedSortDirection === "desc" ? new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime() : new Date(a.dateModified).getTime() - new Date(b.dateModified).getTime();
                } else if (selectedSort === "created") {
                    return selectedSortDirection === "desc" ? new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime() : new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
                } else if (selectedSort === "alphabetical") {
                    return selectedSortDirection === "desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
                }
                return 0;
            })
        })
        return sortedItems;
    }
    return <div className="h-full pb-2 p-4 pr-0 flex flex-col bg-card relative">
        <FileSelectorDialog open={showFileSelector} setOpen={setShowFileSelector} onConfirm={async(_files) => {
            const finalFiles = _files.filter((file)=> files.every((f) => f.id !== file.id))
            if (finalFiles.length === 0){
                setShowFileSelector(false);
                return;
            }
            setFiles((x) => [...x, ...finalFiles]);
            await addNotebookFiles(noteId, finalFiles.map(f=>f.id));
            setShowFileSelector(false);
        }}/>
        {loadingItems ? <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, index) => (
                <div key={index} className="h-12 bg-secondary/50 rounded-md animate-pulse"/>
            ))}
        </div> 
        : <>
            <div className="flex gap-2 bg-card pb-3 pt-1 pl-1 pr-1 mr-4">
                {selectedType != "all" && (
                    <Button variant="outline" className={`shrink-0`} size="icon-lg" onClick={()=> {setSelectedType("all"); setSelectedGroup("item")}}>
                        <ChevronLeft className="size-4"/>
                    </Button>
                )}
                <Select disabled={files.length == 0} value={selectedType} onValueChange={(v)=>{
                    if (v != "all") {
                        if (selectedGroup == "item") {
                            setSelectedGroup("modified");
                        }
                    } else {
                        setSelectedGroup("item");
                    }
                    setSelectedType(v);
                }}>
                    <SelectTrigger className={`w-full data-[size=default]:h-10`}>
                        <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all"><Box/> All items</SelectItem>
                        <SelectItem value="sources"><FileIcon/>Sources</SelectItem>
                        <SelectItem value="chats"><MessageSquare/> Chats</SelectItem>
                        <SelectItem value="flashcards"><WalletCards/> Flashcards</SelectItem>
                        <SelectItem value="quizzes"><ListTodo/> Quizzes</SelectItem>
                    </SelectContent>
                </Select>
                <Popover>
                    <PopoverTrigger disabled={files.length == 0} asChild>
                        <Button variant="outline" size="icon-lg" className={`shrink-0`}>
                            <Filter className="size-4"/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end">
                        <PopoverHeader>
                            <PopoverTitle>Filter options</PopoverTitle>
                        </PopoverHeader>
                        <div className="flex flex-col gap-2 w-full">
                            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <SelectTrigger size="sm" className="w-full">
                                            <SelectValue placeholder="Select a group" />
                                        </SelectTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Group by</p>
                                    </TooltipContent>
                                </Tooltip>
                                <SelectContent>
                                    <SelectItem value="item" disabled={selectedType != "all"}><ListTree/> Type</SelectItem>
                                    <SelectItem value="modified"><ListTree/>Date modified</SelectItem>
                                    <SelectItem value="created"><ListTree/> Date created</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2 w-full">
                                <Select value={selectedSort} onValueChange={setSelectedSort}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <SelectTrigger size="sm" className="w-full">
                                                <SelectValue placeholder="Select a sort order" />
                                            </SelectTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Sort by</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <SelectContent>
                                        <SelectItem value="modified"><ListFilter/> Last modified</SelectItem>
                                        <SelectItem value="created"><ListFilter/> Last created</SelectItem>
                                        <SelectItem value="alphabetical"><ListFilter/> Alphabetical</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon-sm" variant="outline" className="shrink-0" onClick={() => setSelectedSortDirection(selectedSortDirection === "desc" ? "asc" : "desc")}>
                                            {selectedSortDirection === "desc" ? <ArrowDown/> : <ArrowUp/>}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Sort direction</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => {
                                setSelectedType("all");
                                setSelectedGroup("item");
                                setSelectedSort("modified");
                                setSelectedSortDirection("desc");
                            }}>
                                Reset filters
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

            </div>
            <div className="flex flex-col gap-3 pt-2 pr-4 pb-32 h-full overflow-auto">
                {files.length > 0 ? <>
                {(selectedType == "sources" || selectedType == "all") && <>
                    <LibraryItemGroup label="Sources" items={files.map((file) => ({ id: file.id, label: file.name, description: relativeTime(file.dateModified, {capitalize: true}), type: "sources" }))} />
                    <Separator className="mb-0 mt-1"/>
                </>}
                {Object.values(sortedItems).flat().length > 0 ? Object.keys(sortedItems).filter((key)=> sortedItems[key].length > 0).map((key, index) => {
                    return <Fragment key={index}>
                        <LibraryItemGroup label={key} items={sortedItems[key].map((item) => ({ id: item.id, label: item.name, description: relativeTime(item.dateModified, {capitalize: true}), type: item.type}))} onLabelClick={(selectedGroup == "item" && selectedType == "all") ? ((key) => {setSelectedType(key); setSelectedGroup("modified")}) : undefined} limit={3} />
                        {index < Object.keys(sortedItems).filter((key)=> sortedItems[key].length > 0).length - 1 && <Separator className="mb-0 mt-1"/>}
                    </Fragment>
                }) : <Empty>
                    <EmptyMedia variant={"icon"}>
                        <Search/>
                    </EmptyMedia>
                    <EmptyHeader>
                        <EmptyTitle>No items yet!</EmptyTitle>
                        <EmptyDescription>Create a new item to get started.</EmptyDescription>
                    </EmptyHeader>
                </Empty>}
                </> : <Empty className="py-0">
                        <EmptyMedia variant="icon">
                            <Box className="text-muted-foreground" />
                        </EmptyMedia> 
                        <EmptyHeader>
                            <EmptyTitle>No sources yet!</EmptyTitle>
                            <EmptyDescription>Add a source to begin creating items.</EmptyDescription>
                        </EmptyHeader>
                        <Button variant="secondaryRaised" className="shrink-0" onClick={()=> setShowFileSelector(true)}>
                            Add source <Plus/>
                        </Button>            
                </Empty>}
            </div>
            {files.length > 0 &&
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="raised" className="absolute bottom-8 right-6" size="lg">
                        Create new <Plus/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="shrink-0 w-max">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={()=> setShowFileSelector(true)}><Upload/> Add source</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator/>
                    <DropdownMenuGroup>
                        <DropdownMenuItem><MessageSquare/> New Chat</DropdownMenuItem>
                        <DropdownMenuItem><WalletCards/> New Flashcards</DropdownMenuItem>
                        <DropdownMenuItem><ListTodo/> New Quiz</DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            }
        </>}
    </div>
}