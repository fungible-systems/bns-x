import { atom } from 'jotai';
import { atomWithHash } from 'jotai-location';
import { tupleCV, bufferCV } from 'micro-stacks/clarity';
import { asciiToBytes } from 'micro-stacks/common';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { Atom, PrimitiveAtom } from 'jotai';
import { networkAtom, stxAddressAtom } from '@store/micro-stacks';
import { fetchTransaction } from '@common/stacks-api';
import { validateStacksAddress } from 'micro-stacks/crypto';
import { bnsContractState, clarigenAtom, nameRegistryState } from '@store/index';
import { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';
import { getContractParts } from '@common/utils';

function hashAtom(name: string) {
  return typeof window === 'undefined'
    ? atom<string | undefined>(undefined)
    : atomWithHash<string | undefined>(name, undefined);
}

export const wrapperDeployTxidAtom = hashAtom('deployTx');

export const wrapperSignatureAtom = hashAtom('wrapperSig');

export const wrapperContractIdAtom = hashAtom('wrapperId');

export const migrateTxidAtom = hashAtom('migrateTxid');

export const migrateNameAtom = hashAtom('name');

export const upgradeRecipientAtom = atom('');

export const recipientAddrAtom = atom<string | null>(null);

export const migrateNameAssetIdState = atom(get => {
  const nameStr = get(migrateNameAtom);
  if (!nameStr) throw new Error('Cannot get BNS name asset - empty');
  const [name, namespace] = getContractParts(nameStr);
  return tupleCV({
    name: bufferCV(asciiToBytes(name)),
    namespace: bufferCV(asciiToBytes(namespace)),
  });
});

export function txidQueryAtom(txidAtom: Atom<string | undefined>) {
  return atomsWithQuery<MempoolTransaction | Transaction | null>(get => ({
    queryKey: ['txid-query', get(txidAtom) || ''],
    refetchInterval: data => {
      if (data) {
        return data.tx_status === 'pending' ? 5000 : false;
      }
      return 5000;
    },
    queryFn: async () => {
      const txid = get(txidAtom);
      const network = get(networkAtom);
      if (!txid) return Promise.resolve(null);
      const tx = await fetchTransaction({
        url: network.getCoreApiUrl(),
        unanchored: true,
        txid,
      });
      return tx;
    },
  }));
}

export const [migrateTxState] = txidQueryAtom(migrateTxidAtom);

export const sendElsewhereAtom = atom(false);

export const [validRecipientState] = atomsWithQuery<string | null>(get => ({
  queryKey: ['valid-recipient', get(upgradeRecipientAtom), get(sendElsewhereAtom)],
  queryFn: async () => {
    const recipient = get(upgradeRecipientAtom).trim();
    const sendElsewhere = get(sendElsewhereAtom);
    console.log('recipient', recipient, !!recipient);
    if (!sendElsewhere) {
      const me = get(stxAddressAtom);
      return me || null;
    }
    if (!recipient) return null;
    if (!recipient.includes('.')) {
      return validateStacksAddress(recipient) ? recipient : null;
    }
    const clarigen = get(clarigenAtom);
    const registry = get(nameRegistryState);
    const bns = get(bnsContractState);
    const [nameStr, namespaceStr] = getContractParts(recipient);
    console.log(`Fetching addr for BNS name ${nameStr}.${namespaceStr}`);
    const name = asciiToBytes(nameStr);
    const namespace = asciiToBytes(namespaceStr);

    const [xName, v1Name] = await Promise.all([
      clarigen.ro(registry.getNameProperties({ name, namespace })),
      clarigen.ro(bns.nameResolve({ name, namespace })),
    ]);
    if (xName !== null) {
      console.log(`Setting recipient from BNSx: ${xName.owner}`);
      return xName.owner;
    }
    console.log('v1Name', v1Name);
    if (v1Name.isOk) {
      console.log(`Setting name from v1 to addr`, v1Name.value.owner);
      return v1Name.value.owner;
    }
    return null;
  },
}));

export const recipientIsBnsState = atom(get => {
  const sendElsewhere = get(sendElsewhereAtom);
  const inputBNS = get(upgradeRecipientAtom).split('.').length === 2;
  return sendElsewhere && inputBNS;
});

// export const bnsInputValidState = atom<boolean | null>(get => {

// })
