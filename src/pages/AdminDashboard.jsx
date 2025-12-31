import { Link } from "react-router";
import { useGetAllUsersQuery, useGetAllListingsQuery } from "../apis/adminApi";
import styles from "../styles/adminDashboard.module.css";

const AdminDashboard = () => {
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery();
  const { data: listingsData, isLoading: listingsLoading } = useGetAllListingsQuery();

  if (usersLoading || listingsLoading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  const users = usersData?.data || [];
  const listings = listingsData?.data || [];

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'ACTIVE').length,
    premiumUsers: users.filter(u => u.subscriptionPlan === 'PREMIUM').length,
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'ACTIVE').length,
    pendingListings: listings.filter(l => l.status === 'PENDING').length,
    deletedListings: listings.filter(l => l.status == 'DELETED').length,
  };

  return (
    <>
        <div className={styles.adminDashboard}>
            <h1>Admin Dashboard Overview</h1>
        
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                <div className={styles.statIcon}>👥</div>
            <div className={styles.statInfo}>
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
            </div>
            </div>

            <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statInfo}>
                <h3>{stats.activeUsers}</h3>
                <p>Active Users</p>
            </div>
            </div>

            <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statInfo}>
                <h3>{stats.premiumUsers}</h3>
                <p>Premium Users</p>
            </div>
            </div>

            <div className={styles.statCard}>
            <div className={styles.statIcon}>📋</div>
            <div className={styles.statInfo}>
                <h3>{stats.totalListings}</h3>
                <p>Total Listings</p>
            </div>
            </div>

            <div className={styles.statCard}>
            <div className={styles.statIcon}>🟢</div>
            <div className={styles.statInfo}>
                <h3>{stats.activeListings}</h3>
                <p>Active Listings</p>
            </div>
            </div>

            <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statInfo}>
                <h3>{stats.pendingListings}</h3>
                <p>Pending Listings</p>
            </div>
            </div>

            <div className={styles.statCard}>
            <div className={styles.statIcon}>❌</div>
                <div className={styles.statInfo}>
                <h3>{stats.deletedListings}</h3>
                <p>Deleted Listings</p>
                </div>
                </div>


            </div>




            <div className={styles.quickActions}>
            <h2>Quick Actions</h2>
            <div className={styles.actionButtons}>
            <Link to="/admin/users" className={styles.actionBtn}>
                Manage Users
            </Link>
            <Link to="/admin/listings" className={styles.actionBtn}>
                Manage Listings
            </Link>
            </div>
            </div>
        </div>
    </>
);
};

export default AdminDashboard;