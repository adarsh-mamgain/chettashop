import { User } from 'src/microservices/users/users.entity';

export function authHelper(request: any, user: User[]): any[] {
  const exceptions: string[] = [];

  if (!request.body.email.includes('@')) {
    exceptions.push('Invalid email format');
  }

  if (request.route.path === '/auth/signup') {
    if (user.length) {
      exceptions.push('Email already in use');
    }
    if (!request.body.password.match(/[a-z]/i)) {
      exceptions.push('Password must contain at least one letter');
    }
    if (!request.body.password.match(/[0-9]/)) {
      exceptions.push('Password must contain at least one digit');
    }
    if (request.body.password.length < 8) {
      exceptions.push('Password must be at least 8 characters long');
    }
  }

  return exceptions;
}
