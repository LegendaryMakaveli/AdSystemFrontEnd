import { useState, useEffect} from 'react';
import { useParams, useNavigate} from 'react-router';
import { useGetListingByIdQuery, useUpdateListingMutation } from '../apis/listingApi';
import style from '../styles/updateListing.module.css';

const UpdateListing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const { data: listing, isLoading, isError } = useGetListingByIdQuery(id);
    
    const [updateListing, { isLoading: isUpdating }] = useUpdateListingMutation();
    
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        price: '',
    });
    
    const [errors, setErrors] = useState({});

    const categories = [
        'Electronics',
        'Furniture',
        'Vehicles',
        'Real Estate',
        'Jobs',
        'Services',
        'Fashion',
        'Sports',
        'Books',
        'Other'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    useEffect(() => {
        setFormData({
            title: '',
            category: '',
            description: '',
            price: '',
        });
    }, [id]);

    useEffect(() => {
        if (listing && listing.id === id) { 
            console.log('Listing ID:', listing.id);
            console.log('Edit Token:', listing.editToken);
            
            setFormData({
                title: listing.title || '',
                category: listing.category || '',
                description: listing.description || '',
                price: listing.price || ''
            });
        }
    }, [listing, id]);

    const validate = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }
        
        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }
        
        if (!formData.price) {
            newErrors.price = 'Price is required';
        } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Price must be a valid positive number';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }
        
        try {
            const editToken = listing?.editToken;
            console.log('Edit Token from formData:', editToken);

            if (!editToken) {
                alert('Edit token not found. You may not have permission to edit this listing.');
                return;
            }

            const updateData = {
                title: formData.title.trim(),
                category: formData.category.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price)
            };
            
            console.log('Sending update with token:', editToken);

            await updateListing({ 
                id, 
                token: editToken, 
                data: updateData 
            }).unwrap();
            
            alert('Listing updated successfully!');
            navigate(`/listing/${id}`);
        } catch (error) {
            console.error('Failed to update listing:', error);
            alert(`Failed to update listing: ${error.data?.message || error.message || 'Unknown error'}`);
        }
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            navigate('/dashboard');
        }
    };

    if (isLoading) {
        return (
            <div className={style.container}>
                <div className={style.loading}>
                    <div className={style.spinner}></div>
                    <p>Loading listing...</p>
                </div>
            </div>
        );
    }

    if (isError || !listing) {
        return (
            <div className={style.container}>
                <div className={style.error}>
                    <span className="material-symbols-outlined">error</span>
                    <p>Failed to load listing data.</p>
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
                <h1>Edit Listing</h1>
            </div>

            <div className={style.formContainer}>
                <form onSubmit={handleSubmit} className={style.form}>
                    {/* Title */}
                    <div className={style.formGroup}>
                        <label htmlFor="title">
                            <span className="material-symbols-outlined">title</span>
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter listing title"
                            className={errors.title ? style.inputError : ''}
                        />
                        {errors.title && (
                            <span className={style.errorMessage}>{errors.title}</span>
                        )}
                    </div>

                   
                    <div className={style.formGroup}>
                        <label htmlFor="category">
                            <span className="material-symbols-outlined">category</span>
                            Category *
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={errors.category ? style.inputError : ''}
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <span className={style.errorMessage}>{errors.category}</span>
                        )}
                    </div>

                    
                    <div className={style.formGroup}>
                        <label htmlFor="price">
                            <span className="material-symbols-outlined">payments</span>
                            Price ($) *
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Enter price"
                            step="0.01"
                            min="0"
                            className={errors.price ? style.inputError : ''}
                        />
                        {errors.price && (
                            <span className={style.errorMessage}>{errors.price}</span>
                        )}
                    </div>

                    
                    <div className={style.formGroup}>
                        <label htmlFor="description">
                            <span className="material-symbols-outlined">description</span>
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your listing in detail"
                            rows="6"
                            className={errors.description ? style.inputError : ''}
                        />
                        {errors.description && (
                            <span className={style.errorMessage}>{errors.description}</span>
                        )}
                        <span className={style.charCount}>
                            {formData.description.length} characters
                        </span>
                    </div>

                
                    <div className={style.actions}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={style.cancelButton}
                            disabled={isUpdating}
                        >
                            <span className="material-symbols-outlined">close</span>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={style.submitButton}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <>
                                    <div className={style.buttonSpinner}></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">save</span>
                                    Update Listing
                                </>
                            )}
                        </button>
                    </div>
                </form>

            
                <div className={style.infoPanel}>
                    <div className={style.infoPanelHeader}>
                        <span className="material-symbols-outlined">info</span>
                        <h3>Update Information</h3>
                    </div>
                    <div className={style.infoPanelContent}>
                        <p>You can update the following fields:</p>
                        <ul>
                            <li><strong>Title:</strong> The name of your listing</li>
                            <li><strong>Category:</strong> The category this listing belongs to</li>
                            <li><strong>Price:</strong> The price in dollars</li>
                            <li><strong>Description:</strong> Detailed information about your listing</li>
                        </ul>
                        <div className={style.note}>
                            <span className="material-symbols-outlined">warning</span>
                            <p>Note: Location and images cannot be updated. Contact support if you need to change these.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateListing;