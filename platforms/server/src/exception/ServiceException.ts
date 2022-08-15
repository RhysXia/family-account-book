export abstract class BaseServiceException extends Error {}

/**
 * 参数错误异常
 */
export class ParameterException extends BaseServiceException {}

/**
 * 资源不存在异常
 */
export class ResourceNotFoundException extends BaseServiceException {}

/**
 * 授权异常
 */
export class AuthorizationException extends BaseServiceException {}

/**
 * 认证异常
 */
export class AuthentizationException extends BaseServiceException {}
