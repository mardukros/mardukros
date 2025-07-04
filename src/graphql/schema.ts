import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type Field {
    name: String
  }

  type Type {
    name: String
    kind: String
    description: String
    fields: [Field]
  }

  type Query {
    __schema: Schema
    __type(name: String!): Type
  }

  type Schema {
    types: [Type]
  }
`);

export default schema;
