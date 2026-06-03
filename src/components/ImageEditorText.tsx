import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type } from 'lucide-react';

interface ImageEditorTextProps {
  onAddText: (text: string, fontSize: number, color: string, fontFamily: string, x: number, y: number) => void;
}

export const ImageEditorText: React.FC<ImageEditorTextProps> = ({ onAddText }) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);

  const handleAddText = () => {
    if (text.trim()) {
      onAddText(text, fontSize, color, fontFamily, posX, posY);
      setText('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Type className="h-5 w-5 mr-2" />
          Adicionar Texto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Texto</Label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite o texto..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Tamanho: {fontSize}px</Label>
            <Input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              min={10}
              max={100}
            />
          </div>

          <div>
            <Label>Cor</Label>
            <Input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Fonte</Label>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Posição X: {posX}%</Label>
            <Input
              type="number"
              value={posX}
              onChange={(e) => setPosX(Number(e.target.value))}
              min={0}
              max={100}
            />
          </div>

          <div>
            <Label>Posição Y: {posY}%</Label>
            <Input
              type="number"
              value={posY}
              onChange={(e) => setPosY(Number(e.target.value))}
              min={0}
              max={100}
            />
          </div>
        </div>

        <Button onClick={handleAddText} className="w-full">
          <Type className="h-4 w-4 mr-2" />
          Adicionar Texto
        </Button>
      </CardContent>
    </Card>
  );
};
