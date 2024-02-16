import { User } from '../entities';

export function usersHelper(request: any, user: User = null): any[] {
  const exceptions: string[] = [];

  if (user === null && request.route.path === '/users/:id') {
    exceptions.push('User not found');
  }

  return exceptions;
}
