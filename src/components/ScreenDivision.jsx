import React from "react";
import { useDispatch } from "react-redux";
import { updateDivision, removeDivision } from "../store/layoutSlice";

const ScreenDivision = ({ division, index }) => {
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(
      updateDivision({
        id: division.id,
        changes: { [name]: parseInt(value, 10) },
      })
    );
  };

  const handleRemove = () => {
    dispatch(removeDivision(division.id));
  };

  return (
    <div style={styles.container}>
      <span style={styles.index}>{index + 1}</span>
      <label style={styles.label}>
        X:
        <input
          name="x"
          type="number"
          value={division.x}
          onChange={handleChange}
          style={styles.input}
        />
      </label>
      <label style={styles.label}>
        Y:
        <input
          name="y"
          type="number"
          value={division.y}
          onChange={handleChange}
          style={styles.input}
        />
      </label>
      <label style={styles.label}>
        Width:
        <input
          name="width"
          type="number"
          value={division.width}
          onChange={handleChange}
          style={styles.input}
        />
      </label>
      <label style={styles.label}>
        Height:
        <input
          name="height"
          type="number"
          value={division.height}
          onChange={handleChange}
          style={styles.input}
        />
      </label>
      <button onClick={handleRemove} style={styles.button}>
        Remove Division
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    margin: "10px 0",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  index: {
    marginRight: "10px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  label: {
    marginRight: "10px",
    fontSize: "16px",
    fontWeight: "normal",
  },
  input: {
    width: "60px",
    marginLeft: "5px",
    padding: "5px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    marginLeft: "auto",
    padding: "5px 10px",
    backgroundColor: "#d9534f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default ScreenDivision;
