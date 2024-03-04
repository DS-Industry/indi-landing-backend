import { Provider } from '@nestjs/common';
import { AuthUsecase } from '../../aplication/usecases/auth/auth.usecase';

export const AuthProvider: Provider = {
  provide: 'AuthService',
  useClass: AuthUsecase,
};
