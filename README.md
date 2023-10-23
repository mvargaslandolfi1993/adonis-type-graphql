# Adonis Type GraphQL

Adonis Type GraphQL is a package that simplifies working with Type GraphQL, Apollo Server, and GraphQL for Adonis. It provides a convenient provider for creating and managing GraphQL models in your Adonis application.

## Installation

To install Adonis Type GraphQL, run the following command:

```bash
npm i adonis-type-graphql
```

Then execute 

```bash
node ace configure adonis-type-graphql
```

### Features

Adonis Type GraphQL offers several features to streamline GraphQL development in Adonis:

#### Model Creation

You can easily create GraphQL model files, including index.ts, input.ts, resolver.ts, response.ts, and type.ts. For instance:

```bash
node ace graphql:model User
```

#### Configuration

In the config/graphql.ts file, you can modify the default path where these model files are created **(default: app/Graphql)**.

To set up the route in your start/routes.ts file, declare it as follows:

```
Route.post('/graphql', (ctx) => {
  return GraphQL.handle(ctx)
})
```

This sets up a POST route at **/graphql** that handles GraphQL requests.

If you prefer to do it at the controller level, you can also set up the route like this:

```
Route.post('/graphql-controller', 'GraphqlsController.index')
```

This allows you to handle GraphQL requests using a controller named GraphqlsController and the index method instead of a function directly in the routes file. Make sure to match the controller and method names to your specific implementation.

To enable [Apollo GraphQL Explorer](https://www.apollographql.com/docs/graphos/explorer/), which provides a graphical interface for testing GraphQL, follow these steps:

First, you need to install the [Adonis views](https://docs.adonisjs.com/guides/views/introduction#setup) if you haven't already. You can find more information in the official Adonis documentation.

In your resources folder, create a new view file with a name of your choice. As an example, let's name it **graphql_view.edge**. In this file, add the following content:

```
<div style="width: 100%; height: 100%;" id='embedded-sandbox'></div>
<script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script>

<script>
  new window.EmbeddedSandbox({
    target: '#embedded-sandbox',
    initialEndpoint: '{{baseUrl}}',
  });
</script>
```

In your start/routes.ts file, declare the route for Apollo GraphQL Explorer like this:

```
Route.get('/graphql', async ({ request, view }) => {
  view.share({ baseUrl: request.completeUrl() })
  return view.render('graphql_view')
})
```

In this route configuration, **graphql_view** is the name of the recently created view file.

This will enable Apollo GraphQL Explorer at the /graphql endpoint, and it will use the view you've created to provide a graphical interface for testing GraphQL queries. You can access it by visiting /graphql in your Adonis.js application.

### Dependency Injection
You can easily inject dependencies into your resolvers. Example in your resolver.ts file:

```
import { Service } from 'typedi';

@Service()
@Resolver((_of) => UserType)
export class UserResolver {
  constructor(
    private readonly userService: UserService
  ) {
    // Dependency injection
  }
}
```
In your service file

```
import { Service } from 'typedi';

@Service()
export default class MyService {
}
```

## Custom Middlewares

In your Adonis.js and Type GraphQL project, you can implement custom middlewares to add additional logic to your GraphQL resolvers. Custom middlewares allow you to perform actions such as authentication, logging, or request processing before the execution of your resolver methods.

To create a custom middleware, follow these steps:

1. Create a `middlewares` folder in your project if it doesn't already exist.

2. In the `middlewares` folder, create a TypeScript file for your custom middleware, e.g., `MyCustomMiddleware.ts`.

3. Inside your custom middleware file (`MyCustomMiddleware.ts`), add the following code:

```
import { MiddlewareInterface, NextFn, ResolverData } from 'type-graphql';
import { Service } from 'typedi';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export interface Context {
  ctx: HttpContextContract;
}

@Service()
export class CustomMiddleware implements MiddlewareInterface<Context> {
  /**
   * You can access the Adonis Context and implement any necessary logic here.
   *
   * @param context
   * @param next
   * @returns
   */
  async use(context: ResolverData<Context>, next: NextFn) {
    // Perform custom logic, e.g., authentication or request processing.
    // Access Adonis context with context.context.ctx.

    return next();
  }
}
```
You can customize the CustomMiddleware class to implement your specific logic, whether it's authentication, request processing, or any other functionality.

After creating your custom middleware, you can use it in your GraphQL resolvers by decorating resolver methods with @UseMiddleware(CustomMiddleware).

This allows you to add powerful custom logic to your GraphQL resolvers and control the flow of your GraphQL requests as needed.

Make sure to adjust the middleware logic according to your project's requirements. You can create multiple custom middlewares for different purposes and use them in your resolvers as necessary.

For more detailed information on working with Type GraphQL middlewares and their usage, please refer to the [Type GraphQL Middlewares documentation](https://typegraphql.com/docs/middlewares.html).

## Resources

- [Type GraphQL Documentation](https://typegraphql.com/docs/introduction.html): Explore the official documentation for Type GraphQL to learn more about its features and usage.

- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server): Access the official documentation for Apollo Server to understand how to set up and use Apollo Server with your GraphQL APIs.

## Example Usage

You can find a complete example in the following repository:

- [adonis-type-graphql-example](https://github.com/mvargaslandolfi1993/adonis-type-graphql-example)

In this example project, you can explore how to:

- Set up the Adonis.js application.
- Create GraphQL models using `adonis-type-graphql`.
- Define queries and mutations in your resolvers.
- Utilize custom middlewares for your GraphQL resolvers.
- Inject dependencies into your resolvers.
- And more!

## Badges

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

![npm](https://img.shields.io/npm/v/adonis-type-graphql)


