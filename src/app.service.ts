import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '<h1>Chetta Shop</h1>\n<h2>Application is <a role="button" href="/api" style="color: red;">here</a></h2>';
  }
}
