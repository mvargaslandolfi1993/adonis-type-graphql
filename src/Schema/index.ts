import { buildTypeDefsAndResolvers } from 'type-graphql'
import { GraphQLConfig } from '@ioc:Adonis/Addons/GraphqlManager'
import { makeExecutableSchema } from '@graphql-tools/schema'
import * as fs from 'fs'
import * as path from 'path'

export default class Schema {
  public static async boostrap(config: GraphQLConfig) {
    const resolverBasePath: string = config.resolvers

    const resolversModules = this.loadResolvers(resolverBasePath)

    if (resolversModules.length === 0) {
      throw new Error('No valid resolvers found.')
    }

    const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
      resolvers: [resolversModules[0], ...resolversModules.slice(1)],
    })

    const schema = makeExecutableSchema({ typeDefs, resolvers })

    return {
      typeDefs,
      resolvers,
      schema,
    }
  }

  private static loadResolvers(folderPath: string): Array<Function> {
    const resolvers: Array<Function> = []

    fs.readdirSync(folderPath).forEach((file: string) => {
      const filePath: string = path.join(folderPath, file)

      if (fs.statSync(filePath).isDirectory()) {
        resolvers.push(...this.loadResolvers(filePath))
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const resolverModule: NodeRequire = require(filePath)
        resolvers.push(resolverModule)
      }
    })

    return resolvers
  }
}
