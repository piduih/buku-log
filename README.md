<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fUxxaTK3LKTlIkjamxUc4UiDb3N_jhOj

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backup & local JSON

You can export your data to a JSON file and import it back.

- Use the header buttons to Export JSON (download backup), or Import JSON (select a previously-exported file).
- You can now record both expenses and incomes: when adding a new log, use the "Perbelanjaan / Pendapatan" toggle to mark the entry type. The dashboards and history view will show incomes and expenses separately and compute a net balance.
 - New charts: Dashboard shows a trend chart of Pendapatan vs Perbelanjaan over the selected time window, and separate pie charts for income/expense breakdown per `Buku Log`.
- The JSON structure contains `logbooks` and `entries` arrays.

File System Access API (optional):
- If your browser supports the File System Access API (Chromium-based browsers), you will see extra buttons to attach a JSON file and save directly back to it.
- When you attach a file on first load, the app will store a handle in IndexedDB (permission allowing) so subsequent saves will write to the same file.
- If not supported, or if you remove the handle, you can still export and import JSON through the Export/Import buttons.

Autosave:
- When a JSON file is attached with File System Access API, you can enable "Auto-save" in the header and choose an interval (in seconds).
- When enabled, the app will periodically write your `logbooks` and `entries` to that file. This uses an interval timer and will only operate when a file handle is attached.

Offline behaviour:
- If the browser goes offline while Auto-save is enabled, the app shows "Autosave paused - offline" and the background autosave will not attempt to write until network is back. You can still manually export JSON or reattach a file.

This allows you to use a local JSON file to persist or transfer data between devices.

Mobile-first improvements:
- The UI is optimized for phones: modals display full-screen on small devices, navigation buttons are large and tappable, toasts expand to near full width on small screens, and header actions are moved into a 'More (⋯)' menu to reduce clutter on phones.
- If most of your users open the app on a phone (as expected), test with device emulation or on a physical phone — see the Tips below.

Tips for testing on mobile:
- Use the dev server and open your machine IP (e.g., `http://192.168.1.5:5173`) from your phone browser.
- Use Chrome/Edge device emulation in Developer Tools, set the viewport to 'iPhone 12', and test touch targets and safe-area insets.
- To test PWA add-to-home-screen:
   - Serve your dev server on a LAN address (e.g., `http://192.168.x.x:5173`) and open it on your phone.
   - On Chromium browsers, open devtools -> Application tab -> Manifest to confirm your `manifest.json` is detected.
   - If the browser supports PWA installation, you will see the native "Add to Home screen" prompt. The app also exposes a manual install button in the mobile header menu (⋯) when the browser triggers the `beforeinstallprompt` event.
   - Note: For a production PWA you should provide dedicated PNG icons at 192x192 and 512x512 sizes and update `manifest.json` accordingly.

 
