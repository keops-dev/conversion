const { app, BrowserWindow, Tray, Menu, nativeImage } = require("electron")
const path = require("path")

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    app.quit()
}

let tray = null
let mainWindow = null
const platformIsLinux = process.platform === "linux"
const linuxMarginRight = 32
const linuxMarginBottom = 4
const appIcon = nativeImage.createFromPath(
    path.join(__dirname, "/assets/icon.png")
)

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 280,
        height: 300,
        fullscreenable: false,
        resizable: false,
        frame: false,
        show: false,
        transparent: false,
        icon: appIcon,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    })
    mainWindow.setMenu(null)
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
    mainWindow.on("blur", () => {
        if (!mainWindow.webContents.isDevToolsOpened()) {
            mainWindow.hide()
            mainWindow.webContents.send("hidden-window")
        }
    })
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

app.on("ready", () => {
    createWindow()
    createTray()
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

const createTray = () => {
    tray = new Tray(appIcon)

    // Va marcher comme attendu sur windows, mais va forcement ouvrir un menu sous linux (ubuntu en tout cas)
    // https://github.com/electron/electron/issues/14941
    tray.on("click", (event) => {
        toggleWindow()
        // Show devtools when command clicked
        if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
            mainWindow.openDevTools({ mode: "detach" })
        }
    })

    let menuTemplate = platformIsLinux
        ? [
              {
                  label: "Ouvrir / Cacher",
                  type: "normal",
                  click: () => toggleWindow(),
              },
              { type: "separator" },
              {
                  label: "Fermer Conversion",
                  type: "normal",
                  click: () => app.quit(),
              },
          ]
        : [
              {
                  label: "Fermer Conversion",
                  type: "normal",
                  click: () => app.quit(),
              },
          ]
    const contextMenu = Menu.buildFromTemplate(menuTemplate)
    tray.setContextMenu(contextMenu)
    tray.setToolTip("Conversion")
    tray.setTitle("Conversion")
}

const getWindowPosition = () => {
    const windowBounds = mainWindow.getBounds()
    const trayBounds = tray.getBounds()
    let x = 0
    let y = 0

    if (platformIsLinux) {
        const { screen } = require("electron")
        const primaryDisplay = screen.getPrimaryDisplay()
        const { height: screenHeight, width: screenWidth } =
            primaryDisplay.workArea

        x = screenWidth - (windowBounds.width + linuxMarginRight)
        y = screenHeight - (windowBounds.height + linuxMarginBottom)
    } else {
        // Center mainWindow horizontally below the tray icon
        x = Math.round(
            trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
        )
        // place verticalement mainWindow juste au dessus de tray
        y = Math.round(trayBounds.y - trayBounds.height - windowBounds.height)
    }

    return { x, y }
}

const toggleWindow = () => {
    if (mainWindow.isVisible()) {
        mainWindow.hide()
    } else {
        showWindow()
    }
}

const showWindow = () => {
    const position = getWindowPosition()
    mainWindow.setPosition(position.x, position.y, false)
    mainWindow.show()
    mainWindow.focus()
}
