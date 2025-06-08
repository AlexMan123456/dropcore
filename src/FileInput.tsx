import { Button, ButtonOwnProps, styled } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { FileType } from ".";

export interface FileInputProps {
  onChange: (allowedFiles: File[]) => void;
  onReject?: (forbiddenFiles: File[]) => void;
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
  onReject,
  accept = Object.values(FileType),
  label = "Upload File",
  multiple,
  variant = "contained",
  disabled,
}: FileInputProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileExtensionsToFileMimes: Record<string, string[]> = {
    ".pdf": ["application/pdf"],
    ".png": ["image/png"],
    ".jpeg": ["image/jpeg", "image/jpg"],
    ".jpg": ["image/jpeg", "image/jpg"],
    ".xlsx": [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    ".docx": [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    ".mp3": ["audio/mp3", "audio/mpeg"],
    ".mp4": ["video/mp4"],
    ".wav": ["audio/wav"],
  };

  const supportedFileExtensions = Object.keys(fileExtensionsToFileMimes);
  const supportedFileMimes = Object.values(fileExtensionsToFileMimes).flat(1);
  const [allowedFileMimes, setAllowedFileMimes] = useState<string[]>([]);
  const [allowedUnsupportedFileMimes, setAllowedUnsupportedFileMimes] =
    useState<string[]>([]);
  const [
    allowedUnsupportedFileExtensions,
    setAllowedUnsupportedFileExtensions,
  ] = useState<string[]>([]);

  function addItemToNewArray(oldArray: any[], newItem: any): any[] {
    const newArray = [...oldArray];
    newArray.push(newItem);
    return newArray;
  }

  const memoisedAccept = useMemo(() => {
    return [...accept];
  }, [accept]);

  useEffect(() => {
    for (const incomingFileType of memoisedAccept) {
      const normalisedFileType = incomingFileType.toLowerCase();
      if (fileExtensionsToFileMimes[normalisedFileType]) {
        setAllowedFileMimes((oldMimes) => {
          return addItemToNewArray(
            oldMimes,
            fileExtensionsToFileMimes[normalisedFileType],
          ).flat(1);
        });
      } else if (
        !supportedFileMimes.includes(incomingFileType) &&
        !supportedFileExtensions.includes(incomingFileType)
      ) {
        if (incomingFileType.includes("/")) {
          setAllowedFileMimes((oldMimes) => {
            return addItemToNewArray(oldMimes, incomingFileType);
          });
          setAllowedUnsupportedFileMimes((oldMimes) => {
            return addItemToNewArray(oldMimes, incomingFileType);
          });
        } else if (
          incomingFileType[0] === "." &&
          !incomingFileType.slice(1).includes(".")
        ) {
          setAllowedUnsupportedFileExtensions((oldExtensions) => {
            return addItemToNewArray(oldExtensions, incomingFileType);
          });
        } else {
          console.error(
            `ERROR: ${incomingFileType} is not a valid file extension or MIME type`,
          );
          return;
        }
        console.warn(
          `WARNING: The file type ${incomingFileType} is not natively supported.`,
        );
      }
    }
  }, [memoisedAccept]);

  function handleFiles(filesArray: File[]) {
    const allowedFiles = [];
    const forbiddenFiles = [];

    for (const file of filesArray) {
      const fileExtension = `.${file.name.split(".")[file.name.split(".").length - 1]}`;
      if (allowedFileMimes.includes(file.type)) {
        allowedFiles.push(file);
      } else {
        if (
          allowedUnsupportedFileMimes.includes(file.type) ||
          allowedUnsupportedFileExtensions.includes(fileExtension)
        ) {
          allowedFiles.push(file);
        } else {
          forbiddenFiles.push(file);
        }
      }
    }
    if (forbiddenFiles.length !== 0) {
      if (onReject) {
        onReject(forbiddenFiles);
      } else {
        alert(
          [
            "The following files did not match the expected format and will therefore not be accepted:",
            ...forbiddenFiles.map((file) => {
              return `    - ${file.name}`;
            }),
          ].join("\n"),
        );
      }
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
