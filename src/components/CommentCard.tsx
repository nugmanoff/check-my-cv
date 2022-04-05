import { DeleteIcon } from "@chakra-ui/icons";
import {
  HStack,
  VStack,
  Text,
  useColorModeValue,
  IconButton,
  StatLabel,
  StatHelpText,
  Stat,
} from "@chakra-ui/react";

const CommentCard = (props: any) => {
  const { text, onDelete, onClick } = props;

  return (
    <HStack
      p={4}
      bg={useColorModeValue("white", "neutralD.100")}
      rounded="lg"
      borderWidth="1px"
      borderColor={useColorModeValue("neutral.400", "neutralD.400")}
      w="100%"
      h="100%"
      textAlign="left"
      align="start"
      spacing={4}
      onClick={onClick}
    >
      <VStack align="start" justify="flex-start" spacing={1} flexGrow={1}>
        <VStack spacing={4} align="start" flexGrow={1}>
          <HStack>
            <IconButton
              onClick={onDelete}
              aria-label="Delete comment"
              size={"xs"}
              icon={<DeleteIcon />}
            />
          </HStack>
          <HStack>
            <Text fontWeight="regular" fontSize="medium" noOfLines={2}>
              {text}
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </HStack>
  );
};

export default CommentCard;
