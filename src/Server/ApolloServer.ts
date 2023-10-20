import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { GraphQLConfig, GraphQLManagerContract } from '@ioc:Adonis/Addons/GraphqlManager'
import { HeaderMap, ApolloServer as ApolloServerClass, HTTPGraphQLRequest } from '@apollo/server'
import { print } from 'graphql'
import Schema from 'src/Schema'
import { typeDefs as scalarTypeDefs, resolvers as scalarResolvers } from 'graphql-scalars'
import { IncomingHttpHeaders } from 'http'
import { Readable } from 'stream'

interface Context {
  ctx: HttpContextContract
}

export default class ApolloServer implements GraphQLManagerContract {
  /**
   * Apollo config
   */
  protected $apolloConfig

  /**
   * Constructor
   * @param config
   */
  constructor(config: GraphQLConfig) {
    this.init(config)
  }

  /**
   * Init main configuration
   * @param config
   */
  private async init(config: GraphQLConfig): Promise<void> {
    const schema = await Schema.boostrap(config)

    this.$apolloConfig = {
      ...schema,
      ...scalarTypeDefs,
      ...scalarResolvers,
      introspection: true,
    }
  }
  /**
   * @param ctx HttpContextContract type
   * @returns
   */
  async handle(ctx: HttpContextContract): Promise<void> {
    if (!this.$apolloConfig) {
      throw new Error('Apollo Server requires options.')
    }

    const { response, request } = ctx

    const httpGraphQLRequest: HTTPGraphQLRequest = {
      method: request.method().toUpperCase(),
      headers: this.parseHeadersToHeaderMap(request.headers()),
      body: request.body(),
      search: this.getGraphQLQuery(ctx),
    }

    const server = new ApolloServerClass<Context>({
      ...this.$apolloConfig,
    })

    await server.start()

    const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
      httpGraphQLRequest,
      context: async () => ({
        ctx: { ...ctx },
      }),
    })

    if (httpGraphQLResponse.body.kind === 'complete') {
      response.type('.json')
      response.status(httpGraphQLResponse.status ?? 200)
      return response.send(httpGraphQLResponse.body.string)
    } else {
      return ctx.response.stream(Readable.from(httpGraphQLResponse.body.asyncIterator))
    }
  }

  /**
   * Transform query in Graphql Query
   * @param request
   * @param response
   * @returns
   */
  private getGraphQLQuery({ request, response }: HttpContextContract): any {
    if (request.is(['multipart/form-data'])) {
      return response
    }

    return request.method() === 'POST' ? this.toString(request.body()) : request.qs()
  }
  /**
   * Construct a Map by iterating over the headers object due Apollo Server expects the headers to be a map.
   * @param headers
   * @returns HeaderMap
   */
  private parseHeadersToHeaderMap(headers: IncomingHttpHeaders): HeaderMap {
    const headersMap: HeaderMap = new HeaderMap()

    for (const [key, value] of Object.entries(headers)) {
      if (value) {
        headersMap.set(key, Array.isArray(value) ? value.join(', ') : value)
      }
    }

    return headersMap
  }

  /**
   * Convert the AST (Abstract Syntax Tree) object to a GraphQL query string.
   * @param value
   * @returns
   */
  private toString(value): Object {
    if (Object.prototype.toString.call(value.query) === '[object String]') {
      return value
    }

    return {
      query: print(value.query),
    }
  }
}
