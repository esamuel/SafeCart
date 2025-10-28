'use client'

import { useState, useEffect } from 'react'
import { analyticsAPI } from '@/lib/api'
import { auth } from '@/lib/firebase'
import {
  TrendingUp,
  Shield,
  Flame,
  Award,
  AlertCircle,
  CheckCircle2,
  Heart,
  Activity,
  Calendar,
  Target,
  Loader
} from 'lucide-react'

interface EnhancedDashboardProps {
  onNavigateToAnalytics?: () => void
}

export default function EnhancedDashboard({ onNavigateToAnalytics }: EnhancedDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(7) // days

  const user = auth.currentUser

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [dashboardData, nutritionData] = await Promise.all([
        analyticsAPI.getDashboard(user.uid, period),
        analyticsAPI.getNutritionChart(user.uid, period)
      ])

      setAnalytics(dashboardData)
      setChartData(nutritionData)
    } catch (err: any) {
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading your health insights...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available yet.</p>
        <p className="text-sm text-gray-500 mt-2">Start using SafeCart to see your health insights!</p>
      </div>
    )
  }

  const { summary, nutrition, shoppingLists: listStats, insights } = analytics

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-1">Health Dashboard</h2>
          <p className="text-gray-600">Your personalized health insights</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map(days => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === days
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Insights Bar */}
      {insights && insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight: any, idx: number) => {
            const colors = {
              success: 'bg-green-50 border-green-200 text-green-800',
              warning: 'bg-orange-50 border-orange-200 text-orange-800',
              achievement: 'bg-purple-50 border-purple-200 text-purple-800',
              tip: 'bg-blue-50 border-blue-200 text-blue-800'
            }

            return (
              <div
                key={idx}
                className={`border-2 rounded-xl p-4 flex items-start gap-3 ${colors[insight.type as keyof typeof colors]}`}
              >
                <span className="text-2xl">{insight.icon}</span>
                <p className="font-medium flex-1">{insight.message}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Safety Score */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-10 h-10 opacity-80" />
            <div className="text-right">
              <p className="text-sm opacity-90">Safety Score</p>
              <p className="text-5xl font-bold">{summary.safetyScore}%</p>
            </div>
          </div>
          <div className="text-sm opacity-90">
            {summary.safeItems} safe / {summary.totalItems} total items
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Flame className="w-10 h-10 opacity-80" />
            <div className="text-right">
              <p className="text-sm opacity-90">Safe Streak</p>
              <p className="text-5xl font-bold">{summary.currentStreak}</p>
            </div>
          </div>
          <div className="text-sm opacity-90">
            {summary.currentStreak > 0 ? `${summary.currentStreak} days allergen-free!` : 'Start your streak today!'}
          </div>
        </div>

        {/* Carb Adherence */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-10 h-10 opacity-80" />
            <div className="text-right">
              <p className="text-sm opacity-90">Carb Control</p>
              <p className="text-5xl font-bold">{nutrition.carbBudgetAdherence}%</p>
            </div>
          </div>
          <div className="text-sm opacity-90">
            Avg {nutrition.avgDailyCarbs}g / {nutrition.dailyCarbLimit}g daily
          </div>
        </div>

        {/* Dangerous Items Avoided */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-10 h-10 opacity-80" />
            <div className="text-right">
              <p className="text-sm opacity-90">Dangers Avoided</p>
              <p className="text-5xl font-bold">{summary.dangerousItemsAvoided}</p>
            </div>
          </div>
          <div className="text-sm opacity-90">
            Items flagged with allergen warnings
          </div>
        </div>
      </div>

      {/* View Detailed Analytics Button */}
      {onNavigateToAnalytics && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Activity className="w-6 h-6" />
                Want More Insights?
              </h3>
              <p className="text-purple-100 text-sm">
                View detailed analytics, trends, AI recommendations, and track your progress over time
              </p>
            </div>
            <button
              onClick={onNavigateToAnalytics}
              className="ml-4 bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              View Analytics
            </button>
          </div>
        </div>
      )}

      {/* Nutrition Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Daily Nutrition Tracking</h3>
            <Activity className="w-6 h-6 text-purple-600" />
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {chartData.map((day: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{day.dayName}</span>
                  <span className="text-gray-500">{day.date}</span>
                </div>

                {/* Carbs Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-16">Carbs:</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.min((day.carbs / nutrition.dailyCarbLimit) * 100, 100)}%` }}
                    >
                      <span className="text-xs font-bold text-white">{day.carbs}g</span>
                    </div>
                  </div>
                </div>

                {/* Protein Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-16">Protein:</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.min((day.protein / 100) * 100, 100)}%` }}
                    >
                      <span className="text-xs font-bold text-white">{day.protein}g</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Carbs (goal: {nutrition.dailyCarbLimit}g)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Protein (goal: ~100g)</span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nutrition Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg">Nutrition Averages</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Daily Carbs</span>
              <span className="font-bold text-purple-600">{nutrition.avgDailyCarbs}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Daily Protein</span>
              <span className="font-bold text-green-600">{nutrition.avgDailyProtein}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Daily Calories</span>
              <span className="font-bold text-orange-600">{nutrition.avgDailyCalories}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-600">Meals Tracked</span>
              <span className="font-bold">{nutrition.mealsTracked}</span>
            </div>
          </div>
        </div>

        {/* Shopping Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg">Shopping Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Lists</span>
              <span className="font-bold text-blue-600">{listStats.totalLists}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Items Added</span>
              <span className="font-bold text-gray-900">{listStats.totalItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <span className="font-bold text-green-600">{listStats.completedItems}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-bold">
                {listStats.totalItems > 0
                  ? Math.round((listStats.completedItems / listStats.totalItems) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-bold text-lg">Achievements</h3>
          </div>
          <div className="space-y-3">
            {summary.safetyScore === 100 && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Perfect Safety Record</span>
              </div>
            )}
            {summary.currentStreak >= 7 && (
              <div className="flex items-center gap-2 text-sm">
                <Flame className="w-5 h-5 text-orange-600" />
                <span>Week-Long Safe Streak</span>
              </div>
            )}
            {nutrition.carbBudgetAdherence >= 90 && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-5 h-5 text-purple-600" />
                <span>Carb Control Master</span>
              </div>
            )}
            {summary.totalItems >= 50 && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Active Shopper</span>
              </div>
            )}
            {(summary.safetyScore < 100 && summary.currentStreak < 7 && nutrition.carbBudgetAdherence < 90 && summary.totalItems < 50) && (
              <p className="text-sm text-gray-500">Keep using SafeCart to unlock achievements!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
