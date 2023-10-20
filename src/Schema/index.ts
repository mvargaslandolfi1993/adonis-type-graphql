import * as fs from 'fs'
import * as path from 'path'
import { buildTypeDefsAndResolvers } from 'type-graphql'
import { GraphQLConfig } from '@ioc:Adonis/Addons/GraphqlManager'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { Container } from "typedi";

export default class Schema {
  public static async boostrap(config: GraphQLConfig) {
    const resolverBasePath: string = config.resolvers

    const resolversModules = await this.loadResolvers(resolverBasePath)

    if (resolversModules.length === 0) {
      throw new Error('No valid resolvers found.')
    }

    const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
      resolvers: [resolversModules[0], ...resolversModules.slice(1)],
      container: Container
    })

    const schema = makeExecutableSchema({ typeDefs, resolvers })

    return {
      typeDefs,
      resolvers,
      schema,
    }
  }

  private static async loadResolvers(folderPath: string) {
    const resolvers: Function[] = []

    const files = await fs.promises.readdir(folderPath)

    for (const file of files) {
      const filePath = path.join(folderPath, file)

      if ((await fs.promises.stat(filePath)).isDirectory()) {
        resolvers.push(...(await this.loadResolvers(filePath)))
      } else if (file.endsWith('index.ts') || file.endsWith('index.js')) {
        const resolverModule = await import(filePath)

        if (resolverModule.default) {
          resolvers.push(resolverModule.default)
        }
      }
    }

    return resolvers
  }
}
