import React from 'react';

/**
 * DiseaseCard Component
 * 
 * Displays disease information with severity indicators, symptoms, and treatment information
 * in a professional, accessible card layout.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.disease - Disease data object
 * @param {string} props.disease.id - Unique identifier for the disease
 * @param {string} props.disease.name - Name of the disease
 * @param {string[]} props.disease.symptoms - Array of symptoms
 * @param {string} props.disease.description - Detailed description
 * @param {string} [props.disease.severity] - Severity level ('low', 'medium', 'high', 'critical')
 * @param {string[]} [props.disease.treatment] - Array of treatment methods
 * @param {string[]} [props.disease.prevention] - Array of prevention methods
 * @param {string} [props.disease.species] - Affected animal species
 * @param {string} [props.disease.transmission] - Transmission method
 * @param {boolean} [props.disease.isZoonotic] - Whether disease can transmit to humans
 * @param {string} [props.disease.mortalityRate] - Mortality rate percentage
 * @param {string} [props.className] - Additional CSS classes
 * @param {function} [props.onClick] - Click handler function
 * @param {boolean} [props.clickable] - Whether the card is clickable
 * @param {boolean} [props.expandable] - Whether the card can expand for more details
 */

export default function DiseaseCard({ 
  disease, 
  className = '',
  onClick,
  clickable = false,
  expandable = false 
}) {
  // Validate disease data
  if (!disease) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 text-center ${className}`}>
        <div className="text-gray-400 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No disease data available</p>
      </div>
    );
  }

  /**
   * Get severity styling based on severity level
   */
  const getSeverityStyles = (severity) => {
    const baseStyles = 'px-2 py-1 rounded-full text-xs font-medium capitalize';
    
    switch (severity?.toLowerCase()) {
      case 'low':
        return `${baseStyles} text-green-700 bg-green-50 border border-green-200`;
      case 'medium':
        return `${baseStyles} text-yellow-700 bg-yellow-50 border border-yellow-200`;
      case 'high':
        return `${baseStyles} text-orange-700 bg-orange-50 border border-orange-200`;
      case 'critical':
        return `${baseStyles} text-red-700 bg-red-50 border border-red-200`;
      default:
        return `${baseStyles} text-gray-700 bg-gray-50 border border-gray-200`;
    }
  };

  /**
   * Get severity icon
   */
  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'high':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'critical':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  /**
   * Get disease category icon
   */
  const getDiseaseIcon = (severity, isZoonotic) => {
    const baseClass = "w-10 h-10 rounded-lg flex items-center justify-center";
    
    if (isZoonotic) {
      return (
        <div className={`${baseClass} bg-red-100 text-red-600 border border-red-200`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      );
    }

    const severityLevel = severity?.toLowerCase();
    switch (severityLevel) {
      case 'critical':
        return (
          <div className={`${baseClass} bg-red-100 text-red-600 border border-red-200`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'high':
        return (
          <div className={`${baseClass} bg-orange-100 text-orange-600 border border-orange-200`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${baseClass} bg-blue-100 text-blue-600 border border-blue-200`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 p-6
        transition-all duration-300 hover:shadow-md
        ${clickable ? 'cursor-pointer transform hover:-translate-y-1' : ''}
        ${className}
      `}
      onClick={onClick}
      role={clickable ? 'button' : 'article'}
      tabIndex={clickable ? 0 : -1}
    >
      {/* Header with icon, title, and severity */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getDiseaseIcon(disease.severity, disease.isZoonotic)}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {disease.name}
              </h3>
              
              {disease.isZoonotic && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200">
                  Zoonotic
                </span>
              )}
            </div>
            
            {disease.species && (
              <p className="text-sm text-gray-500 mt-1">
                Affects: {disease.species}
              </p>
            )}
          </div>
        </div>
        
        {disease.severity && (
          <div className={`flex items-center space-x-1 ${getSeverityStyles(disease.severity)}`}>
            {getSeverityIcon(disease.severity)}
            <span>{disease.severity}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {disease.description && (
        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
          {disease.description}
        </p>
      )}

      {/* Symptoms */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Symptoms
        </h4>
        <div className="flex flex-wrap gap-1">
          {disease.symptoms.map((symptom, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200"
            >
              {symptom}
            </span>
          ))}
        </div>
      </div>

      {/* Additional Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {/* Transmission */}
        {disease.transmission && (
          <div>
            <span className="font-medium text-gray-700">Transmission:</span>
            <p className="text-gray-600 mt-1">{disease.transmission}</p>
          </div>
        )}

        {/* Mortality Rate */}
        {disease.mortalityRate && (
          <div>
            <span className="font-medium text-gray-700">Mortality Rate:</span>
            <p className="text-gray-600 mt-1">{disease.mortalityRate}</p>
          </div>
        )}

        {/* Treatment */}
        {disease.treatment && disease.treatment.length > 0 && (
          <div className="sm:col-span-2">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Treatment
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {disease.treatment.slice(0, 3).map((method, index) => (
                <li key={index}>{method}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Prevention */}
        {disease.prevention && disease.prevention.length > 0 && (
          <div className="sm:col-span-2">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Prevention
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {disease.prevention.slice(0, 3).map((method, index) => (
                <li key={index}>{method}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {(clickable || expandable) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600 font-medium">
              {clickable ? 'View Details' : 'More Information'}
            </span>
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DiseaseCardSkeleton Component
 * Loading state for disease cards
 */
export function DiseaseCardSkeleton({ count = 1, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
          
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Demo Component
 * Shows example usage with various disease configurations
 */
export function DiseaseCardDemo() {
  const sampleDiseases = [
    {
      id: 1,
      name: 'Foot and Mouth Disease',
      symptoms: ['Fever', 'Blisters on feet', 'Excessive salivation', 'Lameness', 'Loss of appetite'],
      description: 'A highly contagious viral disease affecting cloven-hoofed animals. Characterized by fever and blister-like sores on the tongue, lips, mouth, and between the hooves.',
      severity: 'high',
      species: 'Cattle, Pigs, Sheep, Goats',
      transmission: 'Direct contact, airborne, contaminated equipment',
      isZoonotic: false,
      mortalityRate: 'Low (2-5%) in adult animals',
      treatment: ['Supportive care', 'Antibiotics for secondary infections', 'Pain management', 'Isolation'],
      prevention: ['Vaccination', 'Biosecurity measures', 'Quarantine new animals', 'Disinfection protocols']
    },
    {
      id: 2,
      name: 'Avian Influenza',
      symptoms: ['Respiratory distress', 'Swelling of head', 'Cyanosis', 'Diarrhea', 'Sudden death'],
      description: 'Highly pathogenic avian influenza virus affecting poultry and wild birds. Can cause severe economic losses in poultry industry.',
      severity: 'critical',
      species: 'Poultry, Wild Birds',
      transmission: 'Direct contact with infected birds, contaminated surfaces',
      isZoonotic: true,
      mortalityRate: 'High (90-100%) in poultry',
      treatment: ['No specific treatment', 'Culling of infected flocks', 'Strict quarantine'],
      prevention: ['Biosecurity', 'Surveillance', 'Restrict bird movement', 'Personal protective equipment']
    },
    {
      id: 3,
      name: 'Bovine Respiratory Disease',
      symptoms: ['Cough', 'Nasal discharge', 'Fever', 'Rapid breathing', 'Depression'],
      description: 'Complex respiratory infection often associated with stress and multiple pathogens including viruses and bacteria.',
      severity: 'medium',
      species: 'Cattle',
      transmission: 'Direct contact, airborne droplets',
      isZoonotic: false,
      mortalityRate: 'Low with treatment',
      treatment: ['Antibiotics', 'Anti-inflammatory drugs', 'Supportive therapy', 'Improved ventilation'],
      prevention: ['Vaccination', 'Reduce stress', 'Proper nutrition', 'Adequate housing']
    }
  ];

  const handleDiseaseClick = (diseaseId) => {
    console.log(`Disease ${diseaseId} clicked`);
    // Navigate to detailed view or show modal
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Animal Disease Database
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive information about common livestock diseases, their symptoms, and treatment protocols.
          </p>
        </div>

        {/* Disease Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sampleDiseases.map((disease) => (
            <DiseaseCard
              key={disease.id}
              disease={disease}
              clickable={true}
              onClick={() => handleDiseaseClick(disease.id)}
              className="transform hover:-translate-y-1"
            />
          ))}
        </div>

        {/* Loading State Example */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Loading State</h2>
          <DiseaseCardSkeleton count={3} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
        </div>

        {/* Simple Disease Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Disease Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DiseaseCard
              disease={{
                id: 4,
                name: 'Mastitis',
                symptoms: ['Swollen udder', 'Abnormal milk', 'Pain', 'Fever'],
                description: 'Inflammation of the mammary gland, commonly caused by bacterial infection.',
                severity: 'medium'
              }}
            />
            <DiseaseCard
              disease={{
                id: 5,
                name: 'Parasitic Gastroenteritis',
                symptoms: ['Diarrhea', 'Weight loss', 'Anemia', 'Poor growth'],
                description: 'Infection of the gastrointestinal tract by parasitic worms.',
                severity: 'low'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}