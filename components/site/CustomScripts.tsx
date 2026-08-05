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
        if (data.customHeadHtml) setHead(String(data.customHeadHtml))
        if (data.customBodyHtml) setBody(String(data.customBodyHtml))
      } catch {
        /* ignore */
      }
    })()
  }, [])

  useEffect(() => {
    if (!head) return
    try {
      const wrap = document.createElement('div')
      wrap.innerHTML = head
      Array.from(wrap.childNodes).forEach((node) => {
        if (node.nodeName === 'SCRIPT') {
          const el = node as HTMLScriptElement
          const s = document.createElement('script')
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
    } catch {
      /* ignore */
    }
  }, [head])

  if (!body) return null
  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: body }} />
}
