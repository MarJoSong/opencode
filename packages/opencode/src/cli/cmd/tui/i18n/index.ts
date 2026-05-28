import { createRoot, createSignal } from "solid-js"
import enRaw from "./en.json" with { type: "json" }
import zhRaw from "./zh.json" with { type: "json" }

const translations: Record<string, Record<string, string>> = {
  en: enRaw as Record<string, string>,
  zh: zhRaw as Record<string, string>,
}

let _locale: () => string
let _setLocale: (locale: string) => void

createRoot(() => {
  const [locale, set] = createSignal("zh")
  _locale = locale
  _setLocale = (l: string) => {
    if (translations[l]) {
      set(l)
    }
  }
})

export function getLocale(): string {
  return _locale()
}

export function setLocale(locale: string) {
  _setLocale(locale)
}

export function t(key: string, params?: Record<string, string | number>): string {
  const currentLocale = _locale()
  const dict = translations[currentLocale] ?? translations.en
  let value = dict[key] ?? translations.en[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v))
    }
  }
  return value
}
