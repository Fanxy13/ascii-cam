/* ASCII-Cam — webcam to text, entirely client side. */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

  /* Glyph cell proportions: monospace characters are about half as wide as
     they are tall, and the renderer needs that ratio to keep faces round. */
  const CHAR_ASPECT = 0.5;
  const STORE_KEY = "ascii-cam:v1";

  const DEFAULTS = {
    ramp: 0,
    palette: 0,
    cols: 140,
    contrast: 1.25,
    brightness: 0,
    gamma: 1,
    weight: 1,
    truecolor: false,
    invert: false,
    mirror: true,
    scanlines: true,
    vignette: true,
    bloom: true,
    panelOpen: true
  };

  const state = load();

  const out = $("out");
  const ctx = out.getContext("2d", { alpha: false });
  const src = document.createElement("canvas");
  const sctx = src.getContext("2d", { alpha: false, willReadFrequently: true });

  const video = document.createElement("video");
  video.playsInline = true;
  video.muted = true;

  let stream = null;
  let cameras = [];
  let camIndex = 0;
  let mode = "idle";           // idle | camera | demo
  let lastText = "";
  let recorder = null;
  let recChunks = [];
  let grid = { cols: 0, rows: 0, cellW: 0, cellH: 0 };
  let frames = 0;
  let fpsStamp = performance.now();

  /* ---------- persistence ---------- */

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? Object.assign({}, DEFAULTS, JSON.parse(raw)) : Object.assign({}, DEFAULTS);
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      /* private mode, quota, blocked storage — the app works without it */
    }
  }

  /* ---------- ui feedback ---------- */

  let toastTimer = 0;
  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1700);
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function stamp() {
    return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  }

  /* ---------- sources ---------- */

  async function startCamera(deviceId) {
    stopStream();
    const video_constraints = deviceId
      ? { deviceId: { exact: deviceId } }
      : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } };
    stream = await navigator.mediaDevices.getUserMedia({ video: video_constraints, audio: false });
    video.srcObject = stream;
    await video.play();
    cameras = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput");
    mode = "camera";
    $("splash").classList.add("gone");
  }

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  }

  function startDemo() {
    stopStream();
    mode = "demo";
    $("splash").classList.add("gone");
  }

  /* A slow plasma field, so the page still shows what it does when the
     camera is unavailable or the permission was declined. */
  function drawDemo(t) {
    const { cols, rows } = grid;
    const img = sctx.createImageData(cols, rows);
    const d = img.data;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const u = x / cols, v = y / rows;
        let n = Math.sin(u * 9 + t * 0.7) + Math.sin(v * 11 - t * 0.5);
        n += Math.sin((u + v) * 7 + t * 0.9);
        n += Math.sin(Math.hypot(u - 0.5, v - 0.5) * 18 - t * 1.6);
        const lum = clamp((n + 4) / 8, 0, 1);
        const i = (y * cols + x) * 4;
        d[i] = 120 + lum * 135;
        d[i + 1] = 60 + lum * 195;
        d[i + 2] = 200 - lum * 90;
        d[i + 3] = 255;
      }
    }
    sctx.putImageData(img, 0, 0);
  }

  /* ---------- layout ---------- */

  function sourceSize() {
    if (mode === "camera" && video.videoWidth) {
      return { w: video.videoWidth, h: video.videoHeight };
    }
    return { w: 16, h: 9 };
  }

  function layout() {
    const stage = $("stage");
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    const s = sourceSize();

    const cols = state.cols;
    const rows = Math.max(2, Math.round(cols * (s.h / s.w) * CHAR_ASPECT));

    const availW = stage.clientWidth;
    const availH = stage.clientHeight;
    let cellW = availW / cols;
    let cellH = cellW / CHAR_ASPECT;
    if (rows * cellH > availH) {
      cellH = availH / rows;
      cellW = cellH * CHAR_ASPECT;
    }

    grid = { cols, rows, cellW: cellW * dpr, cellH: cellH * dpr };

    if (src.width !== cols || src.height !== rows) {
      src.width = cols;
      src.height = rows;
    }

    const w = Math.round(cols * grid.cellW);
    const h = Math.round(rows * grid.cellH);
    if (out.width !== w || out.height !== h) {
      out.width = w;
      out.height = h;
    }
    out.style.width = Math.round(cols * cellW) + "px";
    out.style.height = Math.round(rows * cellH) + "px";

    $("hud-grid").textContent = cols + "\u00d7" + rows;
  }

  /* ---------- render ---------- */

  const lumBuf = { lvl: new Uint8Array(0), idx: new Uint16Array(0) };

  function ensureBuffers(n) {
    if (lumBuf.lvl.length !== n) {
      lumBuf.lvl = new Uint8Array(n);
      lumBuf.idx = new Uint16Array(n);
    }
  }

  function grab() {
    const { cols, rows } = grid;
    if (mode === "camera") {
      sctx.save();
      if (state.mirror) {
        sctx.translate(cols, 0);
        sctx.scale(-1, 1);
      }
      sctx.drawImage(video, 0, 0, cols, rows);
      sctx.restore();
    } else {
      drawDemo(performance.now() / 1000);
    }
    return sctx.getImageData(0, 0, cols, rows);
  }

  function render(now) {
    requestAnimationFrame(render);
    if (mode === "idle") return;
    if (mode === "camera" && video.readyState < 2) return;

    layout();
    const { cols, rows, cellW, cellH } = grid;
    const n = cols * rows;
    ensureBuffers(n);

    const ramp = RAMPS[state.ramp % RAMPS.length];
    const pal = PALETTES[state.palette % PALETTES.length];
    const chars = ramp.chars;
    const last = chars.length - 1;
    const levels = pal.colors.length;
    const flip = state.invert !== Boolean(pal.light);

    const frame = grab().data;
    const inv = 1 / 255;
    const gexp = 1 / state.gamma;

    const lines = new Array(rows);
    let rowChars = new Array(cols);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const p = i * 4;
        let l = (0.2126 * frame[p] + 0.7152 * frame[p + 1] + 0.0722 * frame[p + 2]) * inv;
        l = (l - 0.5) * state.contrast + 0.5 + state.brightness;
        l = clamp(l, 0, 1);
        if (gexp !== 1) l = Math.pow(l, gexp);
        if (flip) l = 1 - l;
        const ci = (l * last + 0.5) | 0;
        lumBuf.idx[i] = ci;
        lumBuf.lvl[i] = levels === 1 ? 0 : Math.min(levels - 1, (l * levels) | 0);
        rowChars[x] = chars[ci];
      }
      lines[y] = rowChars.join("");
    }
    lastText = lines.join("\n");

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.font = Math.round(cellH * state.weight) + "px " + getComputedStyle(document.body).fontFamily;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    const halfW = cellW / 2;
    const halfH = cellH / 2;

    if (state.truecolor) {
      for (let i = 0; i < n; i++) {
        const ch = chars[lumBuf.idx[i]];
        if (ch === " ") continue;
        const p = i * 4;
        ctx.fillStyle = "rgb(" + frame[p] + "," + frame[p + 1] + "," + frame[p + 2] + ")";
        ctx.fillText(ch, (i % cols) * cellW + halfW, ((i / cols) | 0) * cellH + halfH);
      }
    } else {
      /* One pass per palette colour keeps fillStyle changes down to a
         handful per frame instead of one per glyph. */
      for (let p = 0; p < levels; p++) {
        ctx.fillStyle = pal.colors[p];
        for (let i = 0; i < n; i++) {
          if (lumBuf.lvl[i] !== p) continue;
          const ch = chars[lumBuf.idx[i]];
          if (ch === " ") continue;
          ctx.fillText(ch, (i % cols) * cellW + halfW, ((i / cols) | 0) * cellH + halfH);
        }
      }
    }

    frames++;
    if (now - fpsStamp >= 500) {
      $("hud-fps").textContent = Math.round((frames * 1000) / (now - fpsStamp)) + " fps";
      frames = 0;
      fpsStamp = now;
    }
  }

  /* ---------- exports ---------- */

  function savePNG() {
    out.toBlob((b) => {
      download(b, "ascii-cam-" + stamp() + ".png");
      toast("PNG saved");
    }, "image/png");
  }

  function saveTXT() {
    download(new Blob([lastText], { type: "text/plain" }), "ascii-cam-" + stamp() + ".txt");
    toast("Text saved");
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(lastText);
      toast("Frame copied");
    } catch (e) {
      toast("Clipboard blocked");
    }
  }

  function toggleRecord() {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      toast("Recording unsupported");
      return;
    }
    const types = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    const type = types.find((t) => MediaRecorder.isTypeSupported(t));
    if (!type) {
      toast("Recording unsupported");
      return;
    }
    recChunks = [];
    recorder = new MediaRecorder(out.captureStream(30), { mimeType: type });
    recorder.ondataavailable = (e) => e.data.size && recChunks.push(e.data);
    recorder.onstop = () => {
      download(new Blob(recChunks, { type }), "ascii-cam-" + stamp() + ".webm");
      $("record").textContent = "Record";
      $("record").classList.remove("recording");
      $("rec-dot").hidden = true;
      toast("Clip saved");
    };
    recorder.start();
    $("record").textContent = "Stop";
    $("record").classList.add("recording");
    $("rec-dot").hidden = false;
  }

  async function switchCamera() {
    if (mode !== "camera") return toast("Camera is off");
    if (cameras.length < 2) return toast("Only one camera");
    camIndex = (camIndex + 1) % cameras.length;
    try {
      await startCamera(cameras[camIndex].deviceId);
      toast(cameras[camIndex].label || "Camera " + (camIndex + 1));
    } catch (e) {
      toast("Could not switch");
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else $("stage").requestFullscreen && $("stage").requestFullscreen();
  }

  /* ---------- wiring ---------- */

  function fillSelect(sel, items) {
    sel.innerHTML = "";
    items.forEach((it, i) => {
      const o = document.createElement("option");
      o.value = String(i);
      o.textContent = it.name;
      sel.appendChild(o);
    });
  }

  function syncUI() {
    $("charset").value = String(state.ramp);
    $("palette").value = String(state.palette);
    $("ramp-preview").textContent = RAMPS[state.ramp].chars;

    const pal = PALETTES[state.palette];
    $("swatches").innerHTML = "";
    pal.colors.forEach((c) => {
      const i = document.createElement("i");
      i.style.background = c;
      $("swatches").appendChild(i);
    });

    [["cols", 0], ["contrast", 2], ["brightness", 2], ["gamma", 2], ["weight", 2]].forEach(([k, dp]) => {
      $(k).value = state[k];
      $(k + "-val").textContent = Number(state[k]).toFixed(dp);
    });

    ["truecolor", "invert", "mirror", "scanlines", "vignette", "bloom"].forEach((k) => {
      $(k).checked = state[k];
    });

    $("overlay").className = (state.scanlines ? "scanlines " : "") + (state.vignette ? "vignette" : "");
    /* Bloom is a glow around light glyphs; on a light palette it only muddies
       the ink, so it stays off there regardless of the checkbox. */
    out.classList.toggle("bloom", state.bloom && !pal.light);
    out.style.color = pal.colors[Math.min(pal.colors.length - 1, 3)];

    const hud = $("hud");
    hud.style.color = pal.light ? pal.colors[pal.colors.length - 1] : "";
    hud.style.textShadow = pal.light ? "0 1px 2px rgba(255, 255, 255, 0.7)" : "";
    document.body.style.background = pal.bg;
    $("stage").style.background = pal.bg;
    $("hud-mode").textContent = state.truecolor ? "rgb" : pal.name.toLowerCase();

    $("panel").classList.toggle("hidden", !state.panelOpen);
    $("panel-toggle").setAttribute("aria-expanded", String(state.panelOpen));

    save();
  }

  function bind() {
    fillSelect($("charset"), RAMPS);
    fillSelect($("palette"), PALETTES);

    $("charset").onchange = (e) => { state.ramp = +e.target.value; syncUI(); };
    $("palette").onchange = (e) => { state.palette = +e.target.value; syncUI(); };

    ["cols", "contrast", "brightness", "gamma", "weight"].forEach((k) => {
      $(k).oninput = (e) => { state[k] = +e.target.value; syncUI(); };
    });

    ["truecolor", "invert", "mirror", "scanlines", "vignette", "bloom"].forEach((k) => {
      $(k).onchange = (e) => { state[k] = e.target.checked; syncUI(); };
    });

    $("snap").onclick = savePNG;
    $("txt").onclick = saveTXT;
    $("copy").onclick = copyText;
    $("record").onclick = toggleRecord;
    $("flip").onclick = switchCamera;
    $("full").onclick = toggleFullscreen;
    $("reset").onclick = () => {
      Object.assign(state, DEFAULTS);
      syncUI();
      toast("Settings reset");
    };

    $("panel-toggle").onclick = () => { state.panelOpen = !state.panelOpen; syncUI(); };

    $("start").onclick = async () => {
      try {
        await startCamera();
      } catch (e) {
        toast("Camera denied — showing demo");
        startDemo();
      }
    };
    $("demo").onclick = startDemo;

    document.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      const cycle = (key, list, d) => { state[key] = (state[key] + d + list.length) % list.length; syncUI(); };
      if (k === "h") { state.panelOpen = !state.panelOpen; syncUI(); }
      else if (k === "s") savePNG();
      else if (k === "c") copyText();
      else if (k === "t") saveTXT();
      else if (k === "r") toggleRecord();
      else if (k === "f") switchCamera();
      else if (k === "i") { state.invert = !state.invert; syncUI(); }
      else if (k === "m") { state.mirror = !state.mirror; syncUI(); }
      else if (e.key === "Enter") toggleFullscreen();
      else if (e.key === "ArrowRight") cycle("ramp", RAMPS, 1);
      else if (e.key === "ArrowLeft") cycle("ramp", RAMPS, -1);
      else if (e.key === "ArrowDown") cycle("palette", PALETTES, 1);
      else if (e.key === "ArrowUp") cycle("palette", PALETTES, -1);
      else return;
      e.preventDefault();
    });

    window.addEventListener("beforeunload", stopStream);
  }

  function splashArt() {
    $("splash-art").textContent = [
      "   .---------------.   ",
      "  /                 \\  ",
      " |   .-----------.   | ",
      " |   |  o     o  |   | ",
      " |   |     _     |   | ",
      " |   |  \\_____/  |   | ",
      " |   '-----------'   | ",
      "  \\_________________/  "
    ].join("\n");
  }

  splashArt();
  bind();
  syncUI();
  layout();
  requestAnimationFrame(render);
})();
