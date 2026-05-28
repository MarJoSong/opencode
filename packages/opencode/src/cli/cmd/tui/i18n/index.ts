import enRaw from "./en.json" with { type: "json" }
import zhRaw from "./zh.json" with { type: "json" }

const translations: Record<string, Record<string, string>> = {
  en: enRaw as Record<string, string>,
  zh: zhRaw as Record<string, string>,
}

let currentLocale: string = "zh"

export function getLocale(): string {
  return currentLocale
}

export function setLocale(locale: string) {
  if (translations[locale]) {
    currentLocale = locale
  }
}

export function t(key: string, params?: Record<string, string | number>): string {
  const dict = translations[currentLocale] ?? translations.en
  let value = dict[key] ?? translations.en[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v))
    }
  }
  return value
}
