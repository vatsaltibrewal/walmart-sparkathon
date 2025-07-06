import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ScanCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

// Initialize DynamoDB
const client = new DynamoDBClient({ region: process.env.AWS_REGION })
const docClient = DynamoDBDocumentClient.from(client)

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: 'WalmartProducts',
      Limit: 50 // adjust as needed
    })

    const data = await docClient.send(command)
    const products = data.Items || []

    // Map raw DynamoDB data to your expected Product shape
    const mapped = products.map((item: any, index: number) => ({
      id: index + 1,
      name: item.product_name || 'Unnamed Product',
      price: parseFloat(item.final_price) || 0,
      discountedPrice: item.initial_price ? parseFloat(item.initial_price) : undefined,
      image: item.main_image || item.image_urls?.[0] || '/images/default.jpg',
      rating: item.rating || 4.0,
      description: item.description || 'No description available.',
      category: item.categories?.[0] || 'Misc'
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('DynamoDB Fetch Error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
