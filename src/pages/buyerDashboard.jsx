import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useGetAllQuery } from '../apis/listingApi';
import styles from '../styles/buyerDashboard.module.css';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { data: allListings, isLoading, isError, error } = useGetAllQuery();
  const [selectedListing, setSelectedListing] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
    setIsMobileMenuOpen(false);
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
    <div className={styles.marketplaceContainer}>
      {isMobileMenuOpen && (
        <div 
          className={styles.mobileMenuOverlay} 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>

        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Makaveli Listing Service</h2>
        </div>

        <div className={styles.sidebarSection}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search Marketplace..."
            value={filters.searchText}
            onChange={(e) => handleFilterChange("searchText", e.target.value)}
          />
        </div>

        <div className={styles.sidebarSection}>
          <button 
            className={styles.sellButton}
            onClick={() => navigate("/dashboard")}
          >
            <span className="material-symbols-outlined">add_circle</span>
            Sell Something
          </button>
        </div>

        <div className={styles.sidebarSection}>
          <h3 className={styles.sectionTitle}>Filters</h3>
          
          <div className={styles.filterGroup}>
            <label>
              <span className="material-symbols-outlined">location_on</span>
              Location
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {(filters.location || filters.searchText) && (
            <button className={styles.clearFiltersButton} onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        <div className={styles.sidebarSection}>
          <h3 className={styles.sectionTitle}>Categories</h3>
          <div className={styles.categoryList}>
            <button
              className={`${styles.categoryItem} ${!filters.category ? styles.active : ''}`}
              onClick={() => handleFilterChange("category", "")}
            >
              <span className="material-symbols-outlined">grid_view</span>
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.categoryItem} ${filters.category === cat ? styles.active : ''}`}
                onClick={() => handleFilterChange("category", cat)}
              >
                <span className="material-symbols-outlined">category</span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sidebarSection}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>
      </aside>

    
      <main className={styles.mainContent}>
        
        <button 
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className={styles.contentHeader}>
          <div>
            <h1 className={styles.contentTitle}>
              {filters.category || "Today's picks"}
            </h1>
            <p className={styles.resultsCount}>
              {filteredListings.length} item{filteredListings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

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
              <div 
                key={listing.id} 
                className={styles.listingCard}
                onClick={() => handleViewDetails(listing)}
              >
                <div className={styles.imageWrapper}>
                  {listing.images && listing.images.length > 0 ? (
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className={styles.listingImage}
                    />
                  ) : (
                    <div className={styles.noImage}>
                      <span className="material-symbols-outlined">image</span>
                    </div>
                  )}
                  {listing.images && listing.images.length > 1 && (
                    <span className={styles.imageCount}>
                      <span className="material-symbols-outlined">photo_library</span>
                      {listing.images.length}
                    </span>
                  )}
                </div>
                
                <div className={styles.cardInfo}>
                  <div className={styles.cardPrice}>₦{listing.price?.toLocaleString()}</div>
                  <div className={styles.cardTitle}>{listing.title}</div>
                  <div className={styles.cardLocation}>
                    <span className="material-symbols-outlined">location_on</span>
                    {listing.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>


      {selectedListing && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
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
                  <span className={styles.priceAmount}>₦{selectedListing.price?.toLocaleString()}</span>
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
    </div>
  );
};

export default BuyerDashboard;