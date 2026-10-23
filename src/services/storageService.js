// Layanan Upload Berkas Gambar ke Firebase Storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Mengunggah satu gambar dari URI lokal ke Firebase Storage
 * @param {string} localUri - URI gambar lokal dari ImagePicker
 * @param {string} path - subfolder di Firebase Storage (default: 'properties')
 * @returns {Promise<string>} URL publik gambar yang berhasil diunggah
 */
export const uploadImageAsync = async (localUri, path = 'properties') => {
  if (!localUri) throw new Error('URI gambar diperlukan');

  // Jika sudah berupa URL online (https), langsung gunakan
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  try {
    const response = await fetch(localUri);
    const blob = await response.blob();

    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const storageRef = ref(storage, `${path}/${filename}`);

    const snapshot = await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    // Jika terjadi kendala koneksi atau storage rules, kembalikan localUri sebagai fallback agar app tidak crash
    return localUri;
  }
};

/**
 * Mengunggah banyak gambar sekaligus secara paralel
 * @param {Array<string>} localUris
 * @param {string} path
 * @returns {Promise<Array<string>>}
 */
export const uploadMultipleImagesAsync = async (localUris = [], path = 'properties') => {
  if (!localUris || localUris.length === 0) return [];
  const uploadPromises = localUris.map((uri) => uploadImageAsync(uri, path));
  return await Promise.all(uploadPromises);
};

export default {
  uploadImageAsync,
  uploadMultipleImagesAsync,
};
