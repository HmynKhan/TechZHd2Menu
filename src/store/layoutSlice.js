import { createSlice } from "@reduxjs/toolkit";

const layoutSlice = createSlice({
  name: "layout",
  initialState: {
    layouts: [],
    currentLayout: {
      id: null,
      name: "",
      divisions: [],
      // this is device resolution code start
      deviceResolution: "Full HD 1080P", // Default resolution
      // this is device resolution code end
    },
  },
  reducers: {
    addDivision: (state, action) => {
      const newDivision = {
        id: Date.now(), // Unique ID for each division
        ...action.payload,
      };
      state.currentLayout.divisions.push(newDivision);
    },
    updateDivision: (state, action) => {
      const { id, changes } = action.payload;
      const index = state.currentLayout.divisions.findIndex(
        (div) => div.id === id
      );
      if (index !== -1) {
        state.currentLayout.divisions[index] = {
          ...state.currentLayout.divisions[index],
          ...changes,
        };
      }
    },
    removeDivision: (state, action) => {
      state.currentLayout.divisions = state.currentLayout.divisions.filter(
        (div) => div.id !== action.payload
      );
    },
    saveLayout: (state, action) => {
      const layout = {
        id: Date.now(),
        name: action.payload.name,
        divisions: [...state.currentLayout.divisions],
        // this is device resolution code start
        deviceResolution: state.currentLayout.deviceResolution,
        // this is device resolution code end
      };
      state.layouts.push(layout);
      state.currentLayout = { id: null, name: "", divisions: [] };
    },
    loadLayout: (state, action) => {
      const layout = state.layouts.find(
        (layout) => layout.id === action.payload
      );
      if (layout) {
        state.currentLayout = { ...layout };
      }
    },
    deleteLayout: (state, action) => {
      state.layouts = state.layouts.filter(
        (layout) => layout.id !== action.payload
      );
    },
    // this is device resolution code start
    updateDeviceResolution: (state, action) => {
      state.currentLayout.deviceResolution = action.payload;
    },
    // this is device resolution code end
  },
});

export const {
  addDivision,
  updateDivision,
  removeDivision,
  saveLayout,
  loadLayout,
  deleteLayout,
  updateDeviceResolution,
} = layoutSlice.actions;

export default layoutSlice.reducer;
