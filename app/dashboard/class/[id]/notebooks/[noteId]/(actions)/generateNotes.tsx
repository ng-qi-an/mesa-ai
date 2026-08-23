'use client';
import { useNotebook } from "@/components/providers/notebook-provider";


export function useGenerateNotes(){
    const { notesSubmit, noteId, notesClear, setNotesStatus, setNotesObject } = useNotebook();
    console.log("useGenerateNotes hook initialized with noteId:", noteId);
    return {
        generateNotes: ({length, instructions}: {length: string, instructions: string}) => {
            notesClear();
            setNotesStatus("submitted");
            setNotesObject(undefined);
            console.log("clear object")
            return notesSubmit({
                id: noteId,
                length: length,
                instructions: instructions,
            }) 
        }
    };
}