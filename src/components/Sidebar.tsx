import type { IHighlight } from "react-pdf-highlighter/";
import { ShareButton, ShareButtonStatus } from "./ShareButton";
import { Kbd, Heading, Text, Link, Button } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import CommentCard from "./CommentCard";
import { CommentListSkeleton } from "./CommentListSkeleton";
import "style/Sidebar.css";

interface Props {
  status: string;
  highlights: Array<IHighlight>;
  resetHighlights: () => void;
  onPdfUploaded: (changeEvent: any) => void;
  onShareClicked: () => void;
  isShareHidden: boolean;
  sharedButtonStatus: ShareButtonStatus;
  setSharedButtonStatus: (status: ShareButtonStatus) => void;
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
    setSharedButtonStatus(ShareButtonStatus.LOADING);
    await onShareClicked();
    setSharedButtonStatus(ShareButtonStatus.SUCCESS);
  };

  const CommentList = () => {
    return (
      <div>
        {isLoading ? (
          <CommentListSkeleton />
        ) : (
          <ul className="sidebar__comment-list">
            {highlights.map((highlight, index) => (
              <li
                key={index}
                className="sidebar__comment"
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

  const BrowseAndShare = () => {
    return (
      <div className="sidebar__browse-and-share">
        {!isShareHidden && (
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const files = e.target.files;
              files && onPdfUploaded(files[0]);
              setSharedButtonStatus(ShareButtonStatus.NORMAL);
            }}
          />
        )}
        {!isShareHidden && (
          <ShareButton onClick={onShareButtonClick} status={sharedButtonStatus}>
            Share
          </ShareButton>
        )}
        {sharedButtonStatus == ShareButtonStatus.SUCCESS ? (
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
      <div>
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
    <div className="sidebar">
      <HeadingAndDescription />
      <BrowseAndShare />
      <CommentList />
    </div>
  );
};

export { Sidebar };
