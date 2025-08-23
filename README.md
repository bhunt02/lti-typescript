All documentation excluding source code comments is liable to be inaccurate at this current release

[//]: # (<div align="center">)

[//]: # (	<br>)

[//]: # (	<br>)

[//]: # (	<a href="https://cvmcosta.github.io/ltijs"><img width="360" src="https://raw.githubusercontent.com/Cvmcosta/ltijs/master/docs/logo-300.svg"></img></a>)

[//]: # (  <a href="https://site.imsglobal.org/certifications/coursekey/ltijs"​ target='_blank'><img width="80" src="https://www.imsglobal.org/sites/default/files/IMSconformancelogoREG.png" alt="IMS Global Certified" border="0"></img></a>)

[//]: # (</div>)

[//]: # ()
[//]: # (> Easily turn your web application into a LTI® 1.3 Learning Tool.)

[//]: # ()
[//]: # ([![codecov]&#40;https://codecov.io/gh/Cvmcosta/ltijs/branch/master/graph/badge.svg&#41;]&#40;https://codecov.io/gh/Cvmcosta/ltijs&#41;)

[//]: # ([![Node Version]&#40;https://img.shields.io/node/v/ltijs.svg&#41;]&#40;https://www.npmjs.com/package/ltijs&#41;)

[//]: # ([![NPM package]&#40;https://img.shields.io/npm/v/ltijs.svg&#41;]&#40;https://www.npmjs.com/package/ltijs&#41;)

[//]: # ([![NPM downloads]&#40;https://img.shields.io/npm/dm/ltijs&#41;]&#40;https://www.npmjs.com/package/ltijs&#41;)

[//]: # ([![JavaScript Style Guide]&#40;https://img.shields.io/badge/code_style-standard-brightgreen.svg&#41;]&#40;https://standardjs.com&#41;)

[//]: # ([![APACHE2 License]&#40;https://img.shields.io/github/license/cvmcosta/ltijs&#41;]&#40;#license&#41;)

[//]: # ([![Donate]&#40;https://img.shields.io/badge/Donate-Buy%20me%20a%20coffe-blue&#41;]&#40;https://www.buymeacoffee.com/UL5fBsi&#41;)

[//]: # ()
[//]: # ()
[//]: # (Please ⭐️ us on [GitHub]&#40;https://github.com/Cvmcosta/ltijs&#41;, it always helps!)

[//]: # (> [Ltijs is LTI® Advantage Complete Certified by IMS]&#40;https://site.imsglobal.org/certifications/coursekey/ltijs&#41;)

[//]: # ()
[//]: # (> Ltijs is the first LTI Library to implement the new [LTI® Advantage Dynamic Registration Service]&#40;https://cvmcosta.me/ltijs/#/dynamicregistration&#41;, now supported by **Moodle 3.10**. )

[//]: # (> The Dynamic Registration Service turns the LTI Tool registration flow into a fast, completely automatic process.)

[//]: # ()
[//]: # (> - [Migrating from version 4]&#40;https://cvmcosta.github.io/ltijs/#/migration&#41;)

[//]: # (> - [CHANGELOG]&#40;https://cvmcosta.github.io/ltijs/#/changelog&#41;)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## LTI As A Service)

[//]: # ()
[//]: # (<div align="center">)

[//]: # (	<a href="https://ltiaas.com"><img width="550" src="https://raw.githubusercontent.com/Cvmcosta/ltijs/master/docs/ltiaas.png"></img></a>)

[//]: # (  <br>)

[//]: # (  <br>)

[//]: # (</div>)

[//]: # ()
[//]: # (> A ready-to-go SaaS LTI solution.)

[//]: # ()
[//]: # (If you need an enterprise-ready LTI deployment, LTIaaS can get you up and running in a matter of minutes. We offer a SaaS solution with a powerful, easy to use, API that gives you access to the entire functionality of the LTI protocol. And you only start paying once your product starts to grow.)

[//]: # ()
[//]: # (Through our consultation services we can help you design, build and maintain your LTI tool. The LTIaaS API is already being used to reach thousands of students across the entire world!)

[//]: # ()
[//]: # (> For more information visit [LTIaaS.com]&#40;https://ltiaas.com&#41;)

[//]: # (> - [Documentation and Guides]&#40;https://ltiaas.com/guides/introduction&#41;)

[//]: # (> - [Pricing information and simulator]&#40;https://ltiaas.com/pricing/&#41;)

[//]: # (> - [Contact us]&#40;https://ltiaas.com/contact-us/&#41;)

[//]: # (> - [LTIJS vs LTIAAS]&#40;https://cvmcosta.me/ltijs/#/ltijs-vs-ltiaas&#41;)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # ()
[//]: # (## Table of Contents)

[//]: # ()
[//]: # (- [Introduction]&#40;#introduction&#41;)

[//]: # (- [Feature roadmap]&#40;#feature-roadmap&#41;)

[//]: # (- [Installation]&#40;#installation&#41;)

[//]: # (- [Quick start]&#40;#quick-start&#41;)

[//]: # (- [Documentation]&#40;#documentation&#41;)

[//]: # (- [Contributing]&#40;#contributing&#41;)

[//]: # (- [Special thanks]&#40;#special-thanks&#41;)

[//]: # (- [License]&#40;#license&#41;)

[//]: # ()
[//]: # ()
[//]: # (---)

[//]: # (## Introduction)

[//]: # ()
[//]: # (The Learning Tools Interoperability &#40;LTI®&#41; protocol is a standard for integration of rich learning applications within educational environments. <sup>[ref]&#40;https://www.imsglobal.org/spec/lti/v1p3/&#41;</sup>)

[//]: # ()
[//]: # ()
[//]: # (This library implements a tool provider as an [Express]&#40;https://expressjs.com/&#41; server, with preconfigured routes and methods that manage the [LTI® 1.3]&#40;https://www.imsglobal.org/spec/lti/v1p3/&#41; protocol for you. Making it fast and simple to create a working learning tool with access to every LTI® service, without having to worry about manually implementing any of the security and validation required to do so. )

[//]: # ()
[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## Feature roadmap)

[//]: # ()
[//]: # (| Feature | Implementation | Documentation |)

[//]: # (| --------- | - | - |)

[//]: # (| [Keyset endpoint support]&#40;https://cvmcosta.me/ltijs/#/provider?id=keyset-endpoint&#41; | <center>✔️</center> | <center>✔️</center> |)

[//]: # (| [Deep Linking Service Class]&#40;https://cvmcosta.me/ltijs/#/deeplinking&#41; | <center>✔️</center> | <center>✔️</center> |)

[//]: # (| [Grading Service Class]&#40;https://cvmcosta.me/ltijs/#/grading&#41; | <center>✔️</center> | <center>✔️</center> |)

[//]: # (| [Names and Roles Service Class]&#40;https://cvmcosta.me/ltijs/#/namesandroles&#41; | <center>✔️</center> | <center>✔️</center> |)

[//]: # (| [Dynamic Registration Service ]&#40;https://cvmcosta.me/ltijs/#/dynamicregistration&#41; | <center>✔️</center> | <center>✔️</center> |)

[//]: # (| Database plugins | <center>✔️</center> | <center>✔️</center> |)

[//]: # (| Revised usability tutorials | <center></center> | <center></center> |)

[//]: # (| Key Rotation | <center></center> | <center></center> |)

[//]: # (| Redis caching | <center></center> | <center></center> |)

[//]: # ()
[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # ()
[//]: # (## Installation)

[//]: # ()
[//]: # (### Installing the package)

[//]: # ()
[//]: # (```shell)

[//]: # ($ npm install ltijs)

[//]: # (```)

[//]: # ()
[//]: # ()
[//]: # (### MongoDB)

[//]: # ()
[//]: # (This package natively uses mongoDB by default to store and manage the server data, so you need to have it installed, see link bellow for further instructions.)

[//]: # ()
[//]: # (  - [Installing mongoDB]&#40;https://docs.mongodb.com/manual/administration/install-community/&#41;)

[//]: # ()
[//]: # ()
[//]: # (### Database Plugins)

[//]: # ()
[//]: # (Ltijs can also be used with other databases through database plugins that use the same structure as the main database class.)

[//]: # ()
[//]: # (  -  [Firestore Plugin]&#40;https://github.com/examind-ai/ltijs-firestore&#41;)

[//]: # ( )
[//]: # (  -  [Sequelize Plugin]&#40;https://github.com/Cvmcosta/ltijs-sequelize&#41;&#40;MySQL, PostgreSQL&#41;)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # ()
[//]: # (## Quick start)

[//]: # ()
[//]: # (> Setting up Ltijs)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (```javascript)

[//]: # (const path = require&#40;'path'&#41;)

[//]: # ()
[//]: # (// Require Provider )

[//]: # (const lti = require&#40;'ltijs'&#41;.Provider)

[//]: # ()
[//]: # (// Setup provider)

[//]: # (lti.setup&#40;'LTIKEY', // Key used to sign cookies and tokens)

[//]: # (  { // Database configuration)

[//]: # (    url: 'mongodb://localhost/database',)

[//]: # (    connection: { user: 'user', pass: 'password' })

[//]: # (  },)

[//]: # (  { // Options)

[//]: # (    appRoute: '/', loginRoute: '/login', // Optionally, specify some of the reserved routes)

[//]: # (    cookies: {)

[//]: # (      secure: false, // Set secure to true if the testing platform is in a different domain and https is being used)

[//]: # (      sameSite: '' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used)

[//]: # (    },)

[//]: # (    devMode: true // Set DevMode to false if running in a production environment with https)

[//]: # (  })

[//]: # (&#41;)

[//]: # ()
[//]: # (// Set lti launch callback)

[//]: # (lti.onConnect&#40;&#40;token, req, res&#41; => {)

[//]: # (  console.log&#40;token&#41;)

[//]: # (  return res.send&#40;'It\'s alive!'&#41;)

[//]: # (}&#41;)

[//]: # ()
[//]: # (const setup = async &#40;&#41; => {)

[//]: # (  // Deploy server and open connection to the database)

[//]: # (  await lti.deploy&#40;{ port: 3000 }&#41; // Specifying port. Defaults to 3000)

[//]: # ()
[//]: # (  // Register platform)

[//]: # (  await lti.registerPlatform&#40;{)

[//]: # (    url: 'https://platform.url',)

[//]: # (    name: 'Platform Name',)

[//]: # (    clientId: 'TOOLCLIENTID',)

[//]: # (    authenticationEndpoint: 'https://platform.url/auth',)

[//]: # (    accesstokenEndpoint: 'https://platform.url/token',)

[//]: # (    authConfig: { method: 'JWK_SET', key: 'https://platform.url/keyset' })

[//]: # (  }&#41;)

[//]: # (})

[//]: # ()
[//]: # (setup&#40;&#41;)

[//]: # (```)

[//]: # ()
[//]: # (### Implementation example)

[//]: # ()
[//]: # ( - [Example Ltijs Server]&#40;https://github.com/Cvmcosta/ltijs-demo-server&#41;)

[//]: # ()
[//]: # ( - [Example Client App]&#40;https://github.com/Cvmcosta/ltijs-demo-client&#41;)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## Documentation)

[//]: # ()
[//]: # (See bellow for the complete documentation:)

[//]: # ()
[//]: # (### [Ltijs Documentation]&#40;https://cvmcosta.github.io/ltijs/#/provider&#41;)

[//]: # ()
[//]: # (Service documentations:)

[//]: # (   - [Deep Linking Service documentation]&#40;https://cvmcosta.github.io/ltijs/#/deeplinking&#41;)

[//]: # (   - [Grading Service documentation]&#40;https://cvmcosta.github.io/ltijs/#/grading&#41;)

[//]: # (   - [Names and Roles Provisioning Service documentation]&#40;https://cvmcosta.github.io/ltijs/#/namesandroles&#41;)

[//]: # (   - [Dynamic Registration Service documentation]&#40;https://cvmcosta.me/ltijs/#/dynamicregistration&#41;)

[//]: # ()
[//]: # (Additional documentation:)

[//]: # ()
[//]: # (   - [Platform class documentation]&#40;https://cvmcosta.github.io/ltijs/#/platform&#41; )

[//]: # ()
[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## Contributing)

[//]: # ()
[//]: # (Please ⭐️ us on [GitHub]&#40;https://github.com/Cvmcosta/ltijs&#41;, it always helps!)

[//]: # ()
[//]: # (If you find a bug or think that something is hard to understand feel free to open an issue or contact me on twitter [@cvmcosta]&#40;https://twitter.com/cvmcosta&#41;, pull requests are also welcome :&#41;)

[//]: # ()
[//]: # ()
[//]: # (And if you feel like it, you can donate any amount through paypal, it helps a lot.)

[//]: # ()
[//]: # (<a href="https://www.buymeacoffee.com/UL5fBsi" target="_blank"><img width="217" src="https://cdn.buymeacoffee.com/buttons/lato-green.png" alt="Buy Me A Coffee"></a>)

[//]: # ()
[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## Special thanks)

[//]: # ()
[//]: # (<div align="center">)

[//]: # (	<a href="https://portais.ufma.br/PortalUfma/" target='_blank'><img width="150" src="https://raw.githubusercontent.com/Cvmcosta/ltijs/master/docs/ufma-logo.png"></img></a>)

[//]: # (  <a href="https://www.unasus.ufma.br/" target='_blank'><img width="350" src="https://raw.githubusercontent.com/Cvmcosta/ltijs/master/docs/unasus-logo.png"></img></a>)

[//]: # (</div>)

[//]: # ()
[//]: # (> I would like to thank the Federal University of Maranhão and UNA-SUS/UFMA for the support throughout the entire development process.)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (<div align="center">)

[//]: # (<br>)

[//]: # (	<a href="https://coursekey.com/" target='_blank'><img width="180" src="https://raw.githubusercontent.com/Cvmcosta/ltijs/master/docs/coursekey-logo.png"></img></a>)

[//]: # (</div>)

[//]: # ()
[//]: # (> I would like to thank CourseKey for making the Certification process possible and allowing me to be an IMS Member through them, which will contribute immensely to the future of the project.)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (<div align="center">)

[//]: # (<br>)

[//]: # (	<a href="https://www.examind.io/" target='_blank'><img width="280" src="https://raw.githubusercontent.com/Cvmcosta/ltijs/master/docs/examind-logo.png"></img></a>)

[//]: # (</div>)

[//]: # ()
[//]: # (> I would like to thank Examind for the amazing work on the Firestore database plugin. As well as the continuous help and support in the development of this project.)

[//]: # ()
[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## License)

[//]: # ()
[//]: # ([![APACHE2 License]&#40;https://img.shields.io/github/license/cvmcosta/ltijs&#41;]&#40;LICENSE&#41;)

[//]: # ()
[//]: # (> *Learning Tools Interoperability® &#40;LTI®&#41; is a trademark of the IMS Global Learning Consortium, Inc. &#40;https://www.imsglobal.org&#41;*)
