import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const getSkeletonClass = () => {
    switch (type) {
      case 'card':
        return 'card animate-pulse bg-white/10 border border-white/5 rounded-2xl p-6';
      case 'text':
        return 'h-4 bg-white/10 rounded-full';
      case 'avatar':
        return 'w-12 h-12 bg-white/10 rounded-full';
      case 'button':
        return 'h-10 bg-white/10 rounded-lg';
      case 'image':
        return 'w-full h-48 bg-white/10 rounded-xl';
      default:
        return 'bg-white/10 rounded-lg';
    }
  };

  const renderSkeleton = (key) => {
    switch (type) {
      case 'card':
        return (
          <div key={key} className={getSkeletonClass()}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/20 rounded-full w-3/4"></div>
                <div className="h-3 bg-white/15 rounded-full w-1/2"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-white/15 rounded-full"></div>
              <div className="h-3 bg-white/15 rounded-full w-5/6"></div>
              <div className="h-3 bg-white/15 rounded-full w-4/6"></div>
            </div>
            <div className="flex justify-between mt-6">
              <div className="h-8 bg-white/20 rounded-lg w-24"></div>
              <div className="h-8 bg-white/20 rounded-lg w-32"></div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div key={key} className="space-y-2">
            <div className={getSkeletonClass()}></div>
            <div className={`${getSkeletonClass()} w-5/6`}></div>
            <div className={`${getSkeletonClass()} w-4/6`}></div>
          </div>
        );
      
      case 'worker-card':
        return (
          <div key={key} className="card animate-pulse bg-white/10 border border-white/5 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-7 bg-white/20 rounded-full w-32"></div>
              <div className="h-6 bg-white/20 rounded-full w-16"></div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-white/15 rounded-full w-24"></div>
                <div className="h-4 bg-white/15 rounded-full w-20"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-white/15 rounded-full w-20"></div>
                <div className="h-4 bg-white/15 rounded-full w-12"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-white/15 rounded-full w-24"></div>
                <div className="h-4 bg-white/15 rounded-full w-12"></div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="h-10 bg-white/20 rounded-lg"></div>
            </div>
          </div>
        );
      
      default:
        return <div key={key} className={getSkeletonClass()}></div>;
    }
  };

  return (
    <div className={`skeleton-loader ${type === 'card' || type === 'worker-card' ? 'space-y-4' : ''}`}>
      {skeletons.map(renderSkeleton)}
    </div>
  );
};

export default SkeletonLoader;
