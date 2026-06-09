import { Search, SlidersHorizontal, Grid3x3, List, Star, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { getAvailableTags } from '@/utils/profileStorage';

export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'alphabetical-desc';
export type ViewMode = 'grid' | 'list';

interface ProfileFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalProfiles: number;
  filteredCount: number;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}


export default function ProfileFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  showFavoritesOnly,
  onToggleFavorites,
  viewMode,
  onViewModeChange,
  totalProfiles,
  filteredCount,
  selectedTags,
  onTagsChange,
}: ProfileFiltersProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);

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
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-white">Filtros e Ordenação</h3>
        </div>
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
          {filteredCount} de {totalProfiles} perfis
        </Badge>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border-slate-700 text-slate-100">
            <SelectItem value="newest">Mais Recente</SelectItem>
            <SelectItem value="oldest">Mais Antigo</SelectItem>
            <SelectItem value="alphabetical">A-Z</SelectItem>
            <SelectItem value="alphabetical-desc">Z-A</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="icon"
            onClick={onToggleFavorites}
            className={showFavoritesOnly ? "bg-yellow-500 text-white hover:bg-yellow-600" : "border-slate-600 bg-slate-900/40 text-slate-100 hover:bg-slate-800 hover:text-white"}
          >
            <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant={viewMode === 'grid' ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange('grid')}
            className={viewMode === 'grid' ? "bg-yellow-500 text-white hover:bg-yellow-600" : "border-slate-600 bg-slate-900/40 text-slate-100 hover:bg-slate-800 hover:text-white"}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange('list')}
            className={viewMode === 'list' ? "bg-yellow-500 text-white hover:bg-yellow-600" : "border-slate-600 bg-slate-900/40 text-slate-100 hover:bg-slate-800 hover:text-white"}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {availableTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Tag className="h-4 w-4" />
            Filtrar por tags:
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={selectedTags.includes(tag) ? "cursor-pointer border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600" : "cursor-pointer border-slate-400 text-slate-300 hover:bg-slate-800 hover:text-white"}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
