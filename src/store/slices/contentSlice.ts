import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  PageContent,
  HeroContent,
  FeaturesContent,
  CTAContent,
} from "@/types/content";

interface ContentState {
  pageContent: PageContent | null;
  loading: boolean;
  error: string | null;
}

const initialState: ContentState = {
  pageContent: null,
  loading: false,
  error: null,
};

// Async thunks for Firebase operations
export const fetchPageContent = createAsyncThunk(
  "content/fetchPageContent",
  async () => {
    const docRef = doc(db, "page_content", "homepage");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as PageContent;
    } else {
      // Return default content if none exists
      const defaultContent: PageContent = {
        hero: {
          title: "Welcome to Our Platform",
          subtitle: "Discover Amazing Features",
          description:
            "Transform your experience with our innovative solutions designed for modern needs.",
          primaryButtonText: "Get Started",
          secondaryButtonText: "Learn More",
        },
        features: {
          title: "Why Choose Us",
          subtitle: "Powerful Features",
          features: [
            {
              id: "1",
              title: "Fast Performance",
              description:
                "Lightning-fast loading and seamless user experience.",
              icon: "⚡",
            },
            {
              id: "2",
              title: "Secure Platform",
              description: "Enterprise-grade security to protect your data.",
              icon: "🔒",
            },
            {
              id: "3",
              title: "24/7 Support",
              description: "Round-the-clock customer support for your needs.",
              icon: "🎧",
            },
          ],
        },
        cta: {
          title: "Ready to Get Started?",
          description: "Join thousands of satisfied customers today.",
          buttonText: "Start Now",
          backgroundColor: "bg-blue-600",
        },
      };

      // Save default content to Firebase
      await setDoc(doc(db, "page_content", "homepage"), defaultContent);
      return defaultContent;
    }
  }
);

export const saveHeroContent = createAsyncThunk(
  "content/saveHeroContent",
  async (heroContent: HeroContent, { getState }) => {
    const state = getState() as { content: ContentState };
    const updatedContent = {
      ...state.content.pageContent,
      hero: heroContent,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "page_content", "homepage"), updatedContent);
    return updatedContent;
  }
);

export const saveFeaturesContent = createAsyncThunk(
  "content/saveFeaturesContent",
  async (featuresContent: FeaturesContent, { getState }) => {
    const state = getState() as { content: ContentState };
    const updatedContent = {
      ...state.content.pageContent,
      features: featuresContent,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "page_content", "homepage"), updatedContent);
    return updatedContent;
  }
);

export const saveCTAContent = createAsyncThunk(
  "content/saveCTAContent",
  async (ctaContent: CTAContent, { getState }) => {
    const state = getState() as { content: ContentState };
    const updatedContent = {
      ...state.content.pageContent,
      cta: ctaContent,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "page_content", "homepage"), updatedContent);
    return updatedContent;
  }
);

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    updateHeroContentLocally: (state, action: PayloadAction<HeroContent>) => {
      if (state.pageContent) {
        state.pageContent.hero = action.payload;
      }
    },
    updateFeaturesContentLocally: (
      state,
      action: PayloadAction<FeaturesContent>
    ) => {
      if (state.pageContent) {
        state.pageContent.features = action.payload;
      }
    },
    updateCTAContentLocally: (state, action: PayloadAction<CTAContent>) => {
      if (state.pageContent) {
        state.pageContent.cta = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPageContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPageContent.fulfilled, (state, action) => {
        state.loading = false;
        state.pageContent = action.payload;
      })
      .addCase(fetchPageContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch page content";
      })
      .addCase(saveHeroContent.fulfilled, (state, action) => {
        state.pageContent = action.payload;
      })
      .addCase(saveFeaturesContent.fulfilled, (state, action) => {
        state.pageContent = action.payload;
      })
      .addCase(saveCTAContent.fulfilled, (state, action) => {
        state.pageContent = action.payload;
      });
  },
});

export const {
  updateHeroContentLocally,
  updateFeaturesContentLocally,
  updateCTAContentLocally,
} = contentSlice.actions;
export default contentSlice.reducer;
