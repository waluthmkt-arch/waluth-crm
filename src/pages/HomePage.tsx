 import { useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { useAuth } from "@/hooks/useAuth";
 
 export default function HomePage() {
   const navigate = useNavigate();
   const { user } = useAuth();
 
   useEffect(() => {
     if (user) {
       // Redirect to workspace if user is logged in
       // (We'll implement workspace fetching later)
       navigate("/create-workspace");
     }
   }, [user, navigate]);
 
   return (
     <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-4 bg-slate-50 dark:bg-slate-950">
       <h1 className="text-6xl font-black tracking-tight text-primary">ClickUp Clone</h1>
       <p className="text-xl text-muted-foreground max-w-lg text-center">
         The all-in-one app to replace them all. Tasks, docs, chat, goals, & more.
       </p>
       <div className="flex gap-4 mt-8">
         <Button size="lg" onClick={() => navigate("/login")}>
           Login
         </Button>
         <Button variant="outline" size="lg" onClick={() => navigate("/register")}>
           Sign Up
         </Button>
       </div>
     </main>
   );
 }