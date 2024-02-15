import { User } from 'src/microservices/users';
import { Team } from '../entities';

export function teamsHelper(request: any, attrs?: Team | User): string[] {
  const exceptions: string[] = [];

  if (
    request.route.path === '/teams' ||
    (request.route.path === '/teams/:id' && request.method === 'PUT')
  ) {
    if (attrs) {
      exceptions.push('Team name already in use');
    }
  }
  if (request.route.path === '/teams/:id') {
    if (attrs == null) {
      exceptions.push('Team not found');
    }
  }

  return exceptions;
}
