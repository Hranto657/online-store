import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Product: a
    .model({
      name: a.string(),
      price: a.float(),
      description: a.string(),
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
});
