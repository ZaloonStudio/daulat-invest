type AccountIdentity = {
  uid: string;
  emailVerified: boolean;
  providerData: ReadonlyArray<{ providerId: string }>;
};

// Explicit compatibility link verified against production Auth + Firestore
// and confirmed by the account owner. These are document identifiers, not
// credentials. Never derive a legacy folder from an arbitrary email/hash.
const VERIFIED_LEGACY_LINKS: Readonly<Record<string, string>> = Object.freeze({
  o1LCsgPhCwSWPONPUT2AQzOl20H2: 'google_2094052383',
});

export function accountDataOwner(user: AccountIdentity | null, projectId: string | undefined): string | null {
  if (!user) return null;
  const link = Object.prototype.hasOwnProperty.call(VERIFIED_LEGACY_LINKS, user.uid)
    ? VERIFIED_LEGACY_LINKS[user.uid] : undefined;
  if (projectId === 'zaloon-aecb6' && link && user.emailVerified && user.providerData.some(provider => provider.providerId === 'google.com')) return link;
  return user.uid;
}
