import { trpcClient } from '@bns-x/client';
import { getApiUrl, getAppUrl } from '@common/constants';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { atomFamily } from 'jotai/utils';

export const trpc = trpcClient(getApiUrl());

export const namesForAddressState = atomFamily((address: string) => {
  return atomsWithQuery(() => ({
    queryKey: ['apiNamesState', address],
    refetchInterval: 15000,
    queryFn: async () => {
      return trpc.getAddressNames.query(address);
    },
  }))[0];
}, Object.is);

export const allNostrNamesState = atomsWithQuery(() => ({
  queryKey: ['all-nostr'],
  refetchInterval: false,
  queryFn: async () => {
    const all = await trpc.zonefiles.allNostr.query();
    return all.results;
  },
}))[0];
