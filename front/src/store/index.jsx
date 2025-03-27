import { configureStore,createSlice } from '@reduxjs/toolkit'

let serverIP = createSlice({
    name:'serverIP',
    initialState:{
        ip:'http://localhost:9977'
    }
})

let test = createSlice({
    name:'test',
    initialState: {
        name:'an',
        good:'hi'
    },
    reducers:{
        changeTest(state, action) {
            state.name = action.payload.name;
            state.good = action.payload.good;
        }
    }
})

export let {changeTest} = test.actions;

export default configureStore({
	reducer: {
        serverIP:serverIP.reducer,
        test: test.reducer,
    }
})