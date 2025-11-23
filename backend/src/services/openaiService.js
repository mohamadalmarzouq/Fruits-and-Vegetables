import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get upload directory (same as in upload.js middleware)
const getUploadDir = () => {
  return process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
};

/**
 * Analyze product image quality using OpenAI Vision API
 * @param {string} imagePath - Path to the image file (relative path like /uploads/filename.jpg)
 * @param {string} productName - Name of the product for context
 * @returns {Promise<Object>} Quality report with freshness, ripeness, defects, and color
 */
export const analyzeProductImage = async (imagePath, productName) => {
  try {
    // Extract filename from path (handles both /uploads/filename.jpg and filename.jpg)
    const filename = path.basename(imagePath);
    const uploadDir = getUploadDir();
    const fullImagePath = path.join(uploadDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(fullImagePath)) {
      throw new Error(`Image file not found: ${fullImagePath}`);
    }

    // Read image file and convert to base64
    const imageBuffer = fs.readFileSync(fullImagePath);
    const base64Image = imageBuffer.toString('base64');

    // Determine MIME type from file extension
    const ext = path.extname(fullImagePath).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this ${productName} image and provide a detailed quality assessment. Return a JSON object with the following structure:
{
  "freshness": {
    "score": 5,
    "maxScore": 5,
    "description": "Brief description of freshness"
  },
  "ripeness": "Description of ripeness level (e.g., 'Ripe, ready to eat', 'Underripe', 'Overripe')",
  "visibleDefects": "Description of any visible defects, blemishes, or issues (e.g., 'Minor bruising on a few pieces', 'No visible defects', 'Significant damage')",
  "color": "Description of color quality and consistency (e.g., 'Bright, consistent yellow', 'Vibrant green throughout')",
  "overallQuality": "Brief overall quality assessment"
}

Be specific and detailed in your analysis. If the image quality is poor or the product is not clearly visible, note that in the assessment.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    // Extract and parse the JSON response
    const content = response.choices[0].message.content;
    
    // Try to extract JSON from the response (in case it's wrapped in markdown code blocks)
    let jsonString = content;
    let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
    }
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }
    
    // Try to find JSON object in the content if not in code blocks
    if (!jsonMatch) {
      const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        jsonString = jsonObjectMatch[0];
      }
    }
    
    let qualityReport;
    try {
      qualityReport = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', jsonString);
      throw new Error('Failed to parse quality analysis response');
    }

    // Validate and structure the response
    return {
      freshness: {
        score: qualityReport.freshness?.score || 0,
        maxScore: qualityReport.freshness?.maxScore || 5,
        description: qualityReport.freshness?.description || 'Not assessed'
      },
      ripeness: qualityReport.ripeness || 'Not assessed',
      visibleDefects: qualityReport.visibleDefects || 'No defects noted',
      color: qualityReport.color || 'Not assessed',
      overallQuality: qualityReport.overallQuality || 'Not assessed',
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing product image:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};

