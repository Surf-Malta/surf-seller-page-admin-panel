import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AdminState {
  activeTab: string;
  previewMode: boolean;
  unsavedChanges: boolean;
}

const initialState: AdminState = {
  activeTab: "navigation",
  previewMode: false,
  unsavedChanges: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setPreviewMode: (state, action: PayloadAction<boolean>) => {
      state.previewMode = action.payload;
    },
    setUnsavedChanges: (state, action: PayloadAction<boolean>) => {
      state.unsavedChanges = action.payload;
    },
  },
});

export const { setActiveTab, setPreviewMode, setUnsavedChanges } =
  adminSlice.actions;
export default adminSlice.reducer;
