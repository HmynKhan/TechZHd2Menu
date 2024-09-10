import React from "react";
import images from "../assets/images"; // Import your images array
import DraggableImage from "./DraggableImage";

const ImageGallery = () => {
  return (
    <div style={{ display: "flex", overflowX: "auto", marginTop: "20px" }}>
      {images.map((image) => (
        <DraggableImage key={image.id} id={image.id} src={image.src} />
      ))}
    </div>
  );
};

export default ImageGallery;
