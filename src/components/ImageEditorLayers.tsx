import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Eye, EyeOff, Trash2, GripVertical, Upload } from 'lucide-react';

export interface Layer {
  id: string;
  name: string;
  imageData: string;
  visible: boolean;
  opacity: number;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    grayscale: number;
    sepia: number;
  };
}

interface ImageEditorLayersProps {
  layers: Layer[];
  activeLayerId: string | null;
  onLayerSelect: (id: string) => void;
  onLayerToggle: (id: string) => void;
  onLayerDelete: (id: string) => void;
  onLayerOpacity: (id: string, opacity: number) => void;
  onLayerReorder: (fromIndex: number, toIndex: number) => void;
  onAddLayer: () => void;
}

export const ImageEditorLayers: React.FC<ImageEditorLayersProps> = ({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerToggle,
  onLayerDelete,
  onLayerOpacity,
  onLayerReorder,
  onAddLayer
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onLayerReorder(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Camadas</h3>
        <Button onClick={onAddLayer} size="sm" variant="outline">
          <Upload className="h-3 w-3 mr-1" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`border rounded p-2 cursor-move transition-all ${
              activeLayerId === layer.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            } ${draggedIndex === index ? 'opacity-50' : ''}`}
            onClick={() => onLayerSelect(layer.id)}
          >
            <div className="flex items-center gap-2 mb-2">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-medium flex-1 truncate">{layer.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onLayerToggle(layer.id); }}
              >
                {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onLayerDelete(layer.id); }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Opacidade:</span>
              <Slider
                value={[layer.opacity]}
                onValueChange={([v]) => onLayerOpacity(layer.id, v)}
                max={100}
                step={1}
                className="flex-1"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-xs font-mono w-8">{layer.opacity}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
