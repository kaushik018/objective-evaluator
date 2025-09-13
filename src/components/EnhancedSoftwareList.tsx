import { useState, useMemo } from 'react';
import { SoftwareCard } from '@/components/Dashboard/SoftwareCard';
import { SearchAndFilter, FilterOptions } from '@/components/SearchAndFilter';
import { IntegrationPanel } from '@/components/IntegrationPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSoftware } from '@/hooks/useSoftware';
import { 
  Activity, 
  Plus, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Grid,
  List
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface SoftwareItem {
  id: string;
  name: string;
  version: string;
  category: string;
  performanceScore: number;
  uptimePercentage: number;
  integrations: number;
  lastUpdated: string;
  status: "excellent" | "good" | "fair" | "poor" | "pending";
  website?: string;
}

interface EnhancedSoftwareListProps {
  onView?: (id: string) => void;
  onCompare?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function EnhancedSoftwareList({ 
  onView = () => {}, 
  onCompare = () => {},
  onDelete 
}: EnhancedSoftwareListProps) {
  const { software, loading, deleteSoftware } = useSoftware();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'uptime' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    statuses: [],
    performanceRange: [0, 100],
    uptimeRange: [0, 100]
  });

  // Transform software data to match expected format
  const transformedSoftware: SoftwareItem[] = useMemo(() => {
    return software.map(item => ({
      id: item.id,
      name: item.name,
      version: item.version || 'N/A',
      category: item.category,
      performanceScore: item.performance_score || 0,
      uptimePercentage: item.uptime_percentage || 0,
      integrations: item.integrations_count || 0,
      lastUpdated: formatTimeAgo(item.updated_at),
      status: (item.status as "excellent" | "good" | "fair" | "poor" | "pending") || 'pending',
      website: item.website
    }));
  }, [software]);

  // Get available categories for filtering
  const availableCategories = useMemo(() => {
    const categories = new Set(transformedSoftware.map(s => s.category));
    return Array.from(categories).sort();
  }, [transformedSoftware]);

  // Filter and search software
  const filteredSoftware = useMemo(() => {
    let filtered = transformedSoftware;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(item => filters.categories.includes(item.category));
    }

    // Status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(item => filters.statuses.includes(item.status));
    }

    // Performance range filter
    if (filters.performanceRange[0] > 0 || filters.performanceRange[1] < 100) {
      filtered = filtered.filter(item => 
        item.performanceScore >= filters.performanceRange[0] && 
        item.performanceScore <= filters.performanceRange[1]
      );
    }

    // Uptime range filter
    if (filters.uptimeRange[0] > 0 || filters.uptimeRange[1] < 100) {
      filtered = filtered.filter(item => 
        item.uptimePercentage >= filters.uptimeRange[0] && 
        item.uptimePercentage <= filters.uptimeRange[1]
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'performance':
          aValue = a.performanceScore;
          bValue = b.performanceScore;
          break;
        case 'uptime':
          aValue = a.uptimePercentage;
          bValue = b.uptimePercentage;
          break;
        case 'updated':
        default:
          // For date sorting, we'll use the raw timestamp
          const aIndex = software.findIndex(s => s.id === a.id);
          const bIndex = software.findIndex(s => s.id === b.id);
          aValue = aIndex >= 0 ? new Date(software[aIndex].updated_at).getTime() : 0;
          bValue = bIndex >= 0 ? new Date(software[bIndex].updated_at).getTime() : 0;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [transformedSoftware, searchTerm, filters, sortBy, sortOrder, software]);

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }

  const handleReset = () => {
    setSearchTerm('');
    setFilters({
      categories: [],
      statuses: [],
      performanceRange: [0, 100],
      uptimeRange: [0, 100]
    });
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return <Minus className="h-3 w-3" />;
    return sortOrder === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="software" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="software">Software List</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="software" className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Software Applications</h2>
              <p className="text-muted-foreground">
                {filteredSoftware.length} of {transformedSoftware.length} applications
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Button asChild>
                <Link to="/add-software">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Software
                </Link>
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFiltersChange={setFilters}
            availableCategories={availableCategories}
            onReset={handleReset}
          />

          {/* Sort Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Sort by:</span>
            {[
              { key: 'updated', label: 'Last Updated' },
              { key: 'name', label: 'Name' },
              { key: 'performance', label: 'Performance' },
              { key: 'uptime', label: 'Uptime' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={sortBy === key ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort(key as typeof sortBy)}
                className="flex items-center gap-1"
              >
                {label}
                {getSortIcon(key as typeof sortBy)}
              </Button>
            ))}
          </div>

          {/* Software Grid/List */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSoftware.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
              {filteredSoftware.map((item) => (
                <SoftwareCard
                  key={item.id}
                  software={item}
                  onView={onView}
                  onCompare={onCompare}
                  onDelete={onDelete || deleteSoftware}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {transformedSoftware.length === 0 ? 'No software added yet' : 'No matching results'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {transformedSoftware.length === 0 
                    ? 'Start by adding your first software application to begin monitoring.' 
                    : 'Try adjusting your search or filter criteria.'}
                </p>
                <div className="flex gap-2">
                  {transformedSoftware.length === 0 ? (
                    <Button asChild>
                      <Link to="/add-software">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Software
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleReset}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}