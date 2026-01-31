 import * as z from "zod";
 import { useForm } from "react-hook-form";
 import { zodResolver } from "@hookform/resolvers/zod";
 import { useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 
 import { Button } from "@/components/ui/button";
 import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
 } from "@/components/ui/form";
 import { Input } from "@/components/ui/input";
 import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
 import { FormError } from "@/components/form-error";
 import { FormSuccess } from "@/components/form-success";
 
 const CreateWorkspaceSchema = z.object({
   name: z.string().min(1, "Workspace name is required"),
 });
 
 export default function CreateWorkspacePage() {
   const navigate = useNavigate();
   const { user } = useAuth();
   const [isPending, setIsPending] = useState(false);
   const [error, setError] = useState<string | undefined>("");
   const [success, setSuccess] = useState<string | undefined>("");
 
   const form = useForm<z.infer<typeof CreateWorkspaceSchema>>({
     resolver: zodResolver(CreateWorkspaceSchema),
     defaultValues: {
       name: "",
     },
   });
 
   const onSubmit = async (values: z.infer<typeof CreateWorkspaceSchema>) => {
     setError("");
     setSuccess("");
     setIsPending(true);
 
     if (!user) {
       setError("You must be logged in to create a workspace.");
       setIsPending(false);
       return;
     }

     // Create workspace
     const { data: workspace, error: workspaceError } = await supabase
       .from("workspaces")
       .insert({
         name: values.name,
         owner_id: user.id,
       })
       .select()
       .single();

     if (workspaceError) {
       setError(workspaceError.message);
       setIsPending(false);
       return;
     }

     // Add owner as member
     const { error: memberError } = await supabase
       .from("workspace_members")
       .insert({
         workspace_id: workspace.id,
         user_id: user.id,
         role: "OWNER",
       });

     if (memberError) {
       setError(memberError.message);
       setIsPending(false);
       return;
     }

     setSuccess("Workspace created!");
     setIsPending(false);
 
     setTimeout(() => {
       navigate(`/workspace/${workspace.id}`);
     }, 1000);
   };
 
   return (
     <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
       <Card className="w-[450px]">
         <CardHeader>
           <CardTitle>Create your Workspace</CardTitle>
           <CardDescription>
             Give your workspace a name to get started. You can change this later.
           </CardDescription>
         </CardHeader>
         <CardContent>
           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                 control={form.control}
                 name="name"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Workspace Name</FormLabel>
                     <FormControl>
                       <Input
                         disabled={isPending}
                         placeholder="My Awesome Company"
                         {...field}
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormError message={error} />
               <FormSuccess message={success} />
               <Button disabled={isPending} type="submit" className="w-full">
                 Create Workspace
               </Button>
             </form>
           </Form>
         </CardContent>
       </Card>
     </div>
   );
 }