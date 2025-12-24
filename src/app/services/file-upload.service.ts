import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendResponse } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {
    private apiUrl = '/api/v1/files/upload'; // Endpoint standard supposé

    constructor(private http: HttpClient) { }

    upload(file: File): Observable<string> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<BackendResponse<{ fileUrl: string }>>(this.apiUrl, formData)
            .pipe(map(response => response.data.fileUrl));
    }
}
