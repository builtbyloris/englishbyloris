import Image from "next/image";

import { ProfilePreferencesForm } from "@/components/profile/profile-preferences-form";
import type { AuthenticatedProfile } from "@/lib/auth/profile";
import { cefrDescriptions } from "@/lib/learning/cefr";

function getInitials(displayName: string | null) {
  if (!displayName) {
    return "EL";
  }

  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function isSupportedAvatarUrl(value: string | null) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      (url.hostname === "googleusercontent.com" ||
        url.hostname.endsWith(".googleusercontent.com"))
    );
  } catch {
    return false;
  }
}

export function ProfileExperience({
  preview = false,
  profile,
}: {
  preview?: boolean;
  profile: AuthenticatedProfile;
}) {
  const displayName = profile.displayName?.trim() || "English learner";
  const levelLabel = profile.englishLevel
    ? `${profile.englishLevel} · ${cefrDescriptions[profile.englishLevel]}`
    : "Level not selected";

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-identity">
          <div className="profile-avatar" aria-hidden="true">
            {isSupportedAvatarUrl(profile.avatarUrl) ? (
              <Image
                alt=""
                height={96}
                priority
                referrerPolicy="no-referrer"
                src={profile.avatarUrl as string}
                unoptimized
                width={96}
              />
            ) : (
              <span>{getInitials(profile.displayName)}</span>
            )}
          </div>
          <div>
            <p className="home-kicker">Your space</p>
            <h1>{displayName}</h1>
            <p>Keep your learning preferences aligned with your goals.</p>
          </div>
        </div>

        <div className="profile-summary" aria-label="Current profile settings">
          <div>
            <span>English level</span>
            <strong>{levelLabel}</strong>
          </div>
          <div>
            <span>Theme preference</span>
            <strong>
              {profile.theme
                ? `${profile.theme === "light" ? "Light" : "Dark"}`
                : "Not selected"}
            </strong>
          </div>
        </div>
      </header>

      <ProfilePreferencesForm
        initialInterests={profile.learningInterests}
        initialLevel={profile.englishLevel}
        initialTheme={profile.theme}
        preview={preview}
      />
    </div>
  );
}
