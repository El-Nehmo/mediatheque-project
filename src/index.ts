import path from "path";
import { app, BrowserWindow, ipcMain } from "electron";
import { registerAuthIpc } from "./main/ipcAuth";
import { registerAlbumsIpc } from "./main/ipcAlbums";
import { registerReservationsIpc } from "./main/ipcReservations";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Fix Prisma + Electron
if (!process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(
    __dirname,
    "native_modules",
    "client",
    "query_engine-windows.dll.node"
  );
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  await mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

app.whenReady().then(() => {
  // Enregistrement des IPC
  registerAuthIpc(ipcMain);
  registerAlbumsIpc(ipcMain);
  registerReservationsIpc(ipcMain);

  // Création de la fenêtre
  createWindow().catch((err) => {
    console.error("Erreur lors de la création de la fenêtre:", err);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow().catch((err) => {
        console.error("Erreur lors de la création de la fenêtre:", err);
      });
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});





