import Box from "@mui/material/Box";
import { Dispatch, SetStateAction } from "react";
import FileInput, { FileInputProps } from "./FileInput";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ListItemText from "@mui/material/ListItemText";

interface FileInputArguments extends Omit<FileInputProps, "onChange"> {
  onChange?: (allowedFiles: File[]) => void;
}

export interface FileInputListProps {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  fileInputProps?: FileInputArguments;
}

function FileInputList({
  files,
  setFiles,
  fileInputProps,
}: FileInputListProps) {
  function onChange(newFiles: File[]) {
    setFiles((oldFiles) => {
      return [...oldFiles, ...newFiles];
    });
  }

  const newFileInputProps = { ...fileInputProps, onChange };
  if (newFileInputProps.multiple === undefined) {
    newFileInputProps.multiple = true;
  }

  return (
    <Box>
      <FileInput {...newFileInputProps} />
      <List>
        {files.map((file) => {
          return (
            <ListItem
              key={file.name}
              secondaryAction={
                <IconButton
                  aria-label="Delete"
                  edge="end"
                  onClick={() => {
                    setFiles((oldFiles) => {
                      return oldFiles.filter((fileToDelete) => {
                        return fileToDelete !== file;
                      });
                    });
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={file.name} />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

export default FileInputList;
