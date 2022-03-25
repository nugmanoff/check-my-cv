import { CheckIcon } from "@chakra-ui/icons";
import { Button, Link, useClipboard } from "@chakra-ui/react";

const LinkAndCopy = ({ link }: any) => {
  const { hasCopied, onCopy } = useClipboard(link);

  return (
    <>
      <div className="sidebar__link-and-copy">
        <Link
          href={link}
          isExternal
          style={{
            alignSelf: "center",
          }}
          fontSize="sm"
        >
          {link}
        </Link>

        <Button
          size="sm"
          rightIcon={(hasCopied && <CheckIcon w={3} h={3} />) || undefined}
          variant="outline"
          onClick={onCopy}
        >
          {hasCopied ? "Copied" : "Copy"}
        </Button>
      </div>
    </>
  );
};

export { LinkAndCopy };
