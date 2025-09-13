import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';

export interface FilterOptions {
  categories: string[];
  statuses: string[];
  performanceRange: [number, number];
  uptimeRange: [number, number];
}

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableCategories: string[];
  onReset: () => void;
}

export function SearchAndFilter({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  availableCategories,
  onReset
}: SearchAndFilterProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const statuses = ['excellent', 'good', 'fair', 'poor', 'pending'];
  const statusColors = {
    excellent: 'bg-success text-success-foreground',
    good: 'bg-primary text-primary-foreground',
    fair: 'bg-warning text-warning-foreground',
    poor: 'bg-destructive text-destructive-foreground',
    pending: 'bg-muted text-muted-foreground'
  };

  const activeFiltersCount = 
    filters.categories.length + 
    filters.statuses.length + 
    (filters.performanceRange[0] > 0 || filters.performanceRange[1] < 100 ? 1 : 0) +
    (filters.uptimeRange[0] > 0 || filters.uptimeRange[1] < 100 ? 1 : 0);

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const handlePerformanceChange = (value: string) => {
    const [min, max] = value.split('-').map(Number);
    onFiltersChange({ ...filters, performanceRange: [min, max] });
  };

  const handleUptimeChange = (value: string) => {
    const [min, max] = value.split('-').map(Number);
    onFiltersChange({ ...filters, uptimeRange: [min, max] });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search software by name, category, or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Quick Filters and Advanced Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filter Tags */}
        <div className="flex items-center gap-1 flex-wrap">
          {filters.categories.map(category => (
            <Badge 
              key={category} 
              variant="secondary" 
              className="cursor-pointer"
              onClick={() => handleCategoryToggle(category)}
            >
              {category}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.statuses.map(status => (
            <Badge 
              key={status} 
              className={`cursor-pointer ${statusColors[status as keyof typeof statusColors]}`}
              onClick={() => handleStatusToggle(status)}
            >
              {status}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="border rounded-lg p-4 space-y-4 bg-card">
          <h3 className="font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categories */}
            <div>
              <label className="text-sm font-medium mb-2 block">Categories</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    Categories ({filters.categories.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  {availableCategories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    Status ({filters.statuses.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  {statuses.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={filters.statuses.includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    >
                      <span className="capitalize">{status}</span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Performance Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Performance Score</label>
              <Select onValueChange={handlePerformanceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Any performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-100">Any performance</SelectItem>
                  <SelectItem value="90-100">Excellent (90-100)</SelectItem>
                  <SelectItem value="70-89">Good (70-89)</SelectItem>
                  <SelectItem value="50-69">Fair (50-69)</SelectItem>
                  <SelectItem value="0-49">Poor (0-49)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Uptime Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Uptime</label>
              <Select onValueChange={handleUptimeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Any uptime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-100">Any uptime</SelectItem>
                  <SelectItem value="99-100">99%+ uptime</SelectItem>
                  <SelectItem value="95-98">95-98% uptime</SelectItem>
                  <SelectItem value="90-94">90-94% uptime</SelectItem>
                  <SelectItem value="0-89">&lt;90% uptime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}