/*
 *
 * Hedera Custodians Integration
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import axios from 'axios';

/**
 * Patch axios.create to automatically add interceptors that remove
 * non-serializable properties from responses. This affects all axios
 * instances created by SDKs like fireblocks-sdk.
 */
const originalCreate = axios.create.bind(axios);

axios.create = function (...args) {
  const instance = originalCreate(...args);

  instance.interceptors.response.use(
    (response) => {
      if (response.config) {
        delete response.config.adapter;
        delete response.config.httpAgent;
        delete response.config.httpsAgent;
        delete response.config.transformRequest;
        delete response.config.transformResponse;
      }
      if (response.request) {
        delete response.request;
      }
      return response;
    },
    (error) => {
      if (error.config) {
        delete error.config.adapter;
        delete error.config.httpAgent;
        delete error.config.httpsAgent;
        delete error.config.transformRequest;
        delete error.config.transformResponse;
      }
      if (error.request) {
        delete error.request;
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Also add interceptor to the default axios instance
axios.interceptors.response.use(
  (response) => {
    if (response.config) {
      delete response.config.adapter;
      delete response.config.httpAgent;
      delete response.config.httpsAgent;
      delete response.config.transformRequest;
      delete response.config.transformResponse;
    }
    if (response.request) {
      delete response.request;
    }
    return response;
  },
  (error) => {
    if (error.config) {
      delete error.config.adapter;
      delete error.config.httpAgent;
      delete error.config.httpsAgent;
      delete error.config.transformRequest;
      delete error.config.transformResponse;
    }
    if (error.request) {
      delete error.request;
    }
    return Promise.reject(error);
  }
);
