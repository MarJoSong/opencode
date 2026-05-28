import { DialogSelect } from "@tui/ui/dialog-select"
import { useRoute } from "@tui/context/route"
import { t } from "@tui/i18n"

export function DialogSubagent(props: { sessionID: string }) {
  const route = useRoute()

  return (
    <DialogSelect
      title={t("route.session.dialog.subagent.title")}
      options={[
        {
          title: t("route.session.dialog.subagent.open"),
          value: "subagent.view",
          description: t("route.session.dialog.subagent.open_desc"),
          onSelect: (dialog) => {
            route.navigate({
              type: "session",
              sessionID: props.sessionID,
            })
            dialog.clear()
          },
        },
      ]}
    />
  )
}
