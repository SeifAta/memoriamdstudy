// LiveTutor.tsx
import React, { useEffect, useRef, useState } from "react";
import { Upload, Send, ThumbsUp, ThumbsDown, Trash2, Loader2 } from "lucide-react";

export type Message = {
  role: "user" | "assistant";
  content: string | StructuredReply;
  timestamp: Date;
};

type StructuredReply = {
  overview?: string;
  sections?: { title: string; content: string[] }[];
  takeaway?: string;
  questions?: string[];
};

export default function LiveTutor({
  darkMode,
  file: initialFile,
  messages: initialMessages,
  lectureText: initialLectureText,
  setLiveTutorState,
}: {
  darkMode: boolean;
  file?: File | null;
  messages?: Message[];
  lectureText?: string;
  setLiveTutorState?: any;
}) {
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lectureText, setLectureText] = useState<string>(initialLectureText ?? "");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsUploading(true);
    setMessages((p) => [
      ...p,
      { role: "assistant", content: "Processing lecture notes...", timestamp: new Date() },
    ]);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("https://seifataa-medtutor2.hf.space/upload", {
        method: "POST",
        headers: {
          Authorization: "Bearer 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",
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        const snippet = data.lecture_text || "";
        setLectureText(snippet);
        setMessages((prev) => {
          const m = prev.slice();
          const idx = m.map((x) => x.role + (typeof x.content === "string" ? x.content : "")).lastIndexOf(
            "assistantProcessing lecture notes..."
          );
          if (idx >= 0) {
            m[idx] = {
              role: "assistant",
              content: "Great — I processed your lecture notes. Ask me anything about them.",
              timestamp: new Date(),
            };
          } else {
            m.push({
              role: "assistant",
              content: "Great — I processed your lecture notes. Ask me anything about them.",
              timestamp: new Date(),
            });
          }
          return m;
        });
      } else {
        setMessages((p) => [...p, { role: "assistant", content: "❌ Upload failed.", timestamp: new Date() }]);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessages((p) => [...p, { role: "assistant", content: "❌ Upload error.", timestamp: new Date() }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (overrideText?: string) => {
    const messageText = overrideText ?? input.trim();
    if (!messageText || isSending) return;

    setMessages((p) => [...p, { role: "user", content: messageText, timestamp: new Date() }]);
    setInput("");
    setIsSending(true);
    setIsTyping(true);

    try {
      const res = await fetch("https://seifataa-medtutor2.hf.space/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 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",
        },
        body: JSON.stringify({ message: messageText, lecture_text: lectureText }),
      });

      const data = await res.json();

      if (data && !data.error && (data.sections || data.overview || data.takeaway || data.questions)) {
        setMessages((p) => [
          ...p,
          { role: "assistant", content: data as StructuredReply, timestamp: new Date() },
        ]);
      } else if (data && data.raw) {
        setMessages((p) => [
          ...p,
          { role: "assistant", content: (data.raw as string) ?? "⚠️ No structured reply.", timestamp: new Date() },
        ]);
      } else if (data && typeof data === "string") {
        setMessages((p) => [...p, { role: "assistant", content: data, timestamp: new Date() }]);
      } else if (data && data.reply) {
        setMessages((p) => [...p, { role: "assistant", content: data.reply, timestamp: new Date() }]);
      } else {
        setMessages((p) => [...p, { role: "assistant", content: JSON.stringify(data), timestamp: new Date() }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((p) => [...p, { role: "assistant", content: "⚠️ Error connecting to the tutor. Please try again later.", timestamp: new Date() }]);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const clearSession = () => {
    setMessages([]);
    setFile(null);
    setLectureText("");
    setInput("");
    if (setLiveTutorState) {
      setLiveTutorState({ file: null, messages: [], lectureText: "" });
    }
  };

  function renderAssistantContent(content: string | StructuredReply) {
    if (!content) return null;
    if (typeof content === "string") {
      return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;
    }

    const s = content as StructuredReply;
    return (
      <div className="space-y-3 text-sm">
        {s.overview ? <div className="font-semibold">{s.overview}</div> : null}

        {s.sections?.map((sec, i) => (
          <div key={i} className="space-y-1">
            <div className="font-medium">{sec.title}</div>
            <ul className="list-disc ml-5">
              {sec.content.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>
        ))}

        {s.takeaway ? (
          <div className="mt-2 p-3 border-l-4 border-[#00FFC6] bg-[#00FFC6]/6 rounded">
            <strong>Takeaway:</strong> <span>{s.takeaway}</span>
          </div>
        ) : null}

        {s.questions && s.questions.length ? (
          <div className="mt-2">
            <div className="font-medium">Reflective questions</div>
            <ol className="list-decimal ml-6">
              {s.questions.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <div className={`rounded-2xl border-2 border-dashed p-12 text-center hover:border-[#00FFC6] ${darkMode ? 'border-gray-800 bg-[#161B22]' : 'border-gray-300 bg-white'}`}>
          <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Upload Lecture Notes</h3>
          <p className="text-sm opacity-60 mb-6">Upload your medical lecture notes (PDF, DOCX, or TXT)</p>
          <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00FFC6] to-[#8A2BE2] text-white rounded-lg cursor-pointer hover:scale-105 transition-all">
            <Upload className="w-5 h-5" />
            <span className="ml-2 font-medium">Select File</span>
            <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.txt" className="hidden" disabled={isUploading} />
          </label>
          {isUploading && (
            <div className="mt-4 flex justify-center items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#00FFC6]" />
              <span>Processing your notes...</span>
            </div>
          )}
        </div>
      ) : (
        <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-[#161B22]' : 'bg-white'}`}>
          <div className={`px-6 py-4 border-b flex justify-between ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-[#00FFC6] animate-pulse"></div>
              <span className="font-medium">Active Session: {file.name}</span>
            </div>
            <button onClick={clearSession} className="p-2 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-gradient-to-r from-[#00FFC6] to-[#8A2BE2] text-white' : darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {msg.role === 'assistant' ? renderAssistantContent(msg.content as string | StructuredReply) : <p className="text-sm leading-relaxed">{msg.content}</p>}
                  {msg.role === 'assistant' && (
                    <div className="flex space-x-2 mt-2">
                      <button className="p-1 hover:bg-white/10 rounded"><ThumbsUp className="w-4 h-4" /></button>
                      <button className="p-1 hover:bg-white/10 rounded"><ThumbsDown className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[#00FFC6] animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-[#00FFC6] animate-bounce delay-200"></div>
                    <div className="w-2 h-2 rounded-full bg-[#00FFC6] animate-bounce delay-400"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="px-6 py-4 border-t flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything about your lecture notes..."
              className={`flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#00FFC6] ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
              disabled={isSending}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isSending}
              className="px-6 py-3 bg-gradient-to-r from-[#00FFC6] to-[#8A2BE2] text-white rounded-lg hover:scale-105 transition disabled:opacity-50"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
