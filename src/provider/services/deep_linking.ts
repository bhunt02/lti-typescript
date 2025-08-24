/* Provider Deep Linking Service */

import * as jwt from 'jsonwebtoken';
import {Debug} from '../../utils/debug';
import {BaseContentItem, IdToken} from '../../utils/types';
import {Provider} from '../provider';

export class DeepLinkingService {
  constructor(private provider: Provider) {}

  /**
   * @description Creates an auto submitting form containing the DeepLinking Message.
   * @param {IdToken} idToken - Idtoken for the user.
   * @param {BaseContentItem | BaseContentItem[]} contentItems - Array of contentItems to be linked.
   * @param {Object} options - Object containing extra options that mus be sent along the content items.
   * @param {String} options.message - Message the platform may show to the end user upon return to the platform.
   * @param {String} options.errMessage - Message the platform may show to the end user upon return to the platform if some error has occurred.
   * @param {String} options.log - Message the platform may log in it's system upon return to the platform.
   * @param {String} options.errLog - Message the platform may log in it's system upon return to the platform if some error has occurred.
   */
  async createDeepLinkingForm(
    idToken: IdToken,
    contentItems: BaseContentItem | BaseContentItem[],
    options: {
      message?: string;
      errMessage?: string;
      log?: string;
      errLog?: string;
    },
  ): Promise<string> {
    const message = await this.createDeepLinkingMessage(
      idToken,
      contentItems,
      options,
    );

    return `
      <form id="ltijs_submit" style="display: none;" action="${idToken.platformContext.deepLinkingSettings.deep_link_return_url}" method="POST">
          <input type="hidden" name="JWT" value="${message}" />
      </form>
      <script>
        document.getElementById("ltijs_submit").submit()
      </script>
    `;
  }

  /**
   * @description Creates a DeepLinking signed message.
   * @param {Object} idToken - Idtoken for the user.
   * @param {Array} contentItems - Array of contentItems to be linked.
   * @param {Object} options - Object containing extra options that mus be sent along the content items.
   * @param {String} options.message - Message the platform may show to the end user upon return to the platform.
   * @param {String} options.errMessage - Message the platform may show to the end user upon return to the platform if some error has occurred.
   * @param {String} options.log - Message the platform may log in it's system upon return to the platform.
   * @param {String} options.errLog - Message the platform may log in it's system upon return to the platform if some error has occurred.
   */
  async createDeepLinkingMessage(
    idToken: IdToken,
    contentItems: BaseContentItem | BaseContentItem[],
    options: {
      message?: string;
      errMessage?: string;
      log?: string;
      errLog?: string;
    },
  ): Promise<string> {
    Debug.log(this, 'Starting deep linking process');
    if (!idToken) {
      Debug.log(this, 'Missing IdToken object.');
      throw new Error('MISSING_ID_TOKEN');
    }
    if (!idToken.platformContext.deepLinkingSettings) {
      Debug.log(this, 'DeepLinkingSettings object missing.');
      throw new Error('MISSING_DEEP_LINK_SETTINGS');
    }
    if (!contentItems) {
      Debug.log(this, 'No content item passed.');
      throw new Error('MISSING_CONTENT_ITEMS');
    }

    // If it's not an array, turns it into an array
    if (!Array.isArray(contentItems)) contentItems = [contentItems];

    // Gets platform
    const platform = await this.provider.getPlatform(
      idToken.iss,
      idToken.clientId,
    );
    if (!platform) {
      Debug.log(this, 'Platform not found');
      throw new Error('PLATFORM_NOT_FOUND');
    }
    if (!platform.active) throw new Error('PLATFORM_NOT_ACTIVATED');

    Debug.log(this, 'Building basic JWT body');
    // Builds basic jwt body
    const jwtBody = {
      iss: platform.clientId,
      aud: idToken.iss,
      nonce: encodeURIComponent(
        [...Array(25)]
          .map((_) => ((Math.random() * 36) | 0).toString(36))
          .join(''),
      ),
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id':
        idToken.deploymentId,
      'https://purl.imsglobal.org/spec/lti/claim/message_type':
        'LtiDeepLinkingResponse',
      'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
    };

    // Adding messaging options
    if (options) {
      if (options.message)
        jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/msg'] =
          options.message;
      if (options.errMessage)
        jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/errormsg'] =
          options.errMessage;
      if (options.log)
        jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/log'] =
          options.log;
      if (options.errLog)
        jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/errorlog'] =
          options.errLog;
    }

    // Adding Data claim if it exists in initial request
    if (idToken.platformContext.deepLinkingSettings.data)
      jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/data'] =
        idToken.platformContext.deepLinkingSettings.data;

    Debug.log(
      this,
      "Sanitizing content item array based on the platform's requirements:",
    );
    const selectedContentItems = [];

    const acceptedTypes =
      idToken.platformContext.deepLinkingSettings.accept_types;
    const acceptMultiple = !(
      idToken.platformContext.deepLinkingSettings.accept_multiple === 'false' ||
      idToken.platformContext.deepLinkingSettings.accept_multiple === false
    );

    Debug.log(this, 'Accepted Types: ' + acceptedTypes);
    Debug.log(this, 'Accepts Mutiple: ' + acceptMultiple);

    Debug.log(this, 'Received content items: ');
    Debug.log(this, contentItems);

    for (const contentItem of contentItems) {
      if (!acceptedTypes.includes(contentItem.type)) continue;
      selectedContentItems.push(contentItem);
      if (!acceptMultiple) break;
    }
    Debug.log(this, 'Content items to be sent: ');
    Debug.log(this, selectedContentItems);
    jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/content_items'] =
      selectedContentItems;

    return jwt.sign(jwtBody, await platform.platformPrivateKey(), {
      algorithm: 'RS256',
      expiresIn: 60,
      keyid: platform.kid,
    });
  }
}
