import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send } from "lucide-react";

const AssistantWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        id="assistantWidget"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform active:scale-90 hover:scale-105"
        style={{
          boxShadow: `0 4px 24px hsl(var(--kos-glow) / 0.3)`,
        }}
      >
        <Bot size={22} className="text-primary-foreground" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-3 bottom-3 top-16 z-50 flex flex-col kos-surface overflow-hidden sm:inset-x-auto sm:right-4 sm:bottom-4 sm:top-auto sm:h-[500px] sm:w-[360px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <Bot size={14} className="text-primary" />
                </div>
                <div>
                  <p className="kos-heading text-sm">Kenta AI</p>
                  <p className="kos-mono text-[10px]">online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="kos-icon-button !w-7 !h-7">
                <X size={14} />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="kos-surface !bg-primary/5 rounded-widget p-3 max-w-[85%]">
                <p className="kos-body text-xs">Hey Kenta, how can I help you today?</p>
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2">
              <input
                placeholder="Ask anything..."
                className="flex-1 rounded-button bg-muted px-3 py-2 text-xs outline-none placeholder:text-muted-foreground font-body"
              />
              <button className="kos-icon-button !bg-primary/10 !border-primary/20">
                <Send size={14} className="text-primary" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AssistantWidget;
