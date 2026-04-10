export interface CropArea {
  width: number;
  height: number;
  x: number;
  y: number;
}

export const getCroppedImg = async (
  imageSrc: string,
  crop: CropArea,
  filename: string = "cropped.png"
): Promise<File> => {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No canvas context");

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error("Canvas is empty");

      const file = new File([blob], filename, {
        type: blob.type,
        lastModified: Date.now(),
      });

      resolve(file);
    }, "image/png");
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = reject;
  });