import type { IHighlight } from "react-pdf-highlighter/";
import { ShareButton } from "./ShareButton";
import { Kbd, Heading, Text, Link, Button } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import CommentCard from "./CommentCard";
import { CommentListSkeleton } from "./CommentListSkeleton";
import "style/Sidebar.css";

interface Props {
  status: SidebarStatus;
  statusText: string;
  highlights: Array<IHighlight>;
  onPdfUploaded: (changeEvent: any) => void;
  onShareClicked: () => void;
}

const updateHash = (highlight: IHighlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

export enum SidebarStatus {
  CAN_UPLOAD,
  LOADING,
  UPLOADED,
  SHARING_IN_PROGRESS,
  SHARING_SUCCESS,
}

const Sidebar = ({
  status,
  statusText,
  highlights,
  onShareClicked,
  onPdfUploaded,
}: Props) => {
  const CommentList = () => {
    return (
      <div>
        {status === SidebarStatus.LOADING ? (
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
        {(status === SidebarStatus.CAN_UPLOAD ||
          status === SidebarStatus.UPLOADED) && (
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const files = e.target.files;
              files && onPdfUploaded(files[0]);
            }}
          />
        )}
        {(status === SidebarStatus.UPLOADED ||
          status === SidebarStatus.SHARING_IN_PROGRESS ||
          status === SidebarStatus.SHARING_SUCCESS) && (
          <ShareButton onClick={onShareClicked} status={status}>
            Share
          </ShareButton>
        )}
        {status === SidebarStatus.SHARING_SUCCESS && (
          <Link href={statusText} isExternal>
            {statusText} <ExternalLinkIcon mx="2px" />
          </Link>
        )}
        {status === SidebarStatus.SHARING_IN_PROGRESS && (
          <Text fontSize="sm">{statusText}</Text>
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
