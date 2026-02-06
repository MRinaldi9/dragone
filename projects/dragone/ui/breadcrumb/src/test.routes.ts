import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet, Routes } from '@angular/router';

@Component({
  template: `
    <h1>Home</h1>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Home {}

@Component({
  imports: [RouterOutlet],
  template: `
    <h1>Category Page</h1>
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Category {}

@Component({
  template: `
    <h1>Subcategory Page</h1>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Subcategory {}

export default [
  {
    path: '',
    component: Home,
  },
  {
    path: 'category',
    component: Category,
    children: [
      {
        path: 'subcategory',
        component: Subcategory,
      },
    ],
  },
] satisfies Routes;
