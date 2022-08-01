import { createAsyncThunk } from '@reduxjs/toolkit';
import { guppyUrl } from '../../localconf';
import { fetchWithCreds } from '../../utils.fetch';

export const fetchDataVersion = createAsyncThunk(
  'versionInfo/fetchDataVersion',
  async () => {
    const { data, status } = await fetchWithCreds({
      path: `${guppyUrl}/_data_version`,
      method: 'GET',
      useCache: true,
    });

    if (status !== 200) throw Error();
    return data;
  }
);
