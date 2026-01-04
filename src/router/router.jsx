import {createBrowserRouter} from "react-router";
import LandingPage from "../pages/LandingPage"
import SignUp from "../auth/signup/SignUp";
import Login from "../auth/login/Login";
import DashBoard from "../pages/DashBoard";
import CreateListing from "../components/createListing"
import ViewListing from "../components/listingDetails"
import UpdateListing from "../components/updateListing";
import BuyerDashboard from "../pages/buyerDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import AdminUsers from "../pages/AdminUsers";
import AdminListings from "../pages/AdminListing";
import ProtectedAdminRoute from "../components/protectedAdminRoute";
import AdminLayout from "../components/AdminLayout";
import ForgotPassword from "../components/forgetPassword";





const router = createBrowserRouter([
    {path: "/", element: <LandingPage/>},
    {path: "/signup", element: <SignUp/>},
    {path: "/login", element: <Login/>},
    {path: "/dashboard", element: <DashBoard/>},
    {path: "/createListing", element: <CreateListing/>},
    {path: "/listing/:id", element: <ViewListing/>},
    {path: "/updateListing/:id", element: <UpdateListing/>},
    {path: "/buyerDashboard", element: <BuyerDashboard/>},
    {path: "/resetPassword", element: <ForgotPassword/>},
    {path: "/admin", element: (
            <ProtectedAdminRoute>
                <AdminLayout />
            </ProtectedAdminRoute>
        ),
        children: [
            { index: true, element: <AdminDashboard /> },
            { path: "users", element: <AdminUsers /> },
            { path: "listings", element: <AdminListings /> }
        ]
    }
])

export default router;