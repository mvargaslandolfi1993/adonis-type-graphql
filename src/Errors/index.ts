import { GraphQLError } from 'graphql'

export default class GraphError extends GraphQLError {
  constructor(message, errors) {
    super(message, errors)
  }
}
