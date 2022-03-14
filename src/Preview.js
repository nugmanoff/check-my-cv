import * as React from "react";
import { Viewer } from "@react-pdf-viewer/core";
import { dropPlugin } from "@react-pdf-viewer/drop";


const Preview = () => {
  const [url, setUrl] = React.useState("");

  // Handle the `onChange` event of the `file` input
  const onChange = (e) => {
    const files = e.target.files;
    files.length > 0 && setUrl(URL.createObjectURL(files[0]));
  };

  const dropPluginInstance = dropPlugin();

  return (
    <div
      style={{
        margin: "100px",
      }}
    >
      <input type="file" accept=".pdf" onChange={onChange} />

      <div style={{ height: "350px" }}>
        {url ? (
          <div
            style={{
              border: "1px solid rgba(0, 0, 0, 0.3)",
              height: "100%",
            }}
          >
            <Viewer plugins={[dropPluginInstance]} fileUrl={url} />
          </div>
        ) : (
          <div
            style={{
              alignItems: "center",
              border: "2px dashed rgba(0, 0, 0, .3)",
              display: "flex",
              fontSize: "2rem",
              height: "100%",
              justifyContent: "center",
              width: "100%",
              marginTop: "5%",
            }}
          >
            <Viewer plugins={[dropPluginInstance]} fileUrl={"./drop-here.pdf"} defaultScale={10} />
          </div>
        )}
      </div>
    </div>
  );
};

export { Preview };
