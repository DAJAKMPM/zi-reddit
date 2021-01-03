import argon2 from "argon2";
import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import { AuthenticationInput, UserResponse } from "../types/user";
import { Context } from "../types/context";
import { User } from "../entities/User";

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("formData") formData: AuthenticationInput,
    @Ctx() { em }: Context
  ): Promise<User> {
    const hashedPasswod = await argon2.hash(formData.password);
    const user = em.create(User, {
      username: formData.username,
      password: hashedPasswod,
    });

    await em.persistAndFlush(user);
    return user;
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("formData") formData: AuthenticationInput,
    @Ctx() { em }: Context
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: formData.username });

    if (!user) {
      return {
        errors: [{ field: "username", message: "username does not exist" }],
      };
    }

    const valid = await argon2.verify(user.password, formData.password);

    if (!valid) {
      return {
        errors: [{ field: "password", message: "incorrect password" }],
      };
    }

    return { user };
  }
}
