import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  searchWord:''
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.searchWord = action.payload.searchWord;
    },
  },
});

export const { setSearch } = searchSlice.actions;
export default searchSlice.reducer;