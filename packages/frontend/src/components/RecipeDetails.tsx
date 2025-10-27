'use client'

import { useState } from 'react'
import { recipesAPI } from '@/lib/api'
import { auth } from '@/lib/firebase'
import { 
  Clock, Users, ChefHat, PlayCircle, CheckCircle2, 
  AlertTriangle, ArrowLeft, ShoppingCart, BookOpen, 
  UtensilsCrossed, Leaf, Zap
} from 'lucide-react'

interface RecipeDetailsProps {
  recipe: any
  onClose: () => void
  onGenerateShoppingList?: (recipe: any) => void
}

export default function RecipeDetails({ recipe, onClose, onGenerateShoppingList }: RecipeDetailsProps) {
  const [cookingMode, setCookingMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  if (!recipe) return null

  const toggleCookingMode = () => {
    if (!cookingMode) {
      setCookingMode(true)
      setCurrentStep(0)
    } else {
      setCookingMode(false)
    }
  }

  const nextStep = () => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'hard':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const totalTime = recipe.prepTime + recipe.cookTime
  const isUserAllergic = recipe.allergens?.contains && recipe.allergens.contains.length > 0

  if (cookingMode) {
    // Cooking Mode View - Step-by-step
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={toggleCookingMode}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Exit Cooking Mode</span>
            </button>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {recipe.instructions.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-800 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / recipe.instructions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Recipe Info Bar */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-6 mb-6">
            <h1 className="text-2xl font-bold mb-3">{recipe.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {recipe.prepTime} min prep
              </div>
              <div className="flex items-center gap-1">
                <ChefHat className="w-4 h-4" />
                {recipe.cookTime} min cook
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {recipe.servings} servings
              </div>
            </div>
          </div>

          {/* Current Step */}
          <div className="bg-white border-2 border-purple-200 rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-purple-600">{currentStep + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{recipe.instructions[currentStep]}</h3>
            </div>

            {/* Step Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  currentStep === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                Previous Step
              </button>

              {currentStep < recipe.instructions.length - 1 && (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition flex items-center gap-2"
                >
                  Next Step
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              )}

              {currentStep === recipe.instructions.length - 1 && (
                <button
                  onClick={() => {
                    setCookingMode(false)
                    onClose()
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition flex items-center gap-2"
                >
                  Recipe Complete!
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* All Steps Overview */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-bold text-gray-900 mb-3">All Steps</h4>
            <div className="space-y-2">
              {recipe.instructions.map((step: string, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg transition ${
                    idx === currentStep
                      ? 'bg-purple-600 text-white'
                      : idx < currentStep
                      ? 'bg-green-100 text-green-800'
                      : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-bold">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Standard Details View
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 overflow-y-auto">
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <button
                  onClick={onClose}
                  className="mb-4 flex items-center gap-2 text-white hover:text-gray-200 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Meal Plan</span>
                </button>
                <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
                {recipe.description && (
                  <p className="text-purple-100">{recipe.description}</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <Clock className="w-5 h-5 mb-1" />
                <div className="text-xs text-purple-100">Prep Time</div>
                <div className="text-lg font-bold">{recipe.prepTime} min</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <ChefHat className="w-5 h-5 mb-1" />
                <div className="text-xs text-purple-100">Cook Time</div>
                <div className="text-lg font-bold">{recipe.cookTime} min</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <Users className="w-5 h-5 mb-1" />
                <div className="text-xs text-purple-100">Servings</div>
                <div className="text-lg font-bold">{recipe.servings}</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </span>
                <div className="text-xs text-purple-100 mt-1">Difficulty</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Allergen Warning */}
            {isUserAllergic && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-900 mb-1">⚠️ Contains Your Allergens!</p>
                    <p className="text-red-700 text-sm">
                      This recipe contains: {recipe.allergens.contains.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dietary Tags */}
            {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {recipe.dietaryTags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Ingredients */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Ingredients
                </h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span className={ingredient.optional ? 'text-gray-500 italic' : ''}>
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                        {ingredient.optional && (
                          <span className="text-xs text-gray-400 ml-1">(optional)</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nutrition */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-purple-600" />
                  Nutrition (per serving)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Net Carbs</span>
                    <span className="font-bold text-purple-600">{recipe.nutrition.netCarbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Carbs</span>
                    <span className="font-bold text-purple-600">{recipe.nutrition.totalCarbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Protein</span>
                    <span className="font-bold text-purple-600">{recipe.nutrition.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Calories</span>
                    <span className="font-bold text-purple-600">{recipe.nutrition.calories}</span>
                  </div>
                  {recipe.nutrition.glycemicIndex && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-700">GI</span>
                        <span className="font-bold text-purple-600">{recipe.nutrition.glycemicIndex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">GL</span>
                        <span className="font-bold text-purple-600">{recipe.nutrition.glycemicLoad}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions Preview */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-purple-600" />
                Instructions ({recipe.instructions.length} steps)
              </h3>
              <div className="space-y-3">
                {recipe.instructions.slice(0, 3).map((step: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 pt-1">{step}</p>
                  </div>
                ))}
                {recipe.instructions.length > 3 && (
                  <p className="text-sm text-gray-500 italic">
                    + {recipe.instructions.length - 3} more steps...
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={toggleCookingMode}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                Start Cooking Mode
              </button>
              {onGenerateShoppingList && (
                <button
                  onClick={() => onGenerateShoppingList(recipe)}
                  className="bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold transition flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to List
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
