import React, { useState } from 'react';

/**
 * VetCard Component
 * 
 * A professional veterinarian card with contact options, availability status,
 * ratings, and detailed information display. Features modern design with
 * interactive elements and comprehensive vet details.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.vet - Veterinarian data object
 * @param {string} props.vet.id - Unique identifier
 * @param {string} props.vet.name - Full name of the veterinarian
 * @param {string} props.vet.specialization - Area of specialization
 * @param {string} props.vet.phone - Contact phone number
 * @param {string} [props.vet.email] - Email address
 * @param {string} [props.vet.photo] - Profile photo URL
 * @param {string} [props.vet.experience] - Years of experience
 * @param {string} [props.vet.rating] - Average rating (1-5)
 * @param {number} [props.vet.reviewCount] - Number of reviews
 * @param {string} [props.vet.availability] - Current availability status
 * @param {string} [props.vet.location] - Practice location
 * @param {string} [props.vet.qualifications] - Professional qualifications
 * @param {Array} [props.vet.languages] - Languages spoken
 * @param {string} [props.vet.bio] - Professional biography
 * @param {boolean} [props.vet.isEmergency] - Emergency service availability
 * @param {string} [props.vet.consultationFee] - Consultation fee
 * @param {function} [props.onContact] - Contact handler callback
 * @param {function} [props.onBookAppointment] - Appointment booking handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.clickable] - Whether the card is clickable
 */

