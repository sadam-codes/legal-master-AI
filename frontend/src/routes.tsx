import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignIn from "./pages/auth/sign-in";
import SignUp from "./pages/auth/sign-up";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import LandingPage from "./pages/landing";
import AdminDashboard from "./pages/admin";
import ChatTable from "./pages/admin/chat/chatTable";
import { AdminLayout } from "./components/layout/AdminLayout";
import { UserLayout } from "./components/layout/UserLayout";
import UserTable from "./pages/admin/user/usertable";
import QuestionTable from "./pages/admin/question/questiontable";
import CategoryTable from "./pages/admin/category/categorytable";
import Chat from "./pages/user/chat/chat";
import Auth from "./components/auth";
import ProfileSettings from "./pages/profile/ProfileSettings";
import AdminSettings from "./pages/admin/settings";
import NotFound from "./pages/NotFound";
import SubscriptionManagement from "./pages/admin/subscription";
import Products from "./pages/products";
import MockTrials from "./pages/user/trial/mockTrials";
import TrialAnalysis from "./pages/user/trial/trialAnalysis";
import TrialHistory from "./pages/user/trial/trialHistory";
import TrialsPage from "./pages/admin/trials";
import ProductsWithStripe from "./pages/products/ProductsWithStripe";

const router = createBrowserRouter([

    {
        path: "/",
        element: <Auth isAuth={false}><LandingPage /></Auth>
    },
    {
        path: "/login",
        element: <Auth isAuth={false}><SignIn /> </Auth>// Redirect old login to new sign-in
    },
    {
        path: "/sign-in",
        element: <Auth isAuth={false}><SignIn /></Auth>
    },
    {
        path: "/sign-up",
        element:<Auth isAuth={false}> <SignUp /></Auth>
    },
    {
        path: "/forgot-password",
        element:<Auth isAuth={false}> <ForgotPassword /></Auth>
    },
    {
        path: "/reset-password",
        element:<Auth isAuth={false}> <ResetPassword /></Auth>
    },
    {
        path: "/products",
        element: <Auth isAuth={true}><Products /></Auth>
    },
    // Admin routes
    {
        path: "/admin",
        element:
            <Auth isAuth={true} isAdmin={true}><AdminLayout /></Auth>,
        children: [
            {
                path: "chats",
                element: <ChatTable />
            },
            {
                path: "profile",
                element: <ProfileSettings />
            },
            {
                path: "dashboard",
                element: <AdminDashboard />
            },
            {
                path: "users",
                element: <UserTable />
            },
            {
                path: "questions",
                element: <QuestionTable />
            },
            {
                path: "categories",
                element: <CategoryTable />
            },
            {
                path: "settings",
                element: <AdminSettings />
            },
            {
                path: "subscriptions",
                element: <SubscriptionManagement />
            },
            {
                path: "trials",
                element: <TrialsPage />
            } 
        ]
    },
    // User routes
    {
        path: "/chat",
        element: <Auth isAuth={true}><UserLayout /></Auth>,
        children: [
            {
                path: "new",
                element: <Chat />
            },
            {
                path: ":chatId",
                element: <Chat />
            },
            {
                path: "profile",
                element: <ProfileSettings />
            },
            {
                path: "products",
                element: <ProductsWithStripe />
            }
        ]
    },
    {
        path: "/user",
        element: <Auth isAuth={true}><UserLayout /></Auth>,
        children: [
            {
                path: "trial",
                element: <MockTrials />
            },
            {
                path: "trial/analysis",
                element: <TrialAnalysis />
            },
            {
                path: "trial/history",
                element: <TrialHistory />
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
]);

const AppRouter = () => {
    return (
        <RouterProvider router={router} />
    )
}

export default AppRouter;
