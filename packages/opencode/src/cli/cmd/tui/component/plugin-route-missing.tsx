import { useTheme } from "../context/theme"
import { t } from "@tui/i18n"

export function PluginRouteMissing(props: { id: string; onHome: () => void }) {
  const { theme } = useTheme()

  return (
    <box width="100%" height="100%" alignItems="center" justifyContent="center" flexDirection="column" gap={1}>
      <text fg={theme.warning}>{t("plugin.unknown_route")} {props.id}</text>
      <box onMouseUp={props.onHome} backgroundColor={theme.backgroundElement} paddingLeft={1} paddingRight={1}>
        <text fg={theme.text}>{t("plugin.go_home")}</text>
      </box>
    </box>
  )
}
