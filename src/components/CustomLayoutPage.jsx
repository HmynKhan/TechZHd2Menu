import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addDivision,
  updateDivision,
  saveLayout,
  loadLayout,
  deleteLayout,
  updateDeviceResolution, // this is device resolution code start
} from "../store/layoutSlice";
import LayoutPreview from "./LayoutPreview";
import ScreenDivision from "./ScreenDivision";
import images from "../assets/images"; // Assuming you have an array of image objects
import videos from "../assets/videos"; // Assuming you have an array of video objects
import Preview from "./Preview"; // Import the PreviewLayout component
import "./CustomLayout.css";
import TimelineMedia from "./TimelineMedia";

const CustomLayoutPage = () => {
  const dispatch = useDispatch();
  const layouts = useSelector((state) => state.layout.layouts);
  const selectedLayout = useSelector((state) => state.layout.currentLayout);
  const [layoutName, setLayoutName] = useState("");
  const [draggedMedia, setDraggedMedia] = useState(null); // State to store the dragged media ID and type
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // State to control the preview modal
  const [selectedMedia, setSelectedMedia] = useState(null);

  // this is device resolution code start
  const [deviceResolution, setDeviceResolution] = useState(
    selectedLayout.deviceResolution || "Full HD 1080P"
  );

  const handleDeviceResolutionChange = (e) => {
    const newResolution = e.target.value;
    setDeviceResolution(newResolution);
    dispatch(updateDeviceResolution(newResolution));
  };
  // this is device resolution code end

  const handleAddDivision = () => {
    const newDivision = {
      id: Date.now(), // Unique ID for each division
      x: 0,
      y: 0,
      width: 300,
      height: 200,
      imageSrcs: [], // Initialize with an empty array to store multiple images or videos
      durations: [], // Initialize with an empty array to store durations for each media
    };
    dispatch(addDivision(newDivision));
  };

  const handleSaveLayout = () => {
    if (layoutName) {
      dispatch(saveLayout({ name: layoutName }));
      setLayoutName("");
    } else {
      alert("Please enter a layout name.");
    }
    saveLayout("");
  };

  const handleLoadLayout = (id) => {
    dispatch(loadLayout(id)); // Load the layout into the editable area
  };

  const handleSelectLayout = (layout) => {
    dispatch(loadLayout(layout.id)); // Load the selected layout into the editable area
  };

  const handleDeleteLayout = (id) => {
    dispatch(deleteLayout(id));
  };

  const handleDivisionChange = (id, changes) => {
    dispatch(updateDivision({ id, changes }));
  };

  const handleDragStart = (media) => {
    setDraggedMedia(media); // Set the dragged media ID and type
  };

  const handleDropMedia = (divisionId, event) => {
    event.preventDefault();

    if (draggedMedia !== null) {
      const { id, type } = draggedMedia;

      // Find the media in the respective array by ID
      const mediaObj =
        type === "image"
          ? images.find((img) => img.id === id)
          : videos.find((video) => video.id === id);

      if (mediaObj) {
        // Find the division within the selected layout
        const division = selectedLayout.divisions.find(
          (div) => div.id === divisionId
        );

        if (division) {
          // Add the new media to the array of imageSrcs and durations
          const updatedImageSrcs = [
            ...(division.imageSrcs || []),
            mediaObj.src,
          ];

          const updatedDurations = [
            ...(division.durations || []),
            type === "video" ? mediaObj.duration : mediaObj.duration, // Default duration for images is 4 seconds
          ];

          dispatch(
            updateDivision({
              id: divisionId,
              changes: {
                imageSrcs: updatedImageSrcs,
                durations: updatedDurations,
              },
            })
          );
        }
      }
    }
  };

  const handlePreviewClick = () => {
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleMediaClick = (src, id) => {
    const division = selectedLayout.divisions.find((div) =>
      div.imageSrcs.includes(src)
    );

    if (division) {
      const mediaIndex = division.imageSrcs.indexOf(src);
      const mediaDuration = division.durations[mediaIndex];

      setSelectedMedia({
        src,
        id,
        duration: mediaDuration, // Store the media duration
      });
    }
  };

  const handleRemoveMedia = () => {
    const { src } = selectedMedia;
    const division = selectedLayout.divisions.find((div) =>
      div.imageSrcs.includes(src)
    );

    if (division) {
      const updatedImageSrcs = division.imageSrcs.filter(
        (imageSrc) => imageSrc !== src
      );
      const updatedDurations = division.durations.filter(
        (_, index) => division.imageSrcs[index] !== src
      );

      dispatch(
        updateDivision({
          id: division.id,
          changes: { imageSrcs: updatedImageSrcs, durations: updatedDurations },
        })
      );
    }
    setSelectedMedia(null);
  };

  const handleDurationChange = (mediaId, newDuration) => {
    const { src } = selectedMedia;
    const division = selectedLayout.divisions.find((div) =>
      div.imageSrcs.includes(src)
    );

    if (division) {
      const mediaIndex = division.imageSrcs.indexOf(src);
      const updatedDurations = [...division.durations];
      updatedDurations[mediaIndex] = newDuration;

      dispatch(
        updateDivision({
          id: division.id,
          changes: { durations: updatedDurations },
        })
      );
    }
  };

  return (
    <div style={{ margin: "20px", backgroundColor: "#FAF9F6" }}>
      <h1
        style={{
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          color: "#333",
        }}
      >
        Create Custom Layout
      </h1>

      {/* this is device resolution code start */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="deviceResolution" style={{ fontWeight: "600" }}>
          Device Resolution:{" "}
        </label>
        <select
          id="deviceResolution"
          value={deviceResolution}
          onChange={handleDeviceResolutionChange}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "200px",
            fontSize: "16px",
          }}
        >
          <option value="HD 720P">HD 720P</option>
          <option value="Full HD 1080P">Full HD 1080P</option>
          <option value="Ultra HD 4K">Ultra HD 4K</option>
        </select>
      </div>
      {/* this is device resolution code end */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value)}
          placeholder="Enter layout name"
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginBottom: "10px",
            width: "300px",
            fontSize: "16px",
          }}
        />
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={handleSaveLayout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Save Layout
          </button>
          <button
            onClick={handleAddDivision}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
          >
            Add Division
          </button>
        </div>
        <LayoutPreview
          divisions={selectedLayout.divisions}
          onDivisionChange={handleDivisionChange}
          onDropImage={handleDropMedia}
          style={{
            border: "3px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            width: "80%",
            marginBottom: "20px",
          }}
        />
        {selectedLayout.divisions.map((div, index) => (
          <ScreenDivision key={div.id} index={index} division={div} />
        ))}
      </div>

      <h2 className="custom-layout-title">Saved Layouts</h2>
      <div className="custom-layout-container">
        {layouts.map((layout) => (
          <div
            key={layout.id}
            className={`custom-layout-card ${
              selectedLayout && selectedLayout.id === layout.id
                ? "custom-layout-card-selected"
                : ""
            }`}
            onClick={() => handleSelectLayout(layout)}
          >
            <h3 className="custom-layout-name">{layout.name}</h3>
            <div className="custom-layout-button-container">
              <button
                className="custom-layout-button"
                onClick={() => handleLoadLayout(layout.id)}
              >
                Load
              </button>
              <button
                className="custom-layout-button custom-layout-button-delete"
                onClick={() => handleDeleteLayout(layout.id)}
              >
                Delete
              </button>
            </div>
            <div className="custom-layout-preview-container">
              <LayoutPreview divisions={layout.divisions} isPreview={true} />
            </div>
          </div>
        ))}
      </div>

      {selectedLayout && (
        <div className="custom-layout-timeline-container">
          <h2 className="custom-layout-timeline-title">
            Timeline for Layout: {selectedLayout.name}
          </h2>
          <div className="custom-layout-timeline">
            {selectedLayout.divisions.map((division, index) => (
              <div
                key={division.id}
                className="custom-layout-timeline-division"
                onDrop={(e) => handleDropMedia(division.id, e)}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="custom-layout-timeline-index">{index + 1}</div>
                <div className="custom-layout-timeline-content">
                  {division.imageSrcs &&
                    division.imageSrcs.map((src, i) =>
                      src.endsWith(".mp4") ? (
                        <video
                          key={i}
                          src={src}
                          controls={false}
                          muted
                          className="custom-layout-video"
                          onClick={() => handleMediaClick(src, i)}
                        />
                      ) : (
                        <img
                          key={i}
                          src={src}
                          alt="Dropped"
                          className="custom-layout-image"
                          onClick={() => handleMediaClick(src, i)}
                        />
                      )
                    )}
                </div>
              </div>
            ))}
            <button
              onClick={handlePreviewClick}
              className="custom-layout-preview-button"
            >
              Preview Layout
            </button>
          </div>
        </div>
      )}

      <h2>Images & Videos Gallery</h2>
      <div style={{ display: "flex", flexWrap: "wrap", cursor: "pointer" }}>
        {images.map((item, index) => (
          <img
            src={item.src}
            key={index}
            alt="images"
            height={60}
            width={100}
            style={{ margin: "5px" }}
            draggable
            onDragStart={() => handleDragStart({ id: item.id, type: "image" })} // Set the image ID on drag start
          />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", cursor: "pointer" }}>
        {videos.map((video, index) => (
          <video
            key={index}
            src={video.src}
            height={60}
            width={100}
            autoPlay
            muted
            loop
            controls={false}
            style={{ margin: "5px" }}
            draggable
            onDragStart={() => handleDragStart({ id: video.id, type: "video" })} // Set the video ID on drag start
          />
        ))}
      </div>

      {isPreviewOpen && (
        <Preview layout={selectedLayout} onClose={handleClosePreview} />
      )}

      {selectedMedia && (
        <TimelineMedia
          mediaSrc={selectedMedia.src}
          mediaId={selectedMedia.id}
          duration={selectedMedia.duration} // Pass the current duration here
          onRemove={handleRemoveMedia}
          onClose={() => setSelectedMedia(null)}
          onDurationChange={handleDurationChange} // Add the onDurationChange handler
        />
      )}
    </div>
  );
};

export default CustomLayoutPage;
