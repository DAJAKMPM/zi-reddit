import React, { Fragment } from "react";
import NextLink from "next/link";
import { Box, Button, Flex, Link } from "@chakra-ui/core";

import { useCurrentUserQuery, useLogoutMutation } from "../generated/graphql";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useCurrentUserQuery();

  const displayBody = (): JSX.Element | null => {
    if (fetching) {
      return null;
    } else if (!data?.currentUser) {
      return (
        <Fragment>
          <NextLink href="/login">
            <Link mr={2}>Login</Link>
          </NextLink>
          <NextLink href="/register">
            <Link>Register</Link>
          </NextLink>
        </Fragment>
      );
    } else {
      return (
        <Flex>
          <Box mr={2}>{data.currentUser.username}</Box>
          <Button
            variant="link"
            onClick={async () => await logout()}
            isLoading={logoutFetching}
          >
            Logout
          </Button>
        </Flex>
      );
    }
  };

  return (
    <Flex bg="tan" p={4}>
      <Box ml={"auto"}>{displayBody()}</Box>
    </Flex>
  );
};
