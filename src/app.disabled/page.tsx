
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();

  if (user && user.id) {
    // Check if user has any workspace
    const workspaceMember = await db.workspaceMember.findFirst({
      where: { userId: user.id },
      include: { workspace: true }
    });

    if (workspaceMember) {
      return redirect(`/workspace/${workspaceMember.workspaceId}`);
    } else {
      return redirect("/create-workspace");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-4 bg-slate-50 dark:bg-slate-950">
      <h1 className="text-6xl font-black tracking-tight text-primary">ClickUp Clone</h1>
      <p className="text-xl text-muted-foreground max-w-lg text-center">
        The all-in-one app to replace them all. Tasks, docs, chat, goals, & more.
      </p>
      <div className="flex gap-4 mt-8">
        <Button size="lg" asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    </main>
  );
}

