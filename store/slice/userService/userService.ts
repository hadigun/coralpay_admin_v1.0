// "use client";

// import { sessionStorageName } from "@/config";
// import { User } from "@/types";
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// let sessionStorageState;
// if (typeof window !== "undefined") {
//   sessionStorageState = sessionStorage.getItem(sessionStorageName);
// }

// interface UserState {
//   user: Partial<User>;
// }

// const initialState: UserState = sessionStorageState
//   ? {
//       user: { ...JSON.parse(sessionStorageState) },
//     }
//   : {
//       user: {
//         isAuthenticated: false,
//       },
//     };

// const userServiceSlice = createSlice({
//   name: "userService",
//   initialState,
//   reducers: {
//     setUserToken: (state, action: PayloadAction<Partial<User>>) => {
//       state.user = {
//         ...action.payload,
//       };
//       sessionStorage.setItem(sessionStorageName, JSON.stringify(state.user));
//     },
//     setUser: (state, action: PayloadAction<Partial<User>>) => {
//       state.user = {
//         ...action.payload,
//       };
//       sessionStorage.setItem(sessionStorageName, JSON.stringify(state.user));
//     },
//     updateUser: (state, action: PayloadAction<Partial<User>>) => {
//       if (state?.user) {
//         state.user = { ...state.user, ...action.payload };
//         sessionStorage.setItem(sessionStorageName, JSON.stringify(state.user));
//       }
//     },
//     logoutUser: (state) => {
//       state.user = {
//         ...{
//           isAuthenticated: false,
//         },
//       };
//       sessionStorage.setItem(sessionStorageName, JSON.stringify(state.user));
//     },
//   },
// });

// export const { setUser, updateUser, logoutUser, setUserToken } =
//   userServiceSlice.actions;

// export default userServiceSlice.reducer;
"use client";

import { sessionStorageName } from "@/config";
import { User } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

let sessionStorageState;
if (typeof window !== "undefined") {
  sessionStorageState = sessionStorage.getItem(sessionStorageName);
}

interface UserState {
  user: Partial<User>;
}

const initialState: UserState = sessionStorageState
  ? {
      user: { ...JSON.parse(sessionStorageState) },
    }
  : {
      user: {
        isAuthenticated: false,
      },
    };

const userServiceSlice = createSlice({
  name: "userService",
  initialState,
  reducers: {
    setUserToken: (state, action: PayloadAction<Partial<User>>) => {
      state.user = {
        ...action.payload,
      };
      sessionStorage.setItem(sessionStorageName, JSON.stringify(state.user));
    },
    setUser: (state, action: PayloadAction<Partial<User>>) => {
      state.user = {
        ...action.payload,
      };
      sessionStorage.setItem(sessionStorageName, JSON.stringify(state.user));
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state?.user) {
        state.user = { ...state.user, ...action.payload };
        sessionStorage.setItem(sessionStorageName, JSON.stringify(state.user));
      }
    },
    // Add this new action for token refresh
    updateTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>
    ) => {
      if (state?.user) {
        state.user = {
          ...state.user,
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
          expiresIn: action.payload.expiresIn,
        };
        sessionStorage.setItem(sessionStorageName, JSON.stringify(state.user));
      }
    },
    logoutUser: (state) => {
      state.user = {
        isAuthenticated: false,
      };
      sessionStorage.removeItem(sessionStorageName);
    },
  },
});

export const { setUser, updateUser, logoutUser, setUserToken, updateTokens } =
  userServiceSlice.actions;

export default userServiceSlice.reducer;
