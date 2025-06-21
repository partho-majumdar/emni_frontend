"use client";

import { useEffect, useState, useRef, Component } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send, MessageCircle, X, Copy, Check, ChevronDown, ChevronUp, Bot, User, Sparkles, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, ApiRequestType } from "@/app/lib/apiClient";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface AIMessage {
  message_id: string;
  conversation_id: string;
  user_id: string;
  message_text: string;
  is_from_ai: boolean;
  sent_at: string;
}

interface AIConversation {
  conversation_id: string;
  student: {
    student_id: string;
    user_id: string;
    name: string;
    username: string;
  };
  messages: AIMessage[];
}

interface ApiResponse {
  success: boolean;
  data: AIConversation | { user_message: AIMessage; ai_response: AIMessage };
  message?: string;
}

const getStudentAvatar = (username: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&size=80`;
};

const getAvatar = (username: string): string => {
  return `https://robohash.org/${username}.png?size=120x120`;
};

const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC" 
    });
  } catch (err) {
    console.error("Date formatting error:", err);
    return "Invalid Date";
  }
};

class MarkdownErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
          Error rendering message content. Please try again.
        </div>
      );
    }
    return this.props.children;
  }
}

const CodeBlock = ({ children, className, node, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const codeContent = typeof children === 'string' ? children : 
    Array.isArray(children) ? children.join('') : '';
  
  const language = className?.replace('language-', '') || 'text';
  const isLongCode = codeContent.split('\n').length > 10;
  
  const copyCode = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-slate-300 capitalize">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLongCode && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-2 py-1 text-xs bg-slate-700/50 hover:bg-slate-600/50 rounded-md text-slate-300 hover:text-white transition-colors flex items-center gap-1"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Expand
                </>
              )}
            </button>
          )}
          <button
            onClick={copyCode}
            className="px-2 py-1 text-xs bg-slate-700/50 hover:bg-slate-600/50 rounded-md text-slate-300 hover:text-white transition-colors flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      <ScrollArea 
        className={cn(
          "w-full",
          isLongCode && !expanded ? "max-h-60" : "max-h-[400px]"
        )}
      >
        <pre className="p-4 text-sm overflow-x-auto">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </ScrollArea>
    </div>
  );
};

