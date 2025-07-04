import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import schema from './schema.js';

const FieldType = new GraphQLObjectType({
  name: 'Field',
  fields: {
    name: { type: GraphQLString }
  }
});

const TypeType = new GraphQLObjectType({
  name: 'Type',
  fields: {
    name: { type: GraphQLString },
    kind: { type: GraphQLString },
    description: { type: GraphQLString },
    fields: { type: new GraphQLList(FieldType) }
  }
});

const SchemaType = new GraphQLObjectType({
  name: 'Schema',
  fields: {
    types: { type: new GraphQLList(TypeType) }
  }
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    __schema: { type: SchemaType },
    __type: {
      type: TypeType,
      args: { name: { type: GraphQLString } }
    }
  }
});

const resolvers = {
  Query: {
    __schema: () => schema,
    __type: (_, { name }) => schema.getType(name)
  }
};

export default resolvers;
