/** @jsxImportSource @opentui/solid */
/** @jsxRuntime automatic */
import { useDialog } from "@tui/ui/dialog"
import { DialogSelect } from "@tui/ui/dialog-select"
import { setLocale, getLocale } from "@tui/i18n"
import type { DialogSelectOption } from "@tui/ui/dialog-select"

const LOCALES = [
  { value: "zh", title: "中文 (Chinese)" },
  { value: "en", title: "English" },
]

export function DialogLocale() {
  const dialog = useDialog()

  return (
    <DialogSelect
      title="Select Language"
      current={getLocale()}
      options={LOCALES}
      onSelect={(option: DialogSelectOption) => {
        setLocale(option.value)
        dialog.clear()
      }}
    />
  )
}
