import { Suspense } from "react";
import { AudiobookList } from "@/components/audiobook/audiobook-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";

// Mock data for when database is not available
const mockAudiobooks = [
  {
    id: "1",
    title: "Sample Audiobook",
    author: "John Author",
    narrator: "Jane Narrator",
    coverImage: "/placeholder.svg?height=400&width=300",
    genre: "Fiction",
    description: "A sample audiobook for demonstration",
    duration: 3600,
    chapterCount: 10,
    totalDuration: 3600,
    favoriteCount: 5,
    releaseDate: new Date(),
    isExplicit: false,
    createdAt: new Date()
  }
];

const mockGenres = [
  { id: "1", name: "Fiction", slug: "fiction" },
  { id: "2", name: "Non-Fiction", slug: "non-fiction" }
];

// This is a server component that fetches the initial data
async function AudiobooksContent() {
  try {
    // Try to fetch from API first
    let formattedAudiobooks: any[] = [];
    let genres: any[] = [];
    
    try {
      const result = await apiClient.request('/audiobooks');
      formattedAudiobooks = result.data || [];
      genres = result.genres || [];
    } catch (error) {
      console.log("API not available, using mock data");
      formattedAudiobooks = mockAudiobooks;
      genres = mockGenres;
    }

    // If no audiobooks found, show a helpful message
    if (formattedAudiobooks.length === 0) {
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Explore Our Audiobooks</h1>
            <p className="text-xl text-muted-foreground">
              Immerse yourself in captivating stories narrated by talented voice
              artists. From bestselling novels to thought-provoking non-fiction,
              our audiobook collection has something for everyone.
            </p>
          </div>

          <div className="text-center py-12">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-6 rounded-lg max-w-md mx-auto">
              <h2 className="text-lg font-semibold mb-2">
                No Audiobooks Available
              </h2>
              <p className="mb-4">
                No published audiobooks have been created yet.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Get popular audiobooks (by favorite count)
    const popularAudiobooks = [...formattedAudiobooks].sort(
      (a, b) => b.favoriteCount - a.favoriteCount
    );

    // Get recent audiobooks
    const recentAudiobooks = [...formattedAudiobooks].sort(
      (a, b) =>
        new Date(b.releaseDate || b.createdAt).getTime() -
        new Date(a.releaseDate || a.createdAt).getTime()
    );

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Our Audiobooks</h1>
          <p className="text-xl text-muted-foreground">
            Immerse yourself in captivating stories narrated by talented voice
            artists. From bestselling novels to thought-provoking non-fiction,
            our audiobook collection has something for everyone.
          </p>
        </div>

        <Tabs defaultValue="featured" className="mb-12">
          <TabsList className="flex flex-wrap h-auto p-1 mb-8">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="new">New Releases</TabsTrigger>
            <TabsTrigger value="favorites">My Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="mt-0">
            <AudiobookList
              initialAudiobooks={formattedAudiobooks}
              title="Featured Audiobooks"
              availableGenres={genres}
            />
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            <AudiobookList
              initialAudiobooks={popularAudiobooks}
              title="Popular Audiobooks"
              availableGenres={genres}
            />
          </TabsContent>

          <TabsContent value="new" className="mt-0">
            <AudiobookList
              initialAudiobooks={recentAudiobooks}
              title="New Releases"
              availableGenres={genres}
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <AudiobookList
              initialAudiobooks={[]}
              title="My Favorites"
              showFavoritesOnly={true}
              availableGenres={genres}
            />
          </TabsContent>
        </Tabs>

        <div className="space-y-12">
          {genres.slice(0, 3).map((genre: any) => {
            const genreAudiobooks = formattedAudiobooks
              .filter((audiobook: any) => audiobook.genre === genre.name)
              .slice(0, 4);

            if (genreAudiobooks.length === 0) return null;

            return (
              <section key={genre.id} className="space-y-6">
                <h2 className="text-2xl font-bold">{genre.name} Audiobooks</h2>
                <AudiobookList
                  initialAudiobooks={genreAudiobooks}
                  showSearch={false}
                  showFilters={false}
                  title=""
                  availableGenres={genres}
                />
              </section>
            );
          })}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in AudiobooksContent:", error);
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Error loading audiobooks</h2>
          <p>
            We encountered an issue while loading the audiobook data. Please try
            again later.
          </p>
          <details className="mt-2">
            <summary>Error details (for debugging)</summary>
            <pre className="text-xs mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

// Loading skeleton for the audiobooks page
function AudiobooksLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-full max-w-lg mx-auto" />
      </div>

      <Skeleton className="h-10 w-96 mb-8" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
        {Array(10)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
      </div>
    </div>
  );
}

export default function AudiobooksPage() {
  return (
    <Suspense fallback={<AudiobooksLoading />}>
      <AudiobooksContent />
    </Suspense>
  );
}
