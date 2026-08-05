'use client'

import { useEffect, useState } from 'react'

export default function CustomScripts() {
  const [head, setHead] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/settings/public', { cache: 'no-store' })
        const data = await res.json()
        if (data.customHeadHtml) setHead(data.customHeadHtml)
        if (data.customBodyHtml) setBody(data.customBodyHtml)
      } catch {
        /* ignore */
      }
    })()
  }, [])

  useEffect(() => {
    if (!head && !body) return
    // حقن head
    if (head) {
      const wrap = document.createElement('div')
      wrap.innerHTML = head
      Array.from(wrap.childNodes).forEach((node) => {
        if (node.nodeName === 'SCRIPT') {
          const s = document.createElement('script')
          const el = node as HTMLScriptElement
          if (el.src) s.src = el.src
          else s.text = el.textContent || ''
          Array.from(el.attributes || []).forEach((a) => {
            if (a.name !== 'src') s.setAttribute(a.name, a.value)
          })
          document.head.appendChild(s)
        } else {
          document.head.appendChild(node.cloneNode(true))
        }
      })
    }
  }, [head])

  if (!body) return null
  return (
    <div
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: body }}
    />
  )
}
