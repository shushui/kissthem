import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { SecretManagerService } from '../google-cloud/secret-manager.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly secretManagerService: SecretManagerService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const token = authHeader.substring(7);
      const clientId = await this.secretManagerService.getSecret('oauth-client-id');
      const client = new OAuth2Client(clientId);
      
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: clientId
      });
      
      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      request.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      };
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
