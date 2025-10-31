import React from 'react'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
        <div className="text-primary-700">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

export default FeatureCard
