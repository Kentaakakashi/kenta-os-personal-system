import { Wifi, Bluetooth, Moon, Zap, Camera, FileText } from "lucide-react";

const ACTIONS = [
  { icon: Wifi, label: "Wi-Fi" },
  { icon: Bluetooth, label: "Bluetooth" },
  { icon: Moon, label: "Focus" },
  { icon: Zap, label: "Power" },
  { icon: Camera, label: "Camera" },
  { icon: FileText, label: "Notes" },
];

const QuickActions = () => {
  return (
    <div id="quickActions" className="kos-surface p-4">
      <p className="kos-label mb-3">Quick Actions</p>
      <div className="grid grid-cols-3 gap-2">
        {ACTIONS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="kos-button flex flex-col items-center gap-1.5 py-3 px-2"
          >
            <Icon size={16} className="text-primary" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
