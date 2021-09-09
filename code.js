let figmark = [];
/* ===== main ===== */
const updateFigmark = () => {
    figma.clientStorage.setAsync("figmark", figmark);
    figma.ui.postMessage({ type: "update-figmark", value: figmark });
};
const deleteItem = (id) => {
    figmark = figmark.map(v => {
        if (v.id !== id)
            return v;
        return;
    }).filter(v => v !== undefined);
};
figma.showUI(__html__);
figma.ui.onmessage = msg => {
    if (msg.type === "add-bookmark") {
        const selections = figma.currentPage.selection;
        if (selections.length === 0)
            return;
        selections.forEach(select => {
            const hasSaved = figmark.map(v => v.id).filter(id => id === select.id).length;
            if (hasSaved)
                return;
            figmark.push({
                id: select.id,
                page: figma.currentPage.id,
                name: select.name
            });
        });
        updateFigmark();
    }
    else if (msg.type === "select-node") {
        const { id, page } = msg.value;
        // select page
        if (figma.currentPage.id !== page) {
            const targetPage = figma.root.findChild(v => v.id === page);
            figma.currentPage = targetPage;
        }
        // select component
        const node = figma.getNodeById(id);
        if (node) {
            figma.currentPage.selection = new Array().concat(node);
            return;
        }
        alert('既に削除されています');
        deleteItem(id);
        updateFigmark();
    }
    else if (msg.type === "delete-bookmark") {
        const { id } = msg.value;
        deleteItem(id);
        updateFigmark();
    }
    else if (msg.type === "update-bookmark") {
        const { id, name } = msg.value;
        figmark = figmark.map(v => {
            if (v.id === id) {
                return {
                    id: v.id,
                    page: v.page,
                    name: name
                };
            }
            return v;
        });
        updateFigmark();
    }
};
figma.clientStorage.getAsync("figmark").then((value) => {
    if (value !== undefined) {
        figmark = value;
    }
    figma.ui.postMessage({ type: "update-figmark", value: figmark });
});
