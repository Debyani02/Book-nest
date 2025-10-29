import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, BookMarked, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_image_url: string | null;
  pdf_file_path: string | null;
  genre: string | null;
  published_year: number | null;
  page_count: number | null;
}

const BookReader = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (id) {
      fetchBook();
    }
  }, [id, user, navigate]);

  const fetchBook = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Error loading book",
        description: error.message,
        variant: "destructive",
      });
      navigate("/library");
    } else {
      setBook(data);
      if (data.pdf_file_path) {
        const { data: urlData } = await supabase.storage
          .from("books")
          .createSignedUrl(data.pdf_file_path, 3600);
        if (urlData) {
          setPdfUrl(urlData.signedUrl);
        }
      }
    }
    setLoading(false);
  };

  const addToList = async (status: "want_to_read" | "currently_reading") => {
    if (!user || !book) return;

    const { error } = await supabase
      .from("reading_lists")
      .upsert({ user_id: user.id, book_id: book.id, status }, { onConflict: "user_id,book_id" });

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

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Book not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/library")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="aspect-[2/3] bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-4">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <BookOpen className="h-24 w-24 text-muted-foreground" />
                  )}
                </div>
                <CardTitle className="text-2xl">{book.title}</CardTitle>
                <p className="text-lg text-muted-foreground">{book.author}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {book.description && (
                  <p className="text-sm text-muted-foreground">{book.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {book.genre && (
                    <span className="bg-secondary px-3 py-1 rounded-full text-sm">{book.genre}</span>
                  )}
                  {book.published_year && (
                    <span className="bg-secondary px-3 py-1 rounded-full text-sm">{book.published_year}</span>
                  )}
                  {book.page_count && (
                    <span className="bg-secondary px-3 py-1 rounded-full text-sm">{book.page_count} pages</span>
                  )}
                </div>
                <div className="pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => addToList("want_to_read")}
                  >
                    <BookMarked className="h-4 w-4 mr-2" />
                    Add to Want to Read
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => addToList("currently_reading")}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark as Reading
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="h-[calc(100vh-12rem)]">
              <CardContent className="p-0 h-full">
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full rounded-lg"
                    title={book.title}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                    <BookOpen className="h-24 w-24 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">PDF Not Available</h3>
                    <p className="text-muted-foreground">
                      The PDF file for this book hasn't been uploaded yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookReader;
