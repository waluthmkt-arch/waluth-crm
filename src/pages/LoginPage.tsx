 import * as z from "zod";
 import { useForm } from "react-hook-form";
 import { zodResolver } from "@hookform/resolvers/zod";
 import { useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "@/lib/supabase";
 
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
 
 const LoginSchema = z.object({
   email: z.string().email(),
   password: z.string().min(1),
 });
 
 export default function LoginPage() {
   const navigate = useNavigate();
   const [isPending, setIsPending] = useState(false);
   const [error, setError] = useState<string | undefined>("");
   const [success, setSuccess] = useState<string | undefined>("");
 
   const form = useForm<z.infer<typeof LoginSchema>>({
     resolver: zodResolver(LoginSchema),
     defaultValues: {
       email: "",
       password: "",
     },
   });
 
   const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
     setError("");
     setSuccess("");
     setIsPending(true);
 
     const { error } = await supabase.auth.signInWithPassword({
       email: values.email,
       password: values.password,
     });
 
     if (error) {
       setError(error.message);
       setIsPending(false);
     } else {
       setSuccess("Login successful! Redirecting...");
       setTimeout(() => {
         navigate("/");
       }, 500);
     }
   };
 
   return (
     <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
       <Card className="w-[450px]">
         <CardHeader>
           <CardTitle>Login</CardTitle>
           <CardDescription>Sign in to your account to continue</CardDescription>
         </CardHeader>
         <CardContent>
           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                 control={form.control}
                 name="email"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Email</FormLabel>
                     <FormControl>
                       <Input disabled={isPending} placeholder="you@example.com" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="password"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Password</FormLabel>
                     <FormControl>
                       <Input disabled={isPending} type="password" placeholder="••••••••" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormError message={error} />
               <FormSuccess message={success} />
               <Button disabled={isPending} type="submit" className="w-full">
                 Login
               </Button>
             </form>
           </Form>
         </CardContent>
       </Card>
     </div>
   );
 }