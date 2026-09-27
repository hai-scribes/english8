"""A small Gemini client over the REST API — urllib only, no SDK to install.

Three calls, and nothing else:

    generate_image(prompt, refs, aspect, size)  -> (bytes, mime)
    judge(prompt_text, images)                  -> dict parsed from JSON
    list_models()                               -> [model ids that make images]

`generateContent` rather than the newer Interactions API: it is documented as
supported, its shape is stable, and the image models answer on it. Parsing is
deliberately tolerant of both spellings (`inlineData` / `inline_data`) and skips
parts marked `thought` — the image models think before they draw, and an
interim thought image is not the answer.

`transport` is injectable so tools/test_artgen.py can check the request and the
parsing without a key or a network.
"""
import base64
import json
import time
import urllib.error
import urllib.request

from . import config


class GeminiError(RuntimeError):
    pass


def _http(url, body, key, timeout=300):
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(
        url, data=data, method="GET" if body is None else "POST",
        headers={"x-goog-api-key": key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise GeminiError(f"HTTP {e.code}: {e.read().decode(errors='replace')[:800]}")


transport = _http


def _call(model, body, key=None, retries=3):
    key = key or config.api_key()
    url = f"{config.API_BASE}/models/{model}:generateContent"
    for attempt in range(retries):
        try:
            return transport(url, body, key)
        except GeminiError as e:
            # 429 and 5xx are worth waiting out; a 400 is our mistake and
            # repeating it only spends time.
            msg = str(e)
            if attempt + 1 < retries and any(f"HTTP {c}" in msg for c in
                                             ("429", "500", "502", "503", "504")):
                time.sleep(4 * 2 ** attempt)
                continue
            raise


def _parts(resp):
    out = []
    for cand in resp.get("candidates") or []:
        out += (cand.get("content") or {}).get("parts") or []
    return out


def _image_part(img):
    """(bytes, mime) -> a request part."""
    data, mime = img
    return {"inline_data": {"mime_type": mime,
                            "data": base64.b64encode(data).decode()}}


def generate_image(prompt, refs=(), aspect="1:1", size="2K", model=None):
    """One picture. `refs` is a list of (bytes, mime), sent after the text."""
    model = model or config.IMAGE_MODEL
    image_config = {"aspectRatio": aspect}
    if size:
        image_config["imageSize"] = size
    body = {
        "contents": [{"role": "user",
                      "parts": [{"text": prompt}] + [_image_part(r) for r in refs]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"],
                             "imageConfig": image_config},
    }
    try:
        resp = _call(model, body)
    except GeminiError as e:
        # Not every image model takes imageSize. Asking again without it is
        # cheaper than a table of which model accepts what, which would be
        # out of date by the next release.
        if size and "HTTP 400" in str(e) and "imageSize" in str(e):
            return generate_image(prompt, refs, aspect, None, model)
        raise

    images, texts = [], []
    for p in _parts(resp):
        if p.get("thought"):
            continue
        blob = p.get("inlineData") or p.get("inline_data")
        if blob and blob.get("data"):
            images.append((base64.b64decode(blob["data"]),
                           blob.get("mimeType") or blob.get("mime_type") or "image/png"))
        elif p.get("text"):
            texts.append(p["text"])
    if not images:
        why = (resp.get("promptFeedback") or {}).get("blockReason") or \
              next((c.get("finishReason") for c in resp.get("candidates") or []), None)
        raise GeminiError(f"no image returned (reason: {why}; text: "
                          f"{' '.join(texts)[:300]!r})")
    # The last non-thought image is the answer; earlier ones are drafts.
    return images[-1]


def judge(prompt, images, model=None):
    """Ask a vision model to grade `images` and answer in JSON."""
    model = model or config.CRITIC_MODEL
    body = {
        "contents": [{"role": "user",
                      "parts": [{"text": prompt}] + [_image_part(i) for i in images]}],
        "generationConfig": {"responseMimeType": "application/json",
                             "temperature": 0.1},
    }
    resp = _call(model, body)
    text = "".join(p.get("text", "") for p in _parts(resp) if not p.get("thought"))
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # A fenced block is the commonest way a model ignores the mime type.
        s, e = text.find("{"), text.rfind("}")
        if s >= 0 and e > s:
            return json.loads(text[s:e + 1])
        raise GeminiError(f"critic did not answer in JSON: {text[:300]!r}")


def list_models():
    key = config.api_key()
    out, token = [], ""
    while True:
        url = f"{config.API_BASE}/models?pageSize=200" + (f"&pageToken={token}" if token else "")
        resp = transport(url, None, key)
        for m in resp.get("models", []):
            out.append((m["name"].split("/", 1)[-1], m.get("displayName", ""),
                        m.get("supportedGenerationMethods", [])))
        token = resp.get("nextPageToken")
        if not token:
            return out
