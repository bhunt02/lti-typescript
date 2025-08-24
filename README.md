![Tests](https://github.com/bhunt02/lti-typescript/actions/workflows/test.yml/badge.svg)

# LTI-TypeScript

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Documentation](#documentation-table-of-contents)
- [License](#license)

---

## Introduction

The Learning Tools Interoperability (LTI®) protocol is a standard for integration of rich learning applications within educational environments. <sup>[ref](https://www.imsglobal.org/spec/lti/v1p3/)</sup>

This library implements a tool provider as an [Express](https://expressjs.com/) server, with preconfigured routes and methods that manage the [LTI® 1.3](https://www.imsglobal.org/spec/lti/v1p3/) protocol for you.
Making it fast and simple to create a working learning tool with access to every LTI® service, without having to worry about manually implementing any of the security and validation required to do so.

## Original Work

This library is a fork of the original work by [CVM Costa](https://github.com/Cvmcosta). The original library can be found [here](https://github.com/Cvmcosta/ltijs).

---

## Installation

### Installing the Package

```shell
$ yarn add github:bhunt02/lti-typescript#release # OR https://github.com/bhunt02/lti-typescript.git#release
```

---

## Documentation Table of Contents

# Table of Contents

## [1. Introduction](./docs/1-Introduction)
## [2. Platform](./docs/2-Platform)
## [3. Dynamic Registration Service](./docs/3-DynamicRegistration)
## [4. Names and Roles Service](./docs/4-NamesAndRoles)
## [5. Deep Linking Service](./docs/5-DeepLinking)
## [6. Grades Service](./docs/5-Grading)

## Appendix
### [i. Redirection URIs](./docs/i-RedirectionURIs)

---

## License

> [APACHE2 License](LICENSE)

> *Learning Tools Interoperability® (LTI®) is a trademark of the IMS Global Learning Consortium, Inc. (https://www.imsglobal.org)*

> *This library is a derivative work of [CVM Costa](https://github.com/Cvmcosta)'s original [LTIJS library](https://github.com/Cvmcosta/ltijs).* 
