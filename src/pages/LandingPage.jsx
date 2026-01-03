import style from "../styles/LandingPage.module.css"
import { Link } from "react-router"

const LandingPage = () => {
    return (
    <>
        <div className={style.navContainer}>
            <div className={style.smallNavLinks}>
                <ul>
                    <li>About Us</li>
                    <li>Contact Us</li>
                    <li>Services</li>
                    <li>Gigs</li>
                    <li>Commuity</li>
                </ul>
            </div>

            <div className={style.message}>
                <div className={style.messageInput}>
                    <h1>Welcome To Makaveli Hub</h1>
                    <p>Post your business for the world to see</p>
                    <Link to={"/login"}>
                        <button className={style.login}>Login to Continue</button>
                    </Link>
                    <Link to={"/signup"}>
                        <button className={style.signup}>SignUp to Continue</button>
                    </Link>
                </div>
            </div>
        </div>
    </>
    )
}
export default LandingPage