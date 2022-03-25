const { contextBridge, ipcRenderer } = require("electron")

// https://www.electronjs.org/fr/docs/latest/tutorial/process-model#scripts-de-preload
contextBridge.exposeInMainWorld("api", {
    onHiddenWindow: (callback) => {
        ipcRenderer.on("hidden-window", (event, ...args) =>
            callback(event, ...args)
        )
    },
})
