import { processCodeBlocks } from "../../../node_modules/genko-markdown/web/js/codex"

window.ENDEC.onCleartext(($el) => processCodeBlocks($el))
