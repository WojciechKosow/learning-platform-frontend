export const THEME_KEY = "codetta.theme";

/**
 * Runs in <head> before the first paint, so a saved light theme never flashes
 * dark (the server always renders the dark default).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
