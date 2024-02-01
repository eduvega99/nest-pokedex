import { Injectable } from '@nestjs/common';
import { HttpAdapter } from '../interfaces/http-adapter.interface';

@Injectable()
export class FetchAdapter implements HttpAdapter {
  async get<T>(url: string): Promise<T> {
    try {
      const resp = await fetch(url);
      const data: T = await resp.json();
      return data;
    } catch (error) {
      throw new Error('Error in request');
    }
  }
}
