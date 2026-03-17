import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getApp } from "firebase/app";

/**
 * Uploads an image File to Firebase Storage and returns its public download URL.
 * Images are stored under `content-images/` with a timestamp + original filename.
 */
export async function uploadImage(file: File): Promise<string> {
  const storage = getStorage(getApp());
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageRef = ref(storage, `content-images/${timestamp}-${safeName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
