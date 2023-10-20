declare module '@ioc:Adonis/Addons/GraphqlManager' {
  import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

  export interface GraphQLManagerContract {
    /**
     * Handle Graphql route
     * @param params
     */
    handle(context: HttpContextContract): Promise<any>
  }

  export interface GraphQLConfig {
    /**
     * The GraphQL Schema path
     *
     * @example ../app/Schemas
     */
    schemas: string

    /**
     * The GraphQL Resolver path
     *
     * @example ../app/Resolvers
     */
    resolvers: string
  }

  const GraphQL: GraphQLManagerContract

  export default GraphQL
}
