import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable()
export class ApiService {
  constructor(private httpService: HttpService) {}

  private fetchApiData<T>(
    endpoint: string,
    params: URLSearchParams,
  ): Observable<AxiosResponse<{ response: T }>> {
    return this.httpService.get(
      `${process.env.FOOTBALL_API_URL}/${endpoint}/?${params.toString()}`,
      {
        headers: {
          'x-rapidapi-key': process.env.API_KEY,
        },
      },
    );
  }

  public async getApiResponse<T>(endpoint: string, params: URLSearchParams) {
    const { data } = await firstValueFrom(
      this.fetchApiData<T[]>(endpoint, params),
    );

    if (data?.response?.length) return data.response;

    throw new NotFoundException();
  }
}
