'use client'

import { Calendar, Plus } from 'lucide-react'

export default function MealPlanner() {
  const meals = [
    {
      day: 'Monday, Oct 25',
      meals: [
        { time: '🍳 Breakfast', name: 'Veggie Omelet', duration: '15 min', tags: ['Low GI', 'Dairy-free'], carbs: '8g' },
        { time: '🥗 Lunch', name: 'Quinoa Power Bowl', duration: '25 min', tags: ['Balanced', 'Allergy-safe'], carbs: '35g' },
        { time: '🍲 Dinner', name: 'Grilled Salmon', duration: '30 min', tags: ['High Protein', 'Low Carb'], carbs: '5g' },
      ]
    },
    {
      day: 'Tuesday, Oct 26',
      meals: [
        { time: '🥞 Breakfast', name: 'Almond Flour Pancakes', duration: '20 min', tags: ['Low GI', 'Gluten-free'], carbs: '6g' },
        { time: '🌮 Lunch', name: 'Turkey Lettuce Wraps', duration: '15 min', tags: ['Low Carb', 'High Protein'], carbs: '8g' },
        { time: '🍝 Dinner', name: 'Zucchini Pasta', duration: '25 min', tags: ['Dairy-free', 'Low Carb'], carbs: '12g' },
      ]
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">Meal Planner</h2>
      <p className="text-gray-600 mb-6">This week's safe & delicious meals</p>

      {/* Carb Budget Card */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-2xl mb-8 shadow-lg">
        <div className="text-4xl font-bold mb-2">127g</div>
        <div className="text-lg opacity-90">Daily Carb Budget Remaining</div>
      </div>

      {/* Meals List */}
      <div className="space-y-8">
        {meals.map((day, dayIdx) => (
          <div key={dayIdx}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{day.day}</h3>
            <div className="space-y-4">
              {day.meals.map((meal, mealIdx) => (
                <div key={mealIdx} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
                  {/* Recipe Image Placeholder */}
                  <div className="h-24 bg-gradient-to-r from-orange-400 to-yellow-300"></div>
                  
                  {/* Recipe Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{meal.time} {meal.name}</div>
                        <div className="text-sm text-gray-600 mt-1">⏱️ {meal.duration}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-purple-600">Net Carbs</div>
                        <div className="text-2xl font-bold text-purple-600">{meal.carbs}</div>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {meal.tags.map((tag, tagIdx) => (
                        <span key={tagIdx} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Generate Shopping List Button */}
      <button className="mt-8 w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition font-semibold text-lg shadow-lg">
        <Plus className="w-6 h-6" />
        Generate Shopping List
      </button>
    </div>
  )
}
