import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker?url";

// ⚠️ necesario para que funcione en Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export interface ConvertedImage {
  file: File;
  name: string;
}

export const convertPdfToImages = async (
  file: File
): Promise<ConvertedImage[]> => {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const images: ConvertedImage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
        canvas,
        canvasContext: context,
        viewport,
    }).promise;

    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );

    const fileNameWithoutExt = file.name.replace(/\.pdf$/i, "");

    const imageFile = new File(
      [blob],
      `${fileNameWithoutExt} ${pageNumber}.png`,
      {
        type: "image/png",
      }
    );

    images.push({
      file: imageFile,
      name: imageFile.name,
    });
  }

  return images;
};