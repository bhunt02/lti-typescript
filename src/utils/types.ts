import {CookieOptions} from 'express';
import {BaseEntity} from 'typeorm';
import {JwtPayload} from 'jsonwebtoken';

export type ProviderOptions = {
  appUrl?: string;
  loginUrl?: string;
  keySetUrl?: string;
  dynRegUrl?: string;
  appRoute?: string;
  loginRoute?: string;
  keySetRoute?: string;
  dynRegRoute?: string;
  staticPath?: string;
  https?: boolean;
  ssl?: {
    key: string;
    cert: string;
    staticPath: string;
  };
  cors?: boolean;
  serverAddon?: (...params: any[]) => any;
  cookies?: CookieOptions;
  devMode?: boolean;
  debug?: boolean;
  tokenMaxAge?: number;
  dynReg?: DynamicRegistrationOptions;
};

export type DynamicRegistrationOptions = {
  url: string;
  name: string;
  logo?: string;
  description?: string;
  redirectUris?: string[];
  customParameters?: Record<string, string>;
  autoActivate?: boolean;
  useDeepLinking?: boolean;
};

export type DynamicRegistrationSecondaryOptions = {
  initiate_login_uri?: string;
  redirect_uris?: string[];
  client_name?: string;
  jwks_uri?: string;
  logo_uri?: string;
  'https://purl.imsglobal.org/spec/lti-tool-configuration'?: Partial<LtiPlatformRegistration>;
};

export type VerifiedToken = {
  'https://purl.imsglobal.org/spec/lti/claim/tool_platform': PlatformInfoType;
  'https://purl.imsglobal.org/spec/lti/claim/roles': string[];
  'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': string;
  'https://purl.imsglobal.org/spec/lti/claim/custom': Record<string, any>;
  'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': IMSLaunchPresentation;
  'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint': IMSGradeEndpoint;
  'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice': any;
  'https://purl.imsglobal.org/spec/lti/claim/context'?: IMSContext;
  'https://purl.imsglobal.org/spec/lti/claim/resource_link'?: IMSResourceLink;
  'https://purl.imsglobal.org/spec/lti/claim/deployment_id'?: string;
};

export type IMSGradeEndpoint = {
  scope: string[];
  lineitems: string;
  lineitem: string;
};

export type IMSContext = {
  id: string;
  label?: string;
  title?: string;
  type?: string[];
};

export type IMSResourceLink = {
  id: string;
  description?: string;
  title?: string;
};

export type IMSLaunchPresentation = {
  document_target?: 'iframe' | 'frame' | 'window';
  height?: string | number;
  width?: string | number;
  return_url?: string;
  locale?: string;
};

export type DeepLinkingSettings = {
  deep_link_return_url: string;
  accept_types: ('link' | 'file' | 'html' | 'ltiResourceLink' | 'image')[];
  accept_media_types?: string;
  accept_presentation_document_targets: ('iframe' | 'window' | 'embed')[];
  accept_multiple?: boolean | 'true' | 'false';
  auto_create?: boolean | 'true' | 'false';
  title: string;
  text: string;
  data: string;
};

export type LISClaim = {
  person_sourcedid?: string;
  course_offering_sourcedid?: string;
  course_section_sourcedid?: string;
};

export type ContextProperties = MainContextProperties & AdditionalContext;

export type MainContextProperties = {
  contextId: string;
  user: string;
  context: IMSContext;
  resource: IMSResourceLink;
  messageType: string;
  version: string;
  deepLinkingSettings: DeepLinkingSettings;
  lis: LISClaim;
};

export type AdditionalContext = {
  path: string;
  roles: string[];
  targetLinkUri: string;
  custom: any;
  launchPresentation: IMSLaunchPresentation;
  endpoint: IMSGradeEndpoint;
  namesRoles: IMSNamesRoles;
};

export type IMSNamesRoles = {
  context_memberships_url: string;
};

export type ValidatedToken = JwtPayload &
  UserInfo &
  VerifiedToken & { platformId: string; clientId: string };

export type IdToken = {
  iss: string;
  sub: string;
  aud: string;
  clientId: string;
  deploymentId: string;
  platformId: string;
  platformContext: ContextProperties;
  platformInfo: {
    product_family_code: string;
    version: string;
    guid: string;
    name: string;
    description: string;
  };
  user: string;
  userInfo: UserInfo;
};

export type UserInfo = {
  given_name: string;
  family_name: string;
  name: string;
  email: string;
};

/**
 * @name RouteType
 * @description A type that describes a route based on the pathname and method
 * @property route RegExp property which represents the pathname of the route
 * @property method String property which maps to an HTTP/S method
 */
export type RouteType = {
  route: RegExp | string;
  method: string;
};

export enum AuthTokenMethodEnum {
  RSA_KEY = 'RSA_KEY',
  JWK_KEY = 'JWK_KEY',
  JWK_SET = 'JWK_SET',
}

export type AuthConfigType = {
  method: AuthTokenMethodEnum;
  key: string;
};

export type UserInfoType = any;

export type PlatformInfoType = any;

export class EncryptedEntity extends BaseEntity {
  iv: string;
  data: string;
}

export type PlatformProperties = {
  platformUrl: string;
  clientId: string;
  name: string;
  authenticationEndpoint: string;
  accessTokenEndpoint: string;
  authorizationServer?: string;
  kid: string;
  authToken: AuthConfigType;
  active?: boolean;
};

export type AccessTokenType = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
};

export type KeyObject = {
  key: string;
  kid: string;
};

export type LineItem = {
  id: string;
  scoreMaximum: number;
  label: string;
  resourceId?: string;
  tag: string;
  resourceLinkId?: string;
  startDateTime?: string;
  endDateTime?: string;
  gradesReleased?: false;
};

