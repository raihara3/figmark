interface FigmarkStorage {
  id: string
  page: string
  name: string
}

let figmark: FigmarkStorage[] = []

const PROJECT_NAME = figma.root.name

/* ===== main ===== */

const updateFigmark = () => {
  figma.clientStorage.setAsync(`figmark_${PROJECT_NAME}`, figmark)
  figma.ui.postMessage({ type: "update-figmark", value: figmark })
}

const deleteItem = (id) => {
  figmark = figmark.map(v => {
    if(v.id !== id) return v
    return
  }).filter(v => v !== undefined)
}

figma.showUI(__html__)

figma.ui.onmessage = msg => {
  if(msg.type === "get-figmark") {
    figma.clientStorage.getAsync(`figmark_${PROJECT_NAME}`).then((value: FigmarkStorage[] | undefined) => {
      if (value !== undefined) {
        figmark = value
      }
      figma.ui.postMessage({ type: "update-figmark", value: figmark })
    })
  }else if(msg.type === "add-bookmark") {
    const selections = figma.currentPage.selection
    if(selections.length === 0) {
      figma.notify("Select the one you want to add.")
      return
    }

    selections.forEach(select => {
      const hasSaved = figmark.map(v => v.id).filter(id => id === select.id).length
      if(hasSaved) return

      figmark.push({
        id: select.id,
        page: figma.currentPage.id,
        name: select.name
      })
    })
    updateFigmark()

  }else if(msg.type === "select-node") {
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
    deleteItem(id)
    updateFigmark()

  }else if(msg.type === "delete-bookmark") {
    const { id } = msg.value
    figma.notify("removed.")
    deleteItem(id)
    updateFigmark()

  }else if(msg.type === "update-bookmark") {
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
