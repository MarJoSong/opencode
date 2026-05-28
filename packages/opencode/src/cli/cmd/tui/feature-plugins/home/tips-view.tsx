import type { TuiPluginApi } from "@opencode-ai/plugin/tui"
import { createMemo, For, type Accessor } from "solid-js"
import { DEFAULT_THEMES, useTheme } from "@tui/context/theme"
import { useCommandShortcut } from "../../keymap"
import { t } from "@tui/i18n"

const themeCount = Object.keys(DEFAULT_THEMES).length

type TipPart = { text: string; highlight: boolean }
type TipShortcut = Accessor<string>
type Shortcuts = {
  agentCycle: TipShortcut
  childFirst: TipShortcut
  childNext: TipShortcut
  childPrevious: TipShortcut
  commandList: TipShortcut
  editorOpen: TipShortcut
  helpShow: TipShortcut
  inputClear: TipShortcut
  inputNewline: TipShortcut
  inputPaste: TipShortcut
  inputUndo: TipShortcut
  leader: TipShortcut
  messagesCopy: TipShortcut
  messagesFirst: TipShortcut
  messagesLast: TipShortcut
  messagesPageDown: TipShortcut
  messagesPageUp: TipShortcut
  messagesToggleConceal: TipShortcut
  modelCycleRecent: TipShortcut
  modelList: TipShortcut
  sessionExport: TipShortcut
  sessionInterrupt: TipShortcut
  sessionList: TipShortcut
  sessionNew: TipShortcut
  sessionParent: TipShortcut
  sessionPinToggle: TipShortcut
  sessionQuickSwitch1: TipShortcut
  sessionQuickSwitch9: TipShortcut
  sessionSidebarToggle: TipShortcut
  sessionTimeline: TipShortcut
  statusView: TipShortcut
  terminalSuspend: TipShortcut
  themeList: TipShortcut
}
type Tip = string | ((shortcuts: Shortcuts) => string | undefined)

function parse(tip: string): TipPart[] {
  const parts: TipPart[] = []
  const regex = /\{highlight\}(.*?)\{\/highlight\}/g
  const found = Array.from(tip.matchAll(regex))
  const state = found.reduce(
    (acc, match) => {
      const start = match.index ?? 0
      if (start > acc.index) {
        acc.parts.push({ text: tip.slice(acc.index, start), highlight: false })
      }
      acc.parts.push({ text: match[1], highlight: true })
      acc.index = start + match[0].length
      return acc
    },
    { parts, index: 0 },
  )

  if (state.index < tip.length) {
    parts.push({ text: tip.slice(state.index), highlight: false })
  }

  return parts
}

const NO_MODELS_TIP = t("tips.no_models")
const NO_MODELS_PARTS = parse(NO_MODELS_TIP)

function shortcutText(value: string) {
  return `{highlight}${value}{/highlight}`
}

function commandText(command: string, shortcut: string) {
  if (!shortcut) return shortcutText(command)
  return `${shortcutText(command)} ${t("tips.or")} ${shortcutText(shortcut)}`
}

function press(shortcut: string, text: string) {
  if (!shortcut) return undefined
  return `${t("tips.press")} ${shortcutText(shortcut)} ${text}`
}

function configShortcut(api: TuiPluginApi, command: string): TipShortcut {
  return () =>
    api.tuiConfig.keybinds
      .get(command)
      .map((binding) => api.keys.formatSequence(Array.from(api.keymap.parseKeySequence(binding.key))))
      .filter(Boolean)
      .join(", ")
}

export function Tips(props: { api: TuiPluginApi; connected?: boolean }) {
  const theme = useTheme().theme
  const tipOffset = Math.random()
  const shortcuts: Shortcuts = {
    agentCycle: useCommandShortcut("agent.cycle"),
    childFirst: configShortcut(props.api, "session.child.first"),
    childNext: configShortcut(props.api, "session.child.next"),
    childPrevious: configShortcut(props.api, "session.child.previous"),
    commandList: useCommandShortcut("command.palette.show"),
    editorOpen: useCommandShortcut("prompt.editor"),
    helpShow: useCommandShortcut("help.show"),
    inputClear: useCommandShortcut("prompt.clear"),
    inputNewline: useCommandShortcut("input.newline"),
    inputPaste: useCommandShortcut("prompt.paste"),
    inputUndo: useCommandShortcut("input.undo"),
    leader: configShortcut(props.api, "leader"),
    messagesCopy: configShortcut(props.api, "messages.copy"),
    messagesFirst: configShortcut(props.api, "session.first"),
    messagesLast: configShortcut(props.api, "session.last"),
    messagesPageDown: configShortcut(props.api, "session.page.down"),
    messagesPageUp: configShortcut(props.api, "session.page.up"),
    messagesToggleConceal: configShortcut(props.api, "session.toggle.conceal"),
    modelCycleRecent: useCommandShortcut("model.cycle_recent"),
    modelList: useCommandShortcut("model.list"),
    sessionExport: configShortcut(props.api, "session.export"),
    sessionInterrupt: configShortcut(props.api, "session.interrupt"),
    sessionList: useCommandShortcut("session.list"),
    sessionNew: useCommandShortcut("session.new"),
    sessionParent: configShortcut(props.api, "session.parent"),
    sessionPinToggle: configShortcut(props.api, "session.pin.toggle"),
    sessionQuickSwitch1: useCommandShortcut("session.quick_switch.1"),
    sessionQuickSwitch9: useCommandShortcut("session.quick_switch.9"),
    sessionSidebarToggle: configShortcut(props.api, "session.sidebar.toggle"),
    sessionTimeline: configShortcut(props.api, "session.timeline"),
    statusView: useCommandShortcut("opencode.status"),
    terminalSuspend: useCommandShortcut("terminal.suspend"),
    themeList: useCommandShortcut("theme.switch"),
  }
  const tip = createMemo(() => {
    if (props.connected === false) return NO_MODELS_TIP
    const tips = TIPS.flatMap((item) => {
      const value = typeof item === "string" ? item : item(shortcuts)
      return value ? [value] : []
    })
    return tips[Math.floor(tipOffset * tips.length)] ?? NO_MODELS_TIP
  }, NO_MODELS_TIP)
  // Solid can expose a memo's initial value while a pure computation is pending.
  const parts = createMemo(() => {
    const value = tip()
    if (typeof value === "string") return parse(value)
    return NO_MODELS_PARTS
  }, NO_MODELS_PARTS)

  return (
    <box flexDirection="row" maxWidth="100%">
      <text flexShrink={0} style={{ fg: theme.warning }}>
        ● {t("tips.label")}{" "}
      </text>
      <text flexShrink={1} wrapMode="word">
        <For each={parts()}>
          {(part) => <span style={{ fg: part.highlight ? theme.text : theme.textMuted }}>{part.text}</span>}
        </For>
      </text>
    </box>
  )
}

