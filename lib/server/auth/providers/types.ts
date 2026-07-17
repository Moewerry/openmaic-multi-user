export interface AuthenticatedIdentity { authType: string; username?: string; externalId?: string; displayName?: string; email?: string }
export interface AuthProvider<TInput = unknown> { readonly id: string; authenticate(input: TInput): Promise<AuthenticatedIdentity | null> }
