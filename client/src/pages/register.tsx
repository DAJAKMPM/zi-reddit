import React, { FC } from "react";
import { Formik, Form } from "formik";
import { Box, Button } from "@chakra-ui/core";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";

import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { createUrqlClient } from "../utils/createUrqlClient";

const Register: FC = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();

  return (
    <Wrapper variant={"small"}>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({ formData: values });

          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push("/");
          }
        }}
      >
        {(props) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />

            <Box mt={4} />

            <InputField
              name="password"
              placeholder="password"
              label="Password"
              type="password"
            />

            <Button
              mt={4}
              isLoading={props.isSubmitting}
              type="submit"
              variantColor="teal"
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
