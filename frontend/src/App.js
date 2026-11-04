import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import UploadReceiptPage from "./pages/UploadReceiptPage";
import ReceiptsPage from "./pages/ReceiptsPage";
import ExpensesPage from "./pages/ExpensesPage";
import BudgetsPage from "./pages/BudgetsPage";
import AlertsPage from "./pages/AlertsPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadReceiptPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/receipts"
            element={
              <ProtectedRoute>
                <ReceiptsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpensesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <BudgetsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AlertsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;