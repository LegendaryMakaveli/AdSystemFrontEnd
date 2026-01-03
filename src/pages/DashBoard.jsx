import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useGetAllQuery} from "../apis/listingApi";
import style from "../styles/DashBoard.module.css";


const DashBoard = () => {
    const navigate = useNavigate();
    const { data: allListings, isLoading, error, isError } = useGetAllQuery();
    
    const loggedInUserId = localStorage.getItem("userId");

    const [filters, setFilters] = useState({
        category: "",
        location: "",
        searchText: ""
    });

    const userActiveListings = useMemo(() => {
        if (!allListings || !Array.isArray(allListings)) return [];
        return allListings.filter(listing => {
            const isUserListing = listing.userId === loggedInUserId;
            const isActive = listing.status === "ACTIVE" || listing.status === "active";
            
            return isUserListing && isActive;
        });
    }, [allListings, loggedInUserId]);

    const { categories, locations } = useMemo(() => {
        if (!userActiveListings || userActiveListings.length === 0) return { categories: [], locations: [] };
        
        const cats = [...new Set(userActiveListings.map(l => l.category).filter(Boolean))];
        const locs = [...new Set(userActiveListings.map(l => l.location).filter(Boolean))];
        
        return {
            categories: cats.sort(),
            locations: locs.sort()
        };
    }, [userActiveListings]);

    const filteredListings = useMemo(() => {
        if (!userActiveListings || userActiveListings.length === 0) return [];
        
        return userActiveListings.filter(listing => {
            const matchesCategory = !filters.category || listing.category === filters.category;
            const matchesLocation = !filters.location || listing.location === filters.location;
            const matchesSearch = !filters.searchText || 
                listing.title?.toLowerCase().includes(filters.searchText.toLowerCase()) ||
                listing.description?.toLowerCase().includes(filters.searchText.toLowerCase());
            
            return matchesCategory && matchesLocation && matchesSearch;
        });
    }, [userActiveListings, filters]);


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

    return (
        <>
            <div className={style.createButtonBigConatiner}>
                <div className={style.createButtonContainer}>
                    <button className={style.createButton} onClick={() => navigate("/createListing")}>
                        <span className="material-symbols-outlined">add</span>
                        Create New Listing
                    </button>
                </div>
                <div className={style.createButtonContainer}>
                    <button className={style.createButton} onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
                <div className={style.createButtonContainer}>
                    <Link to={"/buyerDashboard"}>
                        <span className={style.createButton}>🔙</span>
                    </Link>
                </div>
            </div>

            <div className={style.filtersContainer}>
                <div className={style.filtersHeader}>
                    <h3>My Active Listings</h3>
                    {(filters.category || filters.location || filters.searchText) && (
                        <button className={style.clearButton} onClick={clearFilters}>
                            Clear Filters
                        </button>
                    )}
                </div>
                
                <div className={style.filtersGrid}>
                    <div className={style.filterGroup}>
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

                    <div className={style.filterGroup}>
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

                    <div className={style.filterGroup}>
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

                <div className={style.resultsCount}>
                    Showing {filteredListings.length} of {userActiveListings.length} active listing{filteredListings.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className={style.listingsContainer}>
                <h2 className={style.sectionTitle}>All Listings</h2>
                
                {isLoading && (
                    <div className={style.loading}>
                        <div className={style.spinner}></div>
                        <p>Loading listings...</p>
                    </div>
                )}
                
                {isError && (
                    <div className={style.error}>
                        <span className="material-symbols-outlined">error</span>
                        <p>Failed to load listings. {error?.data?.data || error?.data?.message || "Please try again."}</p>
                    </div>
                )}
                
                {!isLoading && !isError && filteredListings.length === 0 && (
                    <div className={style.emptyState}>
                        <span className="material-symbols-outlined">inbox</span>
                        <p>
                            {userActiveListings.length === 0
                                ? "No active listings yet. Create your first listing!"
                                : "No listings match your filters. Try adjusting your search."}
                        </p>
                    </div>
                )}
                
                {!isLoading && !isError && filteredListings.length > 0 && (
                    <div className={style.listingsGrid}>
                        {filteredListings.map((listing) => (
                            <div key={listing.id} className={style.listingCard}>
                                {listing.images && listing.images.length > 0 && (
                                    <div className={style.imageContainer}>
                                        <img 
                                            src={listing.images[0]} 
                                            alt={listing.title}
                                            className={style.listingImage}
                                        />
                                    </div>
                                )}
                                
                                <div className={style.cardContent}>
                                    <div className={style.listingHeader}>
                                        <h3>{listing.title}</h3>
                                        <span className={style.category}>
                                            {listing.category}
                                        </span>
                                    </div>
                                    
                                    <p className={style.description}>
                                        {listing.description?.substring(0, 120)}
                                        {listing.description?.length > 120 ? '...' : ''}
                                    </p>
                                    
                                    <div className={style.listingDetails}>
                                        <div className={style.price}>
                                            <span className={style.priceLabel}>Price:</span>
                                            <span className={style.priceAmount}>${listing.price?.toLocaleString()}</span>
                                        </div>
                                        <div className={style.location}>
                                            <span className="material-symbols-outlined">location_on</span>
                                            <span>{listing.location}</span>
                                        </div>
                                    </div>
                                    
                                    <div className={style.listingActions}>
                                        <button 
                                            className={`${style.actionButton} ${style.viewButton}`}
                                            onClick={() => navigate(`/listing/${listing.id}`)}
                                            title="View Details"
                                        >
                                            <span className="material-symbols-outlined">visibility</span>
                                            <span>View</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default DashBoard;