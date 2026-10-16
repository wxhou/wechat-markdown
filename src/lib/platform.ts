/* Tauri 在 WebView 里注入 __TAURI_INTERNALS__；模块级求值即可（注入早于 bundle 执行） */
export const isTauri = '__TAURI_INTERNALS__' in window;
