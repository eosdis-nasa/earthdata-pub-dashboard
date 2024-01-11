import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { get as getProperty } from 'object-path';
import _config from '../../config';

const {apiRoot} = _config

export const rtkApiSlice = createApi({
    reducerPath: 'rtkApiSlice',
    baseQuery: fetchBaseQuery({
        baseUrl: apiRoot,
        prepareHeaders: (headers, { getState }) => {
            const token = getProperty(getState(), 'api.tokens.token')
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        }
    }),
    endpoints: builder => ({
        listRequests: builder.query({
            query: ({}) => ({
                url: 'data/submission/operation/active',
                method: 'POST'
            }),
        }),
        getRequestDetails: builder.query({
            query: ({requestId}) => ({
                url: `data/submission/${requestId}/details`,
                method: 'GET',
            }),
        }),
        copyRequest: builder.query({
            query: ({ payload }) => ({
                url: 'data/submission/operation/copySubmission',
                method: 'POST',
                body: payload
            }),
        }),
        withdrawRequest: builder.query({
            query: ({ requestId }) => ({
                url: 'data/submission/operation/withdrawSubmission',
                method: 'POST',
                body: {id: requestId}
            }),
        }),
        restoreRequest: builder.query({
            query: ({ requestId }) => ({
                url: 'data/submission/operation/restoreSubmission',
                method: 'POST',
                body: {id: requestId}
            }),
        }),
        addUserToRequest: builder.query({
            query: ({ payload }) => ({
                url: 'data/submission/operation/addContributors',
                method: 'POST',
                body: payload
            }),
        }),
        listFileUploadsBySubmission: builder.query({
            query: ({ submissionId }) => ({
                url: `data/upload/list/${submissionId}`,
                method: 'GET'
            }),
        }),
        listFileDownloadsByKey: builder.query({
            query: ({ key }) => ({
                url: `data/upload/downloadUrl/${key}`,
                method: 'GET'
            }),
        }),
    })
})

export const { 
    useListRequestsQuery,
    useGetRequestDetailsQuery,
    useCopyRequestQuery,
    useWithdrawRequestQuery,
    useRestoreRequestQuery,
    useAddUserToRequestQuery,
    useListFileUploadsBySubmissionQuery,
    useListFileDownloadsByKeyQuery,
} = rtkApiSlice