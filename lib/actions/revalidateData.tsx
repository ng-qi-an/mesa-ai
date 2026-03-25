'use server';
import { revalidatePath } from "next/cache";

export default async function revalidateData(path: string) {
    return revalidatePath(path);
}