import {configureStore} from "@reduxjs/toolkit"
import {authApi} from "../apis/authApis"
import { listingApi } from "../apis/listingApi"
import {adminApi} from "../apis/adminApi"

export const store = configureStore({
    reducer:{
        [authApi.reducerPath]: authApi.reducer,
        [listingApi.reducerPath]: listingApi.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
    },
    middleware:(getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware, listingApi.middleware, adminApi.middleware)
})