import React, { useState, useEffect, useRef } from "react";
import "./TimelineMedia.css";

const TimelineMedia = ({
  mediaSrc,
  mediaId,
  onRemove,
  onClose,
  onDurationChange,
  duration: initialDuration,
}) => {
  const [duration, setDuration] = useState(initialDuration || 5);

  const videoRef = useRef(null);

  useEffect(() => {
    // Ensure the duration is set correctly when the component mounts or initialDuration changes
    setDuration(initialDuration);
  }, [initialDuration]);

  useEffect(() => {
    if (videoRef.current) {
      const videoElement = videoRef.current;
      videoElement.currentTime = 0;
      videoElement.play();

      // Pause and set the video end time to the assigned duration
      const handleTimeUpdate = () => {
        if (videoElement.currentTime >= duration) {
          videoElement.pause();
        }
      };

      videoElement.addEventListener("timeupdate", handleTimeUpdate);

      // Cleanup event listener on unmount
      return () => {
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [duration]);

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value, 10);
    setDuration(newDuration);
    onDurationChange(mediaId, newDuration); // Trigger the change
  };

  return (
    <div className="timeline-media-overlay">
      <div className="timeline-media-content">
        <button className="timeline-media-close-button" onClick={onClose}>
          Close
        </button>
        {mediaSrc.endsWith(".mp4") ? (
          <video
            src={mediaSrc}
            controls={false}
            muted
            className="timeline-media-video"
            style={{ pointerEvents: "none" }}
          />
        ) : (
          <img src={mediaSrc} alt="Media" className="timeline-media-image" />
        )}
        <div className="timeline-media-details">
          <p className="timeline-media-id">ID: {mediaId}</p>
          <div className="timeline-media-duration">
            <label htmlFor="duration">Duration (seconds): </label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={handleDurationChange}
              min="1"
              className="duration-input"
            />
          </div>
        </div>
        <button className="timeline-media-remove-button" onClick={onRemove}>
          Remove Media
        </button>
      </div>
    </div>
  );
};

export default TimelineMedia;
