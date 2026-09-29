import { readFile, access } from "node:fs/promises";

const requiredFiles = [
  "README.md",
  "PROJECT-SPECIFICATIONS.md",
  "PROJECT-RECORD.md",
  "SPECIFICATIONS.md",
  "FEATURES.md",
  "IMPLEMENTED-FEATURES.md",
  "PLANNED-FEATURES.md",
  "CHANGELOGS.md",
  "BENEFITS.md",
  "COMPETITIVE-OBJECTIVES.md",
  "BRANDING.md",
  "USER-MANUAL.md",
  "PRIVACY.md",
  "PRIVACY POLICY.md",
  "NOTES.md",
  "SECURITY.md",
  "THIRD-PARTY-NOTICES.md",
  "docs/WEATHER-PROVIDERS.md",
  "LICENSE",
  ".gitignore",
  ".editorconfig",
  "goreecloud.platform.yaml",
  "package.json",
  "tsconfig.json",
  "index.html",
  ".env.example",
  "src/main.ts",
  "src/app.ts",
  "src/state/weather-cache.ts",
  "src-tauri/Cargo.toml",
  "src-tauri/tauri.conf.json",
  "src-tauri/capabilities/default.json"
];

const errors = [];

for (const file of requiredFiles) {
  try {
    await access(file);
  } catch {
    errors.push(`Missing required repository file: ${file}`);
  }
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
if (packageJson.name !== "@goreecloud/news-weather") {
  errors.push("package.json name must remain @goreecloud/news-weather");
}
if (packageJson.version !== "0.1.0-dev.0") {
  errors.push("package.json version must remain 0.1.0-dev.0 for this foundation");
}

const tauri = JSON.parse(await readFile("src-tauri/tauri.conf.json", "utf8"));
if (tauri.identifier !== "com.goreecloud.newsweather") {
  errors.push("Tauri identifier must remain com.goreecloud.newsweather");
}
if (tauri.productName !== "News & Weather") {
  errors.push("Tauri productName must remain News & Weather");
}

const platformManifest = await readFile("goreecloud.platform.yaml", "utf8");
for (const expected of [
  "schema_version: '0.4'",
  "version: '1.6.0'",
  "manager:",
  "privacy_shield:",
  "wardveil_security:",
  "everkeep:",
  "glaze_ui:",
  "mesh:",
  "identity:",
  "policy:",
  "observability:"
]) {
  if (!platformManifest.includes(expected)) {
    errors.push(`Platform manifest missing expected marker: ${expected}`);
  }
}

const implemented = await readFile("IMPLEMENTED-FEATURES.md", "utf8");
for (const expected of [
  "source-level evidence",
  "Not yet verified",
  "does **not** establish live-provider runtime acceptance or native target acceptance",
  "Release Candidate, Production, or Stable qualification"
]) {
  if (!implemented.includes(expected)) {
    errors.push(`Implemented-features record is missing truthfulness marker: ${expected}`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Repository baseline verified: ${requiredFiles.length} required files and key authority markers.`);
}
