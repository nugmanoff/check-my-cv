import "style/button.css";
import { Button as ChakraButton } from "@chakra-ui/react";

export enum ButtonStatus {
  NORMAL,
  LOADING,
  SUCCESS,
}

export const Button = (props: any) => {
  const { status, onClick, children } = props;

  return (
    <ChakraButton
      isLoading={ButtonStatus.LOADING == status}
      colorScheme="teal"
      variant="solid"
      onClick={onClick}
      isDisabled={ButtonStatus.SUCCESS == status}
    >
      {ButtonStatus.SUCCESS == status ? "Success!" : children}
    </ChakraButton>
  );
};
