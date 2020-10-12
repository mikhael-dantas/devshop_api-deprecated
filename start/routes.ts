/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes/index.ts` as follows
|
| import './cart'
| import './customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.post('/sessions', 'SessionsController.store')
Route.delete('/sessions', 'SessionsController.delete')

Route.get('/users', 'UsersController.index').middleware('auth')
Route.post('/users', 'UsersController.store')

Route.get('/products', 'ProductsController.index')
Route.post('/products', 'ProductsController.store').middleware('auth')
Route.put('/products/:id', 'ProductsController.update').middleware('auth')
Route.delete('/products/:id', 'ProductsController.delete').middleware('auth')

Route.get('/serviceorders', 'ServiceOrdersController.index').middleware('auth')
Route.post('/serviceorders', 'ServiceOrdersController.store').middleware('auth')

