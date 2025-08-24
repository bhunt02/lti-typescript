# The problem with Redirection URIs

---

## Problem: Platform-Specific Implementations of LTI

During the launch of a LTI tool the Platform starts the login flow by sending a request containing a `target_link_uri` that determines the desired final endpoint for this specific launch, the Tool then redirects to the Platform's authentication endpoint sending a `redirect_uri` parameter that tells the Platform to which exact endpoint it's supposed to redirect to at the end of the login flow. 

According to the OAuth2 specification, the `redirect_uri` parameter should be matched with the redirection URIs registered inside the Platform. The problem is the inconsistency of implementations when it comes to whether or not the query portion of a URL should be taken into consideration. This inconsistency, combined with incomplete support of `custom parameters` creates a situation where Tools can't use a single resource selection strategy for every LMS.

Using as an example two of the most popular LMSs, Canvas and Moodle, we can easily see the issue: 

<table>
   <thead>
      <tr>
         <th>
            LMS
         </th>
         <th>
            URL Parameters
         </th>
         <th>
            Custom Parameters (Deep Linking)
         </th>
      </tr>
   </thead>
   <tbody>
   <tr>
      <td>
         Canvas
      </td>
      <td align="center">
         ✔️
      </td>
      <td align="center">
         ✖️
      </td>
   </tr>
   <tr>
      <td>
         Moodle
      </td>
      <td align="center">
         ✖️
      </td>
      <td align="center">
         ✔️
      </td>
   </tr>
   </tbody>
</table>

## The Solution

The solution LTI-Typescript implements to provide developers with an unified resource selection strategy, without breaking the OAuth2 protocol, is receiving a `target_link_uri` with URL Parameters, using the OAuth2 `state` token as a key to store the parameters, cleaning the `redirect_uri` down to it's registered form and reapplying the URL parameters once the launch flow is finished. 

Using this strategy, URL Parameters can be used to select resources dynamically in any LMS:

 - Received `target_link_uri`: 
 
    `https://tool.com?resource=123`
  
 - URL Parameters stored using state as the key: 
  
    ```
    { 
      state: "12uy3g8asd7123vasdjhv123876asd", 
      query: { resource: "123" } 
    }
    ```
 - Returned `redirect_uri`: 
    
    `https://tool.com`

 - After launch is complete, URL parameters are retrieved and reapplied to URL: 
 
    `https://tool.com?resource=123`

---

## License

> [APACHE2 License](../LICENSE)

> *Learning Tools Interoperability® (LTI®) is a trademark of the IMS Global Learning Consortium, Inc. (https://www.imsglobal.org)*

> *This library is a derivative work of [CVM Costa](https://github.com/Cvmcosta)'s original [LTIJS library](https://github.com/Cvmcosta/ltijs).* 
