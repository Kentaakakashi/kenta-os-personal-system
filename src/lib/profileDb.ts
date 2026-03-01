import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { OSKey } from "@/lib/profileKeys";

export type ProfileDoc = {
  widgetOrder?: string[];
  widgetSettings?: any;
  customThemes?: any[];
  activeTheme?: any;
  updatedAt?: any;
};

export function profileRef(os: OSKey) {
  return doc(db, "profiles", os);
}

export async function fetchProfile(os: OSKey): Promise<ProfileDoc | null> {
  const snap = await getDoc(profileRef(os));
  return snap.exists() ? (snap.data() as ProfileDoc) : null;
}

export async function writeProfilePartial(os: OSKey, partial: ProfileDoc) {
  await setDoc(
    profileRef(os),
    { ...partial, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export function subscribeProfile(os: OSKey, cb: (doc: ProfileDoc) => void) {
  return onSnapshot(profileRef(os), (snap) => {
    if (!snap.exists()) return;
    cb(snap.data() as ProfileDoc);
  });
}
