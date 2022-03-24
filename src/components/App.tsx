import { useCallback, useEffect, useState } from "react";
import type { IHighlight, NewHighlight } from "react-pdf-highlighter/";
import {
  AreaHighlight,
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
  Tip,
} from "react-pdf-highlighter/";
import { Sidebar, SidebarStatus } from "./Sidebar";
import { HighlightPopup } from "./HighlightPopup";
import { database, storage, storageRef } from "utils/firebase";
import { getDownloadURL, uploadBytes } from "firebase/storage";
import {
  get,
  ref as databaseRef,
  set,
  update,
  remove,
} from "firebase/database";
import { generateCommentId, generateResumeId } from "utils/id-generator";
import URLwithStore from "utils/url-extensions";
import "style/App.css";
import { Text, Spinner, Center, VStack } from "@chakra-ui/react";
import Dropzone from "./Dropzone";

let scrollViewerTo = (highlight: IHighlight) => {};

const parseIdFromHash = (): string =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const App = () => {
  const [url, setUrl] = useState("");
  const [highlights, setHighlights] = useState([] as IHighlight[]);
  const [statusText, setStatusText] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [sidebarStatus, setSidebarStatus] = useState(SidebarStatus.CAN_UPLOAD);

  const resetHighlightsAndHash = () => {
    setHighlights([]);
    resetHash();
  };

  const onPdfUploaded = (file: any) => {
    if (file) {
      setUrl(URLwithStore.createObjectURL(file));
      resetHighlightsAndHash();
      setSidebarStatus(SidebarStatus.UPLOADED);
    } else {
      setSidebarStatus(SidebarStatus.CAN_UPLOAD);
    }
  };

  const onShareClicked = async () => {
    const id = generateResumeId();
    const ref = storageRef(storage, id);
    const file = URLwithStore.getFromObjectURL(url);
    const metadata = { contentType: "application/pdf" };
    setSidebarStatus(SidebarStatus.SHARING_IN_PROGRESS);

    setStatusText("Uploading file...");

    const fileUploadResult = await uploadBytes(ref, file, metadata);

    setStatusText("Constructing download URL...");

    const fileUrl = await getDownloadURL(fileUploadResult.ref);

    setStatusText("Saving link...");

    const databaseWriteResult = await set(
      databaseRef(database, "resumes/" + id),
      {
        fileUrl: fileUrl,
        comments: highlights,
      }
    );
    setResumeId(id);
    setStatusText(`${window.location.origin}/${id}`);
    setSidebarStatus(SidebarStatus.SHARING_SUCCESS);
  };

  const scrollToHighlightFromHash = () => {
    const highlight = getHighlightById(parseIdFromHash());
    console.log("highlight", highlight);
    if (highlight) {
      scrollViewerTo(highlight);
    }
  };

  const getResumeIfAny = useCallback(async () => {
    if (document.location.pathname !== "/") {
      const id = document.location.pathname.slice(1);
      setSidebarStatus(SidebarStatus.LOADING);

      try {
        const result = await get(databaseRef(database, `resumes/${id}`));
        if (result.exists()) {
          let resume = result.val();
          setUrl(resume.fileUrl);
          setResumeId(id);
          resume.comments = resume?.comments
            ? resume?.comments.map((comment: any) => {
                if (!comment.position.hasOwnProperty("rects")) {
                  comment.position["rects"] = [];
                  return comment;
                } else return comment;
              })
            : [];

          setHighlights(resume.comments ?? []);
          setSidebarStatus(SidebarStatus.CAN_UPLOAD);
        } else {
          document.location.pathname = "/";
          setSidebarStatus(SidebarStatus.CAN_UPLOAD);
        }
      } catch (error) {
        console.error("error occurred", error);
        document.location.pathname = "/";
        setSidebarStatus(SidebarStatus.CAN_UPLOAD);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("hashchange", scrollToHighlightFromHash, false);
    return () => {
      window.removeEventListener("hashchange", scrollToHighlightFromHash);
    };
  }, [highlights]);

  useEffect(() => {
    synchronizeHighlights(highlights);
  }, [highlights]);

  useEffect(() => {
    getResumeIfAny().then();
  }, [getResumeIfAny]);

  const synchronizeHighlights = async (newHighlights: NewHighlight[]) => {
    if (resumeId !== "") {
      const updates = {
        [`/resumes/${resumeId}/comments`]: { ...newHighlights },
      };
      try {
        if (newHighlights.length == 0) {
          const databaseWriteResult = await remove(
            databaseRef(database, `/resumes/${resumeId}/comments`)
          );
        } else {
          const databaseWriteResult = await update(
            databaseRef(database),
            updates
          );
        }
      } catch {
        console.log("error occurred while syncing");
      }
    }
  };

  const getHighlightById = (id: string) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  const addHighlight = (highlight: NewHighlight) => {
    setHighlights((prevState) => {
      let newHighlights = [
        { ...highlight, id: generateCommentId() },
        ...prevState,
      ];

      return newHighlights;
    });
  };

  const updateHighlight = (
    highlightId: string,
    position: Object,
    content: Object
  ) => {
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
  };

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        status={sidebarStatus}
        statusText={statusText}
        highlights={highlights}
        onPdfUploaded={onPdfUploaded}
        onShareClicked={onShareClicked}
      />
      <div style={{ height: "100vh", width: "75vw", position: "relative" }}>
        {url === "" ? (
          sidebarStatus === SidebarStatus.LOADING ? (
            <Center h="100%" w="100%">
              <VStack>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="teal.500"
                  size="xl"
                />
                <Text fontSize="lg">Resume is being loaded...</Text>
              </VStack>
            </Center>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              <Dropzone onFileAccepted={onPdfUploaded} />
            </div>
          )
        ) : (
          <PdfLoader
            url={url}
            beforeLoad={
              <Center h="100%" w="100%">
                <VStack>
                  <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="teal.500"
                    size="xl"
                  />
                  <Text fontSize="lg">Resume is being loaded...</Text>
                </VStack>
              </Center>
            }
          >
            {(pdfDocument) => (
              <div
                style={{
                  pointerEvents: `${
                    sidebarStatus === SidebarStatus.SHARING_IN_PROGRESS
                      ? "none"
                      : "unset"
                  }`,
                }}
              >
                <PdfHighlighter
                  pdfDocument={pdfDocument}
                  enableAreaSelection={(event) => event.altKey}
                  onScrollChange={resetHash}
                  scrollRef={(scrollTo) => {
                    scrollViewerTo = scrollTo;
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
                />{" "}
              </div>
            )}
          </PdfLoader>
        )}
      </div>
    </div>
  );
};

export default App;
