import { getDehydratedStateFromSession } from '../common/session-helpers';
import type { NextPage, GetServerSidePropsContext } from 'next';
import { useIsSSR } from '../common/hooks/use-is-ssr';
import { Layout } from '../components/layout';
import { Stack, Text } from '@nelson-ui/react';
import { Link } from '../components/link';
import { useAccount } from '@micro-stacks/react';
import { Faucet } from '../components/faucet';
import { Ui } from '@components/p/ui';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

const UiPage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      {/* <Stack> */}
      <Ui />
      {/* </Stack> */}
    </Layout>
  );
};

export default UiPage;