export type CreateLineItem = Omit<LineItem, 'id'>;

export type getLineItemOptions = {
  resourceLinkId?: boolean;
  resourceId?: boolean;
  tag?: string | false;
  limit?: number | false;
  id?: string | false;
  label?: string | false;
  url?: string | false;
};

export type ScoreResultType = {
  id: string;
  scoreOf: string;
  userId: string;
  resultScore: number | null;
  resultMaximum: number;
  scoringUserId?: string;
  comment?: string;
};

export type ScoreType = {
  scoreGiven: number;
  scoreMaximum: number;
  comment?: string;
  activityProgress:
    | 'Initialized'
    | 'Starting'
    | 'InProgress'
    | 'Submitted'
    | 'Completed';
  gradingProgress:
    | 'FullyGraded'
    | 'Pending'
    | 'PendingManual'
    | 'Failed'
    | 'NotReady';
  timestamp: string;
  userId: string;
  scoringUserId?: string;
  submission?: {
    startedAt: string;
    submittedAt?: string;
  };
};

export type LTIK = {
  platformUrl: string;
  platformCode: string;
  clientId: string;
  deploymentId: string;
  contextId: string;
  user: string;
};

export type LtiAdvantageLoginParams = {
  iss: string;
  target_link_uri: string;
  client_id?: string;
  redirect_uri: string;
  login_hint: string;
  lti_message_hint: string;
  lti_deployment_id: string;
};

export type LtiAdvantageLoginArgs = {
  response_type: 'id_token';
  response_mode: 'form_post';
  id_token_signed_response_alg: 'RS256';
  scope: 'openid';
  client_id: string;
  redirect_uri: string;
  login_hint: string;
  nonce: string;
  prompt: 'none';
  lti_message_hint?: string;
  lti_deployment_id?: string;
  state: string;
};

export type LtiResourceType =
  | 'link'
  | 'file'
  | 'html'
  | 'ltiResourceLink'
  | 'image';

export interface BaseContentItem {
  type: LtiResourceType;
  title?: string;
  text?: string;
  custom?: Record<string, string>;
}

export interface IconContentItem extends BaseContentItem {
  url: string;
  icon?: string;
  thumbnail?: {
    url: string;
    width: string | number;
    height: string | number;
  };
}

export interface ContentItem extends IconContentItem {
  embed?: string;
  window?: {
    targetName: string;
    width: string | number;
    height: string | number;
    windowFeatures: string;
  };
  iframe?: {
    src: string;
    width: string | number;
    height: string | number;
  };
}

export interface LinkContentItem extends ContentItem {
  type: 'link';
}

export interface LtiResourceLinkContentItem extends ContentItem {
  type: 'ltiResourceLink';
  custom?: Record<string, any>;
  lineItem?: {
    label?: string;
    scoreMaximum: number;
    resourceId?: string;
    tag?: string;
    gradesReleased?: boolean;
  };
  available?: {
    startDateTime?: Date;
    endDateTime?: Date;
  };
  submission?: {
    startDateTime?: Date;
    endDateTime?: Date;
  };
}

export interface FileContentItem extends IconContentItem {
  type: 'file';
  expiresAt: Date;
}

export interface HtmlFragmentContentItem extends BaseContentItem {
  type: 'html';
  html: string;
}

export interface ImageContentItem extends IconContentItem {
  type: 'image';
  width?: string | number;
  height?: string | number;
}

export type OpenIdConfiguration = {
  issuer: string;
  authorization_endpoint: string;
  registration_endpoint: string;
  jwks_uri: string;
  token_endpoint: string;
  token_endpoint_auth_methods_supported: ['private_key_jwt'] & string[];
  token_endpoint_auth_signing_alg_values_supported: ['RS256'] & string[];
  scopes_supported: ['openid'] & string[];
  response_types_supported: ['id_token'] & string[];
  id_token_signing_alg_values_supported: ['RS256'] & string[];
  claims_supported: string[];
  subject_types_supported: ('public' | 'pairwise')[];
  authorization_server: string;
  'https://purl.imsglobal.org/spec/lti-platform-configuration': LtiPlatformConfig;
};

export type OpenIdRegistration = {
  application_type: 'web';
  grant_types: ['client_credentials', 'implicit'] & string[];
  response_types: ['id_token'] & string[];
  redirect_uris: string[];
  initiate_login_uri: string;
  client_name: string;
  logo_uri?: string;
  token_endpoint_auth_method: 'private_key_jwt';
  contacts?: any[];
  client_uri?: string;
  tos_uri?: string;
  policy_uri?: string;
  scope: string;
  'https://purl.imsglobal.org/spec/lti-tool-configuration': LtiPlatformRegistration;
};

export type ToolOpenIdConfiguration = {
  client_id: string;
  registration_client_uri?: string;
  registration_access_token?: string;
} & OpenIdRegistration;

export type LtiPlatformConfig = {
  product_family_code: string;
  version: string;
  messages_supported: MessageSupported[];
  variables: string[];
};

export type LtiPlatformRegistration = {
  domain: string;
  secondary_domains?: string[];
  deployment_id?: string;
  target_link_uri: string;
  custom_parameters?: Record<string, string>;
  description?: string;
  messages: LtiMessageRegistration[];
  claims: string[];
};

export type LtiMessageRegistration = {
  type: string;
  target_link_uri?: string;
  label?: string;
  icon_uri?: string;
  custom_parameters?: Record<string, string>;
  placements?: string[];
  roles?: string[];
};

export type LtiDeepLinkingMessageRegistration = {
  placements?: ('Content Area' | 'RichTextEditor')[];
  supported_types: LtiResourceType[];
  supported_media_types: string[];
} & LtiMessageRegistration;

export type MessageSupported = {
  type: string;
  placements?: string[];
};
