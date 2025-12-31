
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

import LandingPage from './components/LandingPage';
import PlannerPage from './components/PlannerPage';
import DashboardPage from './components/DashboardPage';
import CoursePage from './components/CoursePage';
import LinksPage from './components/LinksPage';

import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import EmailConfirmationPage from './components/EmailConfirmationPage';
import AdminPage from './components/AdminPage';

import ResetPasswordPage from './components/ResetPasswordPage';
import AuthRedirectHandler from './components/AuthRedirectHandler';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

import Preloader from './components/Preloader';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = React.useState(true);

    return (
        <ThemeProvider>
            <AuthProvider>
                {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
                <HashRouter>
                    <AuthRedirectHandler />
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/email-confirmed" element={<EmailConfirmationPage />} />

                        {/* Planner público */}
                        <Route element={<Layout />}>
                            <Route path="/planner" element={<PlannerPage />} />
                        </Route>

                        {/* Demais rotas protegidas */}
                        <Route element={<PrivateRoute />}>
                            <Route element={<Layout />}>
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/course" element={<CoursePage />} />
                                <Route path="/links" element={<LinksPage />} />
                                <Route path="/admin" element={<AdminPage />} />
                            </Route>
                        </Route>

                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </HashRouter>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;