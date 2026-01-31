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
 
 const RegisterSchema = z.object({
   email: z.string().email(),
   password: z.string().min(6),
   name: z.string().min(1),
 });
 
 export default function RegisterPage() {
   const navigate = useNavigate();
   const [isPending, setIsPending] = useState(false);
   const [error, setError] = useState<string | undefined>("");
   const [success, setSuccess] = useState<string | undefined>("");
 
   const form = useForm<z.infer<typeof RegisterSchema>>({
     resolver: zodResolver(RegisterSchema),
     defaultValues: {
       email: "",
       password: "",
       name: "",
     },
   });
 
   const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
     setError("");
     setSuccess("");
     setIsPending(true);
 
     const { error } = await supabase.auth.signUp({
       email: values.email,
       password: values.password,
       options: {
         data: {
           name: values.name,
         },
       },
     });
 
     if (error) {
       setError(error.message);
       setIsPending(false);
     } else {
       setSuccess("Registration successful! Please check your email to verify your account.");
       setIsPending(false);
       setTimeout(() => navigate("/login"), 2000);
     }
   };
 
   return (
     <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
       <Card className="w-[450px]">
         <CardHeader>
           <CardTitle>Sign Up</CardTitle>
           <CardDescription>Create a new account to get started</CardDescription>
         </CardHeader>
         <CardContent>
           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                 control={form.control}
                 name="name"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Name</FormLabel>
                     <FormControl>
                       <Input disabled={isPending} placeholder="John Doe" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
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
                 Sign Up
               </Button>
             </form>
           </Form>
         </CardContent>
       </Card>
     </div>
   );
 }