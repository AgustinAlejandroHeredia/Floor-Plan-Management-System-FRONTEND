export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const getCroppedImg = async (
  image: HTMLImageElement,
  crop: CropArea,
  filename: string = "cropped.png"
): Promise<File> => {

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No canvas context");

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error("Canvas is empty");

      resolve(
        new File([blob], filename, {
          type: "image/png",
          lastModified: Date.now(),
        })
      );
    }, "image/png");
  });
};