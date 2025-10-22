import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Progress = () => {
  const { user } = useAuth();
  // TODO: Load from localStorage or database
  const savedExperiments = [];

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-5xl">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Your Progress</h1>
          <p className="text-lg text-muted-foreground">
            Track your saved experiments and learning progress
          </p>
        </div>

        {!user ? (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Sign In to Track Progress</h2>
            <p className="mb-6 text-muted-foreground">
              Create an account to save your experiments and track your learning journey
            </p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </Card>
        ) : savedExperiments.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">No Saved Experiments Yet</h2>
            <p className="mb-6 text-muted-foreground">
              Run simulations and save them to track your progress
            </p>
            <Link to="/topics">
              <Button>Start Learning</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {savedExperiments.map((exp: any, i: number) => (
              <Card key={i} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{exp.algorithm}</h3>
                    <p className="text-sm text-muted-foreground">{exp.createdAt}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
