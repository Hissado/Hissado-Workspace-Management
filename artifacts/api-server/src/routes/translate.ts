import { Router, type IRouter } from "express";

const router: IRouter = Router();

const LANG_CODES: Record<string, string> = {
  en: "en-US",
  fr: "fr-FR",
  zh: "zh-CN",
  es: "es-ES",
  de: "de-DE",
  ar: "ar-SA",
  pt: "pt-BR",
  ja: "ja-JP",
};

router.post("/translate", async (req, res) => {
  const { text, targetLang } = req.body as { text?: string; targetLang?: string };

  if (!text || !targetLang) {
    res.status(400).json({ error: "text and targetLang are required" });
    return;
  }

  if (text.startsWith("data:image")) {
    res.json({ translatedText: text });
    return;
  }

  const targetCode = LANG_CODES[targetLang] || targetLang;

  if (targetCode.toLowerCase().startsWith("en")) {
    res.json({ translatedText: text });
    return;
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetCode}`;
    const apiRes = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!apiRes.ok) {
      res.status(502).json({ error: `Translation API HTTP error: ${apiRes.status}` });
      return;
    }
    const json = (await apiRes.json()) as {
      responseStatus: number | string;
      responseData?: { translatedText?: string };
      responseDetails?: string;
    };
    if ((json.responseStatus === 200 || json.responseStatus === "200") && json.responseData?.translatedText) {
      res.json({ translatedText: json.responseData.translatedText });
    } else {
      res.status(502).json({ error: json.responseDetails || "Translation unavailable" });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: msg });
  }
});

export default router;
