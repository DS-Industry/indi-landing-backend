import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ValidationException } from './infrastructure/common/exceptions/validation.exception';
import { AllExceptionFilter } from './infrastructure/common/filters/exception.filter';
import { ResponseInterceptor } from './infrastructure/common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const PORT = configService.get<number>('port');
  const environment = configService.get<string>('NODE_ENV');
  const appName = configService.get<string>('appName');
  app.enableCors({
    origin: ['http://localhost:5173', 'https://pay.moy-ka.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // if you need to send cookies or credentials,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new ValidationException(errors);
      },
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionFilter());
  await app.listen(PORT);
  app.use(require('body-parser').json());

  console.log(
    `Application ${appName} ready to receive request in PORT - ${PORT}`,
  );
}
bootstrap();
