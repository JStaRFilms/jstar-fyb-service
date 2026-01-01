import { ChatInterface } from '@/features/bot/components/ChatInterface';
import { getCurrentUser } from "@/lib/auth-server";

export default async function ChatPage() {
    const user = await getCurrentUser();
    return <ChatInterface initialUser={user} />;
}
