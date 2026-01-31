 import { Routes, Route } from "react-router-dom";
 import HomePage from "@/pages/HomePage";
 import LoginPage from "@/pages/LoginPage";
 import RegisterPage from "@/pages/RegisterPage";
 import CreateWorkspacePage from "@/pages/CreateWorkspacePage";
 import WorkspacePage from "@/pages/WorkspacePage";
 import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function App() {
  return (
     <Routes>
       <Route path="/" element={<HomePage />} />
       <Route path="/login" element={<LoginPage />} />
       <Route path="/register" element={<RegisterPage />} />
       <Route
         path="/create-workspace"
         element={
           <ProtectedRoute>
             <CreateWorkspacePage />
           </ProtectedRoute>
         }
       />
       <Route
         path="/workspace/:workspaceId/*"
         element={
           <ProtectedRoute>
             <WorkspacePage />
           </ProtectedRoute>
         }
       />
     </Routes>
  );
}
