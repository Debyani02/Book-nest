import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { BookOpen, Library, BookMarked, Sparkles } from "lucide-react";
import heroImage from "@/assets/library-hero.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80 z-10" />
        <img 
          src={heroImage} 
          alt="Library" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 container mx-auto px-4 py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Your Digital Reading Haven</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-fade-in">
              Welcome to BookNest
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
              Discover, read, and organize your favorite books in one beautiful place. 
              Your personal library awaits.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={() => navigate("/library")}
                className="text-lg px-8"
              >
                <Library className="mr-2 h-5 w-5" />
                Explore Library
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 border-primary/20 hover:bg-primary/5"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete reading experience designed for book lovers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="group p-8 rounded-2xl bg-card hover:shadow-[var(--shadow-elegant)] transition-all duration-300 border border-border hover:border-primary/20">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Read Online</h3>
            <p className="text-muted-foreground">
              Access your books anywhere, anytime. Read directly in your browser with our beautiful PDF viewer.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-card hover:shadow-[var(--shadow-elegant)] transition-all duration-300 border border-border hover:border-primary/20">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookMarked className="h-7 w-7 text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Organize Lists</h3>
            <p className="text-muted-foreground">
              Create reading lists, track your progress, and never lose track of books you want to read.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-card hover:shadow-[var(--shadow-elegant)] transition-all duration-300 border border-border hover:border-primary/20">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/80 to-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Library className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Curated Library</h3>
            <p className="text-muted-foreground">
              Discover new favorites from our carefully curated collection of books across all genres.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="bg-gradient-to-r from-primary via-primary/90 to-accent rounded-3xl p-12 md:p-16 text-center text-primary-foreground shadow-[var(--shadow-elegant)]">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start Your Reading Journey Today
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join our community of book lovers and unlock access to a world of literature
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 hover:scale-105 transition-transform"
          >
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
