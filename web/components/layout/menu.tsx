import type { ReactNode, ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Stack, Box, Flex } from '@nelson-ui/react';
import { useAtomValue } from 'jotai';
import { userNameState } from '@store/names';
import { useGradient } from '@common/hooks/use-gradient';
import { stxAddressAtom, useAuthState } from '@store/micro-stacks';
import { Text } from '@components/text';
import { keyframes } from '@nelson-ui/core';
import { styled } from '@common/theme';
import Tippy from '@tippyjs/react/headless';
import type { Instance, Placement, Props } from 'tippy.js';
import { followCursor } from 'tippy.js';
// import 'tippy.js/dist/tippy.css';
import { useSpring, animated } from 'react-spring';
import { useRouter } from 'next/router';
import { useAuth } from '@micro-stacks/react';
import { useSwitchAccounts } from '@hooks/use-switch-accounts';
import { ONLY_INSCRIPTIONS } from '@common/constants';

const StyledMenu = styled(Stack, {
  '&:hover': {
    backgroundColor: '$surface-surface--hovered',
  },
});

const StyledName = styled(Text, {
  display: 'block',
  '@bp1': {
    display: 'none',
  },
});

export const MenuName: React.FC = () => {
  const name = useAtomValue(userNameState);
  const stxAddress = useAtomValue(stxAddressAtom);
  const gradient = useGradient(name || stxAddress || '');
  const router = useRouter();

  const display = useMemo(() => {
    const show = name || stxAddress || '';
    const MAX_NAME = 20;
    if (show.length > MAX_NAME) {
      return show.slice(0, MAX_NAME - 3) + '...';
    }
    return show;
  }, [name, stxAddress]);
  return (
    <StyledMenu
      isInline
      className="menu-name"
      borderRadius="70px"
      border="1px solid $border-subdued"
      height="48px"
      cursor="pointer"
      pl="9px"
      pt="0px"
      spacing="12px"
      alignItems={'center'}
      pr="50px"
      onClick={async () => {
        const pathname = ONLY_INSCRIPTIONS ? '/' : '/profile';
        await router.push({
          pathname,
          query: {
            redirect: 'false',
          },
        });
      }}
    >
      <Stack isInline alignItems={'center'} spacing="8px">
        <Box borderRadius="50%" size="32px" background={gradient} />
        <StyledName variant="Label01">{display}</StyledName>
      </Stack>
    </StyledMenu>
  );
};

const MenuContainerStyled = styled(Box, {
  position: 'relative',
  '.menu-name:hover ~ .dropdown-btn': {
    backgroundColor: '$surface-surface',
  },
});

export const Menu: React.FC = () => {
  return (
    <MenuContainerStyled>
      <MenuName />
      <MenuDropdown />
    </MenuContainerStyled>
  );
};

const PopoverOption: React.FC<BoxProps> = ({ children, onClick }) => {
  return (
    <Box
      px="12px"
      py="10px"
      onClick={onClick}
      cursor="pointer"
      _hover={{ backgroundColor: '$surface-surface--hovered' }}
      _active={{
        backgroundColor: '$surface-surface--pressed',
      }}
    >
      <Text variant="Body02">{children}</Text>
    </Box>
  );
};

const MenuDropdown: React.FC = () => {
  const config = { tension: 300, friction: 25 };
  const initialStyles = { opacity: 0, transform: 'scale(0.3) translateY(-150px)' };
  const [props, setSpring] = useSpring(() => initialStyles);
  const { signOut } = useAuthState();
  const { switchAccounts } = useSwitchAccounts();

  const router = useRouter();

  return (
    <Tippy
      placement="bottom"
      trigger="click"
      interactive
      render={() => (
        <PopoverContainer style={props}>
          {/* <PopoverOption>
            <Text variant="Body02">Profile</Text>
          </PopoverOption> */}
          {!ONLY_INSCRIPTIONS && (
            <PopoverOption
              onClick={async () => {
                await router.push({
                  pathname: '/profile',
                  query: {
                    redirect: 'false',
                  },
                });
              }}
            >
              <Text variant="Body02">View all names</Text>
            </PopoverOption>
          )}

          <PopoverOption onClick={async () => await switchAccounts()}>
            <Text variant="Body02">Switch accounts</Text>
          </PopoverOption>
          <PopoverOption>
            <Text variant="Body02" onClick={async () => await signOut()}>
              Sign out
            </Text>
          </PopoverOption>
        </PopoverContainer>
      )}
      onMount={() => {
        setSpring({
          opacity: 1,
          transform: 'scale(1) translateY(0)',
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onRest: () => {},
          config: { ...config, clamp: false },
        });
      }}
      onHide={instance => {
        setSpring({
          ...initialStyles,
          onRest() {
            instance.unmount();
          },
          config: { ...config, clamp: true },
          // config,
        });
      }}
    >
      <Flex
        size="32px"
        backgroundColor="$surface-subdued"
        cursor={'pointer'}
        // pl="9px"
        borderRadius="50%"
        alignItems={'center'}
        className="dropdown-btn"
        justifyContent="center"
        position={'absolute'}
        right="9px"
        top="8px"
        pt="1px"
        _hover={{
          backgroundColor: '$surface--hovered',
        }}
      >
        {/* <MenuPopover /> */}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.999999 1L5 5L9 0.999999"
            stroke="#9A9A9A"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Flex>
    </Tippy>
  );
};

const PopoverContainer = styled(animated.div, {
  width: '168px',
  border: '1px solid $onSurface-border',
  borderRadius: '10px',
  padding: '8px',
  backgroundColor: '$surface-surface',
  marginTop: '8px',
});
