import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ScanCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
})

const docClient = DynamoDBDocumentClient.from(client)

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: 'WalmartProducts', // Update with your actual table name
    })

    const data = await docClient.send(command)
    const products = data.Items || []

    const mapped = products.map((item: any, index: number) => {
      let image = '/images/default.jpg'

      // ✅ Safe parsing of image_urls (which is a stringified array)
      try {
        const urls = JSON.parse(item.image_urls || '[]')
        if (Array.isArray(urls) && urls.length > 0) {
          image = urls[0]
        }
      } catch (err) {
        console.warn('Invalid image_urls JSON:', item.image_urls)
      }

      return {
        id: index + 1,
        name: item.product_name || 'Unnamed Product',
        price: parseFloat(item.final_price) || 0,
        discountedPrice: item.initial_price ? parseFloat(item.initial_price) : undefined,
        image,
        rating: item.rating || 4.0,
        description: item.description || 'No description available.',
        category: (
          item.categories?.[0] ||
          item.category ||
          'misc'
        ).toString().trim().toLowerCase(), // ✅ Normalize category
      }
    })

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('DynamoDB Fetch Error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
