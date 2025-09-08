import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useSoftware } from "@/hooks/useSoftware";
import { 
  Plus, 
  Globe, 
  X, 
  Loader2,
  CheckCircle,
  ArrowLeft
} from "lucide-react";

interface SoftwareFormData {
  name: string;
  version: string;
  category: string;
  website: string;
  description: string;
  apiEndpoint: string;
  statusPage: string;
  tags: string[];
}

const categories = [
  "Communication",
  "Development", 
  "Project Management",
  "CRM",
  "Analytics",
  "Security",
  "Database",
  "Cloud Services",
  "Other"
];

export default function AddSoftware() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addSoftware } = useSoftware();
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [formData, setFormData] = useState<SoftwareFormData>({
    name: "",
    version: "",
    category: "",
    website: "",
    description: "",
    apiEndpoint: "",
    statusPage: "",
    tags: []
  });

  const handleInputChange = (field: keyof SoftwareFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await addSoftware({
        name: formData.name,
        version: formData.version || undefined,
        category: formData.category,
        description: formData.description || undefined,
        website: formData.website || undefined,
        api_endpoint: formData.apiEndpoint || undefined,
        status_page: formData.statusPage || undefined,
        tags: formData.tags
      });
      
      toast({
        title: "Success!",
        description: `${formData.name} has been added for evaluation.`,
      });

      // Navigate back to dashboard
      navigate('/');
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.name && formData.category && formData.website;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Software</h1>
          <p className="text-muted-foreground mt-1">
            Add a new software application for objective evaluation and monitoring
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2 text-primary" />
            Software Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Software Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Slack, GitHub, Jira"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => handleInputChange("version", e.target.value)}
                  placeholder="e.g., v4.29.149, Enterprise"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the software and its primary use case"
                rows={3}
              />
            </div>

            {/* URLs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Website URL *
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiEndpoint">API Endpoint (for performance testing)</Label>
                <Input
                  id="apiEndpoint"
                  type="url"
                  value={formData.apiEndpoint}
                  onChange={(e) => handleInputChange("apiEndpoint", e.target.value)}
                  placeholder="https://api.example.com/v1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusPage">Status Page URL (for uptime monitoring)</Label>
                <Input
                  id="statusPage"
                  type="url"
                  value={formData.statusPage}
                  onChange={(e) => handleInputChange("statusPage", e.target.value)}
                  placeholder="https://status.example.com"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={!isFormValid || isLoading}
                className="min-w-32"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Add Software
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• We'll analyze the software documentation for integrations</li>
            <li>• Performance benchmarks will be conducted automatically</li>
            <li>• Uptime monitoring will begin within 24 hours</li>
            <li>• Results will appear on your dashboard once evaluation is complete</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}