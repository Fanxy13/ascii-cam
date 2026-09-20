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
  { name: "Half blocks",  chars: " \u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588" }
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
  { name: "Gruvbox Light",   colors: ["#ebdbb2", "#bdae93", "#7c6f64", "#504945", "#282828"], bg: "#fbf1c7", light: true }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { RAMPS, PALETTES };
}
