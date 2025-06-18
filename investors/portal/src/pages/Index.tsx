import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";
import InvestmentGroup from "../components/InvestmentGroup";
import AgreementPage from "./AgreementPage";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login 
                onLogin={(user) => {
                  setIsAuthenticated(true);
                  setCurrentUser(user);
                }} 
              />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Dashboard user={currentUser} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/group/:groupId" 
          element={
            isAuthenticated ? (
              <InvestmentGroup user={currentUser} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/group/:groupId/agreement"
          element={
            isAuthenticated ? (
              <AgreementPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default Index; 