import React from 'react';

const Pagination = ({ 
    currentPage, 
    lastPage, 
    onPageChange, 
    showingFrom = null, 
    showingTo = null, 
    total = null 
}) => {
    if (lastPage <= 1) return null;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= lastPage) {
            onPageChange(page);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    السابق
                </button>
                
                <div className="flex items-center gap-1">
                    {/* Show page numbers */}
                    {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                        const page = Math.max(1, Math.min(
                            currentPage - 2 + i,
                            lastPage - 4 + i
                        ));
                        
                        if (page <= lastPage) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-md ${
                                        page === currentPage
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        }
                        return null;
                    })}
                </div>
                
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    التالي
                </button>
            </div>
            
            <div className="text-sm text-gray-600">
                {showingFrom && showingTo && total ? (
                    `عرض ${showingFrom} إلى ${showingTo} من ${total} عنصر`
                ) : (
                    `الصفحة ${currentPage} من ${lastPage}`
                )}
            </div>
        </div>
    );
};

export default Pagination;
