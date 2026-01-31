 import { useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { useAuth } from "@/hooks/useAuth";
 import { supabase } from "@/integrations/supabase/client";
 
 export default function HomePage() {
   const navigate = useNavigate();
   const { user } = useAuth();
 
   useEffect(() => {
     const checkWorkspace = async () => {
       if (!user) return;

       // Check if user has any workspace
       const { data: member } = await supabase
         .from("workspace_members")
         .select("workspace_id")
         .eq("user_id", user.id)
         .limit(1)
         .maybeSingle();

       if (member) {
         navigate(`/workspace/${member.workspace_id}`);
       } else {
         navigate("/create-workspace");
       }
     };

     if (user) {
       checkWorkspace();
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