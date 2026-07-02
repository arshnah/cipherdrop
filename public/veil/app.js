const enc = new TextEncoder();
const dec = new TextDecoder();
const MAGIC = [0x56, 0x45, 0x4c];
const HEADER = 9;

const $ = (id) => document.getElementById(id);
const secure = () => window.isSecureContext && window.crypto && window.crypto.subtle;

async function deriveKey(password, salt) {
  const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}
async function encryptMsg(text, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(text)));
  const out = new Uint8Array(28 + ct.length);
  out.set(salt, 0); out.set(iv, 16); out.set(ct, 28);
  return out;
}
async function decryptMsg(body, password) {
  const salt = body.slice(0, 16), iv = body.slice(16, 28), ct = body.slice(28);
  const key = await deriveKey(password, salt);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return dec.decode(pt);
}

function buildPayload(body, encrypted) {
  const out = new Uint8Array(HEADER + body.length);
  out[0] = MAGIC[0]; out[1] = MAGIC[1]; out[2] = MAGIC[2];
  out[3] = 1;
  out[4] = encrypted ? 1 : 0;
  const n = body.length;
  out[5] = (n >>> 24) & 255; out[6] = (n >>> 16) & 255; out[7] = (n >>> 8) & 255; out[8] = n & 255;
  out.set(body, HEADER);
  return out;
}
function capacityBytes(w, h) { return Math.floor((w * h * 3) / 8) - HEADER; }

function embed(imageData, payload) {
  const d = imageData.data;
  const slots = Math.floor(d.length / 4) * 3;
  if (payload.length * 8 > slots) {
    throw new Error(`this image holds ${Math.floor(slots / 8) - HEADER} bytes, the message needs ${payload.length - HEADER}. pick a larger picture.`);
  }
  let bit = 0;
  for (let i = 0; i < payload.length; i++) {
    for (let b = 7; b >= 0; b--) {
      const px = Math.floor(bit / 3), ch = bit % 3, idx = px * 4 + ch;
      d[idx] = (d[idx] & 0xfe) | ((payload[i] >> b) & 1);
      bit++;
    }
  }
  return imageData;
}
function readBytes(d, startBit, n) {
  const out = new Uint8Array(n);
  let bit = startBit;
  for (let i = 0; i < n; i++) {
    let v = 0;
    for (let b = 0; b < 8; b++) {
      const px = Math.floor(bit / 3), ch = bit % 3;
      v = (v << 1) | (d[px * 4 + ch] & 1);
      bit++;
    }
    out[i] = v;
  }
  return { out, bit };
}
function extract(imageData) {
  const d = imageData.data;
  const head = readBytes(d, 0, HEADER);
  const h = head.out;
  if (h[0] !== MAGIC[0] || h[1] !== MAGIC[1] || h[2] !== MAGIC[2]) {
    throw new Error("no hidden message in this image. it may be an ordinary picture, or it was re-saved as a jpg and the secret got crushed.");
  }
  const encrypted = h[4] === 1;
  const len = ((h[5] << 24) | (h[6] << 16) | (h[7] << 8) | h[8]) >>> 0;
  if (HEADER * 8 + len * 8 > Math.floor(d.length / 4) * 3) throw new Error("the hidden data looks damaged.");
  const body = readBytes(d, head.bit, len).out;
  return { encrypted, body };
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("could not read that image.")); };
    img.src = url;
  });
}
function imageData(img) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return { canvas: c, ctx, data: ctx.getImageData(0, 0, c.width, c.height) };
}
function toPng(canvas) {
  return new Promise((res) => canvas.toBlob((b) => res(URL.createObjectURL(b)), "image/png"));
}

function setErr(el, msg) { if (!msg) { el.hidden = true; el.textContent = ""; } else { el.hidden = false; el.textContent = msg; } }

let hideImg = null, hideCap = 0;
const hideMsg = $("hideMsg"), hidePass = $("hidePass"), hideGo = $("hideGo");

function bindDrop(dropEl, fileEl, onFile) {
  dropEl.addEventListener("click", () => fileEl.click());
  fileEl.addEventListener("change", () => { if (fileEl.files[0]) onFile(fileEl.files[0]); });
  ["dragenter", "dragover"].forEach((e) => dropEl.addEventListener(e, (ev) => { ev.preventDefault(); dropEl.classList.add("drag"); }));
  ["dragleave", "drop"].forEach((e) => dropEl.addEventListener(e, () => dropEl.classList.remove("drag")));
  dropEl.addEventListener("drop", (ev) => {
    ev.preventDefault();
    const f = ev.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) onFile(f);
  });
}

function updateMeter() {
  if (!hideImg) return;
  let used = enc.encode(hideMsg.value).length;
  if (hidePass.value) used += 44;
  const pct = Math.min(100, Math.round((used / hideCap) * 100));
  const bar = $("hideBar"), label = $("hideCap");
  bar.style.width = pct + "%";
  const over = used > hideCap;
  bar.classList.toggle("over", over);
  label.classList.toggle("over", over);
  label.textContent = over
    ? `${used} bytes, only ${hideCap} fit. shorten it or pick a bigger image.`
    : `${used} of ${hideCap.toLocaleString()} bytes used.`;
  hideGo.disabled = used === 0 || over;
}

async function onHideFile(file) {
  setErr($("hideErr"), "");
  $("hideResult").hidden = true;
  try {
    const { img } = await loadImage(file);
    hideImg = img;
    hideCap = capacityBytes(img.naturalWidth, img.naturalHeight);
    $("hidePreview").src = img.src;
    $("hidePreviewWrap").hidden = false;
    $("hideEmpty").hidden = true;
    updateMeter();
  } catch (e) { setErr($("hideErr"), e.message); }
}

async function runHide() {
  setErr($("hideErr"), "");
  if (!hideImg || !hideMsg.value) return;
  const pass = hidePass.value;
  if (pass && !secure()) { setErr($("hideErr"), "encryption needs a secure page (https or localhost). host it or drop the password."); return; }
  hideGo.disabled = true; hideGo.textContent = "hiding...";
  try {
    const body = pass ? await encryptMsg(hideMsg.value, pass) : enc.encode(hideMsg.value);
    const payload = buildPayload(body, !!pass);
    const { canvas, ctx, data } = imageData(hideImg);
    embed(data, payload);
    ctx.putImageData(data, 0, 0);
    const url = await toPng(canvas);
    $("hideOut").src = url;
    $("hideDl").href = url;
    $("hideResult").hidden = false;
  } catch (e) { setErr($("hideErr"), e.message); }
  hideGo.disabled = false; hideGo.textContent = "hide it";
  updateMeter();
}

let revImg = null;
async function onRevFile(file) {
  setErr($("revErr"), "");
  $("revResult").hidden = true;
  try {
    const { img } = await loadImage(file);
    revImg = img;
    $("revPreview").src = img.src;
    $("revPreviewWrap").hidden = false;
    $("revEmpty").hidden = true;
    $("revGo").disabled = false;
  } catch (e) { setErr($("revErr"), e.message); }
}
async function runReveal() {
  setErr($("revErr"), "");
  if (!revImg) return;
  const go = $("revGo"), pass = $("revPass").value;
  go.disabled = true; go.textContent = "scanning...";
  const scan = $("revScan");
  scan.classList.remove("run"); void scan.offsetWidth; scan.classList.add("run");
  try {
    const { data } = imageData(revImg);
    const { encrypted, body } = extract(data);
    let text;
    if (encrypted) {
      if (!pass) throw new Error("this one is locked. type the password it was hidden with.");
      if (!secure()) throw new Error("decryption needs a secure page (https or localhost).");
      try { text = await decryptMsg(body, pass); }
      catch { throw new Error("wrong password, or the image was altered."); }
    } else {
      text = dec.decode(body);
    }
    await new Promise((r) => setTimeout(r, 650));
    $("revMsg").textContent = text;
    $("revResult").hidden = false;
  } catch (e) { setErr($("revErr"), e.message); }
  go.disabled = false; go.textContent = "reveal the message";
}

document.querySelectorAll(".tab").forEach((t) => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("is-on", x === t));
    const name = t.dataset.tab;
    document.querySelectorAll(".pane").forEach((p) => p.classList.toggle("is-on", p.dataset.pane === name));
  });
});

bindDrop($("hideDrop"), $("hideFile"), onHideFile);
bindDrop($("revDrop"), $("revFile"), onRevFile);
hideMsg.addEventListener("input", updateMeter);
hidePass.addEventListener("input", updateMeter);
hideGo.addEventListener("click", runHide);
$("revGo").addEventListener("click", runReveal);
$("revCopy").addEventListener("click", async () => {
  await navigator.clipboard.writeText($("revMsg").textContent);
  const b = $("revCopy"); b.textContent = "copied"; setTimeout(() => (b.textContent = "copy"), 1500);
});
