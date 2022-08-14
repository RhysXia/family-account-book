export abstract class BaseServiceError extends Error {}

export class ParameterError extends BaseServiceError {}

export class NotFoundError extends BaseServiceError {}
