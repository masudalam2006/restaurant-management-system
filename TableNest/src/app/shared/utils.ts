export const round2 = (n: number) => Math.round(n * 100) / 100;
const pad = (n: number) => String(n).padStart(2, '0');

/** Local date key like 2026-11-03 */
export const dateKey = (d: Date | string) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
};
export const monthKey = (d: Date | string) => dateKey(d).slice(0, 7);

/** Shrinks an uploaded image so it fits comfortably in localStorage. */
export function resizeImage(file: File, max = 420): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Not a valid image'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
