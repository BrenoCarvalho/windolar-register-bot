import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import environment from 'src/environment';

@Injectable()
export class WindolarApiService {
  private logger: Logger;

  private authToken: string;

  constructor(private readonly httpService: HttpService) {
    this.logger = new Logger(WindolarApiService.name);
  }

  async authenticate() {
    this.logger.log('Authenticating...');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          environment.windolarBaseUrl + '/login',
          {
            email: environment.windolarEmail,
            password: environment.windolarPassword,
          },
          {
            'axios-retry': {
              onRetry: async (retryCount: number) => {
                this.logger.warn(`Retrying request attempt ${retryCount}`);
              },
            },
          },
        ),
      );

      if (!response?.data?.token) throw new BadRequestException();

      this.authToken = response?.data?.token;
    } catch (error) {
      this.logger.error(error);
    }

    this.logger.log('Authenticated as successfully!');
  }

  async get<T>(
    route: string,
    requestConfig?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      return await firstValueFrom(
        this.httpService.get(environment.windolarBaseUrl + route, {
          ...requestConfig,
          'axios-retry': {
            onRetry: async (retryCount: number, error: AxiosError) => {
              this.logger.warn(`Retrying request attempt ${retryCount}`);
              if (error.response.status === 403) {
                await this.authenticate();

                error.config.headers['Authorization'] =
                  `Bearer ${this.authToken}`;
              }
            },
          },
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }),
      );
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async post<T>({
    route,
    data,
    requestConfig,
    additionalHeaders = {},
  }: {
    route: string;
    data: any;
    requestConfig?: AxiosRequestConfig;
    additionalHeaders?: any;
  }): Promise<AxiosResponse<T>> {
    try {
      return await firstValueFrom(
        this.httpService.post(environment.windolarBaseUrl + route, data, {
          ...requestConfig,
          'axios-retry': {
            onRetry: async (retryCount: number, error: AxiosError) => {
              this.logger.warn(`Retrying request attempt ${retryCount}`);
              if (error.response.status === 403) {
                await this.authenticate();

                error.config.headers['Authorization'] =
                  `Bearer ${this.authToken}`;
              }
            },
          },
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            ...additionalHeaders,
          },
        }),
      );
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async patch<T>(
    route: string,
    data: any,
    requestConfig?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      return await firstValueFrom(
        this.httpService.patch(environment.windolarBaseUrl + route, data, {
          ...requestConfig,
          'axios-retry': {
            onRetry: async (retryCount: number, error: AxiosError) => {
              this.logger.warn(`Retrying request attempt ${retryCount}`);
              if (error.response.status === 403) {
                await this.authenticate();

                error.config.headers['Authorization'] =
                  `Bearer ${this.authToken}`;
              }
            },
          },
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }),
      );
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async put<T>(
    route: string,
    data: any,
    requestConfig?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      return await firstValueFrom(
        this.httpService.put(environment.windolarBaseUrl + route, data, {
          ...requestConfig,
          'axios-retry': {
            onRetry: async (retryCount: number, error: AxiosError) => {
              this.logger.warn(`Retrying request attempt ${retryCount}`);
              if (error.response.status === 403) {
                await this.authenticate();

                error.config.headers['Authorization'] =
                  `Bearer ${this.authToken}`;
              }
            },
          },
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }),
      );
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async delete<T>(
    route: string,
    requestConfig?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      return await firstValueFrom(
        this.httpService.delete(environment.windolarBaseUrl + route, {
          ...requestConfig,
          'axios-retry': {
            onRetry: async (retryCount: number, error: AxiosError) => {
              this.logger.warn(`Retrying request attempt ${retryCount}`);
              if (error.response.status === 403) {
                await this.authenticate();

                error.config.headers['Authorization'] =
                  `Bearer ${this.authToken}`;
              }
            },
          },
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }),
      );
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }
}