export default function VetCard({ 
  vet, 
  onContact, 
  onBookAppointment,
  className = '',
  clickable = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Validate vet data
  if (!vet) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 text-center ${className}`}>
        <div className="text-gray-400 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No veterinarian data available</p>
      </div>
    );
  }

  /**
   * Get availability status styling
   */
  const getAvailabilityStyles = (availability) => {
    const baseStyles = 'px-2 py-1 rounded-full text-xs font-medium capitalize';
    
    switch (availability?.toLowerCase()) {
      case 'available':
        return `${baseStyles} bg-green-100 text-green-800 border border-green-200`;
      case 'busy':
        return `${baseStyles} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case 'offline':
        return `${baseStyles} bg-gray-100 text-gray-600 border border-gray-200`;
      case 'emergency only':
        return `${baseStyles} bg-red-100 text-red-800 border border-red-200`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-600 border border-gray-200`;
    }
  };

  /**
   * Get star rating display
   */
  const renderRating = (rating, reviewCount) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center space-x-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-3 h-3 ${
                star <= Math.floor(parseFloat(rating))
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-xs text-gray-600">
          {rating} {reviewCount && `(${reviewCount})`}
        </span>
      </div>
    );
  };

  /**
   * Handle contact action
   */
  const handleContact = (method) => {
    if (onContact) {
      onContact(vet, method);
    }
  };

  /**
   * Handle appointment booking
   */
  const handleBookAppointment = () => {
    if (onBookAppointment) {
      onBookAppointment(vet);
    }
  };

  const initials = vet.name ? vet.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'V';

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 p-6
        transition-all duration-300 hover:shadow-md
        ${clickable ? 'cursor-pointer transform hover:-translate-y-1' : ''}
        ${className}
      `}
      onClick={clickable ? () => setIsExpanded(!isExpanded) : undefined}
      role={clickable ? 'button' : 'article'}
      tabIndex={clickable ? 0 : -1}
    >
      <div className="flex items-start space-x-4">
        
        {/* Profile Image/Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            {vet.photo && !imageError ? (
              <img
                src={vet.photo}
                alt={vet.name}
                className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg border border-blue-200">
                {initials}
              </div>
            )}
            
            {/* Emergency Badge */}
            {vet.isEmergency && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Vet Information */}
        <div className="flex-1 min-w-0">
          
          {/* Header with name and availability */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {vet.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {vet.specialization}
              </p>
            </div>
            
            {vet.availability && (
              <div className={`flex items-center space-x-1 ${getAvailabilityStyles(vet.availability)}`}>
                <div className={`w-2 h-2 rounded-full ${
                  vet.availability.toLowerCase() === 'available' ? 'bg-green-500' :
                  vet.availability.toLowerCase() === 'busy' ? 'bg-yellow-500' :
                  vet.availability.toLowerCase() === 'emergency only' ? 'bg-red-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs">{vet.availability}</span>
              </div>
            )}
          </div>

          {/* Rating and Experience */}
          <div className="flex items-center space-x-4 mb-3">
            {renderRating(vet.rating, vet.reviewCount)}
            {vet.experience && (
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{vet.experience} years exp</span>
              </div>
            )}
          </div>

          {/* Location and Qualifications */}
          <div className="space-y-1 mb-4">
            {vet.location && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{vet.location}</span>
              </div>
            )}
            
            {vet.qualifications && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <span className="truncate">{vet.qualifications}</span>
              </div>
            )}
          </div>

          {/* Contact Actions */}
          <div className="flex flex-wrap gap-2">
            {/* Call Button */}
            <a
              href={`tel:${vet.phone}`}
              onClick={() => handleContact('call')}
              className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Call</span>
            </a>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${vet.phone.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleContact('whatsapp')}
              className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors duration-200 border border-green-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893-.001-3.189-1.262-6.187-3.55-8.444"/>
              </svg>
              <span>WhatsApp</span>
            </a>

            {/* Email Button */}
            {vet.email && (
              <a
                href={`mailto:${vet.email}`}
                onClick={() => handleContact('email')}
                className="flex items-center space-x-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email</span>
              </a>
            )}

            {/* Book Appointment Button */}
            <button
              onClick={handleBookAppointment}
              className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200 ml-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Book</span>
            </button>
          </div>

          {/* Consultation Fee */}
          {vet.consultationFee && (
            <div className="mt-3 text-sm text-gray-600 font-medium">
              Consultation: {vet.consultationFee}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in-50 slide-in-from-top-2">
          {/* Languages */}
          {vet.languages && vet.languages.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Languages Spoken</h4>
              <div className="flex flex-wrap gap-1">
                {vet.languages.map((language, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {vet.bio && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">About</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{vet.bio}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * VetCardSkeleton Component
 * Loading state for vet cards
 */
export function VetCardSkeleton({ count = 1, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
        >
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="flex space-x-4">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Demo Component
 * Shows example usage with different vet configurations
 */
export function VetCardDemo() {
  const sampleVets = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Large Animal Specialist',
      phone: '+1234567890',
      email: 'sarah.johnson@vetclinic.com',
      experience: '12',
      rating: '4.8',
      reviewCount: 124,
      availability: 'Available',
      location: 'Green Valley Veterinary Clinic',
      qualifications: 'DVM, MS Large Animal Medicine',
      languages: ['English', 'Spanish'],
      bio: 'Specialized in cattle and equine health with over 12 years of experience in large animal medicine and surgery.',
      isEmergency: true,
      consultationFee: '$75'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialization: 'Poultry Health Expert',
      phone: '+1234567891',
      experience: '8',
      rating: '4.6',
      reviewCount: 89,
      availability: 'Busy',
      location: 'Avian Care Center',
      qualifications: 'DVM, PhD Poultry Science',
      consultationFee: '$65'
    },
    {
      id: 3,
      name: 'Dr. Priya Sharma',
      specialization: 'Dairy Cattle Specialist',
      phone: '+1234567892',
      email: 'priya.sharma@dairyvet.com',
      experience: '15',
      rating: '4.9',
      reviewCount: 156,
      availability: 'Emergency Only',
      location: 'Milk & Honey Veterinary Services',
      qualifications: 'DVM, Board Certified',
      languages: ['English', 'Hindi', 'Marathi'],
      bio: 'Expert in dairy cattle reproduction and herd health management. Available for emergency consultations.',
      isEmergency: true,
      consultationFee: '$85'
    }
  ];

  const handleContact = (vet, method) => {
    console.log(`Contacting ${vet.name} via ${method}`);
  };

  const handleBookAppointment = (vet) => {
    console.log(`Booking appointment with ${vet.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Veterinary Professionals
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with experienced veterinarians specializing in livestock health and care
          </p>
        </div>

        {/* Vet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sampleVets.map((vet) => (
            <VetCard
              key={vet.id}
              vet={vet}
              onContact={handleContact}
              onBookAppointment={handleBookAppointment}
              clickable={true}
              className="transform hover:-translate-y-1"
            />
          ))}
        </div>

        {/* Loading State Example */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Loading State</h2>
          <VetCardSkeleton count={3} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
        </div>

        {/* Simple Vet Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VetCard
              vet={{
                id: 4,
                name: 'Dr. Robert Wilson',
                specialization: 'General Livestock Practice',
                phone: '+1234567893'
              }}
            />
            <VetCard
              vet={{
                id: 5,
                name: 'Dr. Emily Davis',
                specialization: 'Swine Health Specialist',
                phone: '+1234567894'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}