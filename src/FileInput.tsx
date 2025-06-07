import { Button, styled } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { ChangeEvent } from "react";
import { FileType } from ".";

export interface FileInputProps {
  onChange: (files: File[]) => void;
  accept?: (FileType | string)[];
  label?: string;
  multiple?: boolean;
  disabled?: boolean;
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function FileInput({
  onChange,
  accept = Object.values(FileType),
  label = "Upload File",
  multiple,
  disabled,
}: FileInputProps) {
  const fileExtensionsToFileMimes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpg",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".mp3": "audio/mp3",
    ".mp4": "video/mp4",
    ".wav": "audio/wav",
  };
  const allowedFileMimes: string[] = [];
  const supportedFileMimes = Object.keys(fileExtensionsToFileMimes);
  const supportedFileExtensions = Object.values(fileExtensionsToFileMimes);
  for (const extension of accept) {
    const normalisedExtension = extension.toLowerCase();
    if (fileExtensionsToFileMimes[normalisedExtension]) {
      allowedFileMimes.push(fileExtensionsToFileMimes[normalisedExtension]);
    } else if (
      !supportedFileMimes.includes(extension) &&
      !supportedFileExtensions.includes(extension)
    ) {
      console.warn(
        `WARNING: The file type ${extension} is not natively supported.`,
      );
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const filesArray = Array.from(event.target.files ?? []).filter((file) => {
      return allowedFileMimes.includes(file.type);
    });
    onChange(filesArray);
  }

  return (
    <Button
      component="label"
      role={undefined}
      variant="outlined"
      startIcon={<CloudUpload />}
    >
      {label}
      <VisuallyHiddenInput
        type="file"
        onChange={handleChange}
        multiple={multiple}
        accept={accept.join(",")}
        disabled={disabled}
      />
    </Button>
  );
}

export default FileInput;
