import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const URL = import.meta.env.VITE_CLASSIFIED_AD_SYSTEM_URL;

export const authApi = createApi({
    reducerPath: "auth",
    baseQuery: fetchBaseQuery({ baseUrl: URL }),
    endpoints: (builder) => ({
        signup: builder.mutation({
            query: (data) => ({
                url: "/auth/signup",
                method: "POST",
                body: data
            })
        }),
        login: builder.mutation({
            query: (data) => ({
                url: "/auth/login",
                method: "POST",
                body: data
            })
        }),
        resetPassword: builder.mutation({
            query: (data) => ({
                url: "/auth/resetPassword",
                method: "POST",
                body: data
            })
        }),
        
    })
});

export const { useSignupMutation, useLoginMutation, useResetPasswordMutation } = authApi;