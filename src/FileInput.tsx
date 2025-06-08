import { Button, ButtonOwnProps, styled } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { useState } from "react";
import { FileType } from ".";

export interface FileInputProps {
  onChange: (files: File[]) => void;
  accept?: (FileType | string)[];
  label?: string;
  multiple?: boolean;
  variant?: ButtonOwnProps["variant"];
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

const Dropzone = styled("div")<{ $dragging: boolean }>(
  ({ theme, $dragging }) => ({
    border: "2px dashed",
    borderColor: $dragging ? theme.palette.primary.main : "#ccc",
    backgroundColor: $dragging ? theme.palette.action.hover : "transparent",
    borderRadius: 8,
    padding: "1.5rem",
    textAlign: "center",
    transition: "border-color 0.2s",
    cursor: "pointer",
  }),
);

function FileInput({
  onChange,
  accept = Object.values(FileType),
  label = "Upload File",
  multiple,
  variant = "contained",
  disabled,
}: FileInputProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);

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

  function handleFiles(filesArray: File[]) {
    const allowedFiles = [];
    const forbiddenFiles = [];

    for (const file of filesArray) {
      if (allowedFileMimes.includes(file.type)) {
        allowedFiles.push(file);
      } else {
        forbiddenFiles.push(file);
      }
    }
    if (forbiddenFiles.length !== 0) {
      alert(
        [
          "The following files did not match the expected format and will therefore not be accepted:",
          ...forbiddenFiles.map((file) => {
            return `    - ${file.name}`;
          }),
        ].join("\n"),
      );
    }
    onChange(allowedFiles);
  }

  return (
    <Dropzone
      $dragging={isDragging}
      onDragOver={(event) => {
        event.preventDefault();
        if (disabled) {
          return;
        }
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (disabled) {
          return;
        }
        const filesArray = Array.from(event.dataTransfer.files ?? []);
        handleFiles(filesArray);
      }}
    >
      <Button
        component="label"
        role={undefined}
        variant={variant}
        startIcon={<CloudUpload />}
      >
        {label}
        <VisuallyHiddenInput
          type="file"
          onChange={(event) => {
            handleFiles(Array.from(event.target.files ?? []));
          }}
          multiple={multiple}
          accept={accept.join(",")}
          disabled={disabled}
        />
      </Button>
    </Dropzone>
  );
}

export default FileInput;
