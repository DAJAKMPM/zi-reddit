import React, { Fragment, FC } from "react";
import { withUrqlClient } from "next-urql";
import { Navbar } from "../components/Navbar";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";

const Index: FC = () => {
  const [{ data }] = usePostsQuery();

  return (
    <Fragment>
      <Navbar />
      {!data ? (
        <>loading...</>
      ) : (
        data.posts.map((p, i) => <div key={i}>{p.title}</div>)
      )}
    </Fragment>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
