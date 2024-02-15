import { User } from 'src/microservices/users';
import { Team } from '../entities';

export function teamsHelper(
  request: any,
  attrs?: Team | User | User[],
): string[] {
  const exceptions: string[] = [];

  if (
    request.route.path === '/teams' ||
    (request.route.path === '/teams/:id' && request.method === 'PUT')
  ) {
    if (attrs) {
      exceptions.push('Team name already in use');
    }
  }
  if (request.route.path === '/teams/member/:id') {
    if (request.method === 'POST' && attrs[0] == null) {
      exceptions.push('Create a Team first');
    }
    if (request.method === 'POST' && attrs[0] != null) {
      exceptions.push('User already a part of a team');
    }
  }
  if (request.route.path === '/teams/:id') {
    if (attrs == null) {
      exceptions.push('Team not found');
    }
  }

  return exceptions;
}
