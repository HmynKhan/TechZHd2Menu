import React from "react";
import { useDrag } from "react-dnd";

const DraggableImage = ({ id, src }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "image",
    item: { id, src },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <img
      ref={drag}
      src={src}
      alt={`image-${id}`}
      style={{
        width: "95px",
        height: "60px",
        margin: "5px",
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    />
  );
};

export default DraggableImage;
