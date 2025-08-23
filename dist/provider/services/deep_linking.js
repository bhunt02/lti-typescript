"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepLinkingService = void 0;
const jwt = require("jsonwebtoken");
const debug_1 = require("../../utils/debug");
class DeepLinkingService {
    constructor(provider) {
        this.provider = provider;
    }
    async createDeepLinkingForm(idToken, contentItems, options) {
        const message = await this.createDeepLinkingMessage(idToken, contentItems, options);
        return `
      <form id="ltijs_submit" style="display: none;" action="${idToken.platformContext.deepLinkingSettings.deep_link_return_url}" method="POST">
          <input type="hidden" name="JWT" value="${message}" />
      </form>
      <script>
        document.getElementById("ltijs_submit").submit()
      </script>
    `;
    }
    async createDeepLinkingMessage(idToken, contentItems, options) {
        debug_1.Debug.log(this, 'Starting deep linking process');
        if (!idToken) {
            debug_1.Debug.log(this, 'Missing IdToken object.');
            throw new Error('MISSING_ID_TOKEN');
        }
        if (!idToken.platformContext.deepLinkingSettings) {
            debug_1.Debug.log(this, 'DeepLinkingSettings object missing.');
            throw new Error('MISSING_DEEP_LINK_SETTINGS');
        }
        if (!contentItems) {
            debug_1.Debug.log(this, 'No content item passed.');
            throw new Error('MISSING_CONTENT_ITEMS');
        }
        if (!Array.isArray(contentItems))
            contentItems = [contentItems];
        const platform = await this.provider.getPlatform(idToken.iss, idToken.clientId);
        if (!platform) {
            debug_1.Debug.log(this, 'Platform not found');
            throw new Error('PLATFORM_NOT_FOUND');
        }
        if (!platform.active)
            throw new Error('PLATFORM_NOT_ACTIVATED');
        debug_1.Debug.log(this, 'Building basic JWT body');
        const jwtBody = {
            iss: platform.clientId,
            aud: idToken.iss,
            nonce: encodeURIComponent([...Array(25)]
                .map((_) => ((Math.random() * 36) | 0).toString(36))
                .join('')),
            'https://purl.imsglobal.org/spec/lti/claim/deployment_id': idToken.deploymentId,
            'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingResponse',
            'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
        };
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
        if (idToken.platformContext.deepLinkingSettings.data)
            jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/data'] =
                idToken.platformContext.deepLinkingSettings.data;
        debug_1.Debug.log(this, "Sanitizing content item array based on the platform's requirements:");
        const selectedContentItems = [];
        const acceptedTypes = idToken.platformContext.deepLinkingSettings.accept_types;
        const acceptMultiple = !(idToken.platformContext.deepLinkingSettings.accept_multiple === 'false' ||
            idToken.platformContext.deepLinkingSettings.accept_multiple === false);
        debug_1.Debug.log(this, 'Accepted Types: ' + acceptedTypes);
        debug_1.Debug.log(this, 'Accepts Mutiple: ' + acceptMultiple);
        debug_1.Debug.log(this, 'Received content items: ');
        debug_1.Debug.log(this, contentItems);
        for (const contentItem of contentItems) {
            if (!acceptedTypes.includes(contentItem.type))
                continue;
            selectedContentItems.push(contentItem);
            if (!acceptMultiple)
                break;
        }
        debug_1.Debug.log(this, 'Content items to be sent: ');
        debug_1.Debug.log(this, selectedContentItems);
        jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/content_items'] =
            selectedContentItems;
        return jwt.sign(jwtBody, await platform.platformPrivateKey(), {
            algorithm: 'RS256',
            expiresIn: 60,
            keyid: platform.kid,
        });
    }
}
exports.DeepLinkingService = DeepLinkingService;
//# sourceMappingURL=deep_linking.js.map