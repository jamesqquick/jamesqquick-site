import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Font loading — read from node_modules at script start (no network needed)
// ---------------------------------------------------------------------------

// Satori requires woff or TTF — not woff2.
// Use @fontsource/space-grotesk and @fontsource/inter (non-variable) which ship woff files.

function loadFont(filePath: string): Buffer {
  try {
    return readFileSync(filePath);
  } catch {
    throw new Error(
      `gen-covers: font file not found at ${filePath}\nRun \`pnpm install\` to restore node_modules.`
    );
  }
}

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const FONTS_DIR_SPACE_GROTESK = join(
  __dirname,
  "../node_modules/@fontsource/space-grotesk/files"
);
const FONTS_DIR_INTER = join(
  __dirname,
  "../node_modules/@fontsource/inter/files"
);

const spaceGroteskData = loadFont(
  join(FONTS_DIR_SPACE_GROTESK, "space-grotesk-latin-700-normal.woff")
);
const interData = loadFont(
  join(FONTS_DIR_INTER, "inter-latin-400-normal.woff")
);

// ---------------------------------------------------------------------------
// Design tokens — mirrored from src/styles/tokens.css
// ---------------------------------------------------------------------------

const BG = "#0b1020";
const TEXT = "#f8fafc";
const ACCENT = "#0AFA94";
const TEXT_SUBTLE = "#94a3b8";
const SAFE = 72; // px inset from each edge

// ---------------------------------------------------------------------------
// Tag colour map
// ---------------------------------------------------------------------------

type TagStyle = { bg: string; text: string; border: string };

const NEUTRAL_TAG: TagStyle = {
  bg: "rgba(203,213,225,0.1)",
  text: "#94a3b8",
  border: "rgba(203,213,225,0.2)",
};

const AI_TAG: TagStyle    = { bg: "rgba(53,207,255,0.16)",  text: "#35cfff", border: "rgba(53,207,255,0.3)" };
const GREEN_TAG: TagStyle = { bg: "rgba(10,250,148,0.16)",  text: "#0AFA94", border: "rgba(10,250,148,0.3)" };
const PINK_TAG: TagStyle  = { bg: "rgba(255,107,138,0.16)", text: "#ff6b8a", border: "rgba(255,107,138,0.3)" };
const BLUE_TAG: TagStyle  = { bg: "rgba(99,102,241,0.16)",  text: "#a5b4fc", border: "rgba(99,102,241,0.3)" };
const GOLD_TAG: TagStyle  = { bg: "rgba(246,196,83,0.14)",  text: "#f6c453", border: "rgba(246,196,83,0.3)" };

const TAG_MAP: Record<string, TagStyle> = {
  // ai
  ai: AI_TAG, chatgpt: AI_TAG, openai: AI_TAG, claude: AI_TAG,
  // learning
  learning: GREEN_TAG, javascript: GREEN_TAG, typescript: GREEN_TAG,
  css: GREEN_TAG, html: GREEN_TAG, react: GREEN_TAG, nodejs: GREEN_TAG,
  nextjs: GREEN_TAG, astro: GREEN_TAG, vscode: GREEN_TAG, svelte: GREEN_TAG,
  // speaking
  speaking: PINK_TAG, career: PINK_TAG,
  // web
  web: BLUE_TAG, webdev: BLUE_TAG,
  // tools
  tools: GOLD_TAG, cloudflare: GOLD_TAG,
};

function tagStyle(tag: string | undefined): TagStyle | null {
  if (!tag) return null;
  return TAG_MAP[tag.toLowerCase()] ?? NEUTRAL_TAG;
}

// ---------------------------------------------------------------------------
// NameLogo SVG path — inlined from src/components/NameLogo.astro
// Rendered as an inline <svg> element inside the satori template.
// ---------------------------------------------------------------------------

