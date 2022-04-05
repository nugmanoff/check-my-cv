import { ReactNode, useRef } from "react";
import { InputGroup } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";

type FileUploadProps = {
  register: UseFormRegisterReturn;
  children?: ReactNode;
};

const FileUpload = (props: FileUploadProps) => {
  const { register, children } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { ref, ...rest } = register as {
    ref: (instance: HTMLInputElement | null) => void;
  };

  const handleClick = () => inputRef.current?.click();

  return (
    <InputGroup onClick={handleClick}>
      <input
        type={"file"}
        multiple={false}
        hidden
        accept={"application/pdf"}
        {...rest}
        ref={(e) => {
          ref(e);
          inputRef.current = e;
        }}
      />
      <>{children}</>
    </InputGroup>
  );
};

type FormValues = {
  file_: FileList;
};

export { FileUpload, type FormValues };
