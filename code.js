let figmark = [];
figma.showUI(__html__);
figma.ui.onmessage = msg => {
    if (msg.type === "add-bookmark") {
        const selections = figma.currentPage.selection;
        // 選択されているコンポーネントがない
        if (selections.length === 0)
            return;
        selections.forEach(select => {
            const isSaved = figmark.map(v => v.id).filter(id => id === select.id);
            // 既に保存されている
            if (isSaved.length > 0)
                return;
            figmark.push({
                id: select.id,
                page: figma.currentPage.id,
                name: select.name
            });
        });
        figma.clientStorage.setAsync("figmark", figmark);
        figma.ui.postMessage({ type: "update-figmark", value: figmark });
    }
    else if (msg.type === "select-node") {
        // select page
        if (figma.currentPage.id !== msg.page) {
            const targetPage = figma.root.findChild(v => v.id === msg.page);
            figma.currentPage = targetPage;
        }
        // select component
        const node = figma.getNodeById(msg.id);
        figma.currentPage.selection = new Array().concat(node);
    }
    else if (msg.type === "delete-bookmark") {
        figmark = figmark.map(v => {
            if (v.id !== msg.id)
                return v;
            return;
        }).filter(v => v !== undefined);
        figma.clientStorage.setAsync("figmark", figmark);
        figma.ui.postMessage({ type: "update-figmark", value: figmark });
    }
    else if (msg.type === "update-bookmark") {
        figmark = figmark.map(v => {
            if (v.id === msg.id) {
                return {
                    id: v.id,
                    page: v.page,
                    name: msg.value
                };
            }
            return v;
        });
        figma.clientStorage.setAsync("figmark", figmark);
        figma.ui.postMessage({ type: "update-figmark", value: figmark });
    }
};
figma.clientStorage.getAsync("figmark").then(value => {
    if (value !== undefined) {
        figmark = value;
    }
    figma.ui.postMessage({ type: "update-figmark", value: figmark });
});
