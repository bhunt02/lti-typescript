# Introduction & Setup Documentation

## Table of Contents

- [Introduction](#introduction)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Setting up LTI-Typescript](#setting-up-lti-typescript)
    - [Encryption key](#encryption-key)
    - [Database Options](#database-options)
    - [Reserved Endpoints](#reserved-endpoints)
    - [Cookie configuration](#cookie-configuration)
    - [Development mode](#development-mode)
    - [Token max age](#token-max-age)
    - [Server addon](#server-addon)
    - [Serving static files](#serving-static-files)
    - [Cors](#cross-origin-resource-sharing)
- [Using LTI-Typescript](#using-lti-typescript)
    - [App](#app)
    - [Reserved Endpoint Routes](#reserved-endpoint-routes)
    - [OnConnect Callback](#onconnect)
    - [OnDeepLinking Callback](#ondeeplinking)
    - [OnInvalidToken Callback](#oninvalidtoken)
    - [OnSessionTimeout Callback](#onsessiontimeout)
    - [OnUnregisteredPlatform Callback](#onunregisteredplatform)
    - [OnInactivePlatform Callback](#oninactiveplatform)
    - [Deploy](#deploy)
    - [Registering a Platform](#registering-a-new-platform)
    - [Retrieving a Platform](#retrieving-a-platform)
    - [Modifying a Platform](#modifying-a-platform)
    - [Deleting a Platform](#deleting-a-platform)
- [Authentication and Routing](#authentication-and-routing)
    - [Id Token](#idtoken)
    - [Context Token](#contexttoken)
    - [Launch authentication](#authentication)
    - [Request authentication](#request-authentication)
    - [Whitelisting routes](#whitelisting-routes)
    - [Redirecting with LTI-TypeScript](#redirecting-with-lti-typescript)
- [LTI® Advantage Services](#lti-advantage-services)
    - [Deep Linking](#deep-linking-service-with-lti-typescript)
    - [Assignment and Grades](#assignment-and-grades-service-with-lti-typescript)
    - [Names and Roles Provisioning](#names-and-roles-provisioning-service-with-lti-typescript)
    - [Dynamic Registration Service](#dynamic-registration-service-with-lti-typescript)
- [Debugging](#debugging)
- [License](#license)

---

## Introduction

The Learning Tools Interoperability (LTI®) protocol is a standard for integration of rich learning applications within educational environments. <sup>[ref](https://www.imsglobal.org/spec/lti/v1p3/)</sup>

This library implements a tool provider as an [Express](https://expressjs.com/) server, with preconfigured routes and methods that manage the [LTI® 1.3](https://www.imsglobal.org/spec/lti/v1p3/) protocol for you.
Making it fast and simple to create a working learning tool with access to every LTI® service, without having to worry about manually implementing any of the security and validation required to do so.

This library is a fork of the original work by [CVM Costa](https://github.com/Cvmcosta). The original library can be found [here](https://github.com/Cvmcosta/ltijs).

---

### PostgreSQL & TypeORM

The library is configured to run with a PostgreSQL database, using TypeORM to manage database entities.

You will need to run PostgreSQL as a service on your device or using Docker.

- [Install PostgreSQL natively](https://neon.com/postgresql/postgresql-getting-started)
- [Get started with Docker](https://docs.docker.com/get-started/)

> **TypeORM supports more than just PostgreSQL!**
> You can modify this library and the entities it uses via the exported `register()` function, by specifying the `{ entities: [] }`
> value explicitly.
> If overriding the standard entities, you will need to construct your own entity definitions
> and ensure that they meet the requirements of the library.

---

## Quick start

> Setting up LTI-TypeScript

```typescript
import { register } from 'lti-typescript';

async function main() {
  const provider = await register(
          'LTIKEY', // Encryption key used to sign cookies and tokens
          {
            type: 'postgres',
            url: 'postgres://user:password@localhost:5432/database',
            // See TypeORM documentation for more options: https://typeorm.io/docs/data-source/data-source-options
          },
          {
            appRoute: '/', // Optionally, specify some of the reserved routes
            loginRoute: '/login', // Optionally, specify some of the reserved routes
            cookies: {
              secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
              sameSite: 'none' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
            },
            devMode: true // Set DevMode to false if running in a production environment with https
            // The full list of Provider options is defined by the "ProviderOptions" type.
          }
  )

  // Set lti launch callback
  provider.onConnect((token, req, res) => {
    console.log(token)
    return res.send('It\'s alive!')
  });

  // Deploy server and open connection to the database
  await provider.deploy({ port: 3000 }); // Specifying port. Defaults to 3000

  // Register platform
  await provider.registerPlatform({
    url: 'https://platform.url',
    name: 'Platform Name',
    clientId: 'TOOLCLIENTID',
    authenticationEndpoint: 'https://platform.url/auth',
    accesstokenEndpoint: 'https://platform.url/token',
    authConfig: { method: 'JWK_SET', key: 'https://platform.url/keyset' }
  });
}
```

---

## Documentation

### Database
> Static, application-wide Database class which is initialized in Provider.setup()

* The Database class is populated with static methods that will automatically perform encryption/decryption of encrypted data entries.
* These methods are based on existing methods of TypeORM's DataSource and Repository classes.

### register(encryptionKey: string, dataSourceOptions: DataSourceOptions, options: ProviderOptions): Promise\<Provider>

Proxy method used to instantiate a Provider object and call setup(...) with the passed parameters.

### Provider
>The LTI-TypeScript Provider Class implements the LTI® 1.3 protocol and services.

#### Provider.app
[Express](https://expressjs.com/) server instance.

**Type**: ```Express```

#### Provider.GradeService
[GradeService Class](5-Grading), implementing the Assignment and Grade service of the LTI® 1.3 protocol.

**Type**: ```GradeService```

#### Provider.DeepLinkingService
[DeepLinkingService Class](5-DeepLinking), implementing the Deep Linking service of the LTI® 1.3 protocol.

**Type**: ```DeepLinkingService```

#### Provider.NamesAndRolesService
[NamesAndRolesService Class](4-NamesAndRoles), implementing the Names and Roles Provisioning service of the LTI® 1.3 protocol.

**Type**: ```NamesAndRolesService```

#### Provider.setup(encryptionKey: string, dataSourceOptions: DataSourceOptions, options: ProviderOptions): Promise\<Provider>

Method used to setup and configure the LTI® provider. Additionally, initializes connection to the configured database.

#### Provider.deploy(options: { port?: number; silent?: boolean; serverless?: boolean } = {}): Promise\<true>

* Defaults:
    * `port: 3000`
    * `silent: false`
    * `serverless: false`

Starts listening to a given (if specified) port for LTI® requests.
* Use `serverless: true` to use LTI-TypeScript as a middleware.

##### Returns

- Promise that resolves ```true``` when the server starts listening.

#### Provider.close(silent: boolean = true): Promise\<void>

Closes connection to database and stops server.

#### Provider.onConnect(connectCallback: CallbackWithToken): void

Sets the callback method called whenever theres a sucessfull connection, exposing a token object containing the decoded idToken and the usual Express route parameters (Request, Response and Next).

##### Examples

```typescript
provider.onConnect(async (token: IdToken, req: express.Request, res: express.Request, next: express.NextFunction) => {
  return res.send(token)
});
```

* The default method set to this callback simply fowards the request to the next handler, so the usage of onConnect is optional:

```typescript
// Equivalent to onConnect usage above
provider.app.get(provider.appRoute(), async (req: express.Request, res: express.Request, next: express.NextFunction) => {
  return res.send(res.locals.token)
});
```

#### Provider.onDeepLinking(deepLinkingCallback: CallbackWithToken): void

Sets the callback method called whenever theres a sucessfull deep linking request connection, exposing a token object containing the decoded idToken and the usual Express route parameters (Request, Response and Next). Through this callback you can display your Deep Linking view.

##### Examples

```typescript
provider.onDeepLinking(async (token: IdToken, req: express.Request, res: express.Request, next: express.NextFunction) => {
  return res.send(token)
});
```

#### Provider.onSessionTimeout(sessionTimeoutCallback: Callback)

Sets the callback method called when no valid session is found during a request validation.

##### Examples

```typescript
provider.onSessionTimeout(async (req: express.Request, res: express.Request, next: express.NextFunction) => {
  return res.status(401).send(res.locals.err)
});
```

> LTI-TypeScript provides a default method for this callback.

#### Provider.onInvalidToken(invalidTokenCallback: Callback)

Sets the callback method called when the token received fails the validation process.

##### Examples

```typescript
provider.onInvalidToken(async (req: express.Request, res: express.Request, next: express.NextFunction) => {
  return res.status(401).send(res.locals.err)
});
```

> LTI-TypeScript provides a default method for this callback.

#### Provider.onUnregisteredPlatform(unregisteredPlatformCallback: Callback)

Sets the callback function called when the Platform attempting to login is not registered.

##### Examples

```typescript
provider.onUnregisteredPlatform((req: express.Request, res: express.Request, next: express.NextFunction) => {
  return res.status(400).send({ status: 400, error: 'Bad Request', details: { message: 'Unregistered Platform!' } })
});
```

> LTI-Typescript provides a default method for this callback.

#### Provider.onInactivePlatform(inactivePlatformCallback: Callback)

Sets the callback function called when the Platform attempting to login is not activated.

##### Examples

```typescript
provider.onInactivePlatform((req: express.Request, res: express.Request, next: express.NextFunction) => {
  return res.status(401).send({ status: 401, error: 'Unauthorized', details: { message: 'Platform not active!' } })
});
```

> LTI-TypeScript provides a default method for this callback.

#### get Provider.appRoute: string

Gets the main application Route that will receive the final decoded Idtoken.

```typescript
provider.appRoute;
```

#### get Provider.loginRoute: string

Gets the login Route responsible for dealing with the OIDC login flow.

```typescript
provider.loginRoute;
```

#### get Provider.keysetRoute: string

Gets the public JWK keyset Route.

```typescript
provider.keysetRoute;
```

#### get Provider.dynRegRoute: string

Gets the dynamic registration Route.

```typescript
provider.dynRegRoute
```

#### get Provider.whitelist: (string | RouteType)[]

Returns the list of whitelisted routes

#### set Provider.whitelist = urls: (string | RouteType)[]

Whitelists routes to bypass the LTI-TypeScript authentication protocol. If validation fails, these routes are still accessed but aren't given an identity token.
* Note that previously whitelisted routes are overwritten when calling `provider.whitelist = [...]`.
* You can retain the original whitelisted routes by doing: `provider.whitelist = [...provider.whitelist, <new routes>]`

##### Examples

```typescript
// Whitelisting routes
provider.whitelist('/log', '/home');

// Whitelisting routes with specific methods
provider.whitelist(...provider.whitelist, '/log', '/home', { route: '/route', method: 'POST' });
```

#### Provider.registerPlatform(platform: Omit<PlatformProperties,'kid'>): Promise\<Platform>

Registers a new [Platform](2-Platform) and returns a promise resolving to the new platform instance.

```typescript
await provider.registerPlatform({
  url: 'https://platform.url',
  name: 'Platform Name',
  clientId: 'TOOLCLIENTID',
  authenticationEndpoint: 'https://platform.url/auth',
  accesstokenEndpoint: 'https://platform.url/token',
  authConfig: { method: 'JWK_SET', key: 'https://platform.url/keyset' }
});
```

#### Provider.getPlatform(url: string, clientId: string): Promise\<Platform | undefined>

Retrieves a [Platform](2-Platform) (if exists) with the given URL and client ID.

```typescript
const platform = await provider.getPlatform('https://platform.url', 'TOOLCLIENTID');
```

#### Provider.getPlatformById(platformId: string): Promise\<Platform | undefined>

Retrieves a [Platform](2-Platform) (if exists) whose `kid` matches the provided `platformId`.

```typescript
const platform = await provider.getPlatformById('asdih1k12poihalkja52');
```

#### Provider.deletePlatform(url: string, clientId: string): Promise\<void>

Deletes a [Platform](2-Platform) (if exists) with the given URL and client ID.

```typescript
await provider.deletePlatform('https://platform.url', 'TOOLCLIENTID');
```

#### async Provider.deletePlatformById(platformId: string): Promise\<void>

Deletes a [Platform](2-Platform) (if exists) whose `kid` matches the passed `platformId`.

```typescript
await provider.deletePlatformById('60b1fce753c875193d71b');
```

#### Provider.getPlatforms(url: string): Promise\<Platform[]>

Gets all [platforms](2-Platform) whose URL matches the passed URL.

```typescript
const platforms = await provider.getPlatforms('http://platform.url');
```

#### Provider.getAllPlatforms(): Promise\<Platform[]>

Gets all [platforms](2-Platform).

```typescript
const platforms = await provider.getAllPlatforms();
```

#### Provider.redirect(response: ExpressResponse, path: string, options: { newResource?: boolean; isNewResource?: boolean; query?: Record<string, any>;} = { newResource: false, query: undefined }): Promise\<void>

Redirects to a new location. Passes Ltik if present.

```typescript
provider.redirect(res, '/path', { newResource: true, query: { param: 'value' } })
// Redirects to /path?param=value
```

---

## Setting up LTI-TypeScript

When using LTI-TypeScript, the first step must **always** be to call the `Provider.setup(...)` method OR the `register(...)` method to configure the LTI® provider:

```typescript
// Require Ltijs package
import { register } from 'lti-typescript';

const provider = await register(
        'LTIKEY', // Encryption key used to sign cookies and tokens
        {
          type: 'postgres',
          url: 'postgres://user:password@localhost:5432/database',
          // See TypeORM documentation for more options: https://typeorm.io/docs/data-source/data-source-options
        },
        {
          appRoute: '/', // Optionally, specify some of the reserved routes
          loginRoute: '/login', // Optionally, specify some of the reserved routes
          cookies: {
            secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
            sameSite: 'none' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
          },
          devMode: true // Set DevMode to false if running in a production environment with https
          // The full list of Provider options is defined by the "ProviderOptions" type.
        }
);
```

```typescript
import { Provider } from 'lti-typescript';

const provider = new Provider();
provider.setup(
        'LTIKEY', // Encryption key used to sign cookies and tokens
        {
          type: 'postgres',
          url: 'postgres://user:password@localhost:5432/database',
          // See TypeORM documentation for more options: https://typeorm.io/docs/data-source/data-source-options
        },
        {
          appRoute: '/', // Optionally, specify some of the reserved routes
          loginRoute: '/login', // Optionally, specify some of the reserved routes
          cookies: {
            secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
            sameSite: 'none' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
          },
          devMode: true // Set DevMode to false if running in a production environment with https
          // The full list of Provider options is defined by the "ProviderOptions" type.
        }
);
```

This method receives three arguments: **encryption key**, **database options** and **provider options**:

### Encryption Key

The `encryptionKey` parameter is a string that will be used as a secret to sign the cookies set by LTI-TypeScript and encrypt some of the database information, such as access tokens and private keys.

### Database Options

The second parameter of the setup method, **databaseOptions**, is an object which satisfies the TypeORM `DataSourceOptions` type.

### Provider Options

The third parameter, **providerOptions**, is an optional parameter that handles the additional provider configuration:

#### Reserved Endpoints

Through the **options** parameter you can specify the routes for the reserved endpoints used by LTI-TypeScript:

- `appRoute` (or `appUrl`) - Route used to handle successful launch requests through the `onConnect` callback. **Default: '/'**.

- `loginRoute` (or `loginUrl`) - Route used to handle the initial OIDC login flow. **Default: '/login'**.

- `keySetRoute` (or `keySetUrl`) - Route used serve the tool's JWK keyset. **Default: '/keys'**.

- `dynRegRoute` (or `dynRegUrl`) - Route used to handle Dynamic Registration requests. **Default: '/register'**.

```typescript
{
...
  appRoute: '/app',// Scpecifying main app route
          loginRoute: '/loginroute', // Specifying login route
          keysetRoute: '/keyset', // Specifying keyset route
          dynRegRoute: '/register' // Specifying Dynamic registration route
...
}
```

#### Cookie Configuration

LTI-TypeScript sets session cookies throughout the LTI® validation process, how these cookies are set can be configured through the `cookies` field of the **providerOptions** parameter:

- **secure** - Determines if the cookie can only be sent through **https**. **Default: false**.

- **sameSite** - Determines if the cookie can be sent cross domain. **Default: Lax**.

- **domain** - Determines the cookie domain. This option can be used to set cookies that can be shared between all subdomains.

```typescript
{
...
  cookies: { // Cookie configuration
    secure: true,
            sameSite: 'None',
            domain: '.domain.com'
  },
...
}
```

***If the platform and tool are in different domains, some browsers will not allow cookies to be set unless they have the `secure: true` and `sameSite: 'None'` flags. If you are in a development environment and cannot set secure cookies (over https), consider using LTI-TypeScript in `Development mode`.***

#### Development mode:

LTI-TypeScript relies on cookies for part of the validation process, but in some development environments, cookies might not be able to be set, for instance if you are trying to set cross domain cookies over an insecure http connection.

In situations like this you can set the `devMode` field as true and LTI-TypeScript will stop trying to validate the cookies and will instead use the information obtained through the `ltik` token to retrieve the correct context information.

```typescript
{
...
  devMode: true, // Using development mode
...
}
```

***DevMode should never be used in a production environment, and it should not be necessary, since most of the cookie issues can be solved by using the `secure: true` and `sameSite: None` flags.***

[See more about request authentication.](#request-authentication)

#### Token Max Age

As part of the LTI® 1.3 protocol validation steps, LTI-TypeScript checks the idtoken's `iat` claim and flags the token as invalid if it is older than **10 seconds**.

This limit can be configured (or removed) through the `tokenMaxAge` field:

- `tokenMaxAge` - Sets the idToken max age allowed in seconds. If **false**, disables max age validation. **Default: 10**.

```typescript
{
...
  tokenMaxAge: 60, // Setting maximum token age as 60 seconds
...
}
```

#### Server addon:

Through the `serverAddon` field you can setup a method that will be executed on the moment of the server creation.
This method will receive the `Express` app as a parameter and so it can be used to register middlewares or change server configuration:

```typescript
const middleware = (app) => {
  app.use(async (req, res, next) => {
    console.log('Middleware works!')
    next() // Passing to next handler
  });
}

const provider = new Provider();
provider.setup(
        <encryptionKey>,
        <databaseOptions>,
        {
          ...
                  serverAddon: middleware // Setting addon method
...
},
); 
```

> **Registered middlewares need to call `next()`, otherwise no further handlers will be reached.**

#### Serving static files:

`Express` allows us to specify a path from where static files will be served.

LTI-TypeScript can use this functionality by setting the staticPath parameter of the constructor's additional options.

```typescript
{
...
  staticPath: path.join(__dirname, 'public'), // Setting static path
...
}
```

The specified path is internally bound to the root route:

```typescript
app.use('/', express.static(SPECIFIED_PATH, { index: '_' }))
```
Accessing the files:

```
http://localhost:3000/images/kitten.jpg
http://localhost:3000/css/style.css
http://localhost:3000/js/app.js
http://localhost:3000/images/bg.png
http://localhost:3000/hello.html
```

This can also be achieved and further customized by using [server addons](#server-addon):

```typescript
// Creating middleware registration
const middleware = (app) => {
  app.use('/static', express.static(__dirname + '/public'));
}

//Configure provider
const provider = new Provider();
provider.setup(
        <encryptionKey>,
        <databaseOptions>,
        {
          ...
                  serverAddon: middleware // Setting addon method
...
},
); 
```
And then accessing the files through the specified `/static` route:

```
http://localhost:3000/static/images/kitten.jpg
http://localhost:3000/static/css/style.css
http://localhost:3000/static/js/app.js
http://localhost:3000/static/images/bg.png
http://localhost:3000/static/hello.html
```


#### Cross-Origin Resource Sharing:

LTI-TypeScript `Express` instance is configured to accept cross origin requests by default, this can be disabled by setting the `cors` field to **false**:

```typescript
{
...
  cors: false, // Disabling cors
...
}
```

---

## Using LTI-TypeScript

After the `register()` or `provider.setup()` methods are called, the returned `provider` object gives you access to various functionalities to help you create your LTI® Provider.

The Provider is not a singleton class, and you can instantiate multiple instances of LTI-TypeScript across different ports (or middlewares) if needed.

Provider instances will need to be tracked to ensure resources can be closed properly and preventing unnecessary duplicate connections.

### App

The `provider.app` object is an instance of the underlying `Express` server, through this object you can create routes just like you would when using regular [Express](https://expressjs.com/).

```typescript
provider.app.get('/route', async (req,res,next) => {
  return res.send('It works!')
});
```

### Reserved endpoint routes

LTI-TypeScript reserved endpoint routes can be retrieved by using the following methods:

- **provider.appRoute**

```typescript
const appRoute = provider.appRoute; // returns '/' by default
```

- **provider.loginRoute**

```typescript
const loginRoute = provider.loginRoute; // returns '/login' by default
```

- **provider.keysetRoute**

```typescript
const keySetRoute = provider.keySetRoute; // returns '/keys' by default
```

- **provider.dynRegRoute**

```typescript
const dynRegRoute = provider.dynRegRoute; // returns '/register' by default
```

### Callbacks

LTI-TypeScript allows you to configure it's main behaviours through callbacks:

#### onConnect

The `onConnect` callback is called whenever a successful launch request arrives at the main app url. This callback can be set through the `provider.onConnect()` method.

The callback route will be given a first parameter `token`, that is the user's validated [idtoken](#idtoken), and the three Express route parameters (request, response and next).

> The **[idtoken](#idtoken)** can also be found in the **response.locals.token** object.

```typescript
provider.onConnect(async (token, req, res, next) => {
  console.log(token)
  return res.send('User connected!')
});
```

* The default method set to this callback simply fowards the request to the next handler, so the usage of `provider.onConnect()` is optional, you can simply create a route receiving requests at the `appRoute`:

```typescript
// Equivalent to onConnect usage above
provider.app.get(provider.appRoute(), async (req, res, next) => {
  console.log(res.locals.token)
  return res.send('User connected!')
});
```

Launches directed at other endpoints are also valid but **are not handled by the `onConnect` callback**, instead they must be handled by their own `Express` route:

```typescript
// This route can handle launches to /endpoint
provider.app.get('/endpoint', async (req, res, next) => {
  console.log(res.locals.token)
  return res.send('User connected!')
});
```

#### onDeepLinking

The `onDeepLinking` callback is called whenever a successfull deep linking request arrives at the main app url. This callback can be set through the `provider.onDeepLinking()` method.

The callback route will be given a first parameter `token`, that is the user's validated [idtoken](#idtoken), and the three Express route parameters (request, response and next).

> *This callback should be used to display your **LTI® provider's deep linking UI**.*

```typescript
provider.onDeepLinking(async (token, req, res, next) => {
  return res.send('Deep Linking is working!')
});
```

> [See more about the Deep Linking Service](./5-DeepLinking)

#### onInvalidToken

The `onInvalidToken` callback is called whenever the idtoken received fails the LTI® validation process. This callback can be set through the `provider.onInvalidToken()` method.

The callback route will be given the three Express route parameters (request, response and next). And will also have **access to a `res.locals.err` object**, containing information about the error.

> *This callback should be used to display your **invalid token error screen**.*

```typescript
provider.onInvalidToken(async (req, res, next) => {
  return res.status(401).send(res.locals.err)
});
```


* LTI-TypeScript provides a default method for this callback that returns a 401 error code with the `res.locals.err` object:

```
{ status: 401, error: 'Unauthorized', message: 'ERROR_MESSAGE' }
```

#### onSessionTimeout

The `onSessionTimeout` callback is called whenever no valid session is found during a request validation. This callback can be set through the `provider.onSessionTimeout()` method.

The callback route will be given the three Express route parameters (request, response and next). And will also have **access to a `res.locals.err` object**, containing information about the error.

> *This callback should be used to display your **session timeout error screen**.*

```typescript
provider.onSessionTimeout(async (req, res, next) => {
  return res.status(401).send(res.locals.err)
});
```

* LTI-TypeScript provides a default method for this callback that returns a 401 error code with the `res.locals.err` object:

```
{ status: 401, error: 'Unauthorized', message: 'ERROR_MESSAGE' }
```

#### onUnregisteredPlatform

The `onUnregisteredPlatform` callback is called whenever the Platform attempting to start a LTI launch is not registered.

The callback route will be given the two Express route parameters (request, response).

> *This callback should be used to display your **Unregistered Platform error screen**.*

```typescript
provider.onUnregisteredPlatform((req, res) => {
  return res.status(400).send({ status: 400, error: 'Bad Request', message: 'Unregistered Platform!' })
})
```
* LTI-TypeScript provides a default method for this callback that returns a 400 error code with the default error object:
```
{ status: 400, error: 'Bad Request', message: 'UNREGISTERED_PLATFORM' }
```

#### onInactivePlatform

The `onInactivePlatform` callback is called whenever the Platform attempting to start a LTI launch was registered through [Dynamic Registration](./3-DynamicRegistration) and is not active.

The callback route will be given the two Express route parameters (request, response).

> *This callback should be used to display your **Inactive Platform error screen**.*

```typescript
provider.onInactivePlatform((req, res) => {
  return res.status(401).send({ status: 401, error: 'Unauthorized', message: 'Platform not active!' })
});
```
* LTI-TypeScript provides a default method for this callback that returns a 401 error code with the default error object:
```
{ status: 401, error: 'Unauthorized', message: 'PLATFORM_NOT_ACTIVATED' }
```



### Deploy

Deploying the application opens a connection to the configured database and starts the Express server.

```typescript
await provider.deploy()
```

The `provider.deploy()` method accepts an `options` object with the following fields:

* `port`: The port which the underlying HTTP/S server will listen on. Default is `3000`.
* `silent`: Whether or not the server will emit messages on startup and during activity. Default is `false`.
* `serverless`: Prevents an HTTP/S server from being deployed. Allows LTI-TypeScript to be used as a middleware in another application. Default is `false`.

```typescript
await provider.deploy({ port: 3030, silent: false })
```

#### Deploying LTI-TypeScript as part of another server

You can use LTI-TypeScript as a middleware by calling the deploy method with the serverless flag set to true.
* *Theoretically, this also allows you to use LTI-TypeScript with AWS or other similar services.*

```typescript
const app = express()
const provider = new Provider();
await provider.setup(...);

// Start LTI provider in serverless mode
await provider.deploy({ serverless: true })

// Mount LTI-TypeScript express app into preexisting express app with /lti prefix
app.use('/lti', provider.app)
```

### Platform

*Platform manipulation methods require a connection to the database, so they can only be used after the `provider.deploy()` method.*

> [Check the Platform Class Documentation](2-Platform)

#### Registering a new Platform

A LTI® tool works in conjunction with an LTI® ready platform, so in order for a platform to display your tool's resource, it needs to first be registered in the tool provider.

The`provider.registerPlatform()` method returns a Promise that resolves the created [Platform](2-Platform) object.

```typescript
let plat = await provider.registerPlatform({
  url: 'https://platform.url',
  clientId: 'TOOLCLIENTID',
  name: 'Platform Name',
  authenticationEndpoint: 'https://platform.url/auth',
  accesstokenEndpoint: 'https://platform.url/token',
  authToken: { method: 'JWK_SET', key: 'https://platform.url/keyset' }
});
```

* `platformUrl`: the platform's base URL.

* `clientId`: the client ID for the tool provided by the platform.

* `name`: Platform nickname.

* `authenticationEndpoint`: the platform's authentication endpoint.

* `accesstokenEndpoint`: the platform's access token request endpoint.

* `authToken`: the platform's authentication method and key (or keyset URL).

- e.g., If the platform uses a JWK keyset:

```typescript
authToken: { method: 'JWK_SET', key: 'https://platform.url/keyset' }
```

- If the platform uses a JWK key:

```typescript
authToken: {
  method: 'JWK_KEY',
          key: `{"kty":"EC","crv":"P-256","x":"f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU", "y":"x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0","kid":"keyid"}`,
}
```

- If the platform uses a RSA key

```typescript
authToken: {
  method: 'RSA_KEY',
          key: `-----BEGIN PUBLIC KEY-----
      MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCqGKukO1De7zhZj6+H0qtjTkVxwTCpvKe4eCZ0
      FPqri0cb2JZfXJ/DgYSF6vUpwmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKNUSesmQRMSGkVb1/
      3j+skZ6UtW+5u09lHNsj6tQ51s1SPrCBkedbNf0Tp0GbMJDyR4e9T04ZZwIDAQAB
      -----END PUBLIC KEY-----`
}
```

Platforms can also be registered by utilizing the [Dynamic Registration Service](3-DynamicRegistration).

#### Retrieving a Platform

Registered platforms can be retrieved using the following methods:

* `provider.getPlatform(platformUrl: string, clientId: string)`

The `provider.getPlatform()` method receives two arguments, `platformUrl` and `clientId`, and returns a Promise that resolves a [Platform](2-Platform) object.

``` typescript
const platform = await provider.getPlatform('http://platform.url', 'CLIENTID') // Returns Platform object
```

* `provider.getPlatforms(platformUrl: string)`

The `provider.getPlatforms()` method receives one argument, `platformUrl`, and returns a Promise that resolves to an array of [Platform](2-Platform) objects which match the provided URL.

```typescript
const platforms = await provider.getPlatforms('http://platform.url'); // Returns Platform array
```

* `provider.getPlatformById(platformId: string)`

The `provider.getPlatformById()` method receives the `platformId` and returns a Promise that resolves a [Platform](2-Platform) object.

```typescript
const platform = await provider.getPlatformById('60b1fce753c875193d71'); // Returns Platform object
```

The platform ID can be found through the `Platform.kid` method or in the platformId field of the `idToken` object after a successful launch.

* `provider.getAllPlatforms()`

The `provider.getAllPlatforms()` method returns a Promise that resolves an Array containing every registered [Platform](2-Platform).

```typescript
const platforms = await provider.getAllPlatforms(); // Returns every registered platform
```

#### Modifying a Platform

After a platform is registered, it's **name**, **authenticationEndpoint**, **accesstokenEndpoint** and **authConfig** parameters can still be modified in two ways:

**Using Platform object:**

The Platform object gives you methods to retrieve and modify platform configuration.

> [Check the Platform Class Documentation](2-Platform)


* Registration Method:

If the platform is already registered and you pass different values for the parameters when calling the `provider.registerPlatform()` method, the configuration of the registered platform will be updated.

> Note that the `platformUrl` and `clientId` are used to identify collisions, and thus cannot be changed.

```typescript
const platform = await provider.registerPlatform({
  platformUrl: 'https://platform.url',
  clientId: 'TOOLCLIENTID',
  name: 'Platform Name 2', // Changing the name of already registered platform
});
```

#### Deleting a Platform

Registered platforms can be deleted using the `provider.deletePlatform()` and `provider.deletePlatformById()` methods.

The `provider.deletePlatform(platformUrl: string, clientId: string)` method receives two arguments, `platformUrl` and `clientId`:

``` typescript
await provider.deletePlatform('http://platform.url', 'CLIENTID') // Deletes a platform
```

The `provider.deletePlatformById(platformId: string)` method receives the argument `platformId`:

``` typescript
await provider.deletePlatformById('60b1fce753c875193d71b') // Deletes a platform
```

---

## Authentication and Routing

The LTI® 1.3 protocol works in such a way that every successful launch from the platform to the tool generates an **IdToken** that the tool uses to retrieve information about the user and the general context of the launch.

Whenever a successful launch request is received by LTI-TypeScript, the idToken received at the end of the process is validaded according to the [LTI® 1.3 security specifications](https://www.imsglobal.org/spec/security/v1p0/).

The valid idtoken is then separated into two parts `idtoken` and `contexttoken`, that are stored in the databased and passed along to the next route handler inside the `response.locals` object:

### IdToken

The `idtoken` will contain the platform and user information that is context independent, and will be stored in the `res.locals.token` object, or the `token` parameter if the `onConnect` is being used:

```typescript
provider.onConnect(async (token: IdToken, req: express.Request, res: express.Response) => {
  // Retrieving idtoken through response object
  console.log(res.locals.token)
  // Retrieving idtoken through onConnect token parameter
  console.log(token)
})
```

The `idtoken` object is of the type `IdToken` and consists of:

```typescript
{
  iss: "http://localhost/moodle",
          clientId: "CLIENTID",
          deploymentId: "1",
          platformId: "60b1fce753c875193d71b611e895f03d",
          platformContext: ContextProperties,
          platformInfo: {
    product_family_code: "moodle",
            version: "2020042400",
            guid: "localhost",
            name: "moodle",
            description: "Local Moodle"
  },
  user: "2",
          userInfo: {
    given_name: "Admin",
            family_name: "User",
            name: "Admin User",
            email: "local@moodle.com",
  },
}
```

### ContextToken

The `contexttoken` will contain the context specific information, and will be stored in the `res.locals.context` object and as a part of the `idtoken` object as the `platformContext` field:

```typescript
provider.onConnect(async (token, req, res) => {
  // Retrieving contexttoken through response object
  console.log(res.locals.context)
  // Retrieving contexttoken through idtoken object
  console.log(token.platformContext)
})
```

The `contexttoken` object consists of:

```typescript
// Example contexttoken for a Moodle platform
{
  contextId: "http%3A%2F%2Flocalhost%2FmoodlewTtQU3zWHvVeCUf12_57",
          path: "/",
        user: "2",
        roles: [
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator",
  "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor",
  "http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator"
],
        targetLinkUri: "http://localhost:3000",
        context: {
  id: "2",
          label: "course",
          title: "Course",
          type: [
    "CourseSection"
  ]
},
  resource: {
    title: "LTI-TypeScript Demo",
            id: "57"
  },
  custom: {
    "system_setting_url": "http://localhost/moodle/mod/lti/services.php/tool/1/custom",
            "context_setting_url": "http://localhost/moodle/mod/lti/services.php/CourseSection/2/bindings/tool/1/custom",
            "link_setting_url": "http://localhost/moodle/mod/lti/services.php/links/{link_id}/custom"
  },
  lis: {
    "person_sourcedid": "",
            "course_section_sourcedid": ""
  },
  endpoint: {
    scope: [
      "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem",
      "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly",
      "https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly",
      "https://purl.imsglobal.org/spec/lti-ags/scope/score"
    ],
            lineitems: "http://localhost/moodle/mod/lti/services.php/2/lineitems?type_id=1",
            lineitem: "http://localhost/moodle/mod/lti/services.php/2/lineitems/26/lineitem?type_id=1"
  },
  namesRoles: {
    context_memberships_url: "http://localhost/moodle/mod/lti/services.php/CourseSection/2/bindings/1/memberships",
            service_versions: [
      "1.0",
      "2.0"
    ]
  },
  launchPresentation: {
    locale: "en",
            document_target: "iframe",
            return_url: "http://localhost/moodle/mod/lti/return.php?course=2&launch_container=3&instanceid=57&sesskey=6b5H1MF8yp"
  },
  messageType: "LtiResourceLinkRequest",
          version: "1.3.0"
}
```

### Authentication

LTI-TypeScript need as way to retrieve the correct `idtoken` and `contexttoken` information whenever a tool makes a request. The authentication protocol is based on two items, a **session cookie** and a **ltik** token.

#### Launches

A platform can launch to **any of the tool's endpoints**, but only launches targeting the specified `appRoute` will be sent to the [onConnect callback](#onconnect). **Launches to other endpoints must be handled by their specific `Express` routes.**

At the end of a successful launch, LTI-TypeScript redirects the request to the desired endpoint, but it also does two other things:

- Sets a **signed session cookie** containing the `platformCode` and `userId` information;

- Sends a **ltik** JWT token containing the same platform and user information, with additional context information as a query parameter to the endpoint.

> [See more about cookie configuration options](#cookie-configuration)

#### Request Authentication

Whenever the tool receives a request **not directed at one of the reserved endpoints** it attempts to validate the request by matching the information received through the [session cookie](#cookies) with the information contained in the **ltik** token.

The `ltik` token **MUST** be passed to the provider through either the query parameters, body parameters or an Authorization header (Bearer or LTIK-AUTH-V1).

##### Examples
* Query Parameters: `https://tool-url.com?ltik=<ltik>`
* Body Parameters: passed through JSON request body.
* Authorization Header:
    * `Authorization: Bearer <ltik>`
    * `Authorization: LTIK-AUTH-V1 Token=<ltik>, Additional=<additional authorization, e.g., Bearer token>`
        * When using the `LTIK-AUTH-V1` authorization schema, `req.headers.authorization` will only include the `Additional` portion of the header. The `ltik` token can be found in `req.token`.

##### LTIK order of priority:

* **LTI-TypeScript** will look for the `ltik` in the following order:

- LTIK-AUTH-V1 Authorization
- query
- body
- Bearer Authorization

##### Cookies

> In the case of requests coming from different subdomains, usually it is necessary to set `mode: cors` and `credentials: 'include'` flags to include the cookies in the request.

> If for some reason the cookies could not be set in your development environment, the usage of the **devMode** flag eliminates the validation step that matches the cookie information, instead using only the information contained in the **ltik** token.

> [See more about development mode](#development-mode)

If the validation fails, the request is handled by the **invalidTokenCallback** or the **sessionTimeoutCallback**.

#### Whitelisting routes

Routes can be whitelisted to bypass the LTI-TypeScript authentication protocol **in case of validation failure**, this means that these routes work normally, but if the request sent to them fails validation they are still reached but don't have access to a `idtoken` or `contexttoken`.

A good way to exemplify this behaviour is by using it to create a landing page, that will be accessed if a request to the whitelisted route fails validation:

```typescript
// Whitelisting the main app route and /landingpage to create a landing page
provider.whitelist = [provider.appRoute(), { route: '/landingpage', method: 'get' }];

// When receiving successful LTI® launch redirects to app, otherwise redirects to landing page
provider.onConnect(async (token, req, res, next) => {
  // Checking if received idtoken
  if (token) return res.sendFile(path.join(__dirname, './public/index.html'));
  else provider.redirect(res, '/landingpage'); // Redirects to landing page
});
```

Whitelisted routes are defined using the `provider.whitelist` setter that can receive an array of either `string`s or `RouteType` object.

- **Strings**

Route strings will be whitelisted for **every method**:

```typescript
provider.whitelist = ['/route1', '/route2', '/route3'];
```

- **RouteType Objects**

RouteType objects allow you to specify **whitelisted methods**:

```typescript
provider.whitelist = [{ route: '/route1', method: 'get' }];

// Route objects can also be whitelisted for every method
provider.whitelist = [{ route: '/route1', method: 'all' }];

// The provider.whitelist setter can receive different types simultaneously.
provider.whitelist = [{ route: '/route1', method: 'get' }, { route: '/route2', method: 'post' }, '/route3'];
```

Routes can also be set using Regex which means that you can whitelist a big range of routes:

```typescript
// Using Regex
provider.whitelist = [{ route: new RegExp(/^\/route2/), method: 'get' }];
```

The `new RegExp(/^\/route1/)` regex will whitelistd every route that starts with `/route`.

> Be careful when using regex to whitelist routes, you could whitelist routes accidentally and that can have a big impact on your application. It is recommended to use the start-of-string (^) and end-of-string ($) anchors to avoid accidental matches.

#### Redirecting with LTI-TypeScript

The LTI-TypeScript authentication protocol relies on the `ltik` token being passed to endpoints as query parameters.

To make this process seamless, the `provider.redirect()` method can be used to redirect to an endpoint passing the `ltik` token automatically:

```typescript
provider.onConnect(async (token, req, res) => {
  return provider.redirect(res, '/route'); // Redirects to /route with the ltik token
});

provider.get('/route', async (req, res) => {
  return provider.redirect(res, '/route/b?test=123'); // Redirects to /route/b with the ltik token and additional query parameters
});
```

The `provider.redirect()` method requires two parameters:

- **Response** - The `Express` response object, that will be used to perform the redirection and retrieve the `idtoken` and `ltik`.

- **URL** - The redirection target in the form of a string.

The `url` parameter can be an internal route ('/route') or a complete URL ('https://domain.com'), but how the redirection works depends on some conditions:

- If the target is on the same domain and subdomain ('https://domain.com', '/route'), it will have access to the `ltik` and `session cookie` and will pass the LTI-TypeScript authentication protocol.

- If the complete URL is on the same domain but on a different subdomain ('https://a.domain.com'), it will have access to the `ltik` but it might require a cookie domain to be set:

```typescript
// Setup provider example
await provider.setup(
        <encryptionKey>,
        <databaseOptions>,
        {
          ...
                  cookies: { // Cookie configuration
  secure: true,
          sameSite: 'None',
          domain: '.domain.com'
},
...
},
);
```
Setting the domain to `.domain.com` allows the `session cookie` to be accessed on every domain.com subdomain (a.domain.com, b.domain.com).
- If the complete URL is on a different domain, it will have access to the `ltik`, but **it will not have access to a `session cookie`**, and will only be able to make successful requests to whitelisted routes.
- If the route originating the resource does not have access to an `idtoken` (whitelisted route), `provider.redirect()` method will still perform the redirection, but the target will not have access to the `ltik` nor the `session cookie`.

The `provider.redirect()` method also has an `options` parameter that accepts two fields:

- `newResource`: If this field is set to true, the `contexttoken` object has it's `path` field changed to reflect the target route. The `path` field can be used to keep track of the main resource route even after several redirections.

```typescript
provider.onConnect(async (token, req, res) => {
  return provider.redirect(res, '/route', { newResource: true })
});
```

- `query`: This field can be used to easely add query parameter to target URL.
```typescript
provider.onConnect(async (token, req, res) => {
  return provider.redirect(res, '/path', { newResource: true, query: { param: 'value' } })
  // Redirects to /path?param=value
});
```

> If for some reason you want to redirect manually, the `ltik` token can be retrieved, **after a valid request**, through the `res.locals.ltik` variable.

___

## LTI® Advantage Services

### Deep Linking Service with LTI-TypeScript

The Deep Linking Service class documentation can be accessed [here](5-DeepLinking).

### Assignment and Grades Service with LTI-TypeScript

The Assignment and Grades Service class documentation can be accessed [here](5-Grading).

### Names and Roles Provisioning Service with LTI-TypeScript

The Names and Roles Provisioning Service class documentation can be accessed [here](4-NamesAndRoles).

### Dynamic Registration Service with LTI-TypeScript

The Dynamic Registration Service documentation can be accessed [here](3-DynamicRegistration).

---

## Debugging

* To enable debug messages, specify `{ debug: true }` within the Provider options.

---

## License

> [APACHE2 License](../LICENSE)

> *Learning Tools Interoperability® (LTI®) is a trademark of the IMS Global Learning Consortium, Inc. (https://www.imsglobal.org)*

> *This library is a derivative work of [CVM Costa](https://github.com/Cvmcosta)'s original [LTIJS library](https://github.com/Cvmcosta/ltijs).* 