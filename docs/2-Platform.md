# Platform Class Documentation

## Table of Contents

- [Introduction](#introduction)
- [Documentation](#documentation)
- [License](#license)

---

## Introduction

The ```Platform``` class represents an [LTI® Consumer](https://www.imsglobal.org/spec/lti/v1p3/#platforms-and-tools).

---

## Documentation

#### get Platform.platformUrl: string
* Gets the platform's url.

#### get Platform.clientId: string

* Gets the platform's client id.

#### get platform.kid: string

* Gets the platform's identifier.

#### Platform.platformPublicKey(): Promise\<KeyObject> 

* Gets the RSA public key assigned to the platform.

#### Platform.platformPrivateKey(): Promise\<KeyObject>

* Gets the RSA private key assigned to the platform.

#### get Platform.name: string

* Gets the platform's nickname.

#### Platform.setPlatformName(name: string): Promise\<void> 

* Sets the platform's nickname.

#### get Platform.authToken: AuthConfigType

* Gets the platform's authentication token configuration.

#### Platform.setAuthConfig(method?: AuthTokenMethod, key?: string): Promise\<void>

* Sets the platform's authorization configurations used to validate its messages.

#### get Platform.authenticationEndpoint: string

* Gets the platform's authentication endpoint.

#### Platform.setAuthenticationEndpoint(authenticationEndpoint: string): Promise\<void> 

* Sets the platform's authentication endpoint used to perform the OIDC login.

#### get Platform.accessTokenEndpoint: string

* Gets the platform's access token endpoint.

#### Platform.setAccessTokenEndpoint(accessTokenEndpoint: string): Promise\<void>

* Sets the platform access token endpoint used to authenticate messages to the platform.

#### get Platform.active: boolean

* Gets the platform's activation status.

#### get Platform.dynamicallyRegistered: boolean

* Gets whether the platform was dynamically registered or not.


#### get Platform.productFamilyCode: string | undefined

* Gets the product family code for the registration.

#### get Platform.registrationEndpoint: string | undefined

* Gets the platform's registration endpoint (if dynamically registered).

#### get Platform.scopesSupported: string | undefined

* Gets the supported scopes for the platform. Determines what access tokens can and cannot be generated.

#### Platform.setPlatformActive(active: boolean): Promise\<void> 

* Sets the platform's activation status.

#### Platform.getAccessToken(scopes: string): Promise\<AccessTokenType> 

* Gets a platform access token with the following scopes, or attempts to generate a new one.
* The scopes are a space-delimited string of IMS LTI scopes.

#### Platform.platformParams(): Promise\<PlatformProperties & { publicKey: KeyObject }> 

* Retrieves the platform information as a JSON object.

#### Platform.delete(): Promise\<void>

* Deletes the platform and the related keys.

---

## License

> [APACHE2 License](../LICENSE)

> *Learning Tools Interoperability® (LTI®) is a trademark of the IMS Global Learning Consortium, Inc. (https://www.imsglobal.org)*

> *This library is a derivative work of [CVM Costa](https://github.com/Cvmcosta)'s original [LTIJS library](https://github.com/Cvmcosta/ltijs).* 
