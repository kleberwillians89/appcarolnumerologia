import { Filter, Eye, EyeOff, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export interface ComparisonFilterOptions {
  showOnlyDifferences: boolean;
  highlightIdentical: boolean;
  groupBySimilarity: boolean;
  similarityThreshold: number;
}

interface ComparisonFiltersProps {
  filters: ComparisonFilterOptions;
  onFiltersChange: (filters: ComparisonFilterOptions) => void;
  profileCount: number;
}

export default function ComparisonFilters({ 
  filters, 
  onFiltersChange,
  profileCount 
}: ComparisonFiltersProps) {
  
  const updateFilter = (key: keyof ComparisonFilterOptions, value: boolean | number) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-white">Filtros Inteligentes</h3>
          </div>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
            {profileCount} perfis
          </Badge>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-slate-400" />
              <Label htmlFor="show-diff" className="text-slate-300 cursor-pointer">
                Mostrar apenas diferenças
              </Label>
            </div>
            <Switch
              id="show-diff"
              checked={filters.showOnlyDifferences}
              onCheckedChange={(v) => updateFilter('showOnlyDifferences', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-slate-400" />
              <Label htmlFor="highlight" className="text-slate-300 cursor-pointer">
                Destacar números idênticos
              </Label>
            </div>
            <Switch
              id="highlight"
              checked={filters.highlightIdentical}
              onCheckedChange={(v) => updateFilter('highlightIdentical', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <Label htmlFor="group" className="text-slate-300 cursor-pointer">
                Agrupar por similaridade
              </Label>
            </div>
            <Switch
              id="group"
              checked={filters.groupBySimilarity}
              onCheckedChange={(v) => updateFilter('groupBySimilarity', v)}
            />
          </div>

          {filters.groupBySimilarity && (
            <div className="space-y-2 pl-6 border-l-2 border-purple-500/30">
              <Label className="text-slate-300 text-sm">
                Limite de similaridade: {filters.similarityThreshold}%
              </Label>
              <Slider
                value={[filters.similarityThreshold]}
                onValueChange={([v]) => updateFilter('similarityThreshold', v)}
                min={40}
                max={90}
                step={5}
                className="w-full"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
