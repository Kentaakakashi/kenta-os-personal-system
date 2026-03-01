import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical, Settings } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  id: string;
  children: ReactNode;
  colSpan?: boolean;
  onSettings?: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const SortableWidget = ({ id, children, colSpan, onSettings }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      variants={fadeUp}
      className={`relative group ${colSpan ? "sm:col-span-2" : ""}`}
    >
      {/* Drag handle + settings */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onSettings && (
          <button
            onClick={onSettings}
            className="kos-icon-button !w-6 !h-6 !bg-card/80"
          >
            <Settings size={10} />
          </button>
        )}
        <button
          {...attributes}
          {...listeners}
          className="kos-icon-button !w-6 !h-6 !bg-card/80 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical size={10} />
        </button>
      </div>
      {children}
    </motion.div>
  );
};

export default SortableWidget;
