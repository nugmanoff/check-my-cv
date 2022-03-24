import "style/ShareButton.css";
import { Button } from "@chakra-ui/react";
import { SidebarStatus } from "./Sidebar";

export const ShareButton = (props: any) => {
  const { status, onClick, children } = props;

  return (
    <Button
      isLoading={SidebarStatus.SHARING_IN_PROGRESS == status}
      colorScheme="teal"
      variant="solid"
      onClick={onClick}
      isDisabled={SidebarStatus.SHARING_SUCCESS == status}
    >
      {SidebarStatus.SHARING_SUCCESS == status ? "Success!" : children}
    </Button>
  );
};
