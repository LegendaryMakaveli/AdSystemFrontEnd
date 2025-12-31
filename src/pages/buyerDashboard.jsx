import { useState, useMemo } from 'react';
import { useGetAllQuery } from '../apis/listingApi';
import styles from '../styles/buyerDashboard.module.css';

const BuyerDashboard = () => {
  const { data: allListings, isLoading, isError, error } = useGetAllQuery();
  const [selectedListing, setSelectedListing] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    searchText: ""
  });

  const activeListings = useMemo(() => {
    if (!allListings || !Array.isArray(allListings)) return [];
    return allListings.filter(listing => 
      listing.status === "ACTIVE" || listing.status === "active"
    );
  }, [allListings]);

  const { categories, locations } = useMemo(() => {
    if (!activeListings || activeListings.length === 0) return { categories: [], locations: [] };
    
    const categories = [...new Set(activeListings.map(l => l.category).filter(Boolean))];
    const locations = [...new Set(activeListings.map(l => l.location).filter(Boolean))];
    
    return {
      categories: categories.sort(),
      locations: locations.sort()
    };
  }, [activeListings]);

  const filteredListings = useMemo(() => {
    if (!activeListings || activeListings.length === 0) return [];
    
    return activeListings.filter(listing => {
      const matchesCategory = !filters.category || listing.category === filters.category;
      const matchesLocation = !filters.location || listing.location === filters.location;
      const matchesSearch = !filters.searchText || 
        listing.title?.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        listing.description?.toLowerCase().includes(filters.searchText.toLowerCase());
      
      return matchesCategory && matchesLocation && matchesSearch;
    });
  }, [activeListings, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      location: "",
      searchText: ""
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedListing(null);
    setCurrentImageIndex(0);
  };

  const handleContactSeller = (listing) => {
    const message = `Hi! I'm interested in your listing: ${listing.title}`;
    window.location.href = `mailto:${listing.contactEmail}?subject=Inquiry about ${encodeURIComponent(listing.title)}&body=${encodeURIComponent(message)}`;
  };

  const handleCallSeller = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const nextImage = () => {
    if (selectedListing?.images) {
      setCurrentImageIndex((prev) => 
        prev === selectedListing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedListing?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedListing.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <>
      <div className={styles.createButtonBigConatiner}>
        <div className={styles.createButtonContainer}>
          <h1 className={styles.dashboardTitle}>Browse Listings</h1>
        </div>
        <div className={styles.createButtonContainer}>
          <button className={styles.createButton} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.filtersHeader}>
          <h3>Find What You Need</h3>
          {(filters.category || filters.location || filters.searchText) && (
            <button className={styles.clearButton} onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
        
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label htmlFor="searchText">
              <span className="material-symbols-outlined">search</span>
              Search
            </label>
            <input
              type="text"
              id="searchText"
              placeholder="Search listings..."
              value={filters.searchText}
              onChange={(e) => handleFilterChange("searchText", e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="category">
              <span className="material-symbols-outlined">category</span>
              Category
            </label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="location">
              <span className="material-symbols-outlined">location_on</span>
              Location
            </label>
            <select
              id="location"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.resultsCount}>
          Showing {filteredListings.length} of {activeListings.length} listing{filteredListings.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className={styles.listingsContainer}>
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading listings...</p>
          </div>
        )}
        
        {isError && (
          <div className={styles.error}>
            <span className="material-symbols-outlined">error</span>
            <p>Failed to load listings. {error?.data?.data || error?.data?.message || "Please try again."}</p>
          </div>
        )}
        
        {!isLoading && !isError && filteredListings.length === 0 && (
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined">inbox</span>
            <p>
              {activeListings.length === 0
                ? "No listings available at the moment."
                : "No listings match your filters. Try adjusting your search."}
            </p>
          </div>
        )}
        
        {!isLoading && !isError && filteredListings.length > 0 && (
          <div className={styles.listingsGrid}>
            {filteredListings.map((listing) => (
              <div key={listing.id} className={styles.listingCard}>
                {listing.images && listing.images.length > 0 && (
                  <div className={styles.imageContainer}>
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className={styles.listingImage}
                    />
                    {listing.images.length > 1 && (
                      <span className={styles.imageCount}>
                        <span className="material-symbols-outlined">photo_library</span>
                        {listing.images.length}
                      </span>
                    )}
                  </div>
                )}
                
                <div className={styles.cardContent}>
                  <div className={styles.listingHeader}>
                    <h3>{listing.title}</h3>
                    <span className={styles.category}>
                      {listing.category}
                    </span>
                  </div>
                  
                  <p className={styles.description}>
                    {listing.description?.substring(0, 120)}
                    {listing.description?.length > 120 ? '...' : ''}
                  </p>
                  
                  <div className={styles.listingDetails}>
                    <div className={styles.price}>
                      <span className={styles.priceLabel}>Price:</span>
                      <span className={styles.priceAmount}>${listing.price?.toLocaleString()}</span>
                    </div>
                    <div className={styles.location}>
                      <span className="material-symbols-outlined">location_on</span>
                      <span>{listing.location}</span>
                    </div>
                  </div>
                  
                  <div className={styles.listingActions}>
                    <button 
                      className={styles.viewDetailsButton}
                      onClick={() => handleViewDetails(listing)}
                    >
                      <span className="material-symbols-outlined">visibility</span>
                      <span>View Details</span>
                    </button>
                    {listing.phone && (
                      <button 
                        className={styles.callButton}
                        onClick={() => handleCallSeller(listing.phone)}
                      >
                        <span className="material-symbols-outlined">call</span>
                        <span>Call</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedListing && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div className={styles.modalBody}>


              <div className={styles.modalImageSection}>
                {selectedListing.images && selectedListing.images.length > 0 ? (
                  <>
                    <div className={styles.mainImageContainer}>
                      <img 
                        src={selectedListing.images[currentImageIndex]} 
                        alt={`${selectedListing.title} - Image ${currentImageIndex + 1}`}
                        className={styles.mainImage}
                      />
                      {selectedListing.images.length > 1 && (
                        <>
                          <button 
                            className={`${styles.imageNavButton} ${styles.prevButton}`}
                            onClick={prevImage}
                          >
                            <span className="material-symbols-outlined">chevron_left</span>
                          </button>
                          <button 
                            className={`${styles.imageNavButton} ${styles.nextButton}`}
                            onClick={nextImage}
                          >
                            <span className="material-symbols-outlined">chevron_right</span>
                          </button>
                          <div className={styles.imageCounter}>
                            {currentImageIndex + 1} / {selectedListing.images.length}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {selectedListing.images.length > 1 && (
                      <div className={styles.thumbnailContainer}>
                        {selectedListing.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className={`${styles.thumbnail} ${index === currentImageIndex ? styles.activeThumbnail : ''}`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.noImagePlaceholder}>
                    <span className="material-symbols-outlined">image</span>
                    <p>No images available</p>
                  </div>
                )}
              </div>


              <div className={styles.modalDetailsSection}>
                <div className={styles.modalHeader}>
                  <h2>{selectedListing.title}</h2>
                  <span className={styles.modalCategory}>{selectedListing.category}</span>
                </div>

                <div className={styles.modalPrice}>
                  <span className={styles.priceLabel}>Price:</span>
                  <span className={styles.priceAmount}>${selectedListing.price?.toLocaleString()}</span>
                </div>

                <div className={styles.modalSection}>
                  <h3>
                    <span className="material-symbols-outlined">description</span>
                    Description
                  </h3>
                  <p>{selectedListing.description}</p>
                </div>

                <div className={styles.modalSection}>
                  <h3>
                    <span className="material-symbols-outlined">info</span>
                    Details
                  </h3>
                  <div className={styles.detailsList}>
                    <div className={styles.detailItem}>
                      <span className="material-symbols-outlined">location_on</span>
                      <div>
                        <strong>Location</strong>
                        <p>{selectedListing.location}</p>
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <span className="material-symbols-outlined">calendar_today</span>
                      <div>
                        <strong>Posted</strong>
                        <p>{selectedListing.createdAt || 'Recently'}</p>
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <span className="material-symbols-outlined">category</span>
                      <div>
                        <strong>Category</strong>
                        <p>{selectedListing.category}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.modalSection}>
                  <h3>
                    <span className="material-symbols-outlined">contact_phone</span>
                    Contact Seller
                  </h3>
                  <div className={styles.contactActions}>
                    <button 
                      className={styles.modalEmailButton}
                      onClick={() => handleContactSeller(selectedListing)}
                    >
                      <span className="material-symbols-outlined">email</span>
                      <div>
                        <strong>Send Email</strong>
                        <p>{selectedListing.contactEmail}</p>
                      </div>
                    </button>
                    {selectedListing.phone && (
                      <button 
                        className={styles.modalCallButton}
                        onClick={() => handleCallSeller(selectedListing.phone)}
                      >
                        <span className="material-symbols-outlined">call</span>
                        <div>
                          <strong>Call Seller</strong>
                          <p>{selectedListing.phone}</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BuyerDashboard;