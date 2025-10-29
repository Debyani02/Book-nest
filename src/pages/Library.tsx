import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, BookMarked, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_image_url: string | null;
  genre: string | null;
  published_year: number | null;
}

const Library = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchBooks();
  }, [user, navigate]);

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading books",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setBooks(data || []);
    }
    setLoading(false);
  };

  const addToList = async (bookId: string, status: "want_to_read" | "currently_reading") => {
    if (!user) return;

    const { error } = await supabase
      .from("reading_lists")
      .upsert({ user_id: user.id, book_id: bookId, status }, { onConflict: "user_id,book_id" });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Added to list",
        description: `Book added to ${status === "want_to_read" ? "Want to Read" : "Currently Reading"}`,
      });
    }
  };

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
            Our Library
          </h1>
          <p className="text-muted-foreground">Discover your next favorite book</p>
        </div>

        {books.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">
              No books available yet. Check back soon!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <Card
                key={book.id}
                className="overflow-hidden hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                <CardHeader className="p-0">
                  <div className="h-64 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-24 w-24 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-1 line-clamp-2">{book.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                  {book.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{book.description}</p>
                  )}
                  <div className="flex gap-2 mt-3 text-xs text-muted-foreground">
                    {book.genre && <span className="bg-secondary px-2 py-1 rounded">{book.genre}</span>}
                    {book.published_year && <span className="bg-secondary px-2 py-1 rounded">{book.published_year}</span>}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToList(book.id, "want_to_read");
                    }}
                  >
                    <BookMarked className="h-4 w-4 mr-1" />
                    Want to Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToList(book.id, "currently_reading");
                    }}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Reading
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
