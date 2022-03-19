import React, { Component } from "react";

import {
  PdfLoader,
  PdfHighlighter,
  Tip,
  Highlight,
  Popup,
  AreaHighlight,
} from "./react-pdf-highlighter/index";

import type { IHighlight, NewHighlight } from "./react-pdf-highlighter/index";

import { testHighlights as _testHighlights } from "./test-highlights";
import { Spinner } from "./Spinner";
import { Sidebar } from "./Sidebar";
import { storage, storageRef, database } from "./firebase";
import { uploadBytes, getDownloadURL } from "firebase/storage";
import {
  ref as databaseRef,
  set,
  get,
  update,
  push,
  child,
} from "firebase/database";

import generateId from "./id-generator";
import URLwithStore from "./url-extensions";
import "./style/App.css";

interface State {
  url: string;
  highlights: Array<IHighlight>;
  status: string;
}

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const HighlightPopup = ({
  comment,
}: {
  comment: { text: string; emoji: string };
}) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null;

class App extends Component<{}, State> {
  state = {
    url: "",
    highlights: [] as IHighlight[],
    status: "",
  };

  resetHighlights = () => {
    this.setState({
      highlights: [],
    });
    resetHash();
  };

  onPdfUploaded = (e: any) => {
    const files = e.target.files;
    files.length > 0 &&
      this.setState({ url: URLwithStore.createObjectURL(files[0]) });
  };

  onShareClicked = async () => {
    const id = generateId();
    const ref = storageRef(storage, id);
    const file = URLwithStore.getFromObjectURL(this.state.url);
    const metadata = { contentType: "application/pdf" };

    this.setState({
      status: "Uploading file...",
    });

    const fileUploadResult = await uploadBytes(ref, file, metadata);

    this.setState({
      status: "Constructing download URL...",
    });

    const fileUrl = await getDownloadURL(fileUploadResult.ref);

    this.setState({
      status: "Saving link...",
    });

    const databaseWriteResult = await set(
      databaseRef(database, "resumes/" + id),
      {
        fileUrl: fileUrl,
      }
    );

    this.setState({
      status: `Share link generated successfully: check-my-cv.vercel.app/${id}`,
    });
  };

  getResumeIfAny = async () => {
    if (document.location.pathname !== "/") {
      const id = document.location.pathname.slice(1);
      try {
        console.log("request made");
        const result = await get(databaseRef(database, `resumes/${id}`));
        console.log("request done", result);
        if (result.exists()) {
          const resume = result.val();
          this.setState({
            url: resume.fileUrl,
            highlights: resume.comments ?? [],
          });
        } else {
          document.location.pathname = "/";
        }
      } catch (error) {
        console.error("error occurred", error);
        document.location.pathname = "/";
      }
    }
  };

  scrollViewerTo = (highlight: any) => {};

  scrollToHighlightFromHash = () => {
    const highlight = this.getHighlightById(parseIdFromHash());

    if (highlight) {
      this.scrollViewerTo(highlight);
    }
  };

  componentDidMount() {
    window.addEventListener(
      "hashchange",
      this.scrollToHighlightFromHash,
      false
    );

    this.getResumeIfAny();
  }

  getHighlightById(id: string) {
    const { highlights } = this.state;

    return highlights.find((highlight) => highlight.id === id);
  }

  async synchronizeHighlights() {
    if (document.location.pathname !== "/") {
      const id = document.location.pathname.slice(1);

      const updates = {
        [`/resumes/${id}/comments`]: { ...this.state.highlights },
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
  }

  addHighlight(highlight: NewHighlight) {
    const { highlights } = this.state;

    console.log("Saving highlight", highlight);

    this.setState(
      {
        highlights: [{ ...highlight, id: getNextId() }, ...highlights],
      },
      () => {
        this.synchronizeHighlights();
      }
    );
  }

  updateHighlight(highlightId: string, position: Object, content: Object) {
    console.log("Updating highlight", highlightId, position, content);

    this.setState(
      {
        highlights: this.state.highlights.map((h) => {
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
        }),
      },
      () => {
        this.synchronizeHighlights();
      }
    );
  }

  render() {
    const { url, highlights, status } = this.state;

    return (
      <div className="App" style={{ display: "flex", height: "100vh" }}>
        <Sidebar
          status={status}
          highlights={highlights}
          resetHighlights={this.resetHighlights}
          onPdfUploaded={this.onPdfUploaded}
          onShareClicked={this.onShareClicked}
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
                    this.scrollViewerTo = scrollTo;

                    this.scrollToHighlightFromHash();
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
                        this.addHighlight({ content, position, comment });
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
                          this.updateHighlight(
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
  }
}

export default App;
