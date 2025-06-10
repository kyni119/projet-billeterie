import React from 'react';
import ContentLoader from 'react-content-loader';

const EventCardSkeleton = () => (
  <div className="rounded-lg overflow-hidden shadow-md w-full aspect-video bg-white">
    <ContentLoader 
      speed={2}
      width="100%"
      height="100%"
      viewBox="0 0 400 250"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      className="w-full h-full"
    >
      {/* Image section */}
      <rect x="0" y="0" rx="0" ry="0" width="400" height="180" />
      
      {/* Title */}
      <rect x="10" y="190" rx="4" ry="4" width="280" height="15" />
      {/* Metadata */}
      <rect x="10" y="210" rx="3" ry="3" width="140" height="12" />
      <rect x="160" y="210" rx="3" ry="3" width="90" height="12" />
      <rect x="260" y="210" rx="3" ry="3" width="80" height="12" />
    </ContentLoader>
  </div>
);

export default EventCardSkeleton;
