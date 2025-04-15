import { configureStore, createSlice } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // JWT 세션 관리
import modalReducer from './modalSlice';
import loginViewReducer from './loginSlice'; //로그인 뷰 관리
import interactReducer from './interactSlice';
import menuReducer from './menuSlice';
import searchReducer from './searchSlice'; //검색 관리

let serverIP = createSlice({
  name: "serverIP",
  initialState: { ip: "http://192.168.1.146:9977", front: 'http://192.168.1.146:3000' }, // 서버 IP 전역 관리
});

let test = createSlice({
  name: "test",
  initialState: { name: "an", good: "hi" },
  reducers: {
    changeTest(state, action) {
      state.name = action.payload.name;
      state.good = action.payload.good;
    },
  },
});

export let { changeTest } = test.actions;

export default configureStore({
  reducer: {
    serverIP: serverIP.reducer,
    test: test.reducer,
    auth: authReducer,
    modal: modalReducer,
    loginView: loginViewReducer,
    interact: interactReducer,
    menuModal: menuReducer,
    search: searchReducer
  },
});