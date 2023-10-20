import { GraphQLConfig } from '@ioc:Adonis/Addons/GraphqlManager'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import ApolloServer from '../src/Server/ApolloServer'

export default class GraphQLProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Adonis/Addons/GraphqlManager', () => {
      const graphQLConfig = this.app.container
        .use('Adonis/Core/Config')
        .get('graphql', {} as GraphQLConfig)

      return new ApolloServer(graphQLConfig)
    })
  }
}
