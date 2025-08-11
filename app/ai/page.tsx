"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

type AnalyzeResponse = {
  ok?: boolean;
  output?: string;
  usage?: any;
  error?: string;
};

type SearchQaResponse = {
  ok?: boolean;
  answer?: string;
  citations?: { index: number; title: string; url: string }[];
  provider?: string;
  error?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: { index: number; title: string; url: string }[];
  searchInfo?: {
    count: number;
    results: { index: number; title: string; url: string; snippet?: string }[];
  };
};

export default function AITestPage() {
  // default is all-purpose (no web search). "Search" explicitly flips on web search
  const [searchEnabled, setSearchEnabled] = useState(false);

  // (legacy analyze state kept for types; no separate analyze form in UI)
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeResp, setAnalyzeResp] = useState<AnalyzeResponse | null>(null);

  // Search QA state
  const [site, setSite] = useState("");
  const [topK, setTopK] = useState(5);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResp, setSearchResp] = useState<SearchQaResponse | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [reasoningEnabled, setReasoningEnabled] = useState(true);
  const [model, setModel] = useState<string>("deepseek-chat");
  // Animated reasoning phases while streaming (safe high-level visualization)
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phases = ["Analyzing", "Planning", "Drafting", "Refining"] as const;

  const providerHint = useMemo(() => {
    return "Uses server-configured search (Tavily by default).";
  }, []);

  // Auto-scroll to bottom while generating/streaming
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = (smooth = true) => {
    try {
      if (scrollRef.current) {
        const el = scrollRef.current;
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
      } else {
        endRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
      }
    } catch {}
  };
  useEffect(() => {
    scrollToBottom(true);
  }, [messages, sending]);

  // Small animated reveal for progressive UI chunks
  function StepBlock({ show, children }: { show: boolean; children: React.ReactNode }) {
    return (
      <div
        className={`transition-all duration-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}
        style={{ maxHeight: show ? undefined : 0, overflow: show ? undefined : "hidden" }}
        aria-hidden={!show}
      >
        {children}
      </div>
    );
  }

  // Auto-scroll the optional site field into view when Search is enabled
  const siteRef = useRef<HTMLDivElement | null>(null);
  // Do not auto-scroll when Search UI elements appear
  // Intentionally no effect here to avoid moving the viewport when toggling Search

  // Cycle reasoning phase while sending + reasoning enabled
  useEffect(() => {
    if (!sending || !reasoningEnabled) return;
    const t = setInterval(() => setPhaseIndex((p) => (p + 1) % phases.length), 900);
    return () => clearInterval(t);
  }, [sending, reasoningEnabled]);

  // Typewriter reveal
  const typewriterReveal = (full: string, update: (partial: string) => void, done: () => void) => {
    const total = full.length;
    if (total === 0) { update(""); done(); return; }
    let i = 0;
    const step = Math.max(1, Math.floor(total / 350)); // fast
    const interval = setInterval(() => {
      i = Math.min(total, i + step);
      update(full.slice(0, i));
      if (i >= total) {
        clearInterval(interval);
        done();
      }
    }, 8);
  };

  return (
    <div className="ai-page mx-auto max-w-none sm:max-w-3xl px-2 sm:px-4 py-8">
      {/* Branded header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
          <span>AI</span>
          <span className="opacity-80">Assistant</span>
        </div>
        <h1 className="text-3xl font-semibold mt-3 tracking-tight">Ask. Search. Create.</h1>
        <p className="text-sm text-gray-500 mt-1">{providerHint}</p>
      </div>

      {/* Chat window */}
      <div className="rounded-xl bg-white/70 backdrop-blur border border-neutral-200 dark:bg-neutral-900/60 dark:border-neutral-800 shadow-sm">
        <div ref={scrollRef} className="h-[62vh] overflow-y-auto p-4 md:p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="text-sm text-gray-500">Type your request. Toggle Search to pull in fresh results from the web.</div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`${m.role === "assistant" ? "max-w-[98%] sm:max-w-[85%]" : "max-w-[95%] sm:max-w-[85%]"} rounded-2xl px-3.5 py-2.5 shadow-sm animate-fadeInUp ${m.role === "user" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" : "bg-gray-50 text-gray-900 dark:bg-neutral-800 dark:text-gray-100"}`}>
                  {m.role === "assistant" ? (
                    <div className="text-[15px] leading-relaxed">
                      {/* Reasoning panel (no raw chain-of-thought). Shows safe high-level progress while streaming */}
                      {sending && (reasoningEnabled || model === "deepseek-reasoner") && idx === messages.length - 1 && (
                        <div className="mb-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/50 p-2.5">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            {/* brain icon */}
                            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 3a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v1a3 3 0 0 0 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              <path d="M16 3a3 3 0 0 1 3 3v1a3 3 0 0 1 0 6v1a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span>Reasoning</span>
                            <span className="spinner ml-1" aria-hidden="true" />
                            {/* live token estimate based on current streamed text */}
                            <span className="opacity-70">· ~{
                              Math.max(1, Math.round(((m.content || "").length || 0) / 4))
                            } tokens</span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                            {phases.map((p, i) => (
                              <span key={p} className={`px-1.5 py-0.5 rounded border ${i === phaseIndex ? "bg-black text-white border-black" : "bg-transparent border-neutral-300 dark:border-neutral-700"}`}>
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Search meta panel */}
                      {m.searchInfo && (
                        <div className="mb-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Searching Web</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">Found {m.searchInfo.count} site{m.searchInfo.count === 1 ? "" : "s"}</div>
                          {m.searchInfo.results?.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {m.searchInfo.results.map((r) => (
                                <div key={r.index} className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-2.5 bg-white/70 dark:bg-neutral-900/50">
                                  <div className="text-sm font-medium truncate"><a href={r.url} target="_blank" rel="noreferrer" className="hover:underline">[{r.index}] {r.title}</a></div>
                                  <div className="text-xs text-gray-500 truncate">{r.url}</div>
                                  {r.snippet && <div className="text-sm text-gray-700 dark:text-gray-200 mt-1 line-clamp-2">{r.snippet}</div>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <ReactMarkdown
                        remarkPlugins={[gfm]}
                        components={{
                          h1: (props) => <h1 className="text-lg font-semibold mb-2" {...props} />,
                          h2: (props) => <h2 className="text-base font-semibold mb-2" {...props} />,
                          p: (props) => <p className="mb-2" {...props} />,
                          ul: (props) => <ul className="list-disc pl-5 space-y-1 mb-2" {...props} />,
                          ol: (props) => <ol className="list-decimal pl-5 space-y-1 mb-2" {...props} />,
                          li: (props) => <li className="mb-0.5" {...props} />,
                          strong: (props) => <strong className="font-semibold" {...props} />,
                          a: (props) => <a className="underline text-blue-700" target="_blank" rel="noreferrer" {...props} />,
                          code: (props) => <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10" {...props} />,
                          blockquote: (props) => <blockquote className="border-l-4 pl-3 italic opacity-80 mb-2" {...props} />,
                          hr: () => <hr className="my-3 border-neutral-200 dark:border-neutral-700" />,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  )}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-2 text-xs opacity-90">
                      <div className="font-medium mb-1">Citations</div>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {m.citations.map((c: { index: number; title: string; url: string }) => (
                          <li key={c.index}>
                            [{c.index}] <a className="underline" href={c.url} target="_blank" rel="noreferrer">{c.title || c.url}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="max-w-[95%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-sm bg-gray-50 text-gray-900 dark:bg-neutral-800 dark:text-gray-100 animate-fadeInUp">
                <div className="flex items-center gap-2 text-sm">
                  <span className="spinner" aria-hidden="true" />
                  <span>{searchEnabled ? "Searching web..." : "Generating..."}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 p-3 md:p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSearchEnabled((v) => !v)}
              className={`px-3 py-1.5 text-sm rounded-full border shadow-sm transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8] ${searchEnabled ? "bg-[#1a73e8] text-white border-[#1a73e8] hover:bg-[#1664c4]" : "bg-white hover:bg-[#1a73e8]/5 border-neutral-200 dark:border-neutral-700 text-[#1a73e8]"}`}
              title="Enable web search for the next message"
            >
              {/* search icon */}
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {searchEnabled ? "Search: On" : "Search: Off"}
            </button>

            <button
              type="button"
              onClick={() => setReasoningEnabled((v) => !v)}
              className={`px-3 py-1.5 text-sm rounded-full border shadow-sm transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8] ${reasoningEnabled ? "bg-[#1a73e8] text-white border-[#1a73e8] hover:bg-[#1664c4]" : "bg-white hover:bg-[#1a73e8]/5 border-neutral-200 dark:border-neutral-700 text-[#1a73e8]"}`}
              title="Enable R1-style reasoning for the next message"
            >
              {/* brain icon */}
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v1a3 3 0 0 0 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 3a3 3 0 0 1 3 3v1a3 3 0 0 1 0 6v1a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {reasoningEnabled ? "Reasoning: On" : "Reasoning: Off"}
            </button>

            <div className="flex items-center gap-2">
              <label className="text-sm opacity-80">Model</label>
              <select
                className="text-sm border border-neutral-200 dark:border-neutral-700 rounded p-1.5 bg-white dark:bg-neutral-900 outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                title="Select DeepSeek model"
              >
                <option value="deepseek-reasoner">DeepSeek R1 (Reasoner)</option>
                <option value="deepseek-chat">DeepSeek V3 (Chat)</option>
              </select>
            </div>

            <StepBlock show={searchEnabled}>
              <div ref={siteRef}>
                <input
                  className="flex-1 min-w-[160px] border border-neutral-200 dark:border-neutral-700 rounded p-2 text-sm bg-white dark:bg-neutral-900 outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]"
                  placeholder="Restrict to site (optional): example.com"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                />
              </div>
            </StepBlock>
          </div>

          <div className="flex items-end gap-2">
            <textarea
              className="flex-1 border border-neutral-200 dark:border-neutral-700 rounded p-2 min-h-[44px] max-h-[160px] bg-white dark:bg-neutral-900 outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]"
              placeholder={searchEnabled ? "Ask the web..." : "Ask anything..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              disabled={sending || !input.trim()}
              className="rounded-md bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1664c4] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]"
              onClick={async () => {
                const content = input.trim();
                if (!content) return;
                setInput("");
                setSending(true);
                setMessages((prev) => [...prev, { role: "user", content }]);
                try {
                  if (searchEnabled) {
                    const res = await fetch("/api/ai/stream-search", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ query: content, site: site.trim() || undefined, model, reasoning: reasoningEnabled }),
                    });
                    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
                    // placeholder assistant message
                    setMessages((prev) => [...prev, { role: "assistant", content: "", citations: [] }]);
                    const reader = res.body.getReader();
                    const decoder = new TextDecoder();
                    let searchHandled = false;
                    let metaHandled = false;
                    let buffered = "";
                    // stop showing loader once stream starts
                    setSending(false);
                    while (true) {
                      const { done, value } = await reader.read();
                      if (done) break;
                      const chunk = decoder.decode(value, { stream: true });
                      buffered += chunk;
                      // handle search & meta header lines if present
                      let progressed = true;
                      while (progressed && buffered.includes("\n") && (!searchHandled || !metaHandled)) {
                        progressed = false;
                        const idx = buffered.indexOf("\n");
                        const firstLine = buffered.slice(0, idx);
                        const rest = buffered.slice(idx + 1);
                        if (!searchHandled && firstLine.startsWith("__SEARCH__")) {
                          try {
                            const info = JSON.parse(firstLine.replace("__SEARCH__", ""));
                            const count = Number(info?.count) || 0;
                            const results = Array.isArray(info?.results) ? info.results : [];
                            setMessages((prev) => {
                              const next = [...prev];
                              const last = next[next.length - 1];
                              if (last && last.role === "assistant") next[next.length - 1] = { ...last, searchInfo: { count, results } } as any;
                              return next;
                            });
                          } catch {}
                          buffered = rest;
                          searchHandled = true;
                          progressed = true;
                          continue;
                        }
                        if (!metaHandled && firstLine.startsWith("__META__")) {
                          try {
                            const meta = JSON.parse(firstLine.replace("__META__", ""));
                            const cites = Array.isArray(meta?.citations) ? meta.citations : [];
                            setMessages((prev) => {
                              const next = [...prev];
                              const last = next[next.length - 1];
                              if (last && last.role === "assistant") next[next.length - 1] = { ...last, citations: cites } as any;
                              return next;
                            });
                          } catch {}
                          buffered = rest;
                          metaHandled = true;
                          progressed = true;
                        }
                      }
                      if (buffered) {
                        const text = buffered;
                        setMessages((prev) => {
                          const next = [...prev];
                          const last = next[next.length - 1];
                          if (last && last.role === "assistant") next[next.length - 1] = { ...last, content: text } as any;
                          return next;
                        });
                        // keep pinned to bottom while streaming
                        scrollToBottom(false);
                      }
                    }
                  } else {
                    const res = await fetch("/api/ai/stream-analyze", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ text: content, model, reasoning: reasoningEnabled }),
                    });
                    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
                    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
                    const reader = res.body.getReader();
                    const decoder = new TextDecoder();
                    setSending(false);
                    let all = "";
                    while (true) {
                      const { done, value } = await reader.read();
                      if (done) break;
                      const chunk = decoder.decode(value, { stream: true });
                      all += chunk;
                      const text = all;
                      setMessages((prev) => {
                        const next = [...prev];
                        const last = next[next.length - 1];
                        if (last && last.role === "assistant") next[next.length - 1] = { ...last, content: text } as any;
                        return next;
                      });
                      scrollToBottom(false);
                    }
                  }
                } catch (e: any) {
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: `Error: ${e?.message || "Request failed"}` },
                  ]);
                } finally {
                  // sending state may already be cleared when animating
                  setSending(false);
                }
              }}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>

        {/* Local animations */}
        <style jsx>{`
          .animate-fadeInUp {
            animation: fadeInUp 320ms ease-out both;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(0,0,0,0.12);
            border-top-color: currentColor;
            border-radius: 9999px;
            display: inline-block;
            animation: spin .8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          /* Ultra-small devices: reduce page horizontal padding */
          @media (max-width: 360px) {
            .ai-page { padding-left: 4px; padding-right: 4px; }
          }
        `}</style>
      </div>
    </div>
  );
}
