
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ZoomControls = ({ onZoomIn, onZoomOut }: ZoomControlsProps) => {
  return (
    <div className="zoom-controls">
      <Button
        variant="outline"
        size="icon"
        onClick={onZoomIn}
        className="bg-gray-800/50 text-white"
      >
        <ZoomIn size={20} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onZoomOut}
        className="bg-gray-800/50 text-white"
      >
        <ZoomOut size={20} />
      </Button>
    </div>
  );
};
