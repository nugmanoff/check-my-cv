import "style/ShareButton.css";
import { Button } from "@chakra-ui/react";

export enum ShareButtonStatus {
  NORMAL,
  LOADING,
  SUCCESS,
}

export const ShareButton = (props: any) => {
  const { status, onClick, children } = props;

  return (
    <Button
      isLoading={ShareButtonStatus.LOADING == status}
      colorScheme="teal"
      variant="solid"
      onClick={onClick}
      isDisabled={ShareButtonStatus.SUCCESS == status}
    >
      {ShareButtonStatus.SUCCESS == status ? "Success!" : children}
    </Button>
  );
};
