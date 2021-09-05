let figmark = [];
figma.showUI(__html__);
figma.ui.onmessage = msg => {
    if (msg.type === "add-bookmark") {
        const select = figma.currentPage.selection;
        if (select.length === 0)
            return;
        const isSaved = figmark.map(v => v.id).filter(id => id === select[0].id);
        if (isSaved.length > 0) {
            console.log("既に保存済み");
            return;
        }
        figmark.push({
            id: select[0].id,
            name: select[0].name
        });
        figma.clientStorage.setAsync("figmark", figmark);
        figma.ui.postMessage({ type: "update-figmark", value: figmark });
    }
    else if (msg.type === "select-node") {
        const node = figma.getNodeById(msg.id);
        figma.currentPage.selection = new Array().concat(node);
        // console.log(new Array().concat(figma.currentPage))
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
                return { id: v.id, name: msg.value };
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
