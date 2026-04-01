import { useState, useEffect } from "react";

type Lang = "en" | "fr";
type Platform = "ios" | "android" | "desktop" | "ios-chrome";

const S = {
  en: {
    title: "Install Hissado",
    tagline: "Add Hissado to your home screen for a native app experience — no App Store required.",
    iosTitle: "Install on iPhone / iPad",
    iosChromeBanner: "For the best experience on iOS, please open this page in Safari.",
    iosChromeBtn: "Open in Safari",
    iosStep1: "Tap the Share button at the bottom of Safari",
    iosStep2: 'Scroll down and tap "Add to Home Screen"',
    iosStep3: 'Tap "Add" to confirm',
    iosStep4: "Open Hissado from your home screen — it works just like a native app",
    androidTitle: "Install on Android",
    androidStep1: "Tap the menu button (⋮) in the top-right of your browser",
    androidStep2: 'Tap "Add to Home Screen" or "Install app"',
    androidStep3: "Confirm the installation",
    androidStep4: "Hissado appears on your home screen — fully installed",
    androidBtn: "Install App",
    desktopTitle: "Open on Mobile",
    desktopDesc: "Scan the QR code below or send the install link to your phone to add Hissado to your home screen.",
    desktopLink: "Or copy the install link:",
    desktopCopy: "Copy link",
    desktopCopied: "Copied!",
    features: "What you get after installing",
    f1: "Works offline — access your projects even without internet",
    f2: "Push notifications for task updates and messages",
    f3: "Full-screen, no browser chrome — feels native",
    f4: "Fast launch directly from your home screen",
    signIn: "Sign in to Hissado",
    footer: "Hissado Project Management · hissadoconsulting.com",
  },
  fr: {
    title: "Installer Hissado",
    tagline: "Ajoutez Hissado à votre écran d'accueil pour une expérience native — sans passer par l'App Store.",
    iosTitle: "Installer sur iPhone / iPad",
    iosChromeBanner: "Pour une meilleure expérience sur iOS, veuillez ouvrir cette page dans Safari.",
    iosChromeBtn: "Ouvrir dans Safari",
    iosStep1: "Appuyez sur le bouton Partager en bas de Safari",
    iosStep2: '« Ajouter à l\'écran d\'accueil »',
    iosStep3: '« Ajouter » pour confirmer',
    iosStep4: "Ouvrez Hissado depuis votre écran d'accueil — comme une vraie application",
    androidTitle: "Installer sur Android",
    androidStep1: "Appuyez sur le menu (⋮) en haut à droite de votre navigateur",
    androidStep2: '« Ajouter à l\'écran d\'accueil » ou « Installer l\'application »',
    androidStep3: "Confirmez l'installation",
    androidStep4: "Hissado apparaît sur votre écran d'accueil — entièrement installé",
    androidBtn: "Installer l'application",
    desktopTitle: "Ouvrir sur mobile",
    desktopDesc: "Scannez le QR code ci-dessous ou envoyez le lien d'installation sur votre téléphone pour ajouter Hissado à votre écran d'accueil.",
    desktopLink: "Ou copiez le lien d'installation :",
    desktopCopy: "Copier le lien",
    desktopCopied: "Copié !",
    features: "Ce que vous obtenez après l'installation",
    f1: "Fonctionne hors ligne — accédez à vos projets même sans internet",
    f2: "Notifications push pour les mises à jour et messages",
    f3: "Plein écran, sans barre de navigation — comme une vraie app",
    f4: "Lancement rapide depuis votre écran d'accueil",
    signIn: "Se connecter à Hissado",
    footer: "Hissado Project Management · hissadoconsulting.com",
  },
};

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua);

  if (isIOS && !isSafari) return "ios-chrome";
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "desktop";
}

function detectLang(): Lang {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem("hissado-lang") : null;
  if (stored === "fr" || stored === "en") return stored;
  return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
}

const INSTALL_URL = "https://project.hissadoconsulting.com/install";
const APP_URL = "https://project.hissadoconsulting.com";
const NAVY = "#070D1A";
const GOLD = "#C9A96E";
const GOLD_DARK = "#A8762E";
const BG = "#EFF2F8";
const WHITE = "#FFFFFF";

function HissadoLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
      <div style={{
        width: 52, height: 52,
        background: `linear-gradient(145deg, ${GOLD}, ${GOLD_DARK})`,
        borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 16px rgba(201,169,110,0.35)`,
        flexShrink: 0,
      }}>
        <span style={{
          color: WHITE, fontSize: 28, fontWeight: 800,
          fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1,
        }}>H</span>
      </div>
      <div>
        <div style={{
          fontSize: 18, fontWeight: 800, color: WHITE,
          letterSpacing: "0.12em", fontFamily: "-apple-system, 'Segoe UI', sans-serif",
        }}>HISSADO</div>
        <div style={{
          fontSize: 10, fontWeight: 600, color: GOLD,
          letterSpacing: "0.22em", textTransform: "uppercase" as const,
        }}>PROJECT</div>
      </div>
    </div>
  );
}

function Step({ num, text }: { num: number; text: string }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, boxShadow: `0 2px 8px rgba(201,169,110,0.3)`,
      }}>
        <span style={{ color: WHITE, fontSize: 13, fontWeight: 800 }}>{num}</span>
      </div>
      <p style={{ fontSize: 15, color: "#4A5268", lineHeight: 1.6, margin: "3px 0 0" }}>{text}</p>
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <p style={{ fontSize: 14, color: "#4A5268", margin: 0, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

export default function Install() {
  const [lang, setLang] = useState<Lang>(detectLang);
  const [platform] = useState<Platform>(detectPlatform);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [copied, setCopied] = useState(false);

  const T = S[lang];

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isMobile = platform !== "desktop";

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'DM Sans', 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, ${NAVY} 0%, #0F1E35 100%)`,
        padding: isMobile ? "32px 24px 40px" : "48px 40px 56px",
        textAlign: "center" as const,
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <HissadoLogo />
          <h1 style={{
            fontSize: isMobile ? 28 : 36, fontWeight: 800, color: WHITE,
            margin: "0 0 16px", lineHeight: 1.2,
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}>
            {T.title}
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.7 }}>
            {T.tagline}
          </p>

          {/* Lang toggle */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
            {(["en", "fr"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: "6px 16px", borderRadius: 20,
                  border: `1.5px solid ${lang === l ? GOLD : "rgba(255,255,255,0.2)"}`,
                  background: lang === l ? `${GOLD}20` : "transparent",
                  color: lang === l ? GOLD : "rgba(255,255,255,0.5)",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  letterSpacing: "0.06em", textTransform: "uppercase" as const,
                  transition: "all 0.15s",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 580, margin: "0 auto", padding: isMobile ? "24px 20px 60px" : "40px 24px 80px" }}>

        {/* iOS Chrome warning */}
        {platform === "ios-chrome" && (
          <div style={{
            background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: 14,
            padding: "16px 20px", marginBottom: 24,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ fontSize: 14, color: "#92400E", margin: "0 0 10px", fontWeight: 500, lineHeight: 1.5 }}>
                {T.iosChromeBanner}
              </p>
              <a
                href={`x-safari-https://project.hissadoconsulting.com/install`}
                style={{
                  display: "inline-block", padding: "8px 16px",
                  background: "#92400E", color: WHITE, borderRadius: 8,
                  fontSize: 13, fontWeight: 700, textDecoration: "none",
                }}
              >
                {T.iosChromeBtn}
              </a>
            </div>
          </div>
        )}

        {/* iOS Instructions */}
        {(platform === "ios" || platform === "ios-chrome") && (
          <div style={{
            background: WHITE, borderRadius: 18, padding: "28px 24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)",
            marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: 24 }}>🍎</span>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: 0, fontFamily: "Georgia, serif" }}>
                {T.iosTitle}
              </h2>
            </div>
            <Step num={1} text={T.iosStep1} />
            <Step num={2} text={T.iosStep2} />
            <Step num={3} text={T.iosStep3} />
            <Step num={4} text={T.iosStep4} />

            {/* Visual share icon hint */}
            <div style={{
              marginTop: 20, padding: "14px 18px",
              background: `${GOLD}10`, border: `1px solid ${GOLD}30`, borderRadius: 12,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 28 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </span>
              <p style={{ fontSize: 13, color: "#7C6030", margin: 0, lineHeight: 1.5 }}>
                {lang === "fr"
                  ? "Le bouton Partager ressemble à une boîte avec une flèche vers le haut — en bas de l'écran Safari."
                  : "The Share button looks like a box with an arrow pointing up — at the bottom of Safari."}
              </p>
            </div>
          </div>
        )}

        {/* Android Instructions */}
        {platform === "android" && (
          <div style={{
            background: WHITE, borderRadius: 18, padding: "28px 24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)",
            marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: 24 }}>🤖</span>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: 0, fontFamily: "Georgia, serif" }}>
                {T.androidTitle}
              </h2>
            </div>

            {/* Native install button if available */}
            {deferredPrompt && !installed && (
              <button
                onClick={handleAndroidInstall}
                style={{
                  width: "100%", padding: "16px 24px", marginBottom: 24,
                  background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
                  border: "none", borderRadius: 14, cursor: "pointer",
                  fontSize: 16, fontWeight: 700, color: WHITE,
                  boxShadow: `0 4px 16px rgba(201,169,110,0.4)`,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
              >
                <span style={{ fontSize: 20 }}>⬇️</span>
                {T.androidBtn}
              </button>
            )}

            {installed && (
              <div style={{
                background: "#F0FDF4", border: "1.5px solid #BBF7D0",
                borderRadius: 12, padding: "14px 18px", marginBottom: 20,
                display: "flex", gap: 10, alignItems: "center",
              }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <p style={{ fontSize: 14, color: "#166534", margin: 0, fontWeight: 600 }}>
                  {lang === "fr" ? "Hissado a été installé avec succès !" : "Hissado installed successfully!"}
                </p>
              </div>
            )}

            <Step num={1} text={T.androidStep1} />
            <Step num={2} text={T.androidStep2} />
            <Step num={3} text={T.androidStep3} />
            <Step num={4} text={T.androidStep4} />
          </div>
        )}

        {/* Desktop — QR + copy link */}
        {platform === "desktop" && (
          <div style={{
            background: WHITE, borderRadius: 18, padding: "32px 28px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)",
            marginBottom: 24, textAlign: "center" as const,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 8px", fontFamily: "Georgia, serif" }}>
              {T.desktopTitle}
            </h2>
            <p style={{ fontSize: 14, color: "#6B7A99", margin: "0 0 28px", lineHeight: 1.6 }}>
              {T.desktopDesc}
            </p>

            {/* QR code via Google Charts API */}
            <div style={{
              display: "inline-block", padding: 12, background: WHITE,
              border: `2px solid ${GOLD}40`, borderRadius: 16,
              boxShadow: `0 2px 12px ${GOLD}20`, marginBottom: 24,
            }}>
              <img
                src={`https://chart.googleapis.com/chart?chs=180x180&cht=qr&chl=${encodeURIComponent(INSTALL_URL)}&choe=UTF-8&chld=M|2`}
                alt="QR code to install Hissado"
                width={180}
                height={180}
                style={{ display: "block", borderRadius: 8 }}
              />
            </div>

            <p style={{ fontSize: 13, color: "#9BA3B5", marginBottom: 10 }}>{T.desktopLink}</p>
            <div style={{
              display: "flex", gap: 8, alignItems: "center",
              background: BG, borderRadius: 10, padding: "10px 14px",
              border: `1px solid rgba(0,0,0,0.08)`,
            }}>
              <span style={{
                flex: 1, fontSize: 13, color: NAVY, fontFamily: "monospace",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
              }}>
                {INSTALL_URL}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  flexShrink: 0, padding: "6px 14px", borderRadius: 8,
                  background: copied ? "#10B981" : NAVY, color: WHITE,
                  border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                  transition: "background 0.2s",
                }}
              >
                {copied ? T.desktopCopied : T.desktopCopy}
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        <div style={{
          background: WHITE, borderRadius: 18, padding: "28px 24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)",
          marginBottom: 24,
        }}>
          <h3 style={{
            fontSize: 12, fontWeight: 700, color: NAVY, margin: "0 0 20px",
            textTransform: "uppercase" as const, letterSpacing: "0.08em",
          }}>
            {T.features}
          </h3>
          <Feature icon="📶" text={T.f1} />
          <Feature icon="🔔" text={T.f2} />
          <Feature icon="📱" text={T.f3} />
          <Feature icon="⚡" text={T.f4} />
        </div>

        {/* Sign-in CTA */}
        <a
          href={APP_URL}
          style={{
            display: "block", textAlign: "center" as const,
            padding: "17px 24px", borderRadius: 14,
            background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
            color: WHITE, textDecoration: "none",
            fontSize: 16, fontWeight: 700,
            boxShadow: `0 4px 16px rgba(201,169,110,0.35)`,
            marginBottom: 32,
          }}
        >
          {T.signIn} →
        </a>

        <p style={{ textAlign: "center" as const, fontSize: 11, color: "#9BA3B5" }}>
          {T.footer}
        </p>
      </div>
    </div>
  );
}
