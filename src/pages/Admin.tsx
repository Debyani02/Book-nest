import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, BookOpen } from "lucide-react";

const Admin = () => {
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    genre: "",
    published_year: "",
    page_count: "",
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload PDF to storage
      const pdfPath = `${Date.now()}-${pdfFile.name}`;
      const { error: pdfUploadError } = await supabase.storage
        .from("books")
        .upload(pdfPath, pdfFile, { upsert: true });

      if (pdfUploadError) throw pdfUploadError;

      // Upload cover image if provided
      let coverUrl = null;
      if (coverFile) {
        const coverPath = `${Date.now()}-${coverFile.name}`;
        const { error: coverUploadError } = await supabase.storage
          .from("book-covers")
          .upload(coverPath, coverFile);

        if (coverUploadError) throw coverUploadError;

        const { data: coverData } = supabase.storage
          .from("book-covers")
          .getPublicUrl(coverPath);
        coverUrl = coverData.publicUrl;
      }

      // Insert book record
      const { error: dbError } = await supabase.from("books").insert({
        title: formData.title,
        author: formData.author,
        description: formData.description || null,
        genre: formData.genre || null,
        published_year: formData.published_year ? parseInt(formData.published_year) : null,
        page_count: formData.page_count ? parseInt(formData.page_count) : null,
        pdf_file_path: pdfPath,
        cover_image_url: coverUrl,
      });

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Book uploaded successfully",
      });

      // Reset form
      setFormData({
        title: "",
        author: "",
        description: "",
        genre: "",
        published_year: "",
        page_count: "",
      });
      setPdfFile(null);
      setCoverFile(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-primary" />
            Admin - Upload Book
          </h1>
          <p className="text-muted-foreground">Add a new book to the library</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter book title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Enter author name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter book description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="e.g., Fiction"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Published Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.published_year}
                    onChange={(e) => setFormData({ ...formData, published_year: e.target.value })}
                    placeholder="e.g., 2024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pages">Page Count</Label>
                <Input
                  id="pages"
                  type="number"
                  value={formData.page_count}
                  onChange={(e) => setFormData({ ...formData, page_count: e.target.value })}
                  placeholder="e.g., 350"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdf">PDF File *</Label>
                <input
                  id="pdf"
                  type="file"
                  accept=".pdf"
                  required
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">Cover Image (optional)</Label>
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2">
                <Upload className="h-4 w-4" />
                {loading ? "Uploading..." : "Upload Book"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
