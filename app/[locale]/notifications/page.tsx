'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export default function NotificationsPage() {
  const t = useTranslations("notifications")
  const params = useParams()
  const currentLocale = params.locale as string

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [accessCode, setAccessCode] = useState('')

  const [formData, setFormData] = useState({
    titleRo: '',
    titleRu: '',
    bodyRo: '',
    bodyRu: '',
    urlRo: '',
    urlRu: ''
  })

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (accessCode === process.env.NEXT_PUBLIC_ADMIN_CODE) {
      setIsAuthorized(true)
    } else {
      alert('Invalid access code')
    }
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <form onSubmit={handleAccessSubmit} className="max-w-md mx-auto p-4">
          <input
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder={t("enter_access_code")}
            className="w-full p-2 dark:bg-[#4A4A58] rounded mb-4 dark:hover:bg-[#4A4A58]/80"
          />
          <button
            type="submit"
            className="w-full bg-accent text-white p-2 rounded hover:bg-accent/80"
          >
            {t("verify")}
          </button>
        </form>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/push/notificare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifications: {
            ro: {
              title: formData.titleRo,
              body: formData.bodyRo,
              url: formData.urlRo
            },
            ru: {
              title: formData.titleRu,
              body: formData.bodyRu,
              url: formData.urlRu
            }
          }
        })
      })

      await response.json()
      alert('Notifications sent successfully')
    } catch (error) {
      alert('Error sending notifications')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="w-full mx-auto p-4">
        <div>
          <input
            type="text"
            value={formData.titleRo}
            onChange={(e) => setFormData({ ...formData, titleRo: e.target.value })}
            placeholder="Titlu"
            className=" w-full p-2 dark:bg-[#4A4A58] rounded mb-4 dark:hover:bg-[#4A4A58]/80"
          />
        </div>
        <div>
          <input
            type="text"
            value={formData.titleRu}
            onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
            placeholder="Заголовок"
            className="w-full p-2 dark:bg-[#4A4A58] rounded mb-4 dark:hover:bg-[#4A4A58]/80"
          />
        </div>
        <div>
          <textarea
            value={formData.bodyRo}
            onChange={(e) => setFormData({ ...formData, bodyRo: e.target.value })}
            placeholder="Mesaj"
            className="w-full p-2 dark:bg-[#4A4A58] rounded mb-4 dark:hover:bg-[#4A4A58]/80"
            rows={3}
          />
        </div>
        <div>
          <textarea
            value={formData.bodyRu}
            onChange={(e) => setFormData({ ...formData, bodyRu: e.target.value })}
            placeholder="Сообщение"
            className="w-full p-2 dark:bg-[#4A4A58] rounded mb-4 dark:hover:bg-[#4A4A58]/80"
            rows={3}
          />
        </div>
        <div>
          <input
            type="url"
            value={formData.urlRo}
            onChange={(e) => setFormData({ ...formData, urlRo: e.target.value })}
            placeholder="URL RO"
            className="w-full p-2 dark:bg-[#4A4A58] rounded mb-4 dark:hover:bg-[#4A4A58]/80"
          />
        </div>
        <div>
          <input
            type="url"
            value={formData.urlRu}
            onChange={(e) => setFormData({ ...formData, urlRu: e.target.value })}
            placeholder="URL RU"
            className="w-full p-2 dark:bg-[#4A4A58] rounded mb-4 dark:hover:bg-[#4A4A58]/80"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-accent text-white p-2 rounded hover:bg-accent/80"
        >
          {t("send")}
        </button>
      </form>
    </div>
  )
}