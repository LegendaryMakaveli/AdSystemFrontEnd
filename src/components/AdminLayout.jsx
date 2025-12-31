import { Link, Outlet, useNavigate } from "react-router";
import styles from "../styles/adminLayout.module.css";

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div className={styles.adminLayout}>
      <nav className={styles.adminNav}>
        <div className={styles.navBrand}>
          <h2>🔐 Admin Portal</h2>
        </div>
        <ul className={styles.navLinks}>
          <li><Link to="/admin">Dashboard</Link></li>
          <li><Link to="/admin/users">Users</Link></li>
          <li><Link to="/admin/listings">Listings</Link></li>
        </ul>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </nav>
      <main className={styles.adminContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;