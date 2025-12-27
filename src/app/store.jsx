import {configureStore} from "@reduxjs/toolkit"
import {authApi} from "../apis/authApis"
import { listingApi } from "../apis/listingApi"

export const store = configureStore({
    reducer:{
        [authApi.reducerPath]: authApi.reducer,
        [listingApi.reducerPath]: listingApi.reducer,
    },
    middleware:(getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware, listingApi.middleware)
})