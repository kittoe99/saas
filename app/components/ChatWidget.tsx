"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content:
        "Hi! I'm your assistant. Ask about pricing, features, issues, or how to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), 0);
    }
  }, [open, messages.length]);

  function respond(text: string) {
    const t = text.toLowerCase();
    const replies: string[] = [];
    if (/(price|pricing|cost|plan)/.test(t)) {
      replies.push(
        "We offer simple monthly plans. Tell me your needs and I'll suggest a fit, or contact us to tailor a plan."
      );
    }
    if (/(account|login|signup|sign up|password)/.test(t)) {
      replies.push(
        "Account questions? Choose 'Account' on the contact page and we'll help you out."
      );
    }
    if (/(bug|issue|error|technical|problem)/.test(t)) {
      replies.push(
        "Sorry about the trouble. Please describe the issue. You can also pick 'Technical Issues' as the subject on our contact form."
      );
    }
    if (/(sales|demo|quote|project)/.test(t)) {
      replies.push(
        "Happy to discuss your project. Share a brief scope, or start from the Showcase to see examples."
      );
    }
    if (/(ai|agent|automation|website)/.test(t)) {
      replies.push(
        "Our AI tools are in progress. You can explore the Features section for what's coming next."
      );
    }
    if (replies.length === 0) {
      replies.push(
        "Got it. I can help with plans, features, issues, and getting started. Try asking about pricing or AI features."
      );
    }
    return replies.join("\n\n");
  }

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    const botText = respond(trimmed);
    const botMsg: Message = { id: crypto.randomUUID(), role: "bot", content: botText };
    setTimeout(() => setMessages((m) => [...m, botMsg]), 200);
  }

  function quickAsk(q: string) {
    setInput(q);
    // send immediately
    setTimeout(() => handleSend(), 0);
  }

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 pb-[env(safe-area-inset-bottom)] flex items-end justify-end gap-2">
      {/* Toggle button (always visible) */}
      <button
        type="button"
        aria-label={open ? "Close support" : "Open support"}
        onClick={() => setOpen((v) => !v)}
        className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-[#1a73e8] text-white shadow-lg flex items-center justify-center hover:bg-[#1864c7] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M21 12c0 4.418-4.03 8-9 8-1.038 0-2.033-.156-2.957-.445L3 20l1.445-6.043A7.93 7.93 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
        )}
      </button>

      {open && (
        <div
          className="w-[calc(100vw-1.5rem-3rem)] max-w-xs sm:max-w-none sm:w-80 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden"
          role="dialog"
          aria-label="Support chatbot"
        >
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-neutral-200 bg-neutral-50">
            <div className="text-sm sm:text-sm font-medium">Help & resources</div>
            <button
              aria-label="Close"
              className="p-1 rounded-md hover:bg-neutral-100"
              onClick={() => setOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="px-3 sm:px-4 py-2.5 sm:py-3 space-y-2.5 sm:space-y-3 h-52 sm:h-64 overflow-y-auto">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-lg bg-[#1a73e8] text-white px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-sm"
                      : "max-w-[80%] rounded-lg bg-neutral-100 text-neutral-900 px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-sm"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Quick suggestions */}
          <div className="px-3 sm:px-4 pb-2 flex flex-wrap gap-2">
            <button onClick={() => quickAsk("What are your pricing options?")} className="text-sm sm:text-xs px-2 py-1 rounded-full border border-neutral-200 hover:bg-neutral-50">Pricing</button>
            <button onClick={() => quickAsk("Show me examples of your work")} className="text-sm sm:text-xs px-2 py-1 rounded-full border border-neutral-200 hover:bg-neutral-50">Showcase</button>
            <button onClick={() => quickAsk("I have a technical issue")} className="text-sm sm:text-xs px-2 py-1 rounded-full border border-neutral-200 hover:bg-neutral-50">Tech issue</button>
            <button onClick={() => quickAsk("Tell me about AI features")} className="text-sm sm:text-xs px-2 py-1 rounded-full border border-neutral-200 hover:bg-neutral-50">AI features</button>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 min-w-0 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border border-neutral-200 bg-white outline-none text-sm sm:text-sm"
              />
              <button type="submit" className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md bg-[#1a73e8] text-white text-sm sm:text-sm">Send</button>
            </div>
          </form>

          {/* Resources */}
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-neutral-200 bg-neutral-50">
            <div className="text-xs uppercase tracking-wide text-neutral-500">Resources</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <a href="/showcase" className="group rounded-md border border-neutral-200 bg-white px-3 py-2 hover:border-neutral-300">
                <div className="font-medium">Showcase</div>
                <div className="text-xs text-neutral-600">See examples</div>
              </a>
              <a href="#features" className="group rounded-md border border-neutral-200 bg-white px-3 py-2 hover:border-neutral-300">
                <div className="font-medium">Features</div>
                <div className="text-xs text-neutral-600">What’s included</div>
              </a>
              <a href="/contact" className="group rounded-md border border-neutral-200 bg-white px-3 py-2 hover:border-neutral-300">
                <div className="font-medium">Contact</div>
                <div className="text-xs text-neutral-600">Get in touch</div>
              </a>
              <a href="#overview" className="group rounded-md border border-neutral-200 bg-white px-3 py-2 hover:border-neutral-300">
                <div className="font-medium">Overview</div>
                <div className="text-xs text-neutral-600">Home</div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
