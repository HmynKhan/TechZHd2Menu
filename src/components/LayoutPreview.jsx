import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Transformer, Text } from "react-konva";

const LayoutPreview = ({ divisions, isPreview = false, onDivisionChange }) => {
  const [selectedId, setSelectedId] = useState(null);
  const transformerRef = useRef(null);
  const rectRefs = useRef([]);

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleDeselect = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const selectedNode = rectRefs.current.find(
        (rect) => rect && rect.attrs.id === selectedId
      );
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  const handleDragEnd = (id, e) => {
    if (!isPreview && onDivisionChange) {
      const { x, y } = e.target.position();
      const stage = e.target.getStage();
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      const node = e.target;

      // Ensure the division doesn't go out of bounds
      const newX = Math.max(0, Math.min(x, stageWidth - node.width()));
      const newY = Math.max(0, Math.min(y, stageHeight - node.height()));

      onDivisionChange(id, { x: newX, y: newY });
    }
  };

  const handleTransformEnd = (id, e) => {
    if (!isPreview && onDivisionChange) {
      const node = e.target;
      const stage = node.getStage();
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      const width = node.width() * node.scaleX();
      const height = node.height() * node.scaleY();

      // Reset scale to avoid double-scaling
      node.scaleX(1);
      node.scaleY(1);

      // Ensure the division doesn't go out of bounds
      const x = Math.max(0, Math.min(node.x(), stageWidth - width));
      const y = Math.max(0, Math.min(node.y(), stageHeight - height));

      onDivisionChange(id, { width, height, x, y });
    }
  };

  const stageWidth = isPreview ? 150 : 720;
  const stageHeight = isPreview ? 80 : 380;
  const scaleX = isPreview ? stageWidth / 725 : 1;
  const scaleY = isPreview ? stageHeight / 380 : 1;

  return (
    <div
      style={{
        border: isPreview ? "none" : "2px solid black",
        width: `${stageWidth}px`,
        height: `${stageHeight}px`,
      }}
    >
      <Stage
        width={stageWidth}
        height={stageHeight}
        onMouseDown={handleDeselect}
      >
        <Layer>
          {divisions.map((div, i) => (
            <React.Fragment key={div.id}>
              <Rect
                id={div.id} // ID should be a string
                x={div.x * scaleX}
                y={div.y * scaleY}
                width={div.width * scaleX}
                height={div.height * scaleY}
                fill={
                  i === divisions.length - 1 && !isPreview
                    ? "lightpink"
                    : "lightblue"
                }
                stroke="black" // Border color
                strokeWidth={2} // Border width
                draggable={!isPreview}
                onClick={() => handleSelect(div.id)}
                onTap={() => handleSelect(div.id)}
                onDragEnd={(e) => handleDragEnd(div.id, e)}
                onTransformEnd={(e) => handleTransformEnd(div.id, e)}
                ref={(node) => (rectRefs.current[i] = node)}
              />
              <Text
                text={i + 1}
                x={div.x * scaleX + 5}
                y={div.y * scaleY + 5}
                fontSize={18}
                fill="black"
              />
            </React.Fragment>
          ))}
          {selectedId && !isPreview && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default LayoutPreview;
