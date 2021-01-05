import argon2 from "argon2";
import { Resolver, Mutation, Arg, Ctx, Query } from "type-graphql";
import { EntityManager } from "@mikro-orm/postgresql";

import { AuthenticationInput, UserResponse } from "../types/user";
import { Context } from "../types/context";
import { User } from "../entities/User";

@Resolver()
export class UserResolver {
  @Query(() => UserResponse, { nullable: true })
  async currentUser(@Ctx() { req, em }: Context) {
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });

    return { user };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("formData") formData: AuthenticationInput,
    @Ctx() { req, em }: Context
  ): Promise<UserResponse> {
    if (formData.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    if (formData.password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 2",
          },
        ],
      };
    }
    const hashedPasswod = await argon2.hash(formData.password);

    let user;

    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: formData.username,
          password: hashedPasswod,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");

      user = result[0];
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "Username is already taken",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("formData") formData: AuthenticationInput,
    @Ctx() { em, req }: Context
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

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: Context) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie("qid");
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
