import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RelojComponent } from './components/reloj/reloj';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RelojComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'Reloj';
}
