import React, { useEffect, useRef } from 'react';
import '../styles/LocationModal.css';

const LocationModal = ({ location, onClose }) => {
  const modalRef = useRef(null);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Prevent scrolling of background content when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeVideoId = getYoutubeVideoId(location.trailerUrl);

  if (!location) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>{location.title}</h2>
          <div className="modal-meta">
            <span className="modal-year">{location.year}</span>
            <span className="modal-type">{location.type}</span>
          </div>
        </div>
        
        <div className="modal-content">
          {youtubeVideoId && (
            <div className="modal-trailer">
              <iframe 
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title={`${location.title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
          
          <div className="modal-details">
            <p><strong>Location:</strong> {location.locationName}</p>
            <p><strong>Coordinates:</strong> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
            
            {location.imdbLink && (
              <div className="modal-links">
                <a href={location.imdbLink} target="_blank" rel="noopener noreferrer" className="imdb-link">
                  View on IMDb
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;