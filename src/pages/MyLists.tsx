import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReadingListItem {
  id: string;
  status: string;
  book: {
    id: string;
    title: string;
    author: string;
    description: string | null;
    cover_image_url: string | null;
  };
}

const MyLists = () => {
  const [currentlyReading, setCurrentlyReading] = useState<ReadingListItem[]>([]);
  const [wantToRead, setWantToRead] = useState<ReadingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchLists();
  }, [user, navigate]);

  const fetchLists = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("reading_lists")
      .select(`
        id,
        status,
        book:books(id, title, author, description, cover_image_url)
      `)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error loading lists",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const lists = data as any[];
      setCurrentlyReading(lists.filter((item) => item.status === "currently_reading"));
      setWantToRead(lists.filter((item) => item.status === "want_to_read"));
    }
    setLoading(false);
  };

  const removeFromList = async (listId: string) => {
    const { error } = await supabase.from("reading_lists").delete().eq("id", listId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Removed",
        description: "Book removed from list",
      });
      fetchLists();
    }
  };

  const renderBookCard = (item: ReadingListItem) => (
    <Card
      key={item.id}
      className="overflow-hidden hover:shadow-[var(--shadow-card)] transition-all duration-300"
    >
      <div className="flex gap-4 p-4">
        <div className="w-24 h-32 flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded flex items-center justify-center">
          {item.book.cover_image_url ? (
            <img
              src={item.book.cover_image_url}
              alt={item.book.title}
              className="h-full w-full object-cover rounded"
            />
          ) : (
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-lg mb-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/book/${item.book.id}`)}
          >
            {item.book.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{item.book.author}</p>
          {item.book.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{item.book.description}</p>
          )}
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/book/${item.book.id}`)}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFromList(item.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            My Reading Lists
          </h1>
          <p className="text-muted-foreground">Manage your reading journey</p>
        </div>

        <Tabs defaultValue="reading" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="reading">Currently Reading ({currentlyReading.length})</TabsTrigger>
            <TabsTrigger value="want">Want to Read ({wantToRead.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="reading" className="mt-6">
            {currentlyReading.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl text-muted-foreground">
                  No books in your reading list yet
                </p>
                <Button
                  variant="hero"
                  className="mt-4"
                  onClick={() => navigate("/library")}
                >
                  Browse Library
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {currentlyReading.map((item) => renderBookCard(item))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="want" className="mt-6">
            {wantToRead.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl text-muted-foreground">
                  No books in your want to read list yet
                </p>
                <Button
                  variant="hero"
                  className="mt-4"
                  onClick={() => navigate("/library")}
                >
                  Browse Library
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {wantToRead.map((item) => renderBookCard(item))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyLists;
