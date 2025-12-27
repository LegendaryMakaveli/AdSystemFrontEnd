import {createBrowserRouter} from "react-router";
import LandingPage from "../pages/LandingPage"
import SignUp from "../auth/signup/SignUp";
import Login from "../auth/login/Login";
import DashBoard from "../pages/DashBoard";
import CreateListing from "../components/createListing"
import ViewListing from "../components/listingDetails"
import UpdateListing from "../components/updateListing";


const router = createBrowserRouter([
    {path: "/", element: <LandingPage/>},
    {path: "/signup", element: <SignUp/>},
    {path: "/login", element: <Login/>},
    {path: "/dashboard", element: <DashBoard/>},
    {path: "/createListing", element: <CreateListing/>},
    {path: "/listing/:id", element: <ViewListing/>},
    {path: "/updateListing/:id", element: <UpdateListing/>}

])

export default router;