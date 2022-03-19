import React, { useCallback, useEffect, useState } from "react";

import type { IHighlight, NewHighlight } from "react-pdf-highlighter/";
import {
  AreaHighlight,
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
  Tip,
} from "react-pdf-highlighter/";
import { Spinner } from "./Spinner";
import { Sidebar } from "./Sidebar";
import { HighlightPopup } from "./HighlightPopup";
import { database, storage, storageRef } from "utils/firebase";
import { getDownloadURL, uploadBytes } from "firebase/storage";
import { get, ref as databaseRef, set, update } from "firebase/database";

import { generateCommentId, generateResumeId } from "utils/id-generator";
import URLwithStore from "utils/url-extensions";
import "style/App.css";
import { cleanup } from "@testing-library/react";

const parseIdFromHash = (): string =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const App = () => {
  const [url, setUrl] = useState("");
  const [highlights, setHighlights] = useState([] as IHighlight[]);
  const [status, setStatus] = useState("");

  const onResetHighlightsClicked = () => {
    setHighlights([]);
    resetHash();
  };

  const onPdfUploaded = (e: any) => {
    const files = e.target.files;
    if (files.length > 0) setUrl(URLwithStore.createObjectURL(files[0]));
  };

  const onShareClicked = async () => {
    const id = generateResumeId();
    const ref = storageRef(storage, id);
    const file = URLwithStore.getFromObjectURL(url);
    const metadata = { contentType: "application/pdf" };

    setStatus("Uploading file...");

    const fileUploadResult = await uploadBytes(ref, file, metadata);

    setStatus("Constructing download URL...");

    const fileUrl = await getDownloadURL(fileUploadResult.ref);

    setStatus("Saving link...");

    const databaseWriteResult = await set(
      databaseRef(database, "resumes/" + id),
      {
        fileUrl: fileUrl,
        comments: highlights,
      }
    );

    setStatus(
      `Share link generated successfully: check-my-cv.vercel.app/${id}`
    );
  };

  let scrollViewerTo = (highlight: any) => {};

  const scrollToHighlightFromHash = () => {
    // let id = '6255663221315289'
    const highlight = getHighlightById(parseIdFromHash());
    // const highlight = getHighlightById(id);
    console.log(highlight, "highlught found");
    if (highlight) {
      scrollViewerTo(highlight);
    }
  };

  const getResumeIfAny = useCallback(async () => {
    if (document.location.pathname !== "/") {
      const id = document.location.pathname.slice(1);
      try {
        console.log("request made");
        const result = await get(databaseRef(database, `resumes/${id}`));
        console.log("request done", result);
        if (result.exists()) {
          let resume = result.val();
          setUrl(resume.fileUrl);
          console.log(resume);

          resume.comments = resume?.comments.map((comment: any) => {
            if (!comment.position.hasOwnProperty("rects")) {
              comment.position["rects"] = [];
              return comment;
            } else return comment;
          });

          setHighlights(resume.comments ?? []);
        } else {
          document.location.pathname = "/";
        }
      } catch (error) {
        console.error("error occurred", error);
        document.location.pathname = "/";
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("hashchange", scrollToHighlightFromHash, false);
    return () => {
      document.removeEventListener("hashchange", scrollToHighlightFromHash);
    };
  }, [highlights]);

  useEffect(() => {
    getResumeIfAny().then();
  }, [getResumeIfAny]);

  const synchronizeHighlights = async (newHighlights: NewHighlight[]) => {
    if (document.location.pathname !== "/") {
      const id = document.location.pathname.slice(1);

      const updates = {
        [`/resumes/${id}/comments`]: { ...newHighlights },
      };

      try {
        const databaseWriteResult = await update(
          databaseRef(database),
          updates
        );
      } catch {
        console.log("error occurred while syncing");
      }
    }
  };

  const getHighlightById = (id: string) => {
    console.log(highlights);
    return highlights.find((highlight) => highlight.id === id);
  };

  const addHighlight = (highlight: NewHighlight) => {
    console.log("Saving highlight", highlight, highlights);
    setHighlights((prevState) => {
      let newHighlights = [
        { ...highlight, id: generateCommentId() },
        ...prevState,
      ];
      synchronizeHighlights(newHighlights);
      return newHighlights;
    });
  };

  console.log(highlights);

  const updateHighlight = (
    highlightId: string,
    position: Object,
    content: Object
  ) => {
    console.log("Updating highlight", highlightId, position, content);

    const newHighlights = highlights.map((h) => {
      const {
        id,
        position: originalPosition,
        content: originalContent,
        ...rest
      } = h;
      return id === highlightId
        ? {
            id,
            position: { ...originalPosition, ...position },
            content: { ...originalContent, ...content },
            ...rest,
          }
        : h;
    });

    setHighlights(newHighlights);
    synchronizeHighlights(newHighlights);
  };

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        status={status}
        highlights={highlights}
        resetHighlights={onResetHighlightsClicked}
        onPdfUploaded={onPdfUploaded}
        onShareClicked={onShareClicked}
      />
      <div
        style={{
          height: "100vh",
          width: "75vw",
          position: "relative",
        }}
      >
        {url === "" ? (
          <p
            style={{
              color: "black",
              position: "relative",
            }}
          >
            Upload resume
          </p>
        ) : (
          <PdfLoader url={url} beforeLoad={<Spinner />}>
            {(pdfDocument) => (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={resetHash}
                // pdfScaleValue="page-width"
                scrollRef={(scrollTo) => {
                  scrollViewerTo = scrollTo;
                  console.log(scrollTo, "scroll to in scroll ref");
                  scrollToHighlightFromHash();
                }}
                onSelectionFinished={(
                  position,
                  content,
                  hideTipAndSelection,
                  transformSelection
                ) => (
                  <Tip
                    onOpen={transformSelection}
                    onConfirm={(comment) => {
                      addHighlight({ content, position, comment });
                      hideTipAndSelection();
                    }}
                  />
                )}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo
                ) => {
                  const isTextHighlight = !Boolean(
                    highlight.content && highlight.content.image
                  );

                  const component = isTextHighlight ? (
                    <Highlight
                      isScrolledTo={isScrolledTo}
                      position={highlight.position}
                      comment={highlight.comment}
                    />
                  ) : (
                    <AreaHighlight
                      isScrolledTo={isScrolledTo}
                      highlight={highlight}
                      onChange={(boundingRect) => {
                        updateHighlight(
                          highlight.id,
                          { boundingRect: viewportToScaled(boundingRect) },
                          { image: screenshot(boundingRect) }
                        );
                      }}
                    />
                  );

                  return (
                    <Popup
                      popupContent={<HighlightPopup {...highlight} />}
                      onMouseOver={(popupContent) =>
                        setTip(highlight, (highlight) => popupContent)
                      }
                      onMouseOut={hideTip}
                      key={index}
                      children={component}
                    />
                  );
                }}
                highlights={highlights}
              />
            )}
          </PdfLoader>
        )}
      </div>
    </div>
  );
};

export default App;
