// store/slices/navigationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  ref,
  get,
  set,
  remove,
  push,
  child,
  query,
  orderByChild,
  onValue,
} from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { NavigationItem } from "@/types/navigation";

interface NavigationState {
  items: NavigationItem[];
  activeItem: string;
  loading: boolean;
  error: string | null;
}

const initialState: NavigationState = {
  items: [],
  activeItem: "",
  loading: false,
  error: null,
};

// Async thunks for Realtime Database operations
export const fetchNavigationItems = createAsyncThunk(
  "navigation/fetchItems",
  async () => {
    const navRef = query(
      ref(realtimeDb, "navigation_items"),
      orderByChild("order")
    );
    const snapshot = await get(navRef);
    const items: NavigationItem[] = [];
    snapshot.forEach((childSnapshot) => {
      items.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      } as NavigationItem);
    });
    return items;
  }
);

export const listenForNavigationChanges = createAsyncThunk(
  "navigation/listenForChanges",
  async (_, { dispatch }) => {
    const navRef = ref(realtimeDb, "navigation_items");
    onValue(navRef, (snapshot) => {
      const items: NavigationItem[] = [];
      snapshot.forEach((childSnapshot) => {
        items.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        } as NavigationItem);
      });
      dispatch(setNavigationItems(items));
    });
  }
);

export const saveNavigationItem = createAsyncThunk(
  "navigation/saveItem",
  async (item: NavigationItem) => {
    if (item.id) {
      await set(ref(realtimeDb, `navigation_items/${item.id}`), {
        label: item.label,
        href: item.href,
        description: item.description,
        order: item.order,
      });
    } else {
      const newItemRef = push(ref(realtimeDb, "navigation_items"));
      await set(newItemRef, {
        label: item.label,
        href: item.href,
        description: item.description,
        order: item.order,
      });
      return { ...item, id: newItemRef.key };
    }
    return item;
  }
);

export const deleteNavigationItem = createAsyncThunk(
  "navigation/deleteItem",
  async (itemId: string) => {
    await remove(ref(realtimeDb, `navigation_items/${itemId}`));
    return itemId;
  }
);

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setActiveItem: (state, action: PayloadAction<string>) => {
      state.activeItem = action.payload;
    },
    setNavigationItems: (state, action: PayloadAction<NavigationItem[]>) => {
      state.items = action.payload;
    },
    updateItemLocally: (state, action: PayloadAction<NavigationItem>) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItemLocally: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNavigationItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNavigationItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNavigationItems.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch navigation items";
      })
      .addCase(saveNavigationItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(deleteNavigationItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const {
  setActiveItem,
  setNavigationItems,
  updateItemLocally,
  removeItemLocally,
} = navigationSlice.actions;
export default navigationSlice.reducer;
