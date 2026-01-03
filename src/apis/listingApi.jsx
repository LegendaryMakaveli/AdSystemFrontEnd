import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const URL = import.meta.env.VITE_CLASSIFIED_AD_SYSTEM_URL;

export const listingApi = createApi({
    reducerPath: "listingApi",
    baseQuery: fetchBaseQuery({baseUrl: URL,
      prepareHeaders: (headers, {endpoint}) => {
        if(endpoint !== 'addImage'){
          const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
          }
            
            return headers;
        }
    }),
    endpoints: (builder) => ({
    createListing: builder.mutation({ 
      query: (data) => ({
        url: "/listings/create",
        method: "POST",
        body: data
      }),
    }),

    addImage: builder.mutation({
      query: ({ id, token, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/listings/${id}/addImages?token=${token}`,
          method: "POST",
          body: formData
        };
      },
    }),

    getAll: builder.query({
      query: () => "/listings/getAll",
      transformResponse: (response) => {
      console.log("API Response:", response);
      return response.data || response;
      },
    }),

    getListingById: builder.query({
      query: (id) => `/listings/${id}`,
      transformResponse: (response) => response.data || response,
    }),
  

    updateListing: builder.mutation({
      query: ({ id, token, data }) => ({
        url: `/listings/update/${id}?token=${token}`,
        method: "PUT",
        body: data
      }),
    }),

    deleteListing: builder.mutation({
      query: ({ id, token }) => ({
        url: `/listings/delete/${id}?token=${token}`,
        method: "DELETE"
      }),
    })
  }),
});

export const {
  useGetAllQuery,
  useCreateListingMutation,
  useAddImageMutation,
  useGetListingByIdQuery,
  useUpdateListingMutation,
  useDeleteListingMutation
} = listingApi;