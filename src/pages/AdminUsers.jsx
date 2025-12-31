import { useState } from "react";
import { useGetAllUsersQuery, useDeleteUserMutation, useUpgradeUserMutation, useDowngradeUserMutation, useGetListingsByUserIdQuery } from "../apis/adminApi";
import styles from "../styles/adminUser.module.css";

const AdminUsers = () => {
  const { data, isLoading } = useGetAllUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [upgradeUser] = useUpgradeUserMutation();
  const [downgradeUser] = useDowngradeUserMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserListings, setShowUserListings] = useState(false);


  const { data: userListingsData, isLoading: listingsLoading } = useGetListingsByUserIdQuery(selectedUserId, {
    skip: !selectedUserId
  });

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
    if (window.confirm("Upgrade this user to Premium?")) {
      try {
        await upgradeUser(userId).unwrap();
        alert("User upgraded to Premium successfully!");
      } catch (err) {
        alert("Failed to upgrade user: " + (err.data?.message || err.message));
      }
    }
  };

  const handleDowngrade = async (userId) => {
    if (window.confirm("Downgrade this user to FREE?")) {
      try {
        await downgradeUser(userId).unwrap();
        alert("User downgraded to Basic successfully!");
      } catch (err) {
        alert("Failed to downgrade user: " + (err.data?.message || err.message));
      }
    }
  };

  const handleViewUserListings = (userId) => {
    setSelectedUserId(userId);
    setShowUserListings(true);
  };

  const closeUserListingsModal = () => {
    setSelectedUserId(null);
    setShowUserListings(false);
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  const userListings = userListingsData?.data || [];
  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>User Management</h1>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{users.length}</span>
            <span className={styles.statLabel}>Total Users</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{users.filter(u => u.subscriptionPlan === 'PREMIUM').length}</span>
            <span className={styles.statLabel}>Premium Users</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{users.filter(u => u.status === 'ACTIVE').length}</span>
            <span className={styles.statLabel}>Active Users</span>
          </div>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className={styles.nameCell}>
                  <div className={styles.userName}>
                    {user.firstName} {user.lastName}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`${styles.badge} ${user.subscriptionPlan === 'PREMIUM' ? styles.premiumBadge : styles.basicBadge}`}>
                    {user.subscriptionPlan}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${user.status === 'ACTIVE' ? styles.activeBadge : styles.inactiveBadge}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => handleViewUserListings(user.id, `${user.firstName} ${user.lastName}`)}
                      className={styles.btnView}
                      title="View User's Listings"
                    >
                      <span className="material-symbols-outlined">list</span>
                    </button>
                    {user.subscriptionPlan === "FREE" && (
                      <button
                        onClick={() => handleUpgrade(user.id)}
                        className={styles.btnUpgrade}
                        title="Upgrade to Premium"
                      >
                        <span className="material-symbols-outlined">upgrade</span>
                      </button>
                    )}
                    {user.subscriptionPlan === "PREMIUM" && (
                      <button
                        onClick={() => handleDowngrade(user.id)}
                        className={styles.btnDowngrade}
                        title="Downgrade to FREE"
                      >
                        <span className="material-symbols-outlined">expand_circle_down</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user.id)}
                      className={styles.btnDelete}
                      title="Delete User"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className={styles.noResults}>
            <span className="material-symbols-outlined">search_off</span>
            <p>No users found matching your search.</p>
          </div>
        )}
      </div>

      {showUserListings && (
        <div className={styles.modalOverlay} onClick={closeUserListingsModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Listings by {selectedUser?.firstName} {selectedUser?.lastName}</h2>
              <button onClick={closeUserListingsModal} className={styles.closeButton}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className={styles.modalBody}>
              {listingsLoading ? (
                <div className={styles.loadingModal}>
                  <div className={styles.spinner}></div>
                  <p>Loading listings...</p>
                </div>
              ) : userListings.length === 0 ? (
                <div className={styles.noListings}>
                  <span className="material-symbols-outlined">inbox</span>
                  <p>This user has no listings yet.</p>
                </div>
              ) : (
                <div className={styles.listingsGrid}>
                  {userListings.map((listing) => (
                    <div key={listing.id} className={styles.listingCard}>
                      {listing.images && listing.images.length > 0 && (
                        <div className={styles.listingImage}>
                          <img src={listing.images[0]} alt={listing.title} />
                        </div>
                      )}
                      <div className={styles.listingInfo}>
                        <h3>{listing.title}</h3>
                        <p className={styles.listingDescription}>
                          {listing.description?.substring(0, 100)}
                          {listing.description?.length > 100 ? '...' : ''}
                        </p>
                        <div className={styles.listingMeta}>
                          <span className={styles.price}>${listing.price?.toLocaleString()}</span>
                          <span className={`${styles.badge} ${listing.status === 'ACTIVE' ? styles.activeBadge : styles.inactiveBadge}`}>
                            {listing.status}
                          </span>
                        </div>
                        <div className={styles.listingFooter}>
                          <span className={styles.category}>{listing.category}</span>
                          <span className={styles.location}>
                            <span className="material-symbols-outlined">location_on</span>
                            {listing.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;