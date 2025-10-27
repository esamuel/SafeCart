'use client'

import { useState } from 'react'
import { Share2, Copy, X, QrCode } from 'lucide-react'
import { sharesAPI } from '@/lib/api'

interface ShareButtonProps {
  resourceId: string
  resourceType: 'shopping_list' | 'recipe' | 'meal_plan'
  resourceName: string
  userId: string
  userName: string
  onShareCreated?: (shareData: any) => void
}

export default function ShareButton({
  resourceId,
  resourceType,
  resourceName,
  userId,
  userName,
  onShareCreated
}: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [permissions, setPermissions] = useState({
    canView: true,
    canEdit: false,
    canCopy: true
  })
  const [isPublic, setIsPublic] = useState(false)
  const [expiresIn, setExpiresIn] = useState<number | undefined>(undefined)

  const handleShare = async () => {
    setLoading(true)
    try {
      const response = await sharesAPI.create({
        resourceId,
        resourceType,
        isPublic,
        permissions,
        expiresIn,
        userId,
        userName
      })

      setShareUrl(response.shareUrl)
      setQrCode(response.qrCode)

      if (onShareCreated) {
        onShareCreated(response)
      }

      // Try native share if available
      if (navigator.share && !isPublic) {
        try {
          await navigator.share({
            title: `Check out my ${resourceType.replace('_', ' ')}: ${resourceName}`,
            text: `I'd like to share this ${resourceType.replace('_', ' ')} with you on SafeCart`,
            url: response.shareUrl,
          })
        } catch (err) {
          // User cancelled or share not supported, show modal instead
          console.log('Native share cancelled or not supported')
        }
      }
    } catch (error) {
      console.error('Error creating share:', error)
      alert('Failed to create share link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
        title="Share"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Share {resourceType.replace('_', ' ')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Sharing: <strong>{resourceName}</strong></p>
              </div>

              {!shareUrl ? (
                <>
                  {/* Permissions */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-700 mb-2">Permissions</h3>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.canView}
                        disabled
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Can view</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.canEdit}
                        onChange={(e) => setPermissions({ ...permissions, canEdit: e.target.checked })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Can edit (collaborative)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.canCopy}
                        onChange={(e) => setPermissions({ ...permissions, canCopy: e.target.checked })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Can copy to their account</span>
                    </label>
                  </div>

                  {/* Visibility */}
                  <div className="border rounded-lg p-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Share to community feed</span>
                        <p className="text-xs text-gray-500">Make this visible to everyone in the community</p>
                      </div>
                    </label>
                  </div>

                  {/* Expiration */}
                  <div className="border rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Link expires after:
                    </label>
                    <select
                      value={expiresIn || ''}
                      onChange={(e) => setExpiresIn(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Never</option>
                      <option value="1">1 day</option>
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>

                  <button
                    onClick={handleShare}
                    disabled={loading}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating share link...' : 'Generate Share Link'}
                  </button>
                </>
              ) : (
                <>
                  {/* Share link created */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-semibold mb-2">Share link created!</p>
                    <p className="text-sm text-green-700">
                      Anyone with this link can access your {resourceType.replace('_', ' ')}.
                    </p>
                  </div>

                  {/* Share URL */}
                  <div className="border rounded-lg p-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Share Link:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* QR Code */}
                  {qrCode && (
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Scan QR Code:</p>
                      <img src={qrCode} alt="QR Code" className="mx-auto w-48 h-48" />
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowModal(false)
                      setShareUrl('')
                      setQrCode('')
                    }}
                    className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
