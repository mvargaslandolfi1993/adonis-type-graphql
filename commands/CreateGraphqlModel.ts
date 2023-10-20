import { BaseCommand, args } from '@adonisjs/core/build/standalone'
import { existsSync } from 'fs'
import { join } from 'path'

export default class CreateGraphqlModel extends BaseCommand {
  public static commandName = 'graphql:model'

  public static description = 'Create a new GraphQL model'

  @args.string({ description: 'Name of the Adonis model' })
  public model: string

  public async run() {
    const configPath = this.application.appRoot + '/config/graphql.ts'

    if (!existsSync(configPath)) {
      return this.logger.fatal(`Your ${this.colors.red('config/graphql.ts')} file does not exist!`)
    }

    const config = require(configPath)

    const model = this.toCamelCase(this.model)

    const resolverClassName = this.getModelResolverName(model)

    await this.createIndexFile(resolverClassName, model, config)

    await this.createInputFile(model, config)

    await this.createResolverFile(model, resolverClassName, config)

    await this.createResponseFile(model, config)

    await this.createTypeFile(model, config)

    this.ui.logger.success(`Created GraphQL resolver ${model}`)
  }

  private toCamelCase(input) {
    return input
      .replace(/[-_](.)/g, function (_match, group1) {
        return group1.toUpperCase()
      })
      .replace(/^\w/, (firstChar) => firstChar.toUpperCase())
  }

  private getModelResolverName(modelName) {
    return `${modelName}Resolver`
  }

  private async createIndexFile(resolverClassName, model, config) {
    await this.generatorFile(
      'index.ts',
      'index.txt',
      model,
      {
        resolverClassName,
      },
      config
    )
  }

  private async createInputFile(model, config) {
    await this.generatorFile(
      'input.ts',
      'input.txt',
      model,
      {
        InputClassName: `${model}Input`,
        ModelType: `${model}Type`,
      },
      config
    )
  }

  private async createResolverFile(model, ResolverClassName, config) {
    await this.generatorFile(
      'resolver.ts',
      'resolver.txt',
      model,
      {
        ResolverClassName,
        Model: model,
        ModelType: `${model}Type`,
      },
      config
    )
  }

  private async createResponseFile(model, config) {
    await this.generatorFile(
      'response.ts',
      'response.txt',
      model,
      {
        model,
        modelType: `${model}Type`,
      },
      config
    )
  }

  private async createTypeFile(model, config) {
    await this.generatorFile(
      'type.ts',
      'type.txt',
      model,
      {
        model,
        ModelClassName: `${model}Type`,
      },
      config
    )
  }

  private async generatorFile(file_name, stubFileName, model, args, config) {
    this.generator
      .addFile(file_name)
      .stub(join(__dirname, `../templates/Graphql/${stubFileName}`))
      .destinationDir(`${config.default.resolvers}/${model}`)
      .appRoot(this.application.cliCwd || this.application.appRoot)
      .useMustache()
      .apply({
        ...args,
      })

    await this.generator.run()
  }
}
