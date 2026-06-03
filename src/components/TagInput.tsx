import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Tag } from 'lucide-react';
import { getAvailableTags, addAvailableTag } from '@/utils/profileStorage';

interface TagInputProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ selectedTags, onChange }: TagInputProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    loadTags();
    const handleTagsUpdate = () => loadTags();
    window.addEventListener('tagsUpdated', handleTagsUpdate);
    return () => window.removeEventListener('tagsUpdated', handleTagsUpdate);
  }, []);

  const loadTags = () => {
    setAvailableTags(getAvailableTags());
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !availableTags.includes(newTag.trim())) {
      addAvailableTag(newTag.trim());
      onChange([...selectedTags, newTag.trim()]);
      setNewTag('');
      setShowInput(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Tag className="h-4 w-4" />
        Tags
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/90"
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
        
        {showInput ? (
          <div className="flex gap-1">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNewTag()}
              placeholder="Nova tag"
              className="h-7 w-24 text-xs"
              autoFocus
            />
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleAddNewTag}>
              <Plus className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowInput(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Badge variant="outline" className="cursor-pointer" onClick={() => setShowInput(true)}>
            <Plus className="h-3 w-3 mr-1" /> Nova
          </Badge>
        )}
      </div>
    </div>
  );
}
