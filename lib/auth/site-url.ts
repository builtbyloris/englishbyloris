const LOCAL_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  const candidate = value.startsWith("http") ? value : `https://${value}`;

  try {
    const url = new URL(candidate);

    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  const candidates = [
    ["NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL],
    ["NEXT_PUBLIC_VERCEL_URL", process.env.NEXT_PUBLIC_VERCEL_URL],
    ["VERCEL_URL", process.env.VERCEL_URL],
  ] as const;

  for (const [name, value] of candidates) {
    if (!value) {
      continue;
    }

    const siteUrl = normalizeSiteUrl(value);

    if (!siteUrl) {
      throw new Error(`${name} must be a valid HTTP(S) origin.`);
    }

    return siteUrl;
  }

  return LOCAL_SITE_URL;
}

export function toSiteUrl(path: `/${string}`) {
  if (path.startsWith("//")) {
    throw new Error("Site redirects must use an application-relative path.");
  }

  return new URL(path, getSiteUrl());
}
