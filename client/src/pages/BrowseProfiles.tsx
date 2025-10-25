import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye } from "lucide-react";
import type { Profile } from "@shared/schema";

export default function BrowseProfiles() {
  const { data: profiles, isLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-purple-950/20 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold font-display bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Browse Profiles
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover amazing profiles from our community
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-muted rounded-md mb-4" />
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !profiles || profiles.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                No profiles yet. Be the first to create one!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-profiles">
            {profiles.map((profile) => (
              <Link key={profile.id} href={`/${profile.username}`}>
                <Card className="hover-elevate cursor-pointer border-purple-500/20 transition-all" data-testid={`card-profile-${profile.username}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Avatar className="w-24 h-24 border-4 border-primary/50 shadow-lg">
                        <AvatarImage src={profile.profilePicture || undefined} alt={profile.displayName || profile.username} />
                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-purple-600 text-primary-foreground">
                          {(profile.displayName || profile.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1 w-full">
                        <h3 className="text-xl font-bold font-display truncate" data-testid={`text-name-${profile.username}`}>
                          {profile.displayName || profile.username}
                        </h3>
                        <p className="text-sm text-muted-foreground" data-testid={`text-username-${profile.username}`}>
                          @{profile.username}
                        </p>
                      </div>

                      {profile.bio && (
                        <p className="text-sm text-foreground/80 line-clamp-2">
                          {profile.bio}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span data-testid={`text-views-${profile.username}`}>{profile.viewCount.toLocaleString()} views</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
