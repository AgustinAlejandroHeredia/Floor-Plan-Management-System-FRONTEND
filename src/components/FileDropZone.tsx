import { useState } from "react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";

const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
];

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
}

export function FileDropZone({ onFileSelect }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  setIsDragging(false);

  const file = e.dataTransfer.files?.[0];
    if (file && allowedTypes.includes(file.type)) {
      onFileSelect(file);
    } else {
      alert("Only PNG, JPG, JPEG or PDF files are allowed");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && allowedTypes.includes(file.type)) {
      onFileSelect(file);
    } else {
      alert("Only PNG, JPG, JPEG or PDF files are allowed");
    }
  };

  return (
    <Empty
      className={`border p-6 max-w-md mx-auto mt-10 transition
        ${isDragging ? "bg-[var(--accent-bg2)]" : ""}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <EmptyHeader>
        <EmptyTitle className="text-[var(--text-h)] text-base">
          {isDragging ? "Drop your file here" : "Drag and drop a file here"}
        </EmptyTitle>

        <EmptyDescription>
          or use the button below to select a file
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Input
          type="file"
          className="cursor-pointer text-[var(--text-h)] file:text-[var(--text-h)]"
          onChange={handleFileChange}
        />
      </EmptyContent>
    </Empty>
  );
}