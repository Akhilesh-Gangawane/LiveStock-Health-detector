import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Land() {
  const { t } = useTranslation();
  const [farms, setFarms] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: '',
    soilType: 'loamy',
    waterSource: 'borewell',
    crops: '',
    notes: ''
  });

  const soilTypes = [
    { value: 'loamy', label: t('land.loamy', 'Loamy'), icon: '🌱' },
    { value: 'clay', label: t('land.clay', 'Clay'), icon: '🧱' },
    { value: 'sandy', label: t('land.sandy', 'Sandy'), icon: '🏖️' },
    { value: 'silt', label: t('land.silt', 'Silt'), icon: '🌾' },
    { value: 'rocky', label: t('land.rocky', 'Rocky'), icon: '🪨' }
  ];

  const waterSources = [
    { value: 'borewell', label: t('land.borewell', 'Borewell'), icon: '🕳️' },
    { value: 'river', label: t('land.river', 'River'), icon: '🏞️' },
    { value: 'canal', label: t('land.canal', 'Canal'), icon: '🚰' },
    { value: 'rainwater', label: t('land.rainwater', 'Rainwater'), icon: '🌧️' },
    { value: 'pond', label: t('land.pond', 'Pond'), icon: '🏊' }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newFarm = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString()
    };
    setFarms([...farms, newFarm]);
    setFormData({
      name: '',
      location: '',
      area: '',
      soilType: 'loamy',
      waterSource: 'borewell',
      crops: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const getSoilIcon = (type) => {
    const soil = soilTypes.find(s => s.value === type);
    return soil ? soil.icon : '🌱';
  };

  const getWaterIcon = (source) => {
    const water = waterSources.find(w => w.value === source);
    return water ? water.icon : '💧';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('land.title', 'Land Management')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('land.subtitle', 'Manage your farm lands and agricultural properties')}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>{t('land.addFarm', 'Add Farm Land')}</span>
          </button>
        </div>

        {/* Add Farm Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('land.addFarm', 'Add Farm Land')}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('land.farmName', 'Farm Name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter farm name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('land.location', 'Location')}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Village, District, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('land.area', 'Area (acres)')}
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  required
                  step="0.1"
                  className="input-field"
                  placeholder="Area in acres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('land.soilType', 'Soil Type')}
                </label>
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {soilTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('land.waterSource', 'Water Source')}
                </label>
                <select
                  name="waterSource"
                  value={formData.waterSource}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {waterSources.map(source => (
                    <option key={source.value} value={source.value}>
                      {source.icon} {source.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('land.crops', 'Current Crops')}
                </label>
                <input
                  type="text"
                  name="crops"
                  value={formData.crops}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Wheat, Rice, Sugarcane"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('land.notes', 'Additional Notes')}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                  placeholder="Any additional information about the land..."
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {t('common.save', 'Save')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Farms Grid */}
        {farms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <div key={farm.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-2xl">
                      🏡
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {farm.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        📍 {farm.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('land.area', 'Area')}:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{farm.area} acres</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('land.soilType', 'Soil')}:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-1">
                      <span>{getSoilIcon(farm.soilType)}</span>
                      <span>{soilTypes.find(s => s.value === farm.soilType)?.label}</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('land.waterSource', 'Water')}:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-1">
                      <span>{getWaterIcon(farm.waterSource)}</span>
                      <span>{waterSources.find(w => w.value === farm.waterSource)?.label}</span>
                    </span>
                  </div>

                  {farm.crops && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('land.crops', 'Crops')}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white text-right">
                        {farm.crops}
                      </span>
                    </div>
                  )}
                </div>

                {farm.notes && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {farm.notes}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    {t('common.view', 'View')}
                  </button>
                  <button className="flex-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
                    {t('common.edit', 'Edit')}
                  </button>
                  <button className="flex-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                    {t('common.delete', 'Delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏡</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('land.noFarms', 'No farm lands added yet')}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              {t('land.addFirst', 'Add your first farm land to get started with land management')}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              {t('land.addFarm', 'Add Farm Land')}
            </button>
          </div>
        )}

        {/* Land Management Tips */}
        <div className="mt-12 bg-green-50 dark:bg-green-900/20 rounded-xl p-8 border border-green-200 dark:border-green-800">
          <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-6">
            {t('land.managementTips', 'Land Management Tips')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                {t('land.soilHealth', 'Soil Health')}
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                {t('land.soilHealthDesc', 'Regular soil testing and organic matter addition improves fertility')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💧</span>
              </div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                {t('land.waterManagement', 'Water Management')}
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                {t('land.waterManagementDesc', 'Efficient irrigation systems save water and improve crop yield')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                {t('land.cropRotation', 'Crop Rotation')}
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                {t('land.cropRotationDesc', 'Rotating crops helps maintain soil nutrients and reduce pests')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}