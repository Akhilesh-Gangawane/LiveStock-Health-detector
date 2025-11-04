import React, { useState, useRef, useEffect } from 'react';

/**
 * SchemeFilter Component
 * 
 * A professional filter component with search, category filters, sort options,
 * and advanced filtering capabilities. Features a clean, accessible design.
 * 
 * @param {Object} props - Component props
 * @param {function} props.onFilter - Filter callback function
 * @param {function} props.onSort - Sort callback function
 * @param {function} props.onCategoryChange - Category filter callback
 * @param {Array} props.categories - Available categories for filtering
 * @param {Array} props.sortOptions - Available sort options
 * @param {string} props.placeholder - Search input placeholder
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showAdvanced - Whether to show advanced filters
 * @param {Object} props.initialFilters - Initial filter values
 * @param {string} props.size - Component size ('sm', 'md', 'lg')
 */

export default function SchemeFilter({
  onFilter,
  onSort,
  onCategoryChange,
  categories = [],
  sortOptions = [
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'date_newest', label: 'Date (Newest)' },
    { value: 'date_oldest', label: 'Date (Oldest)' },
    { value: 'relevance', label: 'Relevance' }
  ],
  placeholder = "Search schemes...",
  className = "",
  showAdvanced = false,
  initialFilters = {},
  size = 'md'
}) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'all');
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'relevance');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: initialFilters.status || 'all',
    dateRange: initialFilters.dateRange || 'all',
    type: initialFilters.type || 'all'
  });

  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  // Size configurations
  const sizeConfig = {
    sm: {
      input: 'px-3 py-1.5 text-sm',
      button: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4'
    },
    md: {
      input: 'px-4 py-2 text-sm',
      button: 'px-4 py-2 text-sm',
      icon: 'w-5 h-5'
    },
    lg: {
      input: 'px-4 py-3 text-base',
      button: 'px-4 py-2.5 text-base',
      icon: 'w-5 h-5'
    }
  };

  // Debounced search execution
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const filterData = {
        search: searchTerm,
        category: selectedCategory,
        sortBy,
        ...filters
      };

      onFilter?.(filterData);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, selectedCategory, sortBy, filters, onFilter]);

  // Handle sort changes
  useEffect(() => {
    onSort?.(sortBy);
  }, [sortBy, onSort]);

  // Handle category changes
  useEffect(() => {
    onCategoryChange?.(selectedCategory);
  }, [selectedCategory, onCategoryChange]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('relevance');
    setFilters({
      status: 'all',
      dateRange: 'all',
      type: 'all'
    });
    setIsAdvancedOpen(false);
    searchInputRef.current?.focus();
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || sortBy !== 'relevance' ||
    filters.status !== 'all' || filters.dateRange !== 'all' || filters.type !== 'all';

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Main Filter Bar */}
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className={`${sizeConfig[size].icon} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={placeholder}
                className={`
                  block w-full pl-10 pr-4 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  placeholder-gray-500 transition-colors duration-200
                  ${sizeConfig[size].input}
                `}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className={`${sizeConfig[size].icon} text-gray-400 hover:text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={`
                  w-full lg:w-auto border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-colors duration-200
                  ${sizeConfig[size].input}
                `}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Options */}
          <div className="flex-shrink-0">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className={`
                w-full lg:w-auto border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors duration-200
                ${sizeConfig[size].input}
              `}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          {showAdvanced && (
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`
                flex items-center space-x-2 border border-gray-300 rounded-lg
                hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all duration-200
                ${sizeConfig[size].button}
              `}
            >
              <svg className={`${sizeConfig[size].icon} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className={`
                flex items-center space-x-2 text-gray-600 hover:text-gray-800
                transition-colors duration-200 whitespace-nowrap
                ${sizeConfig[size].button}
              `}
            >
              <svg className={`${sizeConfig[size].icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && isAdvancedOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in-50 slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={`
                    w-full border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition-colors duration-200
                    ${sizeConfig[size].input}
                  `}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="expired">Expired</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className={`
                    w-full border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition-colors duration-200
                    ${sizeConfig[size].input}
                  `}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheme Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className={`
                    w-full border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition-colors duration-200
                    ${sizeConfig[size].input}
                  `}
                >
                  <option value="all">All Types</option>
                  <option value="government">Government</option>
                  <option value="private">Private</option>
                  <option value="ngo">NGO</option>
                  <option value="international">International</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Category: {categories.find(c => c.value === selectedCategory)?.label || selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="ml-1 hover:text-green-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Status: {filters.status}
                    <button
                      onClick={() => handleFilterChange('status', 'all')}
                      className="ml-1 hover:text-purple-600"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * SchemeFilterSkeleton Component
 * Loading state for scheme filter
 */
export function SchemeFilterSkeleton({ size = 'md', showAdvanced = false }) {
  const sizeConfig = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className={`bg-gray-200 rounded-lg ${sizeConfig[size]}`}></div>
        </div>
        <div className="w-32">
          <div className={`bg-gray-200 rounded-lg ${sizeConfig[size]}`}></div>
        </div>
        <div className="w-40">
          <div className={`bg-gray-200 rounded-lg ${sizeConfig[size]}`}></div>
        </div>
        {showAdvanced && (
          <div className="w-24">
            <div className={`bg-gray-200 rounded-lg ${sizeConfig[size]}`}></div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Demo Component
 * Shows example usage with different configurations
 */
export function SchemeFilterDemo() {
  const categories = [
    { value: 'health', label: 'Health Schemes' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'subsidy', label: 'Subsidies' },
    { value: 'loan', label: 'Loan Schemes' },
    { value: 'training', label: 'Training Programs' }
  ];

  const handleFilter = (filters) => {
    console.log('Applied filters:', filters);
  };

  const handleSort = (sortBy) => {
    console.log('Sort by:', sortBy);
  };

  const handleCategoryChange = (category) => {
    console.log('Category changed:', category);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Scheme Filter Examples
          </h1>
          <p className="text-lg text-gray-600">
            Professional filtering component with multiple configurations
          </p>
        </div>

        {/* Basic Filter */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Filter</h3>
          <SchemeFilter onFilter={handleFilter} />
        </div>

        {/* With Categories */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">With Categories</h3>
          <SchemeFilter 
            onFilter={handleFilter}
            onSort={handleSort}
            onCategoryChange={handleCategoryChange}
            categories={categories}
          />
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Filters</h3>
          <SchemeFilter 
            onFilter={handleFilter}
            onSort={handleSort}
            onCategoryChange={handleCategoryChange}
            categories={categories}
            showAdvanced={true}
            placeholder="Search government schemes..."
          />
        </div>

        {/* Different Sizes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Different Sizes</h3>
          <div className="space-y-4">
            <SchemeFilter size="sm" onFilter={handleFilter} />
            <SchemeFilter size="md" onFilter={handleFilter} />
            <SchemeFilter size="lg" onFilter={handleFilter} />
          </div>
        </div>

        {/* Loading States */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Loading States</h3>
          <div className="space-y-4">
            <SchemeFilterSkeleton size="md" />
            <SchemeFilterSkeleton size="md" showAdvanced={true} />
          </div>
        </div>
      </div>
    </div>
  );
}