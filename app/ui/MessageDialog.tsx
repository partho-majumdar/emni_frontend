// "use client";

// import { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { MessageCircle, Send, X } from "lucide-react";
// import { apiRequest } from "@/app/lib/apiClient";
// import { toast } from "sonner";

// interface Message {
//   message_id: string;
//   sender_id: string;
//   message_text: string;
//   sent_at: string;
//   sender_name: string;
//   sender_type: string;
// }

// interface ConversationResponse {
//   success: boolean;
//   data: {
//     conversation_id: string;
//     student: {
//       student_id: string;
//       user_id: string;
//       name: string;
//     };
//     mentor: {
//       mentor_id: string;
//       user_id: string;
//       name: string;
//     };
//     messages: Message[];
//   };
//   message?: string;
// }

// interface MessageDialogProps {
//   mentorId: string;
//   open: boolean;
//   onClose: () => void;
// }

// export const MessageDialog = ({ mentorId, open, onClose }: MessageDialogProps) => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [conversationId, setConversationId] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [userId, setUserId] = useState<string | null>(null);

//   // Validate UUID format
//   const isValidUUID = (uuid: string): boolean => {
//     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//     return uuidRegex.test(uuid);
//   };

//   // Fetch authenticated user's ID (assuming stored in localStorage or session after login)
//   useEffect(() => {
//     // Replace with your actual method to get the authenticated user's ID
//     const storedUserId = localStorage.getItem("user_id"); // Example: Adjust based on your auth setup
//     if (storedUserId) {
//       setUserId(storedUserId);
//     } else {
//       setError("User not authenticated. Please log in.");
//       toast.error("User not authenticated. Please log in.");
//     }
//   }, []);

//   useEffect(() => {
//     if (!open || !mentorId || !userId) {
//       if (!mentorId) setError("No mentor ID provided.");
//       if (!userId) setError("User not authenticated.");
//       return;
//     }

//     if (!isValidUUID(mentorId)) {
//       setError("Invalid mentor ID format.");
//       toast.error("Invalid mentor ID format.");
//       return;
//     }

//     fetchConversation();
//   }, [open, mentorId, userId]);

//   const fetchConversation = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       // Start or get conversation
//       const convResponse = await apiRequest({
//         endpoint: `api/messages/conversations/${mentorId}`,
//         method: "POST",
//         auth: true,
//       }) as ConversationResponse;

//       if (!convResponse.success) {
//         // If your apiRequest returns status in the error, handle it in the catch block instead.
//         throw new Error(convResponse.message || "Failed to start conversation.");
//       }

//       const { conversation_id, messages } = convResponse.data;
//       setConversationId(conversation_id);
//       setMessages(messages || []);

//       // Mark messages as read
//       if (conversation_id) {
//         await apiRequest({
//           endpoint: `api/messages/conversations/${conversation_id}/read`,
//           method: "PUT",
//           auth: true,
//         });
//       }
//     } catch (error: any) {
//       const errorMessage = error.message || "An unexpected error occurred while loading the conversation.";
//       setError(errorMessage);
//       toast.error(errorMessage);
//       // Optionally, handle HTTP status codes if available on the error object
//       if (error.status === 404) {
//         setError("Mentor not found. Please verify the mentor exists.");
//         toast.error("Mentor not found. Please verify the mentor exists.");
//       } else if (error.status === 403) {
//         setError("Only students can start conversations with mentors.");
//         toast.error("Only students can start conversations with mentors.");
//       }
//       console.error("Conversation fetch error:", {
//         message: error.message,
//         status: error.status,
//         response: error.response,
//         mentorId,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const sendMessage = async () => {
//     if (!newMessage.trim()) {
//       toast.error("Please enter a message.");
//       return;
//     }
//     if (!conversationId) {
//       toast.error("No active conversation. Please try again.");
//       return;
//     }
//     if (error) {
//       toast.error("Cannot send message due to existing error.");
//       return;
//     }
//     try {
//       setLoading(true);
//       const response = await apiRequest({
//         endpoint: `api/messages/messages/${conversationId}`,
//         method: "POST",
//         auth: true,
//         body: {
//           message_text: newMessage,
//         },
//       });

//       if (!response.success) {
//         throw new Error(response.message || "Failed to send message.");
//       }

//       setNewMessage("");
//       await fetchConversation(); // Refresh messages
//     } catch (error: any) {
//       const errorMessage = error.message || "An unexpected error occurred while sending the message.";
//       toast.error(errorMessage);
//       console.error("Send message error:", {
//         message: error.message,
//         status: error.status,
//         response: error.response,
//         mentorId,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col bg-gray-800 text-white">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <MessageCircle className="w-5 h-5 text-orange-400" />
//             Messages
//           </DialogTitle>
//         </DialogHeader>

//         <ScrollArea className="flex-1 p-4">
//           {error ? (
//             <div className="text-center py-8 text-orange-400">
//               <X className="w-8 h-8 mx-auto mb-2" />
//               <p>{error}</p>
//             </div>
//           ) : loading ? (
//             <div className="flex justify-center items-center h-40">
//               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
//             </div>
//           ) : messages.length === 0 ? (
//             <div className="text-center py-8 text-gray-400">
//               No messages yet. Start the conversation!
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {messages.map((message) => (
//                 <div
//                   key={message.message_id}
//                   className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"}`}
//                 >
//                   <div
//                     className={`max-w-[80%] rounded-lg p-3 ${
//                       message.sender_id === userId ? "bg-orange-900" : "bg-gray-700"
//                     }`}
//                   >
//                     <p className="text-sm">{message.message_text}</p>
//                     <p className="text-xs text-gray-400 mt-1">
//                       {new Date(message.sent_at).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </ScrollArea>

//         <div className="flex gap-2 pt-4">
//           <Input
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Type your message..."
//             onKeyPress={(e) => e.key === "Enter" && sendMessage()}
//             disabled={loading || !!error}
//             className="bg-gray-700 text-white border-orange-500/30 focus:border-orange-500"
//           />
//           <Button
//             onClick={sendMessage}
//             disabled={loading || !!error}
//             className="bg-orange-500 hover:bg-orange-400 text-white"
//           >
//             <Send className="w-4 h-4 mr-2" />
//             Send
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };