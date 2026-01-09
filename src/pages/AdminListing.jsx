import { useState } from "react";
import { useGetAllListingsQuery, useDeleteListingMutation } from "../apis/adminApi";
import styles from "../styles/adminListing.module.css";

const AdminListings = () => {
  const { data, isLoading } = useGetAllListingsQuery();
  const [deleteListing] = useDeleteListingMutation();
  const [searchTerm, setSearchTerm] = useState("");

  const listings = data?.data || [];
  
  const filteredListings = listings.filter(
    (listing) =>
      listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (listingId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await deleteListing(listingId).unwrap();
        alert("Listing deleted successfully");
      } catch (err) {
        alert("Failed to delete listing: " + (err.data?.message || err.message));
      }
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading listings...</div>;
  }

  return (
    <div className={styles.adminListings}>
      <h1>Listings Management</h1>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search listings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.listingsGrid}>
        {filteredListings.map((listing) => (
          <div key={listing.id} className={styles.listingCard}>
            <div className={styles.listingHeader}>
              <h3>{listing.title}</h3>
              <span className={`${styles.badge} ${styles[listing.status?.toLowerCase()]}`}>
                {listing.status}
              </span>
            </div>
            <p className={styles.listingDescription}>
              {listing.description?.substring(0, 100)}
              {listing.description?.length > 100 ? "..." : ""}
            </p>
            <div className={styles.listingDetails}>
              <span className={styles.price}>
                #{listing.price?.toLocaleString()}
              </span>
              <span className={styles.category}>{listing.category}</span>
            </div>
            <div className={styles.listingFooter}>
              <span className={styles.location}>📍 {listing.location}</span>
              <button
                onClick={() => handleDelete(listing.id)}
                className={styles.btnDelete}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminListings;