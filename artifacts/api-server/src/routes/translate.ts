import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { InternalError } from "../lib/errors.js";

const router = Router();

// ── Constants ─────────────────────────────────────────────────────────────────

/** Map of short language codes to BCP 47 locales accepted by MyMemory. */
const LANG_CODE_MAP: Readonly<Record<string, string>> = {
  en: "en-US",
  fr: "fr-FR",
  zh: "zh-CN",
  es: "es-ES",
  de: "de-DE",
  ar: "ar-SA",
  pt: "pt-BR",
  ja: "ja-JP",
};

// ── Schema ────────────────────────────────────────────────────────────────────

const TranslateSchema = z.object({
  text:       z.string().min(1, "text is required").max(5000, "text must be 5 000 characters or fewer"),
  targetLang: z.string().min(2, "targetLang is required").max(10),
});

// ── Route ─────────────────────────────────────────────────────────────────────

/* POST /api/translate */
router.post("/translate", validate(TranslateSchema), async (req, res, next) => {
  const { text, targetLang } = req.body as z.infer<typeof TranslateSchema>;

  // Pass data URIs straight through — they are not translatable text.
  if (text.startsWith("data:")) {
    return res.json({ translatedText: text });
  }

  const targetCode = LANG_CODE_MAP[targetLang] ?? targetLang;

  // If the target is already English there is nothing to translate.
  if (targetCode.toLowerCase().startsWith("en")) {
    return res.json({ translatedText: text });
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${encodeURIComponent(targetCode)}`;
    const apiRes = await fetch(url, { signal: AbortSignal.timeout(8_000) });

    if (!apiRes.ok) {
      return next(new InternalError(`Translation API returned HTTP ${apiRes.status}`));
    }

    const json = (await apiRes.json()) as {
      responseStatus: number | string;
      responseData?: { translatedText?: string };
      responseDetails?: string;
    };

    const status = String(json.responseStatus);
    if (status === "200" && json.responseData?.translatedText) {
      return res.json({ translatedText: json.responseData.translatedText });
    }

    return next(new InternalError(json.responseDetails ?? "Translation unavailable"));
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return next(new InternalError("Translation request timed out"));
    }
    return next(err);
  }
});

export default router;
