import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// export default async function getAllUserFiles({classId, notebookId}: {classId?: string, notebookId?: string}){
//     const session = await auth.api.getSession({
//         headers: await headers()
//     })
//     if (!session || !session.user) {
//         throw new Error("Not authenticated");
//     }
//     const files = 
// }