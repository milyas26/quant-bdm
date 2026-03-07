import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <Button asChild>
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  );
}
