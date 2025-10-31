'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, TrendingUp, TrendingDown, AlertCircle, Check, Target, Flame } from 'lucide-react'
import { analyticsAPI } from '@/lib/api'

interface AnalyticsSummary {
  totalItems: number
  safeItems: number
  dangerousItems: number
  dangerousItemsAvoided: number
  safetyScore: number
  currentStreak: number
}

interface Nutrition {
  avgDailyCarbs: number
  avgDailyProtein: number
  avgDailyCalories: number
  dailyCarbLimit: number
  carbBudgetAdherence: number
  mealsTracked: number
}

interface Insight {
  type: string
  message: string
  icon: string
}

interface Analytics {
  summary: AnalyticsSummary
  nutrition: Nutrition
  insights: Insight[]
}

export default function HealthAnalytics({ user }: any) {
  const { t } = useTranslation('analytics')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    loadAnalytics()
  }, [days, user])

  const loadAnalytics = async () => {
    // Support both firebaseId (from dbUser) and uid (from Firebase user)
    const userId = user?.firebaseId || user?.uid
    if (!userId) {
      console.log('[Analytics] No user ID found, user object:', user)
      setLoading(false)
      return
    }

    console.log('[Analytics] Loading analytics for user:', userId)
    setLoading(true)
    try {
      console.log('[Analytics] Fetching analytics for', days, 'days')
      const data = await analyticsAPI.getDashboard(userId, days)
      console.log('[Analytics] Data received:', data)
      setAnalytics(data)
    } catch (error) {
      console.error('[Analytics] Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!analytics) {
    console.log('[Analytics] No analytics data, showing empty state')
    return (
      <div className="text-center p-12">
        <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('emptyState.title')}</h3>
        <p className="text-gray-600">
          {t('emptyState.description')}
        </p>
        <button
          onClick={() => loadAnalytics()}
          className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700"
        >
          {t('emptyState.retry')}
        </button>
      </div>
    )
  }

  console.log('[Analytics] Rendering dashboard with data:', analytics)

  const { summary, nutrition, insights } = analytics

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h2>
        <p className="text-gray-600">{t('subtitle')}</p>

        {/* Time Range Selector */}
        <div className="flex gap-2 mt-4">
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                days === d
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('timeRange.days', { count: d })}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Safety Score */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-700">
              {summary.safetyScore}%
            </span>
          </div>
          <p className="text-sm font-semibold text-green-800">{t('metrics.safetyScore')}</p>
          <p className="text-xs text-green-600 mt-1">
            {summary.safeItems} {t('metrics.safeItems')} / {summary.totalItems} {t('metrics.items')}
          </p>
        </div>

        {/* Streak */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-5 h-5 text-orange-600" />
            <span className="text-2xl font-bold text-orange-700">
              {summary.currentStreak}
            </span>
          </div>
          <p className="text-sm font-semibold text-orange-800">{t('metrics.streak')}</p>
          <p className="text-xs text-orange-600 mt-1">{t('metrics.streakSubtext')}</p>
        </div>

        {/* Carbs Today */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-700">
              {nutrition.avgDailyCarbs}g
            </span>
          </div>
          <p className="text-sm font-semibold text-blue-800">{t('metrics.avgCarbs')}</p>
          <p className="text-xs text-blue-600 mt-1">
            {t('metrics.of')} {nutrition.dailyCarbLimit}g {t('metrics.limit')}
          </p>
        </div>

        {/* Meals Tracked */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-700">
              {nutrition.mealsTracked}
            </span>
          </div>
          <p className="text-sm font-semibold text-purple-800">{t('metrics.mealsLogged')}</p>
          <p className="text-xs text-purple-600 mt-1">{t('timeRange.days', { count: days })}</p>
        </div>
      </div>

      {/* Carb Budget Progress */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          {t('carbBudget.title')}
        </h3>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">
              {nutrition.avgDailyCarbs}g / {nutrition.dailyCarbLimit}g
            </span>
            <span className={`font-semibold ${
              nutrition.avgDailyCarbs > nutrition.dailyCarbLimit
                ? 'text-red-600'
                : nutrition.avgDailyCarbs > nutrition.dailyCarbLimit * 0.8
                ? 'text-orange-600'
                : 'text-green-600'
            }`}>
              {Math.round((nutrition.avgDailyCarbs / nutrition.dailyCarbLimit) * 100)}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                nutrition.avgDailyCarbs > nutrition.dailyCarbLimit
                  ? 'bg-red-500'
                  : nutrition.avgDailyCarbs > nutrition.dailyCarbLimit * 0.8
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min(100, (nutrition.avgDailyCarbs / nutrition.dailyCarbLimit) * 100)}%`
              }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 p-3 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{nutrition.avgDailyCarbs}g</p>
            <p className="text-xs text-gray-600">{t('carbBudget.dailyAvg')}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">
              {Math.max(0, nutrition.dailyCarbLimit - nutrition.avgDailyCarbs)}g
            </p>
            <p className="text-xs text-gray-600">{t('carbBudget.remaining')}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{nutrition.avgDailyProtein}g</p>
            <p className="text-xs text-gray-600">{t('carbBudget.protein')}</p>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      {insights && insights.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            {t('insights.title')}
          </h3>

          <div className="space-y-3">
            {insights.map((insight, index) => {
              // Map common insight messages to translation keys
              let translatedMessage = insight.message
              
              // Try to translate common insights
              if (insight.message.includes('Perfect safety score')) {
                translatedMessage = t('insights.perfectSafety', { count: summary.totalItems })
              } else if (insight.message.includes('Great carb control') || insight.message.includes('staying within your budget')) {
                translatedMessage = t('insights.greatCarbControl')
              } else if (insight.message.includes('Meal Planner') || insight.message.includes('diabetes-friendly')) {
                translatedMessage = t('insights.tryMealPlanner')
              }
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    insight.type === 'success'
                      ? 'bg-green-50 border-green-200'
                      : insight.type === 'warning'
                      ? 'bg-orange-50 border-orange-200'
                      : insight.type === 'achievement'
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        insight.type === 'success'
                          ? 'text-green-800'
                          : insight.type === 'warning'
                          ? 'text-orange-800'
                          : insight.type === 'achievement'
                          ? 'text-purple-800'
                          : 'text-blue-800'
                      }`}>
                        {translatedMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Danger Zone Alert */}
      {summary.dangerousItems > 0 && (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl mb-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-red-900 mb-2">
                {t('dangerZone.title')}
              </h3>
              <p className="text-red-800 mb-3">
                {t('dangerZone.description', { count: summary.dangerousItems }).split(/\{\{count\}\}/).map((part, i, arr) => 
                  i === arr.length - 1 ? part : (
                    <span key={i}>
                      {part}
                      <span className="font-bold">{summary.dangerousItems}</span>
                    </span>
                  )
                )}
              </p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                {t('dangerZone.button')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-6 rounded-2xl shadow-lg">
        <h3 className="font-bold text-lg mb-4">{t('summary.title', { days })}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-purple-200 text-sm mb-1">{t('summary.itemsScanned')}</p>
            <p className="text-3xl font-bold">{summary.totalItems}</p>
          </div>
          <div>
            <p className="text-purple-200 text-sm mb-1">{t('summary.safeItems')}</p>
            <p className="text-3xl font-bold text-green-300">{summary.safeItems}</p>
          </div>
          <div>
            <p className="text-purple-200 text-sm mb-1">{t('summary.mealsTracked')}</p>
            <p className="text-3xl font-bold">{nutrition.mealsTracked}</p>
          </div>
          <div>
            <p className="text-purple-200 text-sm mb-1">{t('summary.safetyScore')}</p>
            <p className="text-3xl font-bold text-green-300">{summary.safetyScore}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