const AIChat: React.FC = () => {
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [messageText, setMessageText] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    
  }, [messageText]);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);
        setError(null);
        const studentId = localStorage.getItem("student-id");
        if (!studentId) {
          throw new Error("Please log in as a student to access AI chat");
        }

        const request: ApiRequestType = {
          endpoint: `api/student/ai-chat/student/${studentId}`,
          method: "GET",
          auth: true,
        };
        const response = (await apiRequest(request)) as ApiResponse;
        if (response.success) {
          setConversation(response.data as AIConversation);
        } else {
          throw new Error(response.message || "Failed to fetch conversation");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An error occurred while fetching conversation";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !conversation) return;

    setIsSending(true);
    const currentMessage = messageText.trim();
    
    try {
      const studentId = localStorage.getItem("student-id");
      if (!studentId) {
        throw new Error("Student ID not found");
      }

      const request: ApiRequestType = {
        endpoint: `api/student/ai-chat/student/send/${studentId}`,
        method: "POST",
        auth: true,
        body: { message_text: currentMessage },
      };
      
      setMessageText("");
      
      const response = (await apiRequest(request)) as ApiResponse;
      if (response.success) {
        const { user_message, ai_response } = response.data as {
          user_message: AIMessage;
          ai_response: AIMessage;
        };
        
        setConversation({
          ...conversation,
          messages: [...conversation.messages, user_message, ai_response],
        });
      } else {
        throw new Error(response.message || "Failed to send message");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred while sending message";
      toast.error(message);
      setMessageText(currentMessage);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-500 rounded-full animate-spin animate-reverse" 
                 style={{ animationDuration: '1.5s' }} />
          </div>
          <div className="text-center">
            <p className="text-slate-300 font-medium">Initializing AI Assistant</p>
            <p className="text-slate-500 text-sm">Powered by Gemini</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-red-950/10 to-slate-950 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-red-500/20 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-500/20 rounded-full">
              <X className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Connection Error</h3>
          </div>
          <p className="text-slate-300 mb-6 leading-relaxed">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg"
          >
            Retry Connection
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-blue-950/5 to-slate-950 text-slate-100">
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center">
        <div className="w-full max-w-4xl mx-4 mt-2 bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-800/50 px-4 py-2 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-slate-900 animate-pulse" />
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Assistant
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Powered by Gemini Pro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 h-screen">
          <div className="max-w-4xl mx-auto w-full space-y-4 px-4 pt-45 pb-6">
            {conversation?.messages && conversation.messages.length > 0 ? (
              conversation.messages.map((msg, index) => {
                return (
                  <motion.div
                    key={msg.message_id}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={cn(
                      "flex gap-3 group",
                      msg.is_from_ai ? "justify-start" : "justify-end"
                    )}
                  >
                    {msg.is_from_ai && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/20">
                          <Bot className="w-4 h-4 text-blue-400" />
                        </div>
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[85%] md:max-w-[75%] relative",
                        msg.is_from_ai ? "mr-auto" : "ml-auto"
                      )}
                    >
                      <div
                        className={cn(
                          "p-4 rounded-xl relative backdrop-blur-sm shadow-lg",
                          msg.is_from_ai
                            ? "bg-slate-800/40 border border-slate-700/30"
                            : "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20"
                        )}
                      >
                        <button
                          onClick={() => copyToClipboard(msg.message_text, msg.message_id)}
                          className={cn(
                            "absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100",
                            "bg-slate-700/50 hover:bg-slate-600/60 text-slate-400 hover:text-white"
                          )}
                        >
                          {copiedMessageId === msg.message_id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>

                        <div
                          className={cn(
                            "prose prose-invert prose-sm max-w-none pr-8",
                            "prose-p:my-2 prose-p:leading-relaxed",
                            "prose-ul:my-2 prose-ol:my-2",
                            "prose-li:my-0.5",
                            "prose-headings:text-slate-200 prose-headings:font-semibold prose-headings:my-3",
                            "prose-strong:text-slate-100 prose-strong:font-semibold",
                            "prose-em:text-slate-300",
                            "prose-blockquote:border-l-blue-400 prose-blockquote:text-slate-300 prose-blockquote:bg-slate-800/20 prose-blockquote:p-3 prose-blockquote:rounded-r-lg prose-blockquote:my-3",
                            "prose-code:bg-slate-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-blue-300 prose-code:font-medium prose-code:text-sm",
                            "prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300",
                            "prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0"
                          )}
                        >
                          <MarkdownErrorBoundary>
                            <Markdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                pre: ({ children }) => <>{children}</>,
                                code: ({ node, className, children, ...props }) => {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const isMultiline = String(children).includes('\n');
                                  const codeContent = String(children).replace(/\n$/, '');
                                  
                                  if (match && isMultiline) {
                                    return (
                                      <CodeBlock className={className} {...props}>
                                        {children}
                                      </CodeBlock>
                                    );
                                  }
                                  
                                  return (
                                    <code
                                      className={cn(
                                        className,
                                        "px-1.5 py-0.5 bg-slate-800/60 rounded text-blue-300 font-medium text-sm"
                                      )}
                                      {...props}
                                    >
                                      {codeContent || '[Empty code block]'}
                                    </code>
                                  );
                                },
                                h1: ({ children }) => <h1 className="text-2xl font-bold text-slate-100 mt-4 mb-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-xl font-semibold text-slate-200 mt-3 mb-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-lg font-medium text-slate-200 mt-2 mb-1">{children}</h3>,
                                ul: ({ children }) => <ul className="list-disc pl-6 my-2 text-slate-300">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-6 my-2 text-slate-300">{children}</ol>,
                                li: ({ children }) => <li className="my-1">{children}</li>,
                                p: ({ children }) => <p className="my-2 leading-relaxed text-slate-300">{children}</p>,
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-blue-400 pl-3 py-2 my-3 bg-slate-800/20 rounded-r-lg text-slate-300">
                                    {children}
                                  </blockquote>
                                ),
                                a: ({ href, children }) => (
                                  <a href={href} className="text-blue-400 hover:text-blue-300 no-underline" target="_blank" rel="noopener noreferrer">
                                    {children}
                                  </a>
                                )
                              }}
                            >
                              {msg.message_text}
                            </Markdown>
                          </MarkdownErrorBoundary>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-700/30">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            {msg.is_from_ai ? (
                              <Sparkles className="w-3 h-3" />
                            ) : (
                              <User className="w-3 h-3" />
                            )}
                            <span>{formatDateTime(msg.sent_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!msg.is_from_ai && (
                      <div className="flex-shrink-0 mt-1">
                        <img
                          src={getAvatar(conversation.student.username)}
                          alt="User"
                          className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-500/30"
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full py-16"
              >
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 mb-4">
                  <MessageCircle className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2">
                  Ready to assist you
                </h3>
                <p className="text-slate-400 text-center max-w-md leading-relaxed">
                  Ask me about data science, coding, career advice, or any technical concepts. I'm here to help you learn and grow.
                </p>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="p-3 border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="relative flex items-end gap-2 p-2 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/30 shadow-lg">
              <textarea
                value={messageText}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setMessageText(newValue);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isSending) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask me anything about coding, data science, or career advice..."
                className="flex-1 bg-transparent border-none resize-none focus:outline-none text-slate-200 placeholder-slate-500 max-h-24 min-h-[20px] py-1 text-sm"
                rows={1}
                disabled={isSending}
                style={{
                  height: 'auto',
                  minHeight: '20px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 96) + 'px';
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={isSending || !messageText.trim()}
                size="icon"
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-lg transition-all duration-200",
                  isSending || !messageText.trim()
                    ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/25"
                )}
              >
                {isSending ? (
                  <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI responses may contain inaccuracies. Always verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;