import { useState } from "react";
import {useGetAllUsersQuery,useDeleteUserMutation,useUpgradeUserMutation,useDowngradeUserMutation,} from "../apis/adminApi";
import styles from "../styles/adminUser.module.css";

const AdminUsers = () => {
  const { data, isLoading } = useGetAllUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [upgradeUser] = useUpgradeUserMutation();
  const [downgradeUser] = useDowngradeUserMutation();
  const [searchTerm, setSearchTerm] = useState("");

  const users = data?.data || [];
  
  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId).unwrap();
        alert("User deleted successfully");
      } catch (err) {
        alert("Failed to delete user: " + (err.data?.message || err.message));
      }
    }
  };

  const handleUpgrade = async (userId) => {
    try {
      await upgradeUser(userId).unwrap();
      alert("User upgraded to Premium");
    } catch (err) {
      alert("Failed to upgrade user: " + (err.data?.message || err.message));
    }
  };

  const handleDowngrade = async (userId) => {
    try {
      await downgradeUser(userId).unwrap();
      alert("User downgraded");
    } catch (err) {
      alert("Failed to downgrade user: " + (err.data?.message || err.message));
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading users...</div>;
  }

  return (
    <div className={styles.adminUsers}>
      <h1>User Management</h1>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.usersTable}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.email}</td>
                <td>{user.phoneNumber}</td>
                <td>
                  <span className={`${styles.badge} ${styles[user.subscriptionPlan?.toLowerCase()]}`}>
                    {user.subscriptionPlan}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${styles[user.status?.toLowerCase()]}`}>
                    {user.status}
                  </span>
                </td>
                <td className={styles.actions}>
                  {user.subscriptionPlan === "BASIC" && (
                    <button
                      onClick={() => handleUpgrade(user.id)}
                      className={styles.btnUpgrade}
                    >
                      Upgrade
                    </button>
                  )}
                  {user.subscriptionPlan === "PREMIUM" && (
                    <button
                      onClick={() => handleDowngrade(user.id)}
                      className={styles.btnDowngrade}
                    >
                      Downgrade
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(user.id)}
                    className={styles.btnDelete}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;