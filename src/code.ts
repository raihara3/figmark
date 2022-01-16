import ClientStorage from "./storage/ClientStorage"
import {
  GET_FIGMARK,
  ADD_FIGMARK,
  UPDATE_FIGMARK,
  DELETE_FIGMARK,
  SELECT_FIGMARK,
} from "./messageKeys/index"

// types
interface FigmarkStorage {
  id: string
  page: string
  name: string
}

// constant
const PROJECT_NAME = figma.root.name

// global variables
let figmark: FigmarkStorage[] = []

const clientStorage = new ClientStorage(PROJECT_NAME)

/* ===== main ===== */
const updateFigmark = () => {
  clientStorage.set(figmark)
  figma.ui.postMessage({ type: "update-figmark", value: figmark })
}

const deleteFigmark = (id) => {
  figmark = figmark.map(v => {
    if(v.id !== id) return v
    return
  }).filter(v => v !== undefined)
}

figma.showUI(__html__)

figma.ui.onmessage = msg => {

  if(msg.type === GET_FIGMARK) {
    clientStorage.get().then((value: FigmarkStorage[] | undefined) => {
      if (value !== undefined) {
        figmark = value
      }
      figma.ui.postMessage({ type: "update-figmark", value: figmark })
    })

  }else if(msg.type === ADD_FIGMARK) {
    const selections = figma.currentPage.selection
    if(selections.length === 0) {
      figma.notify("Select the one you want to add.")
      return
    }

    selections.forEach(select => {
      const hasSaved = figmark.map(v => v.id).filter(id => id === select.id).length
      if(hasSaved) {
        figma.notify("It's already been added.")
        return
      }

      figmark.push({
        id: select.id,
        page: figma.currentPage.id,
        name: select.name
      })
    })
    updateFigmark()

  }else if(msg.type === SELECT_FIGMARK) {
    const { id, page } = msg.value
    // select page
    if(figma.currentPage.id !== page) {
      const targetPage = figma.root.findChild(v => v.id === page)
      figma.currentPage = targetPage
    }

    // select component
    const node = figma.getNodeById(id)
    if(node) {
      figma.currentPage.selection = new Array().concat(node)
      return
    }
    figma.notify("It's already been removed.")
    deleteFigmark(id)
    updateFigmark()

  }else if(msg.type === DELETE_FIGMARK) {
    const { id } = msg.value
    figma.notify("removed.")
    deleteFigmark(id)
    updateFigmark()

  }else if(msg.type === UPDATE_FIGMARK) {
    const { id, name } = msg.value
    figmark = figmark.map(v => {
      if(v.id === id) {
        return {
          id: v.id,
          page: v.page,
          name: name
        }
      }
      return v
    })
    updateFigmark()
  }
}
