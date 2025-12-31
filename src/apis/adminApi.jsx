import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const URL = import.meta.env.VITE_CLASSIFIED_AD_SYSTEM_URL;

export const adminApi = createApi({
  reducerPath: "adminApi",
    baseQuery: fetchBaseQuery({
        baseUrl: URL,
        prepareHeaders: (headers) => {
        const token = localStorage.getItem("token");
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
        },
  }),
  tagTypes: ["Users", "Listings"],
    endpoints: (builder) => ({
        getAllUsers: builder.query({
            query: () => "/admin/getAllUser",
            providesTags: ["Users"],
        }),


        getUserById: builder.query({
            query: (id) => `/admin/getUser/${id}`,
        }),


        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/admin/delete/${id}`,
                method: "POST",
        }),
        invalidatesTags: ["Users"],
        }),


        upgradeUser: builder.mutation({
            query: (id) => ({
                url: `/admin/users/${id}/upgrade`,
                method: "POST",
        }),
        invalidatesTags: ["Users"],
        }),


        downgradeUser: builder.mutation({
            query: (id) => ({
                url: `/admin/users/${id}/downgrade`,
                method: "POST",
        }),
        invalidatesTags: ["Users"],
        }),
        

        getAllListings: builder.query({
            query: () => "/admin/getAllListing",
            providesTags: ["Listings"],
        }),


        deleteListing: builder.mutation({
            query: (id) => ({
                url: `/admin/deleteListing/${id}`,
                method: "POST",
        }),
        invalidatesTags: ["Listings"],
        }),


        getListingsByUserId: builder.query({
            query: (id) => `/admin/getListingByUserId/${id}`,
        }),
    }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useDeleteUserMutation,
  useUpgradeUserMutation,
  useDowngradeUserMutation,
  useGetAllListingsQuery,
  useDeleteListingMutation,
  useGetListingsByUserIdQuery,
} = adminApi;