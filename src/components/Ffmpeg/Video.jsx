import React, { useState, useRef, useEffect } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import ImageSrc from "../../assets/images";

const resolutions = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "4K Ultra HD": { width: 3840, height: 2160 },
};

const Video = () => {
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [mp4Url, setMp4Url] = useState("");
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const animationRef = useRef(null);
  const ffmpeg = useRef(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const duration = 9000; // Video duration in milliseconds

  // Load FFmpeg when component is mounted
  useEffect(() => {
    const loadFFmpeg = async () => {
      ffmpeg.current = createFFmpeg({ log: true });
      await ffmpeg.current.load();
      setFfmpegLoaded(true);
    };

    loadFFmpeg();
  }, []);

  const startRecording = () => {
    const { width, height } = resolutions[selectedResolution];
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;

    const stream = canvas.captureStream(25); // 25 FPS for video stream

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9", // WebM format for capturing
    });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: "video/webm" }); // Save as WebM
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      recordedChunks.current = []; // Reset for future recordings
    };

    mediaRecorderRef.current.start();
    setRecording(true);

    // Update canvas to apply animations during recording
    const startTime = Date.now();
    const updateCanvas = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        drawCanvas(elapsed); // Animate canvas
        animationRef.current = requestAnimationFrame(updateCanvas); // Keep updating
      } else {
        stopRecording(); // Stop recording after duration
      }
    };

    updateCanvas(); // Start updating the canvas
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    cancelAnimationFrame(animationRef.current); // Stop frame updates
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = `output_${selectedResolution}.webm`; // Save as WebM file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const convertToMp4 = async () => {
    if (!ffmpegLoaded || !videoUrl) return;

    const videoBlob = await fetchFile(videoUrl);
    ffmpeg.current.FS("writeFile", "input.webm", videoBlob);

    await ffmpeg.current.run("-i", "input.webm", "output.mp4");

    const mp4Data = ffmpeg.current.FS("readFile", "output.mp4");
    const mp4Blob = new Blob([mp4Data.buffer], { type: "video/mp4" });
    const mp4Url = URL.createObjectURL(mp4Blob);

    setMp4Url(mp4Url);
  };

  const downloadMp4 = () => {
    if (mp4Url) {
      const link = document.createElement("a");
      link.href = mp4Url;
      link.download = `output_${selectedResolution}.mp4`; // Save as MP4 file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const drawCanvas = (elapsed) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas for new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Image1: Fade in and fade out animation
    const image1 = new Image();
    image1.src = ImageSrc[0].src;
    const opacity = Math.abs(Math.sin((Math.PI * elapsed) / duration)); // Fade in/out calculation
    ctx.globalAlpha = opacity; // Set opacity for fade effect
    ctx.drawImage(image1, 0, 0, canvas.width / 2, canvas.height / 2); // Draw image 1

    // Image2: Slide in from the right
    const image2 = new Image();
    image2.src = ImageSrc[1].src;
    const slidePosition = ((elapsed / duration) * canvas.width) / 2; // Slide calculation
    ctx.globalAlpha = 1; // Reset opacity for image 2
    ctx.drawImage(
      image2,
      slidePosition,
      0,
      canvas.width / 2,
      canvas.height / 2
    ); // Slide from right to left
  };

  useEffect(() => {
    drawCanvas(0); // Initial draw before animation
  }, []);

  return (
    <div>
      <h2>Record Video with Animated Photos</h2>

      <div>
        <label htmlFor="resolution">Select Video Resolution:</label>
        <select
          id="resolution"
          value={selectedResolution}
          onChange={(e) => setSelectedResolution(e.target.value)}
        >
          {Object.keys(resolutions).map((res) => (
            <option key={res} value={res}>
              {res}
            </option>
          ))}
        </select>
      </div>

      <canvas
        ref={canvasRef}
        width={resolutions[selectedResolution].width}
        height={resolutions[selectedResolution].height}
        style={{ border: "1px solid black" }}
      ></canvas>

      <div>
        <button onClick={recording ? stopRecording : startRecording}>
          {recording ? "Stop Recording" : "Record Video"}
        </button>
      </div>

      {videoUrl && (
        <div>
          <video src={videoUrl} controls width="640" />
          <button onClick={handleDownload}>Download WebM</button>
          {ffmpegLoaded && (
            <button onClick={convertToMp4}>Convert to MP4</button>
          )}
          {mp4Url && (
            <div>
              <video src={mp4Url} controls width="640" />
              <button onClick={downloadMp4}>Download MP4</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Video;
