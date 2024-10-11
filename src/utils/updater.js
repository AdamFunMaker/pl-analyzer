import { getVersion } from "@tauri-apps/api/app";
import { check } from "@tauri-apps/plugin-updater";
import { ask } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";

export async function checkForAppUpdates() {
  const update = await check();

  if (update?.available) {
    const yes = await ask(
      `
PL Analyzer ${update.version} is now available! -- you have ${await getVersion()}.
Release notes: 
${update.body}
        `,
      {
        title: "A new version of PL Analyzer is available!",
        kind: "info",
        okLabel: "Yes",
        cancelLabel: "No",
      }
    );

    if (yes) {
      await update.downloadAndInstall();
      await relaunch();
    }
  }
}