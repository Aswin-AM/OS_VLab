import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ReportBug = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Bug Report Submitted",
      description: "Thank you for helping us improve OS VLab!",
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Report a Bug</h1>
          <p className="text-lg text-muted-foreground">
            Help us improve by reporting issues or suggesting features
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about the bug..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="steps">Steps to Reproduce</Label>
              <Textarea
                id="steps"
                placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Bug Report
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ReportBug;
