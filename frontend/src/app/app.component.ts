import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, AfterContentInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterContentInit {
  title = 'frontend';

  videoUrl: string;
  videoElement: HTMLVideoElement;
  isLoading: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.videoUrl = 'http://localhost:3000/video'; // Replace with your server URL
  }

  ngAfterContentInit(): void {
    this.videoElement = document.getElementById('video-player') as HTMLVideoElement;
    this.videoElement.addEventListener('timeupdate', () => this.checkIfNextChunkRequired());
    this.loadVideo();

  }

  // ngAfterViewInit() {
  //   console.log("log");

  //   this.videoElement = document.getElementById('video-player') as HTMLVideoElement;
  //   this.videoElement.addEventListener('timeupdate', () => this.checkIfNextChunkRequired());
  //   this.loadVideo();
  // }

  loadVideo() {
    this.isLoading = true;

    this.http.get(this.videoUrl, {
      responseType: 'blob',
      headers: new HttpHeaders().set('range', `bytes=0-${1024 * 1024}`) // Adjust the chunk size as needed
    }).subscribe((response: any) => {
      this.isLoading = false;
      this.cdr.detectChanges();
      this.videoElement.src = URL.createObjectURL(response);
    }, (error) => {
      this.isLoading = false;
      this.cdr.detectChanges();
      console.error(error);
    });
  }

  checkIfNextChunkRequired() {
    const currentTime = this.videoElement.currentTime;
    const duration = this.videoElement.duration;

    // Request next chunk 5-10 seconds before the video ends
    if (duration - currentTime < 10 && duration - currentTime > 5) {
      this.requestNextChunk();
    }
  }

  requestNextChunk() {
    const startByte = this.videoElement.duration - 5;
    this.http.get(this.videoUrl, {
      responseType: 'blob',
      headers: new HttpHeaders().set('range', `bytes=${startByte}-`)
    }).subscribe((response: any) => {
      const previousSource = this.videoElement.src;
      this.videoElement.src = URL.createObjectURL(response);
      URL.revokeObjectURL(previousSource);
    }, (error) => {
      console.error(error);
    });
  }
}
