import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen:false,
  selected:0,
  pageX:0,
  pageY:0,
};

const interactSlice = createSlice({
  name: "interact",
  initialState,
  reducers: {
    setInteract: (state, action) => {
      state.isOpen = action.payload.isOpen;
      state.selected = action.payload.selected;
      state.pageX = action.payload.pageX;
      state.pageY = action.payload.pageY;
    },
  },
});

export const { setInteract } = interactSlice.actions;
export default interactSlice.reducer;