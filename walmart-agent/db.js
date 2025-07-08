import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  QueryCommand,
  GetCommand,
  PutCommand
} from "@aws-sdk/lib-dynamodb";
import 'dotenv/config';

// The SDK automatically finds credentials from your environment.
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE_NAME;
const CHAT_TABLE = process.env.CHAT_HISTORY_TABLE_NAME;

/**
 * Searches products by optional query, category, and price range.
 * This function is optimized to filter directly in DynamoDB where possible.
 * @returns {Promise<Array|Object>} A list of products or an error object.
 */
export const findProducts = async ({ query, category = null, priceRange = null, limit = 10 }) => {
  let filterExpressions = [];
  let expressionAttributeValues = {};

  // Case-insensitive text search is best done in the app layer after a broader scan.
  // We'll perform other filters first to reduce the items to be searched.
  if (category) {
    filterExpressions.push("(category_name = :category OR root_category_name = :category)");
    expressionAttributeValues[":category"] = category;
  }

  if (priceRange?.min !== undefined) {
    filterExpressions.push("final_price >= :minPrice");
    expressionAttributeValues[":minPrice"] = priceRange.min;
  }

  if (priceRange?.max !== undefined) {
    filterExpressions.push("final_price <= :maxPrice");
    expressionAttributeValues[":maxPrice"] = priceRange.max;
  }
  
  const command = new ScanCommand({
      TableName: PRODUCTS_TABLE,
      FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(" AND ") : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
  });

  try {
    const result = await docClient.send(command);
    let items = result.Items || [];

    // Apply the case-insensitive text query filter after the initial scan
    // FIXED: Now also searches in category_name and root_category_name
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      items = items.filter(item =>
        item.product_name?.toLowerCase().includes(lowerCaseQuery) ||
        item.brand?.toLowerCase().includes(lowerCaseQuery) ||
        item.category_name?.toLowerCase().includes(lowerCaseQuery) ||
        item.root_category_name?.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    // Return a clean subset of data
    return items.slice(0, limit).map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      brand: item.brand,
      final_price: item.final_price,
      rating: item.rating,
      category_name: item.category_name,
    }));
  } catch (error) {
    console.error("DynamoDB Error in findProducts:", error);
    return { error: true, message: "Failed to search for products." };
  }
};

/**
 * Fetches full product details by its unique product_id.
 * @returns {Promise<Object>} The full product item or throws an error.
 */
export const getProductDetails = async ({ product_id }) => {
  const command = new GetCommand({
    TableName: PRODUCTS_TABLE,
    Key: { product_id: product_id }
  });

  try {
    const { Item } = await docClient.send(command);
    if (!Item) {
      throw new Error(`Product ID ${product_id} not found.`);
    }
    return Item;
  } catch (error) {
    console.error("DynamoDB Error in getProductDetails:", error);
    return { error: true, message: "Failed to get product details." };
  }
};

/**
 * Retrieves reviews and ratings for a given product_id.
 * @returns {Promise<Object>} A structured review object or throws an error.
 */
export const getProductReviews = async ({ product_id }) => {
  const command = new GetCommand({
    TableName: PRODUCTS_TABLE,
    Key: { product_id: product_id },
    ProjectionExpression: "product_name, rating, review_count, top_reviews"
  });

  try {
    const { Item } = await docClient.send(command);
    if (!Item) {
      throw new Error(`No reviews for product ID ${product_id}.`);
    }
    // The JSON is clean now, no parsing needed.
    return {
      product_name: Item.product_name,
      overall_rating: Item.rating,
      review_count: Item.review_count,
      reviews: Item.top_reviews
    };
  } catch (error) {
    console.error("DynamoDB Error in getProductReviews:", error);
    return { error: true, message: "Failed to fetch product reviews." };
  }
};

/**
 * Returns top-rated trending products based on rating and review count.
 * @returns {Promise<Array|Object>} A list of trending products or an error object.
 */
export const getTrendingProducts = async ({ limit = 10 }) => {
  const command = new ScanCommand({
    TableName: PRODUCTS_TABLE,
    FilterExpression: "rating > :minRating AND review_count > :minReviews",
    ExpressionAttributeValues: {
      ":minRating": 4.5, // Only consider highly-rated products
      ":minReviews": 500  // Only consider products with a good number of reviews
    }
  });

  try {
    const { Items = [] } = await docClient.send(command);
    // Sort in the application layer after scanning
    const trending = Items
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
    return trending;
  } catch (error) {
    console.error("DynamoDB Error in getTrendingProducts:", error);
    return { error: true, message: "Failed to get trending products." };
  }
};

/**
 * **OPTIMIZED** - Browses products by exact category match using a GSI.
 * @returns {Promise<Array|Object>} A list of products in the category or an error object.
 */
export const getProductsByCategory = async ({ category, limit = 20 }) => {
  const command = new QueryCommand({
    TableName: PRODUCTS_TABLE,
    IndexName: "category-index", // Use the GSI you created
    KeyConditionExpression: "category_name = :c",
    ExpressionAttributeValues: { ":c": category },
    Limit: limit
  });
  
  try {
    const { Items = [] } = await docClient.send(command);
    return Items;
  } catch (err) {
    console.error("DynamoDB Error in getProductsByCategory:", err);
    return { error: true, message: "Failed to get products by category." };
  }
};


// --- CHAT HISTORY FUNCTIONS ---
// Your functions were perfect, no changes needed here.

/**
 * Fetches the last 20 messages for a user to provide conversation context.
 */
export const getChatHistory = async (userId, limit = 20) => {
  const command = new QueryCommand({
    TableName: CHAT_TABLE,
    KeyConditionExpression: "userId = :u",
    ExpressionAttributeValues: { ":u": userId },
    ScanIndexForward: false, // Important: gets the most recent messages first
    Limit: limit
  });
  try {
    const { Items = [] } = await docClient.send(command);
    // Reverse the results to put them in chronological order for the AI model
    return Items.reverse().map(i => ({ role: i.role, parts: [{ text: i.content }] }));
  } catch (err) {
    console.error("DynamoDB Error in getChatHistory:", err);
    return []; // Return empty array on error to not break the conversation
  }
};

/**
 * Saves a message from the user or the AI model to the database.
 */
export const saveChatMessage = async (userId, role, content) => {
  const command = new PutCommand({
    TableName: CHAT_TABLE,
    Item: {
      userId,
      timestamp: new Date().toISOString(),
      role,
      content
    }
  });
  try {
    await docClient.send(command);
  } catch (error) {
    console.error("DynamoDB Error in saveChatMessage:", error);
  }
};