import { Skeleton, Stack } from "@chakra-ui/react";

export const CommentListSkeleton = () => {
  return (
    <Stack p={4} spacing={5}>
      <Skeleton
        height="40px"
        borderRadius={8}
        startColor="gray.100"
        endColor="gray.200"
      />
      <Skeleton
        height="120px"
        borderRadius={8}
        startColor="gray.100"
        endColor="gray.200"
      />
      <Skeleton
        height="120px"
        borderRadius={8}
        startColor="gray.100"
        endColor="gray.200"
      />
      <Skeleton
        height="120px"
        borderRadius={8}
        startColor="gray.100"
        endColor="gray.200"
      />
    </Stack>
  );
};
