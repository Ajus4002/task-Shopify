var axios = require('axios');
var db = require('../db')

let product_count = null;

async function listProduct(req, res) {
    const order = req.query['order']
    const page_info = req.query['page_info'];

    if (!page_info) {
        product_count = null
    }

    const params = page_info ? {
        limit: 10,
        page_info
    } : {
        ...req.query,
        limit: 10,
        order: order || 'title asc',
        published_status: "published",
        status: "active"
    }

    const response = await axios.get('https://vajro-interview.myshopify.com/admin/api/2022-04/products.json', {
        headers: {
            'X-Shopify-Access-Token': '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'
        },
        params
    })

    const products = response.data.products
    const shop_info = await db.get().collection('shop_info').findOne({}, { projection: { "_id": 0, "name": 1, "domain": 1 } })

    if (!product_count) {
        const response = await axios.get('https://vajro-interview.myshopify.com/admin/api/2022-04/products/count.json', {
            headers: {
                'X-Shopify-Access-Token': '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'
            },
            params
        })

        product_count = response.data.count
    }

    const links = response.headers['link'].split(',').map(v => v.split(';'))
    let next_link = links.find(v => v[1] === ' rel="next"')
    let prev_link = links.find(v => v[1] === ' rel="previous"')

    if (next_link) {
        next_link = (new URLSearchParams(next_link[0].replace('<', '').replace('>', ''))).get('page_info');
        res.header('next-page-id', next_link)
    }
    
    if (prev_link) {
        prev_link = (new URLSearchParams(prev_link[0].replace('<', '').replace('>', ''))).get('page_info');
        res.header('prev-page-id', prev_link)
    }

    res.json({ products, shop_info, product_count });
}

async function getShopInfo(req, res) {
    let data = await db.get().collection('shop_info').findOne()
    if (!data) {
        const response = await axios.get('https://vajro-interview.myshopify.com/admin/api/2022-04/shop.json', {
            headers: {
                'X-Shopify-Access-Token': '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'
            }
        })

        await db.get().collection('shop_info').insertOne(response.data.shop)
        data = response.data.shop
    }

    res.json(data)
}


module.exports = { listProduct, getShopInfo }