import { useClass } from "@/components/providers/class-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import deleteUserFolder from "@/lib/r2actions/folders/deleteUserFolder"
import revalidateData from "@/lib/r2actions/revalidateData"
import { FileSelect } from "@/lib/schemas/schema"
import { MoreHorizontal } from "lucide-react"
import { usePathname } from "next/navigation"
import { useContext } from "react"

export default function FileRowActions({file}: {file: FileSelect}) {
    const {_class} = useClass()
    const pathname = usePathname()
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                variant="ghost"
                className={`h-8 w-8 p-0 block ml-auto`}
            >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 ml-1.5" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>{file.contentType == "application/x-directory" ? "Open" : "View"}</DropdownMenuItem> 
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Move</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={async()=>{
                if (file.contentType == "application/x-directory"){
                    await deleteUserFolder(file.id, true)
                    await revalidateData(pathname)
                } else {

                }
            }}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
}