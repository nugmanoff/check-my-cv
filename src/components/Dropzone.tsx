import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Center, useColorModeValue, Text } from "@chakra-ui/react";

export default function Dropzone({ onFileAccepted }: any) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      onFileAccepted(acceptedFiles[0]);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".pdf",
    maxFiles: 1,
    multiple: false,
  });

  const dropText = isDragActive
    ? "Drop the files here ..."
    : "Drag 'n' drop .pdf file here, or click to select files";

  const activeBg = useColorModeValue("gray.100", "gray.600");
  const borderColor = useColorModeValue(
    isDragActive ? "teal.300" : "gray.300",
    isDragActive ? "teal.500" : "gray.500"
  );

  return (
    <Center
      p={100}
      width="80%"
      height="80%"
      cursor="pointer"
      bg={isDragActive ? activeBg : "transparent"}
      _hover={{ bg: activeBg }}
      transition="background-color 0.2s ease"
      borderRadius={4}
      border="3px dashed"
      borderColor={borderColor}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <Text fontSize="2xl">
        Drag'n'drop .pdf file here, or click to select files.
      </Text>
    </Center>
  );
}