const LOGO_PATH =
  "M3.824 52.1337C11.6 52.1337 15.344 48.1737 15.344 39.8937V1.4457H7.424V40.1097C7.424 43.4217 5.912 44.9337 2.744 44.9337C1.88 44.9337 1.016 44.8617 0.152 44.6457V51.8457C1.304 52.0617 2.384 52.1337 3.824 52.1337ZM20.2181 51.8457H27.5621L29.0021 41.9817H38.0021V41.8377L39.4421 51.8457H47.3621L39.1541 1.4457H28.4261L20.2181 51.8457ZM29.9381 35.1417L33.3941 10.2297H33.5381L37.0661 35.1417H29.9381ZM52.6445 51.8457H59.5565V13.6857H59.7005L65.4605 51.8457H72.0845L77.8445 13.6857H77.9885V51.8457H85.4765V1.4457H74.1725L69.1325 37.5177H68.9885L63.9485 1.4457H52.6445V51.8457ZM92.8267 51.8457H114.427V44.6457H100.747V29.1657H111.619V21.9657H100.747V8.6457H114.427V1.4457H92.8267V51.8457ZM130.86 52.5657C138.636 52.5657 142.812 47.9577 142.812 39.7497C142.812 33.4857 140.724 29.4537 134.1 23.6217C128.916 19.0857 127.26 16.4217 127.26 12.7497C127.26 9.2937 128.7 7.9257 131.22 7.9257C133.74 7.9257 135.18 9.2937 135.18 12.8937V15.4857H142.668V13.3977C142.668 5.3337 138.852 0.7257 131.148 0.7257C123.444 0.7257 119.34 5.3337 119.34 13.2537C119.34 19.0137 121.5 23.1177 128.124 28.9497C133.308 33.4857 134.892 36.1497 134.892 40.3257C134.892 44.0697 133.308 45.3657 130.788 45.3657C128.268 45.3657 126.684 44.0697 126.684 40.4697V37.0137H119.196V39.8937C119.196 47.9577 123.084 52.5657 130.86 52.5657ZM185.092 56.5257H187.18V49.3257H185.956C184.516 49.3257 183.58 49.1817 183.004 48.1737C184.444 46.0857 185.236 43.3497 185.236 39.8937V13.3977C185.236 5.3337 180.988 0.7257 173.212 0.7257C165.436 0.7257 161.188 5.3337 161.188 13.3977V39.8937C161.188 47.9577 165.436 52.5657 173.212 52.5657C175.156 52.5657 176.956 52.2777 178.468 51.7017C179.404 55.4457 182.14 56.5257 185.092 56.5257ZM173.212 45.3657C170.692 45.3657 169.108 43.9977 169.108 40.3977V12.8937C169.108 9.2937 170.692 7.9257 173.212 7.9257C175.732 7.9257 177.316 9.2937 177.316 12.8937V40.3977C177.316 43.9977 175.732 45.3657 173.212 45.3657ZM228.331 56.5257H230.419V49.3257H229.195C227.755 49.3257 226.819 49.1817 226.243 48.1737C227.683 46.0857 228.475 43.3497 228.475 39.8937V13.3977C228.475 5.3337 224.227 0.7257 216.451 0.7257C208.675 0.7257 204.427 5.3337 204.427 13.3977V39.8937C204.427 47.9577 208.675 52.5657 216.451 52.5657C218.395 52.5657 220.195 52.2777 221.707 51.7017C222.643 55.4457 225.379 56.5257 228.331 56.5257ZM216.451 45.3657C213.931 45.3657 212.347 43.9977 212.347 40.3977V12.8937C212.347 9.2937 213.931 7.9257 216.451 7.9257C218.971 7.9257 220.555 9.2937 220.555 12.8937V40.3977C220.555 43.9977 218.971 45.3657 216.451 45.3657ZM246.791 52.5657C254.567 52.5657 258.599 47.9577 258.599 39.8937V1.4457H250.967V40.4697C250.967 44.0697 249.455 45.3657 246.935 45.3657C244.415 45.3657 242.903 44.0697 242.903 40.4697V1.4457H234.983V39.8937C234.983 47.9577 239.015 52.5657 246.791 52.5657ZM265.68 51.8457H273.6V1.4457H265.68V51.8457ZM292.132 52.5657C299.764 52.5657 303.796 47.9577 303.796 40.1817V33.0537H296.308V40.7577C296.308 44.0697 294.724 45.3657 292.348 45.3657C289.972 45.3657 288.388 44.0697 288.388 40.7577V12.6057C288.388 9.2937 289.972 7.9257 292.348 7.9257C294.724 7.9257 296.308 9.2937 296.308 12.6057V18.4377H303.796V13.1097C303.796 5.3337 299.764 0.7257 292.132 0.7257C284.5 0.7257 280.468 5.3337 280.468 13.1097V40.1817C280.468 47.9577 284.5 52.5657 292.132 52.5657ZM309.974 51.8457H317.894V35.7897L321.062 29.3817L327.758 51.8457H336.038L326.462 19.9497L335.894 1.4457H327.974L317.894 22.6857V1.4457H309.974V51.8457Z";

// Logo renders at ~200px wide (natural viewBox is 337×57)
const LOGO_W = 200;
const LOGO_H = Math.round((LOGO_W / 337) * 57); // ≈ 34

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

function CoverTemplate({
  title,
  tag,
}: {
  title: string;
  tag?: string;
}): React.ReactElement {
  const ts = tagStyle(tag);
  // Scale font down for longer titles
  const titleSize = title.length > 80 ? 48 : title.length > 55 ? 60 : 72;

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        background: BG,
        display: "flex",
        flexDirection: "column",
        padding: SAFE,
        boxSizing: "border-box",
        position: "relative",
        fontFamily: "Space Grotesk",
      }}
    >
      {/* Content: tag + title + bar — vertically centered in the canvas */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
        }}
      >
        {/* Tag pill — only rendered if tag is present */}
        {ts && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: ts.bg,
              border: `1px solid ${ts.border}`,
              borderRadius: 8,
              paddingLeft: 18,
              paddingRight: 18,
              paddingTop: 8,
              paddingBottom: 8,
              marginBottom: 36,
              alignSelf: "flex-start",
            }}
          >
            <span
              style={{
                fontFamily: "Inter",
                fontSize: 22,
                color: ts.text,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {tag}
            </span>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontFamily: "Space Grotesk",
            fontSize: titleSize,
            fontWeight: 700,
            color: TEXT,
            lineHeight: 1.08,
            maxWidth: 1050,
          }}
        >
          {title}
        </div>

        {/* Accent bar */}
        <div
          style={{
            width: 100,
            height: 5,
            borderRadius: 3,
            background: ACCENT,
            marginTop: 36,
          }}
        />
      </div>

      {/* Footer: wordmark left, URL right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Real NameLogo SVG path inlined */}
        <svg
          width={LOGO_W}
          height={LOGO_H}
          viewBox="0 0 337 57"
          style={{ fill: ACCENT }}
        >
          <path d={LOGO_PATH} />
        </svg>

        <span
          style={{
            fontFamily: "Inter",
            fontSize: 22,
            color: TEXT_SUBTLE,
            letterSpacing: "0.04em",
          }}
        >
          jamesqquick.com
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function renderCover(opts: {
  title: string;
  tag?: string;
}): Promise<Buffer> {
  const svg = await satori(<CoverTemplate title={opts.title} tag={opts.tag} />, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Space Grotesk",
        data: spaceGroteskData,
        weight: 700,
        style: "normal",
      },
      {
        name: "Inter",
        data: interData,
        weight: 400,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });
  return Buffer.from(resvg.render().asPng());
}
