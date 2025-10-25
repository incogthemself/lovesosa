import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Video, Music, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-purple-950/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold font-display bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Profile Platform
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Showcase your style with stunning customizable profiles
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/customize">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
                data-testid="button-create-profile"
              >
                Create Your Profile
              </Button>
            </Link>
            <Link href="/browse">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 backdrop-blur-sm"
                data-testid="button-browse-profiles"
              >
                Browse Profiles
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="border-purple-500/20 hover-elevate">
            <CardHeader>
              <Video className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Background Videos</CardTitle>
              <CardDescription>
                Add immersive video backgrounds to your profile
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-purple-500/20 hover-elevate">
            <CardHeader>
              <Music className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Custom Audio</CardTitle>
              <CardDescription>
                Set your favorite music as your profile soundtrack
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-purple-500/20 hover-elevate">
            <CardHeader>
              <Eye className="w-10 h-10 text-primary mb-2" />
              <CardTitle>View Counter</CardTitle>
              <CardDescription>
                Track how many people visit your profile
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-purple-500/20 hover-elevate">
            <CardHeader>
              <Sparkles className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Stunning Design</CardTitle>
              <CardDescription>
                Beautiful glass morphism effects and animations
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
