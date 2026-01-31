 import { ReactNode } from "react";
 import { Navigate } from "react-router-dom";
 import { useAuth } from "@/hooks/useAuth";
 
 interface ProtectedRouteProps {
   children: ReactNode;
 }
 
 export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
   const { user, loading } = useAuth();
 
   if (loading) {
     return (
       <div className="flex h-screen items-center justify-center">
         <p className="text-muted-foreground">Loading...</p>
       </div>
     );
   }
 
   if (!user) {
     return <Navigate to="/login" replace />;
   }
 
   return <>{children}</>;
 };