const TIPS: Tip[] = [
  t("tips.tip_1"),
  t("tips.tip_2"),
  (shortcuts) => press(shortcuts.agentCycle(), t("tips.tip_3")),
  t("tips.tip_4"),
  t("tips.tip_5"),
  t("tips.tip_6"),
  t("tips.tip_7"),
  (shortcuts) => press(shortcuts.inputPaste(), t("tips.tip_8")),
  (shortcuts) => `${t("tips.tip_9_prefix")} ${commandText("/editor", shortcuts.editorOpen())} ${t("tips.tip_9_suffix")}`,
  t("tips.tip_10"),
  (shortcuts) => `${t("tips.tip_11_prefix")} ${commandText("/models", shortcuts.modelList())} ${t("tips.tip_11_suffix")}`,
  (shortcuts) => `${t("tips.tip_12_prefix")} ${commandText("/themes", shortcuts.themeList())} ${t("tips.tip_12_suffix", { count: themeCount })}`,
  (shortcuts) => `${t("tips.tip_13_prefix")} ${commandText("/new", shortcuts.sessionNew())} ${t("tips.tip_13_suffix")}`,
  (shortcuts) => `${t("tips.tip_14_prefix")} ${commandText("/sessions", shortcuts.sessionList())} ${t("tips.tip_14_suffix")}`,
  (shortcuts) => press(shortcuts.sessionPinToggle(), t("tips.tip_15")),
  (shortcuts) =>
    shortcuts.sessionQuickSwitch1() && shortcuts.sessionQuickSwitch9()
      ? t("tips.tip_16", { first: shortcutText(shortcuts.sessionQuickSwitch1()), last: shortcutText(shortcuts.sessionQuickSwitch9()) })
      : undefined,
  t("tips.tip_17"),
  (shortcuts) => `${t("tips.tip_18_prefix")} ${commandText("/export", shortcuts.sessionExport())} ${t("tips.tip_18_suffix")}`,
  (shortcuts) => press(shortcuts.messagesCopy(), t("tips.tip_19")),
  (shortcuts) => press(shortcuts.commandList(), t("tips.tip_20")),
  t("tips.tip_21"),
  (shortcuts) => t("tips.tip_22", { leader: shortcutText(shortcuts.leader()) }),
  (shortcuts) => press(shortcuts.modelCycleRecent(), t("tips.tip_23")),
  (shortcuts) => press(shortcuts.sessionSidebarToggle(), t("tips.tip_24")),
  (shortcuts) =>
    shortcuts.messagesPageUp() && shortcuts.messagesPageDown()
      ? t("tips.tip_25", { up: shortcutText(shortcuts.messagesPageUp()), down: shortcutText(shortcuts.messagesPageDown()) })
      : undefined,
  (shortcuts) => press(shortcuts.messagesFirst(), t("tips.tip_26")),
  (shortcuts) => press(shortcuts.messagesLast(), t("tips.tip_27")),
  (shortcuts) => press(shortcuts.inputNewline(), t("tips.tip_28")),
  (shortcuts) => press(shortcuts.inputClear(), t("tips.tip_29")),
  (shortcuts) => press(shortcuts.sessionInterrupt(), t("tips.tip_30")),
  t("tips.tip_31"),
  t("tips.tip_32"),
  (shortcuts) => {
    const items = [
      shortcuts.sessionParent(),
      shortcuts.childFirst(),
      shortcuts.childPrevious(),
      shortcuts.childNext(),
    ].filter(Boolean)
    if (!items.length) return undefined
    return `${t("tips.tip_33_prefix")} ${items.map(shortcutText).join(" / ")} ${t("tips.tip_33_suffix")}`
  },
  t("tips.tip_34"),
  t("tips.tip_35"),
  t("tips.tip_36"),
  t("tips.tip_37"),
  t("tips.tip_38"),
  t("tips.tip_39"),
  t("tips.tip_40"),
  t("tips.tip_41"),
  t("tips.tip_42"),
  t("tips.tip_43"),
  t("tips.tip_44"),
  t("tips.tip_45"),
  t("tips.tip_46"),
  t("tips.tip_47"),
  t("tips.tip_48"),
  t("tips.tip_49"),
  t("tips.tip_50"),
  t("tips.tip_51"),
  t("tips.tip_52"),
  t("tips.tip_53"),
  t("tips.tip_54"),
  t("tips.tip_55"),
  t("tips.tip_56"),
  t("tips.tip_57"),
  t("tips.tip_58"),
  t("tips.tip_59"),
  t("tips.tip_60"),
  t("tips.tip_61"),
  t("tips.tip_62"),
  t("tips.tip_63"),
  t("tips.tip_64"),
  t("tips.tip_65"),
  t("tips.tip_66"),
  t("tips.tip_67"),
  t("tips.tip_68"),
  t("tips.tip_69"),
  t("tips.tip_70"),
  t("tips.tip_71"),
  t("tips.tip_72"),
  t("tips.tip_73"),
  t("tips.tip_74"),
  t("tips.tip_75"),
  t("tips.tip_76"),
  t("tips.tip_77"),
  (shortcuts) => `${t("tips.tip_78_prefix")} ${commandText("/timeline", shortcuts.sessionTimeline())} ${t("tips.tip_78_suffix")}`,
  (shortcuts) => press(shortcuts.messagesToggleConceal(), t("tips.tip_79")),
  (shortcuts) => `${t("tips.tip_80_prefix")} ${commandText("/status", shortcuts.statusView())} ${t("tips.tip_80_suffix")}`,
  t("tips.tip_81"),
  (shortcuts) =>
    shortcuts.commandList()
      ? t("tips.tip_82", { shortcut: shortcutText(shortcuts.commandList()) })
      : t("tips.tip_82_fallback"),
  t("tips.tip_83"),
  t("tips.tip_84"),
  t("tips.tip_85"),
  t("tips.tip_86"),
  (shortcuts) => `${t("tips.tip_87_prefix")} ${commandText("/help", shortcuts.helpShow())} ${t("tips.tip_87_suffix")}`,
  t("tips.tip_88"),
  ...(process.platform === "win32"
    ? ([(shortcuts) => press(shortcuts.inputUndo(), t("tips.tip_89"))] satisfies Tip[])
    : ([
        (shortcuts) => press(shortcuts.terminalSuspend(), t("tips.tip_90")),
      ] satisfies Tip[])),
]
