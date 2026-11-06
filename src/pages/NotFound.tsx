import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { BookOpen, Home, Target, HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const suggestions = [
  { to: "/collections", label: "Browse collections", icon: BookOpen },
  { to: "/practice", label: "Practise with flashcards", icon: Target },
  { to: "/quiz", label: "Take a quiz", icon: HelpCircle },
];

const NotFound = () => {
  const location = useLocation();

  return (
    <>
      <Helmet>
        <title>Page not found | QuranVocab</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full text-center space-y-6">
          <p className="text-sm font-semibold text-primary tracking-wide">404</p>
          <h1 className="text-3xl md:text-4xl font-bold">We couldn't find that page</h1>
          <p className="text-muted-foreground">
            There is no page at <code className="px-1 py-0.5 rounded bg-muted text-sm break-all">{location.pathname}</code>.
            It may have been moved, or the link may be mistyped.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {suggestions.map(({ to, label, icon: Icon }) => (
              <Button key={to} asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to={to}>
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{label}</span>
                </Link>
              </Button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Search className="h-4 w-4" />
            Looking for a specific word? Use the search button or press Ctrl+K.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/contact">Report a broken link</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
