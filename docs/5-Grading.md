# Grading Service Class Documentation
## Table of Contents

- [Introduction](#introduction)
- [Usage](#usage)
- [Documentation](#documentation)
- [License](#license)

---


## Introduction


LTI-Typescript implements the [LTI® 1.3 Assignment and Grading Service Specification](https://www.imsglobal.org/spec/lti-ags/v2p0/) in the form of the **GradeService Class**.

___


## Usage

### Sending grades to a platform

LTI-Typescript is able to send grades to a platform in the [application/vnd.ims.lis.v1.score+json](https://www.imsglobal.org/spec/lti-ags/v2p0/#score-publish-service) LTI® standard:

```json5
{ 
  "userId" : "200",
  "scoreGiven" : 83,
  "scoreMaximum" : 100,
  "comment" : "This is exceptional work.",
  "activityProgress" : "Completed",
  "gradingProgress": "FullyGraded"
}
```

> This excludes the *timestamp* field of the specification, because the submitScore method generates it automatically.

#### Submitting Grades

```typescript
/**
 * sendGrade
 */
provider.app.post('/grade', async (req, res) => {
  try {
    const idtoken = res.locals.token; // IdToken
    const score = req.body.grade; // User numeric score sent in the body
    // Creating Grade object
    const gradeObj = {
      userId: idtoken.user,
      scoreGiven: score,
      scoreMaximum: 100,
      activityProgress: 'Completed',
      gradingProgress: 'FullyGraded',
    };

    // Selecting lineItem ID
    let lineItemId = idtoken.platformContext.endpoint.lineitem; // Attempting to retrieve it from idtoken
    if (!lineItemId) {
      const response = await provider.GradeService.getLineItems(idtoken, { resourceLinkId: true });
      const lineItems = response.lineItems;
      if (lineItems.length === 0) {
        // Creating line item if there is none
        console.log('Creating new line item');
        const newLineItem = {
          scoreMaximum: 100,
          label: 'Grade',
          tag: 'grade',
          resourceLinkId: idtoken.platformContext.resource.id,
        }
        const lineItem = await provider.GradeService.createLineItem(idtoken, newLineItem);
        lineItemId = lineItem.id;
      } else lineItemId = lineItems[0].id;
    }

    // Sending Grade
    const responseGrade = await provider.GradeService.submitScore(idtoken, lineItemId, gradeObj);
    return res.send(responseGrade);
  } catch (err) {
    return res.status(500).send({ err: err.message });
  }
});
```

##### Retrieving Grades

LTI-Typescript is able to retrieve grades from a platform:

```typescript
provider.app.get('/grade', async (req, res) => {
  // Retrieves grades from a platform, only for the current user
  const idtoken = res.locals.token; // IdToken
  const response = await provider.GradeService.getScores(idtoken, idtoken.platformContext.endpoint.lineitem, { userId: idtoken.user });
  return res.send(result);
});
```

##### Line Item Retrieval, Creation, Update, and Deletion Example

```typescript

// Retrieving lineitems
provider.app.get('/lineitem', async (req, res) => {
  // Retrieves lineitems from a platform
  const result  = await provider.GradeService.getLineItems(res.locals.token);
  return res.send(result);
});

// Creating lineitem
provider.app.post('/lineitem', async (req, res) => {
  const lineItem = {
    scoreMaximum: 100,
    label: 'Grade',
    tag: 'grade',
  };
  // Sends lineitem to a platform
  await provider.GradeService.createLineItem(res.locals.token, lineItem);
  return res.sendStatus(201);
});

// Update lineitem
provider.app.post('/lineitem', async (req, res) => {
  const lineItem = {
    scoreMaximum: 100,
    label: 'Grade',
    tag: 'grade',
  };
  // Sends lineitem to a platform
  await provider.GradeService.updateLineItemById(res.locals.token, req.body.lineitemid, lineItem);
  return res.sendStatus(201);
});

// Delete lineitem
provider.app.delete('/lineitems', async (req, res) => {
  // Deleting lineitem on a platform
  await provider.GradeService.deleteLineItemById(res.locals.token, req.body.lineitemid, { tag: 'tag' });
  return res.sendStatus(204);
});

```

## Documentation 

#### getLineItems(idToken: IdToken, options?: { ... }, accessToken?: AccessTokenType): Promise<ResultType>;

* Gets line items filtered by (if present) any of the specified options.
* Parameters:
  * `idToken`: Identifier token for the request.
  * `options`: Options for the request.
    * `options.resourceLinkId = false` - Filters line items based on the resourceLinkId of the resource that originated the request, if not false. 
    * `options.resourceId = false` - Filters line items based on the resourceId, if not false.
    * `options.tag = false` - Filters line items based on the tag, if not false.
    * `options.limit = false` - Sets a maximum number of line items to be returned, if not false. 
    * `options.id = false` - Filters line items based on the id, if not false.
    * `options.label = false` - Filters line items based on the label, if not false.
    * `options.url = false` - Retrieves line items from a specific URL, if not false. Usually retrieved from the `next` link header of a previous request.
  * `accessToken`: Optional, pre-retrieved access token to perform the request.
    * If the access token does not have valid scopes or is expired, a new one will be requested.

#### getLineItemById(idToken: IdToken, lineItemId: string, accessToken?: AccessTokenType): Promise<LineItem>;

* Gets a specific line item by ID if it exists.
* Parameters:
    * `idToken`: Identifier token for the request.
    * `lineItemId`: Identifier/url for the line item.
    * `accessToken`: Optional, pre-retrieved access token to perform the request.
      * If the access token does not have valid scopes or is expired, a new one will be requested.


#### createLineItem(idToken: IdToken, lineItem: CreateLineItem, options?: { resourceLinkId: boolean = false }, accessToken?: AccessTokenType): Promise<LineItem>;

* Creates a new Line Item.
* Parameters:
    * `idToken`: Identifier token for the request.
    * `lineItem`: CreateLineItem Object, following the application/vnd.ims.lis.v2.lineitem+json specification
    * `accessToken`: Optional, pre-retrieved access token to perform the request.
      * If the access token does not have valid scopes or is expired, a new one will be requested.

#### updateLineItem(idToken: IdToken, lineItemId: string, lineItem: CreateLineItem, accessToken?: AccessTokenType): Promise<LineItem>;

* Updates an existing Line Item.
* Parameters:
    * `idToken`: Identifier token for the request.
    * `lineItemId`: Identifier/url for the line item.
    * `lineItem`: CreateLineItem Object, following the application/vnd.ims.lis.v2.lineitem+json specification
    * `accessToken`: Optional, pre-retrieved access token to perform the request.
       * If the access token does not have valid scopes or is expired, a new one will be requested.

#### deleteLineItemById(idToken: IdToken, lineItemId: string, accessToken?: AccessTokenType): Promise<boolean>;

* Deletes an existing Line Item.
* Parameters:
    * `idToken`: Identifier token for the request.
    * `lineItemId`: Identifier/url for the line item.
    * `accessToken`: Optional, pre-retrieved access token to perform the request.
        * If the access token does not have valid scopes or is expired, a new one will be requested.

#### submitScore(idToken: IdToken, lineItemId: string, score: Omit<ScoreItem,'timestamp'>, accessToken?: AccessTokenType): Promise<ScoreItem>;
* 
* Submits a score for an existing Line Item.
* Parameters:
    * `idToken`: Identifier token for the request.
    * `lineItemId`: Identifier/url for the line item.
    * `score`: ScoreItem excluding `timestamp` property as it is generated in the method.
    * `accessToken`: Optional, pre-retrieved access token to perform the request.
        * If the access token does not have valid scopes or is expired, a new one will be requested.

---

## License

> [APACHE2 License](../LICENSE)

> *Learning Tools Interoperability® (LTI®) is a trademark of the IMS Global Learning Consortium, Inc. (https://www.imsglobal.org)*

> *This library is a derivative work of [CVM Costa](https://github.com/Cvmcosta)'s original [LTIJS library](https://github.com/Cvmcosta/ltijs).* 