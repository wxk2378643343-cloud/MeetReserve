import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '@/types';
import * as authApi from '@/api/auth';
import { setToken, removeToken, getToken } from '@/utils/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: getToken(),
  loading: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async (params: { username: string; password: string }) => {
    const result = await authApi.login(params);
    setToken(result.token);
    return { token: result.token, user: result.user };
  }
);

export const fetchUserInfo = createAsyncThunk('auth/fetchUserInfo', async () => {
  return authApi.getMe();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null;
      state.token = null;
      removeToken();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state) => {
        state.user = null;
        state.token = null;
        removeToken();
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
