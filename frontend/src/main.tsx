import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AuthenticatedRoute from "./components/authenticateRoute";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { LoginPage } from "./screens/auth/LoginPage";
import { RegisterPage } from "./screens/auth/RegisterPage";
import HomePage from "./screens/user/HomePage";
import { OTPVerificationPage } from "./screens/auth/OTPVerificationPage";
import ForgotPasswordPage from "./screens/auth/ForgotPasswordPage";
import ResetPasswordPage from "./screens/auth/ResetPasswordPage";
import ArticlePage from "./screens/user/ArticlePage";
import ArticleCreationPage from "./screens/user/ArticleCreationPage";
import EditArticlePage from "./screens/user/EditArticlePage";
import UserActivityPage from "./screens/user/UserActivityPage";
import UserProfilePage from "./screens/user/UserProfilePage";
import UserArticlePage from "./screens/user/UserArticlePage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Navigate to="/login" replace />} />

      {/* Public Routes */}
      <Route element={<AuthenticatedRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-otp" element={<OTPVerificationPage />} />

        {/* Protected Routes */}
        <Route path="/user/home" element={<HomePage />} />
        <Route path="/user/article/:articleId" element={<ArticlePage />} />
        <Route
          path="/user/edit-article/:articleId"
          element={<EditArticlePage />}
        />
        <Route path="/user/profile" element={<UserProfilePage />} />
        <Route path="/user/activities" element={<UserActivityPage />} />
        <Route path="/user/my-articles" element={<UserArticlePage />} />
        <Route path="/user/create-article" element={<ArticleCreationPage />} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
