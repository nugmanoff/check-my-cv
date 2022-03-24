import { HStack, VStack, Text, useColorModeValue, Box } from "@chakra-ui/react";

const CommentCard = ({ name, description, link }: any) => {
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
      transition="all 0.25s"
      transition-timing-function="spring(1 100 10 10)"
      _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
    >
      <VStack align="start" justify="flex-start" spacing={1}>
        <VStack spacing={0} align="start">
          <HStack>
            <Text fontWeight="bold" fontSize="md" noOfLines={2}>
              {name}
            </Text>
          </HStack>

          <Text
            fontSize="sm"
            color={useColorModeValue("neutral.1000", "neutralD.1000")}
          >
            {description}
          </Text>
        </VStack>
      </VStack>
    </HStack>
  );
};

export default CommentCard;
