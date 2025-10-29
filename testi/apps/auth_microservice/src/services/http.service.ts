import axios from 'axios';

export class HttpService {
  async post<T = any>(url: string, data: any): Promise<T> {
    const response = await axios.post(url, data);
    return response.data;
  }
}