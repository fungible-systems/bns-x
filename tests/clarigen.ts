
// This file is automatically generated by Clarigen.
// Don't make changes to this file, or they'll
// be overwritten.
import { factory } from "https://deno.land/x/clarigen@v0.4.16/mod.ts";
import { simnet } from "./clarigen-types.ts";

export const { test, contracts, accounts } = factory(simnet);

export const {
  bnsV1,
  bnsxRegistry,
  executorDao,
  extensionTrait,
  nameWrapper,
  nftTrait,
  proposalBootstrap,
  proposalTrait,
  queryHelper,
  testUtils,
  wrapperMigrator
} = contracts;
