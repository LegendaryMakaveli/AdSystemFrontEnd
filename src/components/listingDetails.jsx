import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useGetListingByIdQuery, useDeleteListingMutation } from '../apis/listingApi';
import style from '../styles/listingDetails.module.css';

const ViewListing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const { data: listing, isLoading, isError, error } = useGetListingByIdQuery(id);
    
    const [deleteListing, { isLoading: isDeleting }] = useDeleteListingMutation();

     const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this listing?")) {
            return;
        }
        
        const editToken = listing?.editToken;
        
        if (!editToken) {
            alert("Cannot delete: Edit token not found. You may not have permission to delete this listing.");
            return;
        }
        
        try {
            await deleteListing({ id: listing.id, token: editToken }).unwrap();
            alert("Listing deleted successfully!");
            navigate('/dashboard');
        } catch (error) {
            console.error("Delete error:", error);
            const errorMessage = error?.data?.message || error?.data?.data || error?.message || "Unknown error";
            alert(`Failed to delete: ${errorMessage}`);
        }
    };

    const handleEdit = () => {
        navigate(`/updateListing/${listing.id}`, { 
            state: { listing } 
        });
    };

    const nextImage = () => {
        if (listing?.images && listing.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
        }
    };

    const prevImage = () => {
        if (listing?.images && listing.images.length > 0) {
            setCurrentImageIndex((prev) => 
                prev === 0 ? listing.images.length - 1 : prev - 1
            );
        }
    };

    if (isLoading) {
        return (
            <div className={style.container}>
                <div className={style.loading}>
                    <div className={style.spinner}></div>
                    <p>Loading listing details...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={style.container}>
                <div className={style.error}>
                    <span className="material-symbols-outlined">error</span>
                    <p>Failed to load listing. {error?.data?.message || "Please try again."}</p>
                    <button onClick={() => navigate('/dashboard')} className={style.backButton}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className={style.container}>
                <div className={style.error}>
                    <span className="material-symbols-outlined">info</span>
                    <p>Listing not found.</p>
                    <button onClick={() => navigate('/dashboard')} className={style.backButton}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={style.container}>
            <div className={style.header}>
                <button onClick={() => navigate('/dashboard')} className={style.backButton}>
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Dashboard
                </button>
                
                <div className={style.headerActions}>
                    <button onClick={handleEdit} className={style.editBtn}>
                        <span className="material-symbols-outlined">edit</span>
                        Edit Listing
                    </button>
                    <button 
                        onClick={handleDelete} 
                        className={style.deleteBtn}
                        disabled={isDeleting}
                    >
                        <span className="material-symbols-outlined">delete</span>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            <div className={style.content}>
                {listing.images && listing.images.length > 0 && (
                    <div className={style.imageGallery}>
                        <div className={style.mainImage}>
                            <img 
                                src={listing.images[currentImageIndex]} 
                                alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                            />
                            
                            {listing.images.length > 1 && (
                                <>
                                    <button 
                                        onClick={prevImage} 
                                        className={`${style.navButton} ${style.prevButton}`}
                                    >
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button 
                                        onClick={nextImage} 
                                        className={`${style.navButton} ${style.nextButton}`}
                                    >
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </>
                            )}
                            
                            <div className={style.imageCounter}>
                                {currentImageIndex + 1} / {listing.images.length}
                            </div>
                        </div>
                        
                        {listing.images.length > 1 && (
                            <div className={style.thumbnails}>
                                {listing.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`${style.thumbnail} ${
                                            index === currentImageIndex ? style.activeThumbnail : ''
                                        }`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    >
                                        <img src={image} alt={`Thumbnail ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className={style.infoSection}>
                    <div className={style.titleSection}>
                        <h1>{listing.title}</h1>
                        <span className={style.category}>{listing.category}</span>
                    </div>

                    <div className={style.priceSection}>
                        <span className={style.priceLabel}>Price</span>
                        <span className={style.price}>${listing.price?.toLocaleString()}</span>
                    </div>

                    <div className={style.metaInfo}>
                        <div className={style.metaItem}>
                            <span className="material-symbols-outlined">location_on</span>
                            <span>{listing.location}</span>
                        </div>
                        
                        {listing.createdAt && (
                            <div className={style.metaItem}>
                                <span className="material-symbols-outlined">calendar_today</span>
                                <span>Posted: {new Date(listing.createdAt).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>

                    <div className={style.descriptionSection}>
                        <h2>Description</h2>
                        <p>{listing.description}</p>
                    </div>

                    {(listing.phone || listing.email) && (
                        <div className={style.contactSection}>
                            <h2>Contact Seller</h2>
                            <div className={style.contactButtons}>
                                {listing.phone && (
                                    <a href={`tel:${listing.phone}`} className={style.contactButton}>
                                        <span className="material-symbols-outlined">call</span>
                                        Call Seller
                                    </a>
                                )}
                                {listing.email && (
                                    <a href={`mailto:${listing.email}`} className={style.contactButton}>
                                        <span className="material-symbols-outlined">email</span>
                                        Email Seller
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewListing;