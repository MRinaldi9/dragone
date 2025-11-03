/* eslint-disable @angular-eslint/prefer-on-push-component-change-detection */
import { Component } from '@angular/core';
import { RouterOutlet, Routes } from '@angular/router';

@Component({
  template: `<h1>Home</h1>`,
})
class Home {}

@Component({
  imports: [RouterOutlet],
  template: `
    <h1>Category Page</h1>
    <router-outlet />
  `,
})
class Category {}

@Component({
  template: `<h1>Subcategory Page</h1>`,
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
