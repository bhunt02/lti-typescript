# Names and Roles Provisioning Service Class Documentation

## Table of Contents

- [Introduction](#introduction)
- [Usage](#usage)
- [Documentation](#documentation)
- [License](#license)

---

## Introduction
LTI-Typescript implements the [LTI® 1.3 Names and Roles Provisioning Service](https://www.imsglobal.org/spec/lti-nrps/v2p0) in the form of the **NamesAndRolesService Class**.

The Names And Roles Provisioning Service can be used by a tool to access a list of platform's users (referred to as members) and their roles within the context of a course, program or other grouping.

This class provides a single method for retrieving membership information, and offers the specified filters and functionalities.

---

## Usage


#### Retrieving members from a platform

All members of a platform within the context can be retrieved simply by calling the `getMembers()` method:

> **Since the information necessary to make a request is present in the idtoken, it is necessary to pass it along as the first parameter.**


```typescript
const response = await provider.NamesAndRoles.getMembers(res.locals.token) // Gets context members
````

##### Example Standard Response

```json5
{
  "id" : "https://lms.example.com/sections/2923/memberships",
  "context": {
    "id": "2923-abc",
    "label": "CPS 435",
    "title": "CPS 435 Learning Analytics",
  },
  "members" : [
    {
      "status" : "Active",
      "name": "Jane Q. Public",
      "picture" : "https://platform.example.edu/jane.jpg",
      "given_name" : "Jane",
      "family_name" : "Doe",
      "middle_name" : "Marie",
      "email": "jane@platform.example.edu",
      "user_id" : "0ae836b9-7fc9-4060-006f-27b2066ac545",
      "lis_person_sourcedid": "59254-6782-12ab",
      "roles": [
        "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"
      ]
    }
  ]
}
```


#### Adding filters

The `getMembers()` method allows us to apply filters to the request, and these filters can be specified through the `options` parameter:

- `options.role`

  Specifies that only members part of a certain role should be included in the list.

  **Example**: 
  ```typescript
  const members = await provider.NamesAndRolesService.getMembers(res.locals.token, { role: 'Learner' })
  ```

- `options.limit`

  Specifies the number of members per page that should be returned per members page.
  
  (*By default only one members page is returned.*)


- `options.pages`
  
  Specifies the number of pages that should be returned. *Defaults to 1*. If set to false, retrieves every available page.

  **Example:**
  
  (*The code below will return up to 20 members*)

  ```typescript
  const result = await provider.NamesAndRolesService.getMembers(res.locals.token, { role: 'Learner', limit: 10, pages: 2 })
  ```

 - `options.resourceLinkId`

  Accesses the Platform's Resource Link level membership service. This parameter will only take effect if the current context has a `resourceLinkId`.

   ```typescript
  const result = await provider.NamesAndRolesService.getMembers(res.locals.token, { resourceLinkId: true, role: 'Learner', limit: 10, pages: 2 })
  ```

- `options.url` 

  In case not all members were retrieved when the page limit was reached, the returned object will contain a `next` field holding an url that can be used to retrieve the remaining members. 
  
  This url can be passed through the `options.url` parameter. 

  (*If the `options.url` parameter is present, the `limit`, `role` and `resourceLinkId` filters are ignored, instead, the filters applied on the initial request will be maintained*)

  Example:

  ```json5
  {
    "id" : "https://lms.example.com/sections/2923/memberships",
    "context": {
      "id": "2923-abc",
      "label": "CPS 435",
      "title": "CPS 435 Learning Analytics",
    },
    "members" : [
      ...
    ],
    "next": "https://lms.example.com/sections/2923/memberships/page/2"
  }
  ```

  ```typescript
  const result = await provider.NamesAndRolesService.getMembers(res.locals.token, { role: 'Learner', limit: 10, pages: 2 })
  const next = result.next
  const remaining = await provider.NamesAndRolesService.getMembers(res.locals.token, { pages: 2, url: next }) // This request will maintain the "limit" and "role" parameters of the initial request
  ```

  The same behaviour can be applied to the [differences url](https://www.imsglobal.org/spec/lti-nrps/v2p0#membership-differences), if it is present in the response:

   Example:

  ```json5
  {
    "id" : "https://lms.example.com/sections/2923/memberships",
    "context": {
      "id": "2923-abc",
      "label": "CPS 435",
      "title": "CPS 435 Learning Analytics",
    },
    "members" : [
      ...
    ],
    "differences": "https://lms.example.com/sections/2923/memberships?since=672638723"
  }
  ```

  ```typescript
  const result = await provider.NamesAndRolesService.getMembers(res.locals.token, { role: 'Learner', limit: 10, pages: 2 })
  const differencesUrl = result.differences
  const differences = await provider.NamesAndRolesService.getMembers(res.locals.token, { url: differencesUrl })
  ```

--- 

### Example Basic Usage

```typescript
// Members route
provider.app.get('/members', async (req, res) => {
  const members = await provider.NamesAndRolesService.getMembers(res.locals.token) // Gets context members
  res.send(members)
});
```


___


## Documentation

#### NamesAndRolesService.getMembers(idToken: IdToken, options?: { role?: string; limit?: number; pages?: number; url?: string; resourceLinkId?: boolean; } = { pages: 1, resourceLinkId: false }): Promise\<MemberReturnType[]>

Retrieves members from platform.

---

## License

> [APACHE2 License](../LICENSE)

> *Learning Tools Interoperability® (LTI®) is a trademark of the IMS Global Learning Consortium, Inc. (https://www.imsglobal.org)*

> *This library is a derivative work of [CVM Costa](https://github.com/Cvmcosta)'s original [LTIJS library](https://github.com/Cvmcosta/ltijs).* 
