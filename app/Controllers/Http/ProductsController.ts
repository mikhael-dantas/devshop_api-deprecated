/* eslint-disable max-len */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Product from 'App/Models/Product'

export default class ProductsController {
  public async index ({ request, response }: HttpContextContract) {
    try {
      const params = request.only(['id', 'name'])
      let { page, pagination } = request.only(['page', 'pagination'])
      if (!page) {
        page = 1
      }
      const productQuery = await Product.query()
        .where(params)
        .orderBy('price', 'desc')
        .paginate(page, pagination)

      return productQuery
    } catch (error) {
      response.status(error.status)
    }
  }

  public async store ({ response }: HttpContextContract) {
    const details = {
      'tamanho': 'm',
      'contém etiqueta': 'não',
      'tipo de pano': 'algodão ultra resistente à cortes',
      'contém bolso': 'sim',
      'botões': 'botões redondos de 1,6 centímetros de diâmetro',
      'estampa': 'não',
    }
    const productsToCreate = [
      {
        name: 'Camisa super legal e estilosa.',
        description: 'Essa camisa é muito legal e estilosa',
        price: 1039,
        stock_qty: 12,
        image_url: 'https://mecaluxbr.cdnwm.com/documents/20197/2221244/Soluciones+producto+hombre-Almac%C3%A9n+vertical+autom%C3%A1tico+Clasimat-es_ES.jpg/a6f98622-cae2-4d1f-b6e8-9def77eeb441?t=1484038527000&e=jpg',
        details: JSON.stringify(details),
      },
      {
        name: 'Camisa preta',
        description: 'Com essa camisa você sempre vai estar elegante em todas as situações em que usar',
        price: 1299,
        stock_qty: 15,
        image_url: 'https://i.pinimg.com/originals/5e/0b/95/5e0b957e549d9097104bb20856415cda.jpg',
        details: JSON.stringify(details),
      },
      {
        name: 'Camisa',
        description: 'O traje perfeito para ir à uma festa ou qualquer evento social em que você queira estar bem vestido e estiloso',
        price: 12239,
        stock_qty: 11,
        image_url: 'https://i.pinimg.com/originals/5e/0b/95/5e0b957e549d9097104bb20856415cda.jpg',
        details: JSON.stringify(details),
      },
      {
        name: 'Camisa A',
        description: 'Quantas vezes você olhou para o seu guarda-roupas e ficou indeciso sobre o que usar nas ocasiões importantes? Com essa roupa a dúvida não existirá mais, ela combina com qualquer situação, é a roupa coringa para usar quando quiser causar boa impressão',
        price: 2390,
        stock_qty: 12,
        image_url: 'https://i.pinimg.com/originals/5e/0b/95/5e0b957e549d9097104bb20856415cda.jpg',
        details: JSON.stringify(details),
      },
      {
        name: 'Camisa que tem muitos botões além de ser bonita',
        description: 'Preta',
        price: 1059,
        stock_qty: 26,
        image_url: 'https://i.pinimg.com/originals/5e/0b/95/5e0b957e549d9097104bb20856415cda.jpg',
        details: JSON.stringify(details),
      },
      {
        name: 'Camisa mega legal',
        description: 'Uma camisa simples e formal',
        price: 1455,
        stock_qty: 42,
        image_url: 'https://i.pinimg.com/originals/5e/0b/95/5e0b957e549d9097104bb20856415cda.jpg',
        details: JSON.stringify(details),
      },
      {
        name: 'Camisa polo formal com uma listra chamativa e ao mesmo tempo discreta com interior preto e botões',
        description: 'Polo preta/Branca',
        price: 2229,
        stock_qty: 52,
        image_url: 'https://i.pinimg.com/originals/5e/0b/95/5e0b957e549d9097104bb20856415cda.jpg',
        details: JSON.stringify(details),
      },
      {
        name: 'Camisa boa',
        description: '',
        price: 9999,
        stock_qty: 22,
        image_url: 'https://i.pinimg.com/originals/5e/0b/95/5e0b957e549d9097104bb20856415cda.jpg',
        details: JSON.stringify(details),
      },
    ]

    try {
      const products = await Product.createMany(productsToCreate)

      return products
    } catch (error) {
      return response.status(error.status)
    }
  }
}
