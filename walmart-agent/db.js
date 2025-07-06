import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, GetCommand, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import 'dotenv/config';

// The AWS SDK v3 automatically uses credentials from environment variables.
const client = new DynamoDBClient({
    region: process.env.AWS_REGION
});

const docClient = DynamoDBDocumentClient.from(client);
const productsTable = process.env.PRODUCTS_TABLE_NAME;
const chatHistoryTable = process.env.CHAT_HISTORY_TABLE_NAME;

/**
 * Finds products. Now correctly handles case-insensitivity and string-based numbers
 * by filtering AFTER the initial scan.
 */
export const findProducts = async ({ query, category = null, priceRange = null, limit = 10 }) => {
    // Initial scan is broad and case-sensitive. The real filtering happens in our code.
    const command = new ScanCommand({ TableName: productsTable });

    try {
        const result = await docClient.send(command);
        let items = result.Items || [];

        // Apply filters in the application layer where we can handle data types correctly
        if (query) {
            const lowerCaseQuery = query.toLowerCase();
            items = items.filter(item => 
                (item.product_name && item.product_name.toLowerCase().includes(lowerCaseQuery)) ||
                (item.brand && item.brand.toLowerCase().includes(lowerCaseQuery))
            );
        }

        if (category) {
            const lowerCaseCategory = category.toLowerCase();
            items = items.filter(item =>
                (item.category_name && item.category_name.toLowerCase().includes(lowerCaseCategory)) ||
                (item.root_category_name && item.root_category_name.toLowerCase().includes(lowerCaseCategory))
            );
        }

        if (priceRange) {
            items = items.filter(item => {
                const price = parseFloat(item.final_price);
                const minOk = priceRange.min !== undefined ? price >= priceRange.min : true;
                const maxOk = priceRange.max !== undefined ? price <= priceRange.max : true;
                return minOk && maxOk;
            });
        }

        // Return a useful subset of data for the AI.
        return items.slice(0, limit).map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            brand: item.brand,
            final_price: item.final_price,
            currency: item.currency,
            rating: item.rating,
            category_name: item.category_name,
        }));

    } catch (error) {
        console.error("DynamoDB Error in findProducts:", error);
        return { error: true, message: "Failed to search for products." };
    }
};

/**
 * Gets full product details.
 */
export const getProductDetails = async ({ product_id }) => {
    // The product_id in the database is a number, so we must parse it.
    const id = typeof product_id === 'string' ? parseInt(product_id, 10) : product_id;
    const command = new GetCommand({
        TableName: productsTable,
        Key: { "product_id": id }
    });

    try {
        const result = await docClient.send(command);
        if (result.Item) {
            const item = { ...result.Item };
            // Clean up for the AI
            delete item.image_urls;
            delete item.related_pages;
            delete item.breadcrumbs;
            return item;
        }
        return { error: true, message: `Product with ID ${product_id} not found.` };
    } catch (error) {
        console.error("DynamoDB Error in getProductDetails:", error);
        return { error: true, message: "Failed to get product details." };
    }
};

/**
 * Gets product reviews.
 */
export const getProductReviews = async ({ product_id }) => {
    const id = typeof product_id === 'string' ? parseInt(product_id, 10) : product_id;
    const command = new GetCommand({
        TableName: productsTable,
        Key: { "product_id": id },
        ProjectionExpression: "product_name, top_reviews, rating, review_count"
    });

    try {
        const result = await docClient.send(command);
        if (result.Item) {
            // The JSON in the CSV is double-escaped. We need to parse it twice.
            let reviews = result.Item.top_reviews;
            if (typeof reviews === 'string') {
                try {
                     reviews = JSON.parse(reviews);
                } catch(e) {
                    // It was just a plain string, leave it.
                }
            }
            return {
                product_name: result.Item.product_name,
                overall_rating: result.Item.rating,
                review_count: result.Item.review_count,
                reviews: reviews
            };
        }
        return { error: true, message: `Reviews not found for product ID ${product_id}.` };
    } catch (error) {
        console.error("DynamoDB Error in getProductReviews:", error);
        return { error: true, message: "Failed to fetch product reviews." };
    }
};

/**
 * Gets trending products by sorting on the numeric value of the `rating` string.
 */
export const getTrendingProducts = async ({ limit = 10 }) => {
    const command = new ScanCommand({
        TableName: productsTable,
        // Find items that actually have a rating and a decent number of reviews
        FilterExpression: "attribute_exists(rating) AND review_count > :minReviews",
        ExpressionAttributeValues: { ":minReviews": 20 }
    });

    try {
        const result = await docClient.send(command);
        const sortedProducts = result.Items
            ?.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)) // FIX: Parse rating string to number for correct sorting
            .slice(0, limit)
            .map(item => ({
                product_id: item.product_id,
                product_name: item.product_name,
                brand: item.brand,
                final_price: item.final_price,
                rating: item.rating,
                review_count: item.review_count,
                main_image: item.main_image
            })) || [];

        return sortedProducts;
    } catch (error) {
        console.error("DynamoDB Error in getTrendingProducts:", error);
        return { error: true, message: "Failed to get trending products." };
    }
};

// --- CHAT HISTORY FUNCTIONS (No changes needed) ---
export const getChatHistory = async (userId, limit = 20) => {
    const command = new QueryCommand({
        TableName: chatHistoryTable,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
        ScanIndexForward: false,
        Limit: limit
    });
    try {
        const result = await docClient.send(command);
        return result.Items?.reverse().map(item => ({
            role: item.role,
            parts: [{ text: item.content }]
        })) || [];
    } catch (error) {
        console.error("DynamoDB Error in getChatHistory:", error);
        return [];
    }
};

export const saveChatMessage = async (userId, role, content) => {
    const command = new PutCommand({
        TableName: chatHistoryTable,
        Item: {
            userId: userId,
            timestamp: new Date().toISOString(),
            role: role,
            content: content,
        }
    });
    await docClient.send(command);
};