// // app/(student)/s/inbox/[mentor_id]/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { useParams } from "next/navigation";
// import { apiRequest } from "@/app/lib/apiClient";
// import { toast } from "sonner";
// import { MessageCircle, Send, User, ChevronLeft } from "lucide-react";
// import Link from "next/link";
// import { format } from "date-fns";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";

// interface Message {
//   message_id: string;
//   sender_id: string;
//   message_text: string;
//   sent_at: string;
//   sender_name: string;
//   sender_type: string;
// }

// interface ConversationDetails {
//   conversation_id: string;
//   other_user_id: string;
//   other_user_name: string;
//   other_user_type: string;
//   profile_image: string | null;
// }

// export default function ConversationPage() {
//   const params = useParams();
//   const mentorId = params.mentor_id as string;
  
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [conversation, setConversation] = useState<ConversationDetails | null>(null);

//   useEffect(() => {
//     if (mentorId) {
//       fetchConversation();
//     }
//   }, [mentorId]);

//   const fetchConversation = async () => {
//     try {
//       setLoading(true);
      
//       // First create or get conversation
//       const convResponse = await apiRequest({
//         endpoint: "api/messages/conversations",
//         method: "POST",
//         auth: true,
//         body: { other_user_id: mentorId }
//       });

//       if (!convResponse.success) throw new Error(convResponse.message);
      
//       setConversation({
//         conversation_id: convResponse.conversation_id,
//         other_user_id: mentorId,
//         other_user_name: convResponse.other_user_name,
//         other_user_type: convResponse.other_user_type,
//         profile_image: convResponse.profile_image
//       });
      
//       // Then fetch messages
//       const messagesResponse = await apiRequest({
//         endpoint: `api/messages/${convResponse.conversation_id}`,
//         method: "GET",
//         auth: true
//       });

//       if (messagesResponse.success) {
//         setMessages(messagesResponse.data.messages);
        
//         // Mark messages as read
//         await apiRequest({
//           endpoint: `api/messages/${convResponse.conversation_id}/read`,
//           method: "PUT",
//           auth: true
//         });
//       }
//     } catch (error) {
//       toast.error("Failed to load conversation");
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const sendMessage = async () => {
//     if (!newMessage.trim() || !conversation) return;

//     try {
//       const response = await apiRequest({
//         endpoint: "api/messages",
//         method: "POST",
//         auth: true,
//         body: {
//           conversation_id: conversation.conversation_id,
//           message_text: newMessage
//         }
//       });

//       if (response.success) {
//         setNewMessage("");
//         fetchConversation(); // Refresh messages
//       }
//     } catch (error) {
//       toast.error("Failed to send message");
//       console.error(error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
//       </div>
//     );
//   }

//   if (!conversation) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p>Conversation not found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-3xl mx-auto">
//         <div className="flex items-center mb-6">
//           <Link href="/s/inbox" className="mr-4">
//             <ChevronLeft className="w-6 h-6" />
//           </Link>
//           <div className="flex items-center">
//             <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-3">
//               {conversation.profile_image ? (
//                 <img 
//                   src={conversation.profile_image} 
//                   alt={conversation.other_user_name}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <User className="w-5 h-5 text-gray-500" />
//               )}
//             </div>
//             <h1 className="text-xl font-bold">{conversation.other_user_name}</h1>
//           </div>
//         </div>

//         <ScrollArea className="h-[calc(100vh-200px)] mb-4">
//           <div className="space-y-4 p-2">
//             {messages.length === 0 ? (
//               <div className="text-center py-12 text-gray-500">
//                 No messages yet. Start the conversation!
//               </div>
//             ) : (
//               messages.map((message) => (
//                 <div 
//                   key={message.message_id}
//                   className={`flex ${message.sender_id === mentorId ? "justify-start" : "justify-end"}`}
//                 >
//                   <div 
//                     className={`max-w-[80%] rounded-lg p-3 ${message.sender_id === mentorId ? 
//                       "bg-gray-100 dark:bg-gray-700" : 
//                       "bg-orange-100 dark:bg-orange-900"}`}
//                   >
//                     <p className="text-sm">{message.message_text}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                       {format(new Date(message.sent_at), 'h:mm a')}
//                     </p>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </ScrollArea>

//         <div className="flex gap-2">
//           <Input
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Type your message..."
//             onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//           />
//           <Button onClick={sendMessage}>
//             <Send className="w-4 h-4 mr-2" />
//             Send
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }