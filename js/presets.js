/**
 * Character ramps and colour palettes.
 *
 * A ramp runs dark -> light: index 0 is what you see in the shadows, the last
 * character is what you see in the highlights. Because glyphs are drawn light
 * on a dark background, "light" means a dense character that covers more of
 * its cell — so these ramps read as the reverse of the classic Bourke ramp,
 * which assumes ink on white paper.
 *
 * A palette also runs dark -> light. One entry paints the whole frame in that
 * colour; several are picked by luminance. `bg` is the canvas background, and
 * `light: true` marks a palette meant for a light background, which flips the
 * ramp so the image does not come out as a negative.
 */

const RAMPS = [
  { name: "Classic 70",  chars: " .'`^\",;:Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$" },
  { name: "Standard 10", chars: " .:-=+*#%@" },
  { name: "Blocks",      chars: " ░▒▓█" },
  { name: "Minimal",     chars: " .#" },
  { name: "Binary",      chars: " 01" },
  { name: "Braille",     chars: " ⠁⠃⠇⠏⠟⠿⡿⣿" },
  { name: "Hash ladder", chars: " .,:;=+*&%$XW#" },
  { name: "Typewriter",  chars: " .,:!?9876543210eilyrtjfvcxzsuoawmkqbdgnhgJEFCLTYXZSUVAGDRKHBQNWM" },
  { name: "Standard 16",  chars: " .`'\",:;!~+_-?][}{1)(|\\/*#%@$" },
  { name: "Quadrants",    chars: " \u2596\u2598\u259d\u2597\u2590\u258c\u2580\u2584\u259b\u259c\u2599\u259f\u2588" },
  { name: "Shades",       chars: " \u2591\u2592\u2593\u2588\u2588" },
  { name: "Half blocks",  chars: " \u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588" },
  { name: "Left blocks",  chars: " \u258f\u258e\u258d\u258c\u258b\u258a\u2589\u2588" },
  { name: "Braille dense", chars: " \u2801\u2809\u2819\u2839\u283d\u287d\u28fd\u28ff" },
  { name: "Dots & rings", chars: " \u00b7\u2219\u2022\u25cb\u25cf\u25c9\u25cf" },
  { name: "Squares",      chars: " \u00b7\u25ab\u25fd\u25a1\u25fc\u25aa\u25a0" },
  { name: "Triangles",    chars: " \u00b7\u25b5\u25b4\u25b3\u25b2\u25c6" },
  { name: "Diamonds",     chars: " \u00b7\u22c4\u25c7\u25c8\u25c6\u2666" },
  { name: "Stars",        chars: " \u00b7\u02da\u2726\u2727\u2605\u2736\u2739" },
  { name: "Plus grid",    chars: " .\u00b7+\u2020\u2021#\u2593" },
  { name: "Slashes",      chars: " .:/|\\X\u2573\u2588" },
  { name: "Hex digits",   chars: " 0123456789ABCDEF" },
  { name: "Digits",       chars: " 1234567890" },
  { name: "Roman",        chars: " IVXLCDM" },
  { name: "Morse",        chars: " .-\u2013\u2014\u2588" },
  { name: "Lowercase",    chars: " .ijltfrcvxznsueoahkbdpqgwm" },
  { name: "Uppercase",    chars: " .ILJTFCVXZSUEOAHKBDPQGWM" },
  { name: "Vowels",       chars: " .iueoaAEOUI" },
  { name: "Greek",        chars: " .\u03b9\u03c4\u03c5\u03bd\u03c3\u03b5\u03b1\u03c9\u03bc\u03a9\u03a6\u039e" }
];

const PALETTES = [
  { name: "Terminal green", colors: ["#0d3b1e", "#1a7f37", "#3fb950", "#7ee787", "#b9f6ca"], bg: "#020604" },
  { name: "Amber CRT",      colors: ["#3d2200", "#8a4f00", "#cc7a00", "#ffa629", "#ffd7a0"], bg: "#0a0602" },
  { name: "Paper white",    colors: ["#3a3a3a", "#6e6e6e", "#a3a3a3", "#d4d4d4", "#ffffff"], bg: "#050505" },
  { name: "Ink on paper",   colors: ["#c4c4c4", "#999999", "#666666", "#3d3d3d", "#111111"], bg: "#f2efe6", light: true },
  { name: "Ice",            colors: ["#06283d", "#1363a8", "#2a9df4", "#7ec8ff", "#d6f0ff"], bg: "#010912" },
  { name: "Magenta haze",   colors: ["#3d0033", "#8a0070", "#c71fa3", "#ff5ecb", "#ffc2ec"], bg: "#0c0009" },
  { name: "Ember",          colors: ["#2b0a00", "#7a1c00", "#c43b00", "#ff6b2c", "#ffc08a"], bg: "#0a0301" },
  { name: "Mono",           colors: ["#e6edf3"], bg: "#07080a" },
  { name: "Solarized Dark",  colors: ["#073642", "#268bd2", "#2aa198", "#93a1a1", "#fdf6e3"], bg: "#002b36" },
  { name: "Solarized Light", colors: ["#eee8d5", "#93a1a1", "#586e75", "#073642", "#002b36"], bg: "#fdf6e3", light: true },
  { name: "Dracula",         colors: ["#282a36", "#6272a4", "#bd93f9", "#ff79c6", "#f8f8f2"], bg: "#1a1b24" },
  { name: "Nord",            colors: ["#2e3440", "#4c566a", "#81a1c1", "#88c0d0", "#eceff4"], bg: "#242933" },
  { name: "Gruvbox Dark",    colors: ["#32302f", "#7c6f64", "#d79921", "#fabd2f", "#fbf1c7"], bg: "#1d2021" },
  { name: "Gruvbox Light",   colors: ["#ebdbb2", "#bdae93", "#7c6f64", "#504945", "#282828"], bg: "#fbf1c7", light: true },
  { name: "Monokai",         colors: ["#2d2a2e", "#78dce8", "#a9dc76", "#ffd866", "#fcfcfa"], bg: "#221f22" },
  { name: "Tokyo Night",     colors: ["#1f2335", "#414868", "#7aa2f7", "#bb9af7", "#c0caf5"], bg: "#16161e" },
  { name: "Catppuccin Mocha", colors: ["#313244", "#585b70", "#89b4fa", "#f5c2e7", "#cdd6f4"], bg: "#1e1e2e" },
  { name: "Catppuccin Latte", colors: ["#ccd0da", "#9ca0b0", "#7287fd", "#5c5f77", "#4c4f69"], bg: "#eff1f5", light: true },
  { name: "One Dark",        colors: ["#282c34", "#5c6370", "#61afef", "#98c379", "#abb2bf"], bg: "#21252b" },
  { name: "Material",        colors: ["#263238", "#546e7a", "#80cbc4", "#c3e88d", "#eeffff"], bg: "#1e272c" },
  { name: "Ayu Dark",        colors: ["#1f2430", "#465063", "#73d0ff", "#ffd173", "#cbccc6"], bg: "#171b24" },
  { name: "Ayu Light",       colors: ["#e7e8e9", "#abb0b6", "#55b4d4", "#f2ae49", "#5c6166"], bg: "#fcfcfc", light: true },
  { name: "Everforest",      colors: ["#2d353b", "#4f585e", "#83c092", "#a7c080", "#d3c6aa"], bg: "#232a2e" },
  { name: "Rose Pine",       colors: ["#26233a", "#6e6a86", "#9ccfd8", "#ebbcba", "#e0def4"], bg: "#191724" },
  { name: "Rose Pine Dawn",  colors: ["#dfdad9", "#9893a5", "#56949f", "#b4637a", "#575279"], bg: "#faf4ed", light: true },
  { name: "Kanagawa",        colors: ["#2a2a37", "#54546d", "#7e9cd8", "#98bb6c", "#dcd7ba"], bg: "#1f1f28" },
  { name: "Night Owl",       colors: ["#1d3b53", "#5f7e97", "#82aaff", "#addb67", "#d6deeb"], bg: "#011627" },
  { name: "Oceanic",         colors: ["#1b2b34", "#4f5b66", "#6699cc", "#5fb3b3", "#d8dee9"], bg: "#152029" },
  { name: "Cobalt",          colors: ["#122738", "#15537a", "#0088ff", "#ffc600", "#ffffff"], bg: "#002240" },
  { name: "Synthwave",       colors: ["#241b2f", "#495495", "#ff7edb", "#f97e72", "#fdfdfd"], bg: "#181325" },
  { name: "Vaporwave",       colors: ["#2d1b4e", "#7b2d8e", "#e256a0", "#67e8f9", "#fdf4ff"], bg: "#1a0f2e" },
  { name: "Miami",           colors: ["#1a1a2e", "#16213e", "#e94560", "#0f3460", "#f5f5f5"], bg: "#0f0f1e" },
  { name: "Blade Runner",    colors: ["#0b1a2a", "#123a5a", "#00a8cc", "#ff6b35", "#f7f7f2"], bg: "#050d16" },
  { name: "Tron",            colors: ["#001014", "#00404d", "#00a1b8", "#22d3ee", "#e0ffff"], bg: "#000709" },
  { name: "Matrix",          colors: ["#001100", "#004400", "#008f11", "#00ff41", "#ccffcc"], bg: "#000500" },
  { name: "Fallout",         colors: ["#0b1a0b", "#1a3a1a", "#2f7d32", "#41ff00", "#c9ffc9"], bg: "#040a04" },
  { name: "Commodore 64",    colors: ["#40318d", "#7869c4", "#8f8fff", "#b8b8ff", "#ffffff"], bg: "#352879" },
  { name: "ZX Spectrum",     colors: ["#0000c0", "#c000c0", "#00c0c0", "#c0c000", "#ffffff"], bg: "#000000" },
  { name: "Game Boy",        colors: ["#0f380f", "#306230", "#69a338", "#8bac0f", "#9bbc0f"], bg: "#0b2b0b" },
  { name: "Game Boy Pocket", colors: ["#2b2b26", "#54544a", "#8b8b7a", "#b5b5a0", "#c4cfa1"], bg: "#1f1f1c" },
  { name: "Virtual Boy",     colors: ["#200000", "#560000", "#9c0000", "#e00000", "#ff4040"], bg: "#110000" },
  { name: "NES",             colors: ["#0d0d2b", "#3c3cbe", "#6a6aff", "#f8d878", "#fcfcfc"], bg: "#050514" },
  { name: "Apple II",        colors: ["#1a0d2e", "#5c2d91", "#20c20e", "#66ff66", "#e8ffe8"], bg: "#0b0517" },
  { name: "IBM 5151",        colors: ["#0a1a0a", "#1d4d1d", "#33aa33", "#4aff4a", "#b8ffb8"], bg: "#050d05" },
  { name: "VT220",           colors: ["#0a1410", "#17402c", "#2e8b57", "#4ade80", "#ccffe0"], bg: "#050a08" },
  { name: "Hercules",        colors: ["#1a1200", "#4d3800", "#a37400", "#ffb700", "#ffe6a3"], bg: "#0d0900" },
  { name: "Plan 9",          colors: ["#d8d8b8", "#a8a878", "#787848", "#484830", "#1a1a10"], bg: "#ffffea", light: true },
  { name: "Sepia",           colors: ["#2b2116", "#5c4733", "#8f7050", "#c4a179", "#f0e0c8"], bg: "#140f0a" },
  { name: "Blueprint",       colors: ["#0a2342", "#12456b", "#1d6fa5", "#5aa9e6", "#e8f4ff"], bg: "#04162b" }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { RAMPS, PALETTES };
}
