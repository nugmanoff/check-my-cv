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

interface Props {
  status: string;
  highlights: Array<IHighlight>;
  resetHighlights: () => void;
  onPdfUploaded: (changeEvent: any) => void;
  onShareClicked: () => void;
  isShareHidden: boolean;
  sharedButtonStatus: ButtonStatus;
  setSharedButtonStatus: (status: ButtonStatus) => void;
}

const updateHash = (highlight: IHighlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

export function Sidebar({
  status,
  highlights,
  resetHighlights,
  onShareClicked,
  onPdfUploaded,
  isShareHidden,
  sharedButtonStatus,
  setSharedButtonStatus,
}: Props) {
  const onShareButtonClick = async () => {
    setSharedButtonStatus(ButtonStatus.LOADING);
    await onShareClicked();
    setSharedButtonStatus(ButtonStatus.SUCCESS);
  };
  return (
    <div className="sidebar" style={{ width: "25vw" }}>
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
      <ul className="sidebar__highlights" style={{ listStyle: "none" }}>
        {highlights.map((highlight, index) => (
          <li
            key={index}
            className="sidebar__highlight"
            onClick={() => {
              updateHash(highlight);
            }}
          >
            <div>
              <strong>{highlight.comment.text}</strong>
              {highlight.content.text && (
                <blockquote style={{ marginTop: "0.5rem" }}>
                  {`${highlight.content.text.slice(0, 90).trim()}…`}
                </blockquote>
              )}
              {highlight.content.image ? (
                <div
                  className="highlight__image"
                  style={{ marginTop: "0.5rem" }}
                >
                  <img src={highlight.content.image} alt={"Screenshot"} />
                </div>
              ) : null}
            </div>
            <div className="highlight__location">
              Page {highlight.position.pageNumber}
            </div>
          </li>
        ))}
      </ul>
      {highlights.length > 0 ? (
        <div style={{ padding: "1rem" }}>
          <ChakraButton
            colorScheme="teal"
            variant="outline"
            onClick={resetHighlights}
          >
            Reset highlights
          </ChakraButton>
        </div>
      ) : null}
    </div>
  );
}
