export default async function generateChatName({chatId, message}: {chatId: string, message: string}){
    try {
        const res = await fetch("/api/chat/generate-name", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId, message }),
        });
        if (!res.ok) {
            console.error("Failed to generate chat name:", res.status);
            return null;
        }
        const data = await res.json();
        return data.name as string;
    } catch (error) {
        console.error("Error generating chat name:", error);
        return null;
    }
}
