/*
 * Mine tab wrapper: lets the user switch between the original PulseBitcoin miner
 * and the PulseLitecoin (pLTC) miner. Selection lives in the URL: #/mine and #/mine?miner=pltc
 */
import { ae as h } from "./index.134b1441.js";
import MineView from "./MineView.05c60b0a.js";
import PltcView from "./PltcView.js";

const TABS = [
  { id: "plsb", label: "PulseBitcoin", icon: "/assets/plsb.png", view: MineView },
  { id: "pltc", label: "PulseLitecoin", icon: "/assets/pltc-color.svg", view: PltcView }
];

function tab(t, active, onSelect) {
  return h("div", {
    class: `q-tab relative-position self-stretch flex flex-center text-center q-tab--inline-label q-focusable q-hoverable cursor-pointer ${active ? "q-tab--active text-secondary" : "q-tab--inactive"}`,
    role: "tab", tabindex: 0, "aria-selected": String(active),
    onClick: onSelect,
    onKeydown: e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }
  }, [
    h("div", { class: "q-focus-helper", tabindex: -1 }),
    h("div", { class: "q-tab__content self-stretch flex-center relative-position q-anchor--skip non-selectable row no-wrap q-tab__content--inline" }, [
      h("img", { src: t.icon, alt: "", width: 24, height: 24, class: "q-tab__icon", style: "border-radius:50%" }),
      h("div", { class: "q-tab__label" }, t.label)
    ]),
    h("div", { class: "q-tab__indicator absolute-bottom text-secondary", style: active ? "" : "opacity:0" })
  ]);
}

export default {
  name: "MineSwitch",
  render() {
    const current = this.$route.query.miner === "pltc" ? "pltc" : "plsb";
    const select = id => () => {
      if (id === current) return;
      this.$router.replace({ path: "/mine", query: id === "pltc" ? { miner: "pltc" } : {} });
    };
    const active = TABS.find(t => t.id === current);
    return h("div", { class: "mine-switch" }, [
      h("div", { class: "row justify-center q-pt-sm" }, [
        h("div", { class: "q-tabs row no-wrap items-center q-tabs--not-scrollable q-tabs--horizontal q-tabs__arrows--inside", role: "tablist", "aria-label": "Choose miner" }, [
          h("div", { class: "q-tabs__content row no-wrap items-center self-stretch hide-scrollbar relative-position q-tabs__content--align-center" },
            TABS.map(t => tab(t, t.id === current, select(t.id))))
        ])
      ]),
      h(active.view, { key: current })
    ]);
  }
};
