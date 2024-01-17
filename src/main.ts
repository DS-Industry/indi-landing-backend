import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';



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
  await app.listen(PORT);
  app.use(require('body-parser').json())


  console.log(
      `Application ${appName} ready to receive request in PORT - ${PORT}`,
  );


}
bootstrap();
