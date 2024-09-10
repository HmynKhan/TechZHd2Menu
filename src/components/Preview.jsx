import React, { useEffect, useState, useRef } from "react";
// import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"; // Correct import

const Preview = ({ layout, onClose }) => {
  const [currentContent, setCurrentContent] = useState([]);
  const totalDuration = useRef(0);
  const elapsedDuration = useRef(0); // Track total elapsed duration
  // const ffmpeg = useRef(null); // Store ffmpeg instance with useRef
  // const [ffmpegReady, setFfmpegReady] = useState(false);
  const videoRefs = useRef([]); // Store refs to each video element

  // Initialize FFmpeg instance
  // useEffect(() => {
  //   const loadFFmpeg = async () => {
  //     if (!ffmpeg.current) {
  //       ffmpeg.current = createFFmpeg({ log: true }); // Correct initialization
  //       await ffmpeg.current.load();
  //       setFfmpegReady(true);
  //     }
  //   };
  //   loadFFmpeg();
  // }, []);

  useEffect(() => {
    if (layout && layout.divisions) {
      const content = layout.divisions.map((division) => {
        let divisionDuration = 0;

        division.imageSrcs.forEach((src, index) => {
          const mediaDuration = division.durations[index]
            ? division.durations[index] * 1000
            : 4000; // Fallback to 4 seconds if duration is missing
          divisionDuration += mediaDuration;
        });

        return {
          division,
          contentIndex: 0,
          divisionDuration,
        };
      });

      totalDuration.current = Math.max(
        ...content.map((c) => c.divisionDuration)
      );

      setCurrentContent(content);
    }
  }, [layout]);

  // Update content based on duration
  useEffect(() => {
    if (currentContent.length > 0) {
      const timers = currentContent.map(({ division, contentIndex }, i) => {
        const duration = division.durations[contentIndex]
          ? division.durations[contentIndex] * 1000
          : 4000; // Fallback to 4 seconds if duration is missing

        // Adjust to ensure video pauses correctly
        const mediaElement = videoRefs.current[i];
        if (mediaElement && mediaElement.pause) {
          mediaElement.pause();
        }

        // Handle video playback and pause
        const timeoutId = setTimeout(() => {
          updateContent(i, division, contentIndex, duration);

          // Ensure the last video pauses correctly
          if (i === currentContent.length - 1) {
            const lastMediaElement = videoRefs.current[i];
            if (lastMediaElement) {
              lastMediaElement.onended = () => {
                lastMediaElement.pause();
                lastMediaElement.currentTime = 0;
              };
            }
          }
        }, duration);

        return timeoutId;
      });

      // Cleanup timers on component unmount
      return () => timers.forEach((timer) => clearTimeout(timer));
    }
  }, [currentContent]);

  // Function to update content and handle loop if video
  const updateContent = (i, division, contentIndex, duration) => {
    const newContent = [...currentContent];

    if (contentIndex + 1 < division.imageSrcs.length) {
      newContent[i].contentIndex = contentIndex + 1;
      setCurrentContent(newContent);
      elapsedDuration.current += duration;

      // Handle video playback
      const mediaElement = videoRefs.current[i];
      if (mediaElement) {
        // Pause and reset video to prevent interruptions
        mediaElement.pause();
        mediaElement.currentTime = 0;

        // Ensure video has loaded before attempting to play
        mediaElement.oncanplay = () => {
          mediaElement.play().catch((error) => {
            console.error("Error attempting to play the video:", error);
          });
        };
      }
    }
  };

  const handleDownload = () => {
    alert(
      "Video download functionality is removed. Please check your code for other actions."
    );
  };

  const renderDivision = (division, contentIndex, index) => {
    if (!division || !division.imageSrcs || division.imageSrcs.length === 0) {
      return (
        <div
          style={{
            width: `${division.width}px`,
            height: `${division.height}px`,
            backgroundColor: division.color || "lightgray",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p>No media available</p>
        </div>
      );
    }

    const mediaSrc = division.imageSrcs[contentIndex];

    if (!mediaSrc) {
      return (
        <div
          style={{
            width: `${division.width}px`,
            height: `${division.height}px`,
            backgroundColor: division.color || "lightgray",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p>No media available</p>
        </div>
      );
    }

    if (mediaSrc.endsWith(".mp4")) {
      return (
        <video
          ref={(el) => (videoRefs.current[index] = el)}
          src={mediaSrc}
          autoPlay
          controls={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
          onLoadedData={() => {
            // Ensure video is properly loaded
            const mediaElement = videoRefs.current[index];
            if (mediaElement && mediaElement.readyState >= 3) {
              mediaElement.play().catch((error) => {
                console.error("Error attempting to play the video:", error);
              });
            }
          }}
        />
      );
    } else {
      return (
        <img
          src={mediaSrc}
          alt="content"
          style={{
            width: `${division.width}px`,
            height: `${division.height}px`,
            objectFit: "cover",
          }}
        />
      );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
        <h2>Preview Layout: {layout.name}</h2>
        <div
          style={{
            position: "relative",
            width: "720px",
            height: "380px",
            border: "2px solid black",
          }}
        >
          {currentContent.map(({ division, contentIndex }, i) => (
            <div
              key={division.id}
              style={{
                position: "absolute",
                top: `${division.y}px`,
                left: `${division.x}px`,
                width: `${division.width}px`,
                height: `${division.height}px`,
                backgroundColor: division.color || "lightgray",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {renderDivision(division, contentIndex, i)}
            </div>
          ))}
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
        >
          Download Video
        </button>
      </div>
    </div>
  );
};

export default Preview;
