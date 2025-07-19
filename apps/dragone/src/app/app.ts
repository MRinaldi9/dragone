import { Component } from '@angular/core';
import { InputText } from '@dragone/ui/input-text';
@Component({
  imports: [InputText],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'dragone';
}
