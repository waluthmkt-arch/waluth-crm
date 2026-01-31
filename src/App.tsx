import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-12">
      <h1 className="text-5xl font-black tracking-tight text-primary">ClickUp Clone</h1>
      <p className="text-base text-muted-foreground max-w-lg text-center">
        The all-in-one app to replace them all. Tasks, docs, chat, goals, & more.
      </p>
      <div className="flex gap-3 mt-6">
        <Button asChild>
          <a href="/login">Login</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/register">Sign Up</a>
        </Button>
      </div>
    </main>
  );
}
