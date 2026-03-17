import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getApp } from "firebase/app";

/**
 * Uploads an image File to Firebase Storage at full quality
 * and returns its public download URL.
 */
export async function uploadImage(file: File): Promise<string> {
  const storage = getStorage(getApp());
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageRef = ref(storage, `content-images/${timestamp}-${safeName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
