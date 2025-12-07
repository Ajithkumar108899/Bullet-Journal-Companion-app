import { Injectable } from '@angular/core';
import { delay, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConversionEngineService {
  
  getConvertedReport() {
    const dummyData = {
      taskpaper: "- Project A\n\t- Task 1\n\t- Task 2",
      markdown: "## Project A\n- Task 1\n- Task 2",
      fileUrl: "https://dummyserver.com/download/report.txt"
    };

    return of(dummyData).pipe(delay(1000)); // simulating API call
  }
}
