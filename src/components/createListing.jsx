import { useState } from "react";
import { useNavigate } from "react-router";
import { useCreateListingMutation, useAddImageMutation } from "../apis/listingApi";
import style from "../styles/CreateListing.module.css";

const CreateListing = () => {
    const navigate = useNavigate();
    const [createListing, { isLoading }] = useCreateListingMutation();
    const [addImage] = useAddImageMutation();
    
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        location: "",
        contactEmail: "",
        contactPhone: "",
        status: "ACTIVE"
    });
    
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const categories = [
        "Electronics",
        "Furniture",
        "Vehicles",
        "Real Estate",
        "Jobs",
        "Services",
        "Fashion",
        "Other"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        
        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 5 * 1024 * 1024;
            
            if (!isValidType) {
                alert(`${file.name} is not an image file`);
                return false;
            }
            if (!isValidSize) {
                alert(`${file.name} is too large. Maximum size is 5MB`);
                return false;
            }
            return true;
        });
        
        if (validFiles.length + selectedFiles.length > 5) {
            alert("You can only upload up to 5 images");
            return;
        }
        
        setSelectedFiles(prev => [...prev, ...validFiles]);
        
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.title.trim()) {
            errors.title = "Title is required";
        }
        
        if (!formData.description.trim()) {
            errors.description = "Description is required";
        }
        
        if (!formData.price) {
            errors.price = "Price is required";
        } else if (isNaN(formData.price) || Number(formData.price) < 0) {
            errors.price = "Price must be a valid number";
        }
        
        if (!formData.category) {
            errors.category = "Category is required";
        }
        
        if (!formData.location.trim()) {
            errors.location = "Location is required";
        }
        
        if (!formData.contactEmail.trim()) {
            errors.contactEmail = "Contact email is required";
        }
        
        return errors;
    };

    const uploadImages = async (listingId, editToken) => {
        // FIXED: Check if there are NO files, return early
        if (selectedFiles.length === 0) {
            console.log("No images to upload");
            return true;
        }
        
        setUploadingImages(true);
        
        try {
            console.log(`Starting upload of ${selectedFiles.length} images...`);
            
            for (let index = 0; index < selectedFiles.length; index++) {
                const file = selectedFiles[index];
                console.log(`Uploading image ${index + 1}/${selectedFiles.length}:`, file.name, "Size:", file.size);
                console.log("Listing ID:", listingId);
                console.log("Edit Token:", editToken);

                const result = await addImage({
                    id: listingId,
                    token: editToken,
                    file: file
                }).unwrap();

                console.log(`Image ${index + 1} uploaded successfully:`, result);
            }
            
            console.log("All images uploaded successfully!");
            return true;
            
        } catch (error) {
            console.error("Failed to upload images:", error);
            console.error("Error details:", {
                message: error.message,
                data: error.data,
                status: error.status
            });
            alert("Listing created but some images failed to upload. You can add them later by editing the listing.");
            return false;
        } finally {
            setUploadingImages(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const listingData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                location: formData.location,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone || "",
                status: formData.status
            };

            console.log("Creating listing with data:", listingData);
            const result = await createListing(listingData).unwrap();
            console.log("Full API Response:", result);
            
            let listing = null;
            let editToken = null;
            let listingId = null;
            
            if (result?.data) {
                const payload = result.data;
                listing = Array.isArray(payload) ? payload[0] : payload;
            } else if (Array.isArray(result)) {
                listing = result[0];
            } else {
                listing = result;
            }
            
            if (!listing) {
                throw new Error("No listing data returned from API");
            }
            
            listingId = listing.id || listing.listingId || listing._id;
            editToken = listing.editToken || listing.token || listing.edit_token;

            if (!listingId) {
                throw new Error("Listing ID not found in response");
            }
            
            if (!editToken) {
                console.warn("Edit token not found in response");
            }
            
            if (editToken) {
                localStorage.setItem("editToken", editToken);
                console.log("Saved editToken to localStorage:", editToken);
            }
            
            if (listing.userId) {
                localStorage.setItem("userId", listing.userId);
                console.log("Saved userId to localStorage:", listing.userId);
            }
            
            localStorage.setItem("listingId", listingId);
            console.log("Saved listingId to localStorage:", listingId);
            
            // Upload images if there are any
            if (selectedFiles.length > 0 && editToken) {
                console.log("Starting image upload process...");
                await uploadImages(listingId, editToken);
            } else if (selectedFiles.length > 0 && !editToken) {
                console.warn("Cannot upload images: No edit token available");
                alert("Listing created but images cannot be uploaded without edit token.");
            }
            
            alert("Listing created successfully!");
            navigate("/buyerDashboard");
            
        } catch (err) {
            console.error("Failed to create listing:", err);
            console.error("Error details:", err);
            
            let errorMessage = "Failed to create listing. Please try again.";
            
            if (err?.data?.message) {
                errorMessage = err.data.message;
            } else if (err?.data?.error) {
                errorMessage = err.data.error;
            } else if (err?.data) {
                errorMessage = typeof err.data === 'string' ? err.data : JSON.stringify(err.data);
            } else if (err?.message) {
                errorMessage = err.message;
            } else if (err?.error) {
                errorMessage = err.error;
            }
            
            setFormErrors({ 
                submit: errorMessage
            });
        }
    };

    return (
        <div className={style.container}>
            <div className={style.formCard}>
                <button
                    onClick={() => navigate("/buyerDashboard")}
                    className={style.backButton}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Marketplace
                </button>
                
                <h1 className={style.title}>Create a Listing</h1>
                <p className={style.subtitle}>Fill in the details below to create your listing</p>

                <form className={style.formContainer} onSubmit={handleSubmit}>
                    {formErrors.submit && (
                        <div className={style.errorMessage}>
                            <span className="material-symbols-outlined">error</span>
                            {formErrors.submit}
                        </div>
                    )}

                    {/* Image Upload Section */}
                    <div className={style.imageUploadSection}>
                        <label className={style.sectionLabel}>
                            <span className="material-symbols-outlined">photo_camera</span>
                            Photos (Optional - Max 5)
                        </label>
                        
                        <div className={style.imageUploadArea}>
                            {imagePreviews.length === 0 ? (
                                <label htmlFor="imageUpload" className={style.uploadPlaceholder}>
                                    <span className="material-symbols-outlined">add_photo_alternate</span>
                                    <p>Click to upload images</p>
                                    <span className={style.uploadHint}>JPG, PNG, GIF up to 5MB each</span>
                                </label>
                            ) : (
                                <div className={style.previewGrid}>
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className={style.imagePreview}>
                                            <img src={preview} alt={`Preview ${index + 1}`} />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className={style.removeImageBtn}
                                            >
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {imagePreviews.length < 5 && (
                                        <label htmlFor="imageUpload" className={style.addMoreBtn}>
                                            <span className="material-symbols-outlined">add</span>
                                            <p>Add More</p>
                                        </label>
                                    )}
                                </div>
                            )}
                            
                            <input
                                type="file"
                                id="imageUpload"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                className={style.hiddenInput}
                            />
                        </div>
                        
                        {selectedFiles.length > 0 && (
                            <p className={style.imageCount}>
                                {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} selected
                            </p>
                        )}
                    </div>

                    <div className={style.labelInput}>
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
                            placeholder="e.g., iPhone 13 Pro Max"
                        />
                        {formErrors.title && (
                            <span className={style.error}>{formErrors.title}</span>
                        )}
                    </div>

                    <div className={style.labelInput}>
                        <label htmlFor="description">
                            <span className="material-symbols-outlined">description</span>
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Describe your item in detail..."
                        />
                        {formErrors.description && (
                            <span className={style.error}>{formErrors.description}</span>
                        )}
                    </div>

                    <div className={style.gridTwo}>
                        <div className={style.labelInput}>
                            <label htmlFor="price">
                                <span className="material-symbols-outlined">payments</span>
                                Price (₦) *
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                            {formErrors.price && (
                                <span className={style.error}>{formErrors.price}</span>
                            )}
                        </div>

                        <div className={style.labelInput}>
                            <label htmlFor="category">
                                <span className="material-symbols-outlined">category</span>
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            {formErrors.category && (
                                <span className={style.error}>{formErrors.category}</span>
                            )}
                        </div>
                    </div>

                    <div className={style.labelInput}>
                        <label htmlFor="location">
                            <span className="material-symbols-outlined">location_on</span>
                            Location *
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., Lagos, Nigeria"
                        />
                        {formErrors.location && (
                            <span className={style.error}>{formErrors.location}</span>
                        )}
                    </div>

                    <div className={style.gridTwo}>
                        <div className={style.labelInput}>
                            <label htmlFor="contactEmail">
                                <span className="material-symbols-outlined">email</span>
                                Contact Email *
                            </label>
                            <input
                                type="email"
                                id="contactEmail"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                placeholder="your@email.com"
                            />
                            {formErrors.contactEmail && (
                                <span className={style.error}>{formErrors.contactEmail}</span>
                            )}
                        </div>

                        <div className={style.labelInput}>
                            <label htmlFor="contactPhone">
                                <span className="material-symbols-outlined">phone</span>
                                Contact Phone
                            </label>
                            <input
                                type="tel"
                                id="contactPhone"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                placeholder="+234 123 456 7890"
                            />
                        </div>
                    </div>

                    <div className={style.buttonGroup}>
                        <button
                            type="submit"
                            className={style.submitButton}
                            disabled={isLoading || uploadingImages}
                        >
                            {isLoading ? (
                                <>
                                    <div className={style.buttonSpinner}></div>
                                    Creating...
                                </>
                            ) : uploadingImages ? (
                                <>
                                    <div className={style.buttonSpinner}></div>
                                    Uploading Images...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Create Listing
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/buyerDashboard")}
                            className={style.cancelButton}
                            disabled={isLoading || uploadingImages}
                        >
                            <span className="material-symbols-outlined">close</span>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateListing;