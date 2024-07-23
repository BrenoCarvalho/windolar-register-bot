import { Module } from '@nestjs/common';
import { WindolarApiService } from './windolar-api.service';
import { AxiosRetryModule } from 'nestjs-axios-retry';

@Module({
  imports: [
    AxiosRetryModule.forRoot({
      axiosRetryConfig: {
        retries: 3,
        retryDelay: (retryCount) => retryCount * 100,
        shouldResetTimeout: true,
        retryCondition: (error) =>
          error?.response?.status < 200 || error?.response?.status > 299,
      },
    }),
  ],
  exports: [WindolarApiService],
  providers: [WindolarApiService],
})
export class WindolarApiModule {}
