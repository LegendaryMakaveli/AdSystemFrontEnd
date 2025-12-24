import {createBrowserRouter} from "react-router";
import LandingPage from "../pages/LandingPage"
import SignUp from "../auth/signup/SignUp";
import Login from "../auth/login/Login"


const router = createBrowserRouter([
    {path: "/", element: <LandingPage/>},
    {path: "/signup", element: <SignUp/>},
    {path: "/login", element: <Login/>},

])

export default router;