import type { IHighlight } from "react-pdf-highlighter/";
import { Button, ButtonStatus } from "./Button";
import {
  Kbd,
  Heading,
  Text,
  Link,
  Button as ChakraButton,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import CommentCard from "./CommentCard";
import { CommentListSkeleton } from "./CommentListSkeleton";

interface Props {
  status: string;
  highlights: Array<IHighlight>;
  resetHighlights: () => void;
  onPdfUploaded: (changeEvent: any) => void;
  onShareClicked: () => void;
  isShareHidden: boolean;
  sharedButtonStatus: ButtonStatus;
  setSharedButtonStatus: (status: ButtonStatus) => void;
  isLoading: boolean;
}

const updateHash = (highlight: IHighlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

const Sidebar = ({
  status,
  highlights,
  resetHighlights,
  onShareClicked,
  onPdfUploaded,
  isShareHidden,
  sharedButtonStatus,
  setSharedButtonStatus,
  isLoading,
}: Props) => {
  const onShareButtonClick = async () => {
    setSharedButtonStatus(ButtonStatus.LOADING);
    await onShareClicked();
    setSharedButtonStatus(ButtonStatus.SUCCESS);
  };

  const CommentsSection = () => {
    return (
      <div>
        {isLoading ? (
          <CommentListSkeleton />
        ) : (
          <ul className="sidebar__highlights" style={{ listStyle: "none" }}>
            {highlights.map((highlight, index) => (
              <li
                key={index}
                className="sidebar__highlight"
                onClick={() => {
                  updateHash(highlight);
                }}
              >
                <CommentCard
                  name={highlight.comment.text}
                  description={highlight.comment.text}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const BrowseAndShareSection = () => {
    return (
      <div
        className="buttons"
        style={{
          display: "flex",
          padding: "16px",
          rowGap: "16px",
          flexDirection: "column",
        }}
      >
        {!isShareHidden && (
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const files = e.target.files;
              files && onPdfUploaded(files[0]);
              setSharedButtonStatus(ButtonStatus.NORMAL);
            }}
          />
        )}
        {!isShareHidden && (
          <Button onClick={onShareButtonClick} status={sharedButtonStatus}>
            Share
          </Button>
        )}
        {sharedButtonStatus == ButtonStatus.SUCCESS ? (
          <Link href={status} isExternal>
            {status} <ExternalLinkIcon mx="2px" />
          </Link>
        ) : (
          <Text fontSize="sm">{status}</Text>
        )}
      </div>
    );
  };

  const HeadingAndDescription = () => {
    return (
      <div className="description" style={{ padding: "1rem" }}>
        <Heading as="h2" size="xl">
          Check Resume
        </Heading>
        <Text fontSize="lg">
          To create area highlight hold&nbsp;
          <span>
            <Kbd>⌥ Option (Alt)</Kbd>
          </span>
          , then click and drag.
        </Text>
      </div>
    );
  };

  return (
    <div className="sidebar" style={{ width: "25vw" }}>
      <HeadingAndDescription />
      <BrowseAndShareSection />
      <CommentsSection />
    </div>
  );
};

export { Sidebar };
