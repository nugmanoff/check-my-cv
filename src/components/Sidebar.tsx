import React, { useState } from "react";
import type { IHighlight } from "react-pdf-highlighter/";
import { Button, ButtonStatus } from "./Button";

interface Props {
  status: string;
  highlights: Array<IHighlight>;
  resetHighlights: () => void;
  onPdfUploaded: (changeEvent: any) => void;
  onShareClicked: () => void;
  isShareHidden: boolean;
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
}: Props) {
  const [sharedButtonStatus, setSharedButtonStatus] = useState(
    ButtonStatus.NORMAL
  );
  const onShareButtonClick = async () => {
    setSharedButtonStatus(ButtonStatus.LOADING);
    await onShareClicked();
    setSharedButtonStatus(ButtonStatus.SUCCESS);
  };
  return (
    <div className="sidebar" style={{ width: "25vw" }}>
      <div className="description" style={{ padding: "1rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Check My Resume</h2>
        <p>
          <small>
            To create area highlight hold ⌥ Option key (Alt), then click and
            drag.
          </small>
        </p>
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
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            onPdfUploaded(e);
            setSharedButtonStatus(ButtonStatus.NORMAL);
          }}
        />
        {!isShareHidden && (
          <Button onClick={onShareButtonClick} status={sharedButtonStatus}>
            Share
          </Button>
        )}
        <small>{status}</small>
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
          <button onClick={resetHighlights}>Reset highlights</button>
        </div>
      ) : null}
    </div>
  );
}
