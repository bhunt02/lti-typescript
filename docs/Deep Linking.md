# Deep-Linking Service Class Documentation

## Table of Contents

- [Introduction](#introduction)
- [Usage](#usage)
- [Documentation](#documentation)
- [License](#license)

---


## Introduction
LTI-Typescript implements the [LTI® 1.3 Deep Linking Service Specification](https://www.imsglobal.org/spec/lti-dl/v2p0/) in the form of the **DeepLinking Class**.

Deep Linking consists of using a LTI® launch to select specific resources within a tool to be displayed to the user.

This class provides two methods for generating the deep linking messages, and a callback method called whenever there is a successfull deep linking launch.

Following the official specification, the usual working flow is: 

- Platform initiates deep linking launch.
- onDeepLinking() callback is called and redirects to the resource selection view.
- In the resource selection view, the user selects one or more resources and makes a POST request with the result.
- The tool then uses the provider.DeepLinking class to generate the self submitting form with the signed JWT message of the deep linking request and returns the form to the client.
- The client then embeds the form in the page, submitting the deep linking request.

---

## Usage

### Deep Linking Callback

Whenever a platform makes a successfull deep linking launch to the tool, the deep linking callback is called, so that the tool can display a resource selection view:

```javascript
// Deep Linking callback
lti.onDeepLinking((token, req, res) => {
  // Call redirect function to deep linking view
  lti.redirect(res, '/deeplink')
})

// Deep Linking route, displays the resource selection view
lti.app.get('/deeplink', async (req, res) => {
  return res.sendFile(path.join(__dirname, '/public/resources.html'))
})
```

> Deep linking launches uses the same endpoint as regular launches.

### Deep Linking Messages

#### provider.DeepLinkingService.createDeepLinkingForm()

After resources are selected, the tool can now create a deep linking request message and send to the platform, this can be done through two methods:

```typescript
provider.DeepLinkingService.createDeepLinkingForm(
  idToken: IdToken, 
  contentItems: BaseContentItem[], 
  options: { message?: string; errMessage?: string; log?: string; errLog?: string; }
);
```

Returns a self submitting Deep Linking form containing the signed JWT message, this form should be embeded in the html of the tool's client in order to finish the deep linking request.

```typescript
// Handles deep linking request generation with the selected resource
provider.app.post('/deeplink', async (req, res) => {
    const resource = req.body;
    
    const items = [
      {
        type: 'ltiResourceLink',
        title: resource.title,
        url: resource.url,
        custom: {
          resourceurl: resource.path,
          resourcename: resource.title
        }
      }
    ];
    
    // Creates the deep linking request form
    const form = await provider.DeepLinking.createDeepLinkingForm(res.locals.token, items, { message: 'Successfully registered resource!' });
    
    return res.send(form);
});
```

#### provider.DeepLinkingService.createDeepLinkingMessage()

```typescript
provider.DeepLinkingService.createDeepLinkingMessage(
  idToken: IdToken, 
  contentItems: BaseContentItem[], 
  options: { message?: string; errMessage?: string; log?: string; errLog?: string; }
);
```

Returns a signed JWT message, that the client has to submit in a POST form in order to finish the deep linking request.

```typescript
// Handles deep linking request generation with the selected resource
provider.app.post('/deeplink', async (req, res) => {
    const resource = req.body;
    
    const items = [
      {
        type: 'ltiResourceLink',
        title: resource.title,
        url: resource.url,
        custom: {
          resourceurl: resource.path,
          resourcename: resource.title
        }
      }
    ];
    
    // Creates the deep linking request JWT message
    const message = await provider.DeepLinkingService.createDeepLinkingMessage(res.locals.token, items, { message: 'Successfully registered resource!' });
    
    return res.send(message);
});
```

#### ID Token parameter

Since most of the information necessary to create a deep linking request is present in the idtoken, it is necessary to pass it along as the first parameter.

```typescript
// Retrieves idtoken from the locals variable
const token = res.locals.token
const message = await provider.DeepLinkingService.createDeepLinkingMessage(token, items, { message: 'Successfully registered resources!' })
```

#### Content Items parameter

The Content Items parameter is either an content item object or a array of content item objects, following the [LTI® 1.3 content item specification](https://www.imsglobal.org/spec/lti-dl/v2p0/#content-item-types). 

Passing the parameter **does not guarantee that all content items will be sent in the request**, to avoid errors, LTI-Typescript only sends content items that fit within the platform's accepted item types and allowed quantity.

If a platform only allows one content item per deep linking request, only the first content item passed in the parameter will actually be sent to the platform.

**Example**: 
```typescript
const items = [
  {
    type: 'ltiResourceLink',
    title: 'LTI resource',
    url: 'https://your.ltijs.com?resource=resource1',
    custom: {
      resource: 'resource1'
    }
  },
  {
    type: 'link',
    title: 'Link',
    url: 'https://link.com'
  }
];

const message = await provider.DeepLinkingService.createDeepLinkingMessage(res.locals.token, items, { message: 'Successfully registered resources!' });
```


#### Options

The [Deep Linking specification](https://www.imsglobal.org/spec/lti-dl/v2p0) allows us to set custom messages that should be displayed to the user in case of success or failure:

- `options.message ` e.g., 'Successfully registered the resources!'

- `options.errMessage` e.g., 'Resource registration failed!'

We can also set the messages that the platform will log in their systems in case of success or failure.

- `options.log` e.g., 'registered_lti_resource'

- `options.errLog` e.g., 'resource_registration_failed'

--- 

### Example: 

```typescript
// Deep Linking callback
provider.onDeepLinking((token, req, res) => {
  // Displays the resource selection view
  return res.sendFile(path.join(__dirname, '/public/resources.html'));
})

// Handles deep linking request generation with the selected resource
provider.app.post('/deeplink', async (req, res) => {
  const resource = req.body;

  const items = [
    {
      type: 'ltiResourceLink',
      title: resource.title,
      custom: {
        resourceurl: resource.path,
        resourcename: resource.title
      }
    }
  ];

  // Creates the deep linking request form
  const form = await provider.DeepLinkingService.createDeepLinkingForm(res.locals.token, items, { message: 'Successfully registered resource!' });

  return res.send(form);
});
```


___


## Documentation

#### provider.DeepLinkingService.createDeepLinkingForm(idToken: IdToken, contentItems: BaseContentItem[], options: { message?: string; errMessage?: string; log?: string; errLog?: string; }): Promise\<string> 

Creates a self submitting form containing the signed JWT message of the deep linking request.

#### provider.DeepLinkingService.createDeepLinkingMessage(idToken: IdToken, contentItems: BaseContentItem[], options: { message?: string; errMessage?: string; log?: string; errLog?: string; }): Promise\<string>

Creates a signed JWT message of the deep linking request.

---

## License

> [APACHE2 License](../LICENSE)

> *Learning Tools Interoperability® (LTI®) is a trademark of the IMS Global Learning Consortium, Inc. (https://www.imsglobal.org)*

> *This library is a derivative work of [CVM Costa](https://github.com/Cvmcosta)'s original [LTIJS library](https://github.com/Cvmcosta/ltijs).* 
