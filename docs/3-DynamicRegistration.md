# Dynamic Registration Service Class Documentation

## Table of Contents

- [Introduction](#introduction)
- [Usage](#usage)
- [License](#license)

---

## Introduction

This library supports Dynamic Registation of LTI tools by LTI platforms.

Dynamic registration turns the LTI registration flow into a fast, completely automatic process. Ltijs exposes a registration endpoint through which Platforms can initiate the registration flow.

---

## Usage

### Setting up Dynamic Registration

Dynamic registration needs to be setup through the `Provider.setup()` method through the `options.dynReg` and `options.dynRegRoute` (or `options.dynRegUrl`) fields.

- `dynRegRoute`/`dynRegUrl`: Dynamic registration route. Defaults to `/register`.

- `dynReg`: Dynamic registration configuration object. 
  - `url`: Tool Provider URL. Required field. Example: `http://tool.example.com`.
  - `name`: Tool Provider name. Required field. Example: `Tool Provider`.
  - `logo`: Tool Provider logo URL. Example: `http://tool.example.com/assets/logo.svg`.
  - `description`: Tool Provider description.
  - `redirectUris`: Additional redirection URLs. The main URL is added by default. Example: `['http://tool.example.com/launch']`.
  - `customParameters`: Custom parameters. Example `{ key: 'value' }`.
  - `autoActivate`: Determines whether or not dynamically registered Platforms should be automatically activated. Defaults to `false`.
  - `useDeepLinking`: Deep Linking usage flag. If `true`, sets up deep linking in the platform. Defaults to `true`.
  
> If the `dynReg` parameter is not specified in the provider options, the DynamicRegistrationService is disabled for the provider.

**Example:**

```typescript
import { register } from 'lti-typescript';
const provider = register(
  <encryptionKey>,
  <databaseOptions>,
  {
    ...
    dynReg: {
      url: 'http://tool.example.com', // Tool Provider URL. Required field.
      name: 'Tool Provider', // Tool Provider name. Required field.
      logo: 'http://tool.example.com/assets/logo.svg', // Tool Provider logo URL.
      description: 'Tool Description', // Tool Provider description.
      redirectUris: ['http://tool.example.com/launch'], // Additional redirection URLs. The main URL is added by default.
      customParameters: { key: 'value' }, // Custom parameters.
      autoActivate: false, // Whether or not dynamically registered Platforms should be automatically activated. Defaults to false.
    }, 
    ...
  }
);
```

### Using the Dynamic Registration Service

Dynamic Registration is used when a Platform makes a **registration request** to the Tool's **dynamic registration endpoint**, *`/register` by default*. Both parties will then exchange information and create the registrations.

Platform registrations created dynamically, by default, have to be manually activated. This can be done by using the `Platform.platformActive` method:

```typescript
// Retrieve Platform
const platform = await provider.getPlatform('http://platform.example.com', 'CLIENTID');
// Activate Platform
await platform.setActive(true);
```

By setting the `options.dynReg.autoActivate` field to `true` in the `Provider.setup` method, dynamically registered Platforms can be automatically activated.

#### Custom flow

The Dynamic Registration flow can be customized by using the `provider.onDynamicRegistration` method. This method allows us to control the registration flow to add additional screens, for example.

The registration can be finalized by calling the `provider.DynamicRegistrationService.register` method passing the necessary query parameters and then appending the resulting message to the page HTML.

The following example is a representation of the default Dynamic Registration flow:

```typescript
provider.onDynamicRegistration(async (req, res, next) => {
  try {
    if (!req.query.openid_configuration) return res.status(400).send({ status: 400, error: 'Bad Request', details: { message: 'Missing parameter: "openid_configuration".' } });
    const message = await provider.DynamicRegistrationService.register(req.query.openid_configuration, req.query.registration_token);
    res.setHeader('Content-type', 'text/html');
    res.send(message);
  } catch (err) {
    if (err.message === 'PLATFORM_ALREADY_REGISTERED') return res.status(403).send({ status: 403, error: 'Forbidden', details: { message: 'Platform already registered.' } });
    return res.status(500).send({ status: 500, error: 'Internal Server Error', details: { message: err.message } });
  }
});
```

You can also pass a third parameter to `provider.DynamicRegistrationService.register` containing overrides for the default dynamic registration options.

The following example is a representation of the default Dynamic Registration flow with added custom parameters:


```typescript
provider.onDynamicRegistration(async (req, res, next) => {
  try {
    if (!req.query.openid_configuration) return res.status(400).send({ status: 400, error: 'Bad Request', details: { message: 'Missing parameter: "openid_configuration".' } });
    const message = await lti.DynamicRegistrationService.register(req.query.openid_configuration, req.query.registration_token, {
      'https://purl.imsglobal.org/spec/lti-tool-configuration': {
        custom_parameters: {
          'custom1': 'value1',
          'custom2': 'value2'
        }
      }
    });
    res.setHeader('Content-type', 'text/html');
    res.send(message);
  } catch (err) {
    if (err.message === 'PLATFORM_ALREADY_REGISTERED') return res.status(403).send({ status: 403, error: 'Forbidden', details: { message: 'Platform already registered.' } });
    return res.status(500).send({ status: 500, error: 'Internal Server Error', details: { message: err.message } });
  }
});
```

---

## License

> [APACHE2 License](../LICENSE)

> *Learning Tools Interoperability® (LTI®) is a trademark of the IMS Global Learning Consortium, Inc. (https://www.imsglobal.org)*

> *This library is a derivative work of [CVM Costa](https://github.com/Cvmcosta)'s original [LTIJS library](https://github.com/Cvmcosta/ltijs).* 
