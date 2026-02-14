import * as fs from "fs";
import * as https from "https";
import * as path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Product {
  produto: string;
  imagem: string;
  nome: string;
  tamanhosDisponiveis: string[];
  tipo: string;
  preco: string;
  loja: string;
  link: string;
  descricao: string;
  parteDoCorpo: "upper" | "lower" | "overall" | "inner" | "outer";
  genero: "masculino" | "feminino" | "unisex";
}

// Helper function to download and optimize images
export async function downloadImage(
  url: string,
  filepath: string,
  maxWidth: number = 800,
  quality: number = 80,
): Promise<void> {
  console.log(`    [Download] Starting download...`);
  console.log(`    [Download] URL: ${url}`);
  console.log(`    [Download] Target: ${filepath}`);

  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        console.log(`    [Download] Response status: ${response.statusCode}`);

        if (response.statusCode === 200) {
          const chunks: Buffer[] = [];
          let downloadedBytes = 0;

          response.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
            downloadedBytes += chunk.length;
          });

          response.on("end", async () => {
            try {
              const buffer = Buffer.concat(chunks);
              console.log(`    [Download] Downloaded ${downloadedBytes} bytes`);

              // Optimize image with sharp (keeps aspect ratio)
              const optimized = await sharp(buffer)
                .resize(maxWidth, undefined, {
                  withoutEnlargement: true, // Don't upscale small images
                  fit: "inside", // Maintain aspect ratio
                })
                .jpeg({ quality, progressive: true })
                .toBuffer();

              fs.writeFileSync(filepath, optimized);
              console.log(
                `    [Download] ✓ Optimized! ${downloadedBytes} → ${optimized.length} bytes (${Math.round((optimized.length / downloadedBytes) * 100)}%)`,
              );
              resolve();
            } catch (err) {
              console.error(`    [Download] ✗ Optimization error:`, err);
              reject(err);
            }
          });

          response.on("error", (err) => {
            console.error(`    [Download] ✗ Response error:`, err);
            reject(err);
          });
        } else {
          const errorMsg = `Failed to download image: ${response.statusCode}`;
          console.error(`    [Download] ✗ ${errorMsg}`);
          reject(new Error(errorMsg));
        }
      })
      .on("error", (err) => {
        console.error(`    [Download] ✗ HTTPS error:`, err);
        reject(err);
      });
  });
}

// Helper function to determine body part from product name
export function determineBodyPart(
  name: string,
  description: string,
): "upper" | "lower" | "overall" | "inner" | "outer" {
  const combined = (name + " " + description).toLowerCase();

  // Upper body items
  if (combined.match(/sweatshirt|blusão|blusao|camisa|polo|casaco|jacket/i)) {
    return "upper";
  }

  // Lower body items
  if (combined.match(/jeans|calça|calca|sandália|sandalia|bota|sapato/i)) {
    return "lower";
  }

  // Default to upper for shirts/tops
  return "upper";
}

// Helper function to determine clothing type
export function determineType(name: string): string {
  const nameLower = name.toLowerCase();

  if (nameLower.includes("sweatshirt")) return "Sweatshirt";
  if (nameLower.includes("blusão") || nameLower.includes("blusao"))
    return "Blusão";
  if (nameLower.includes("camisa")) return "Camisa";
  if (nameLower.includes("polo")) return "Polo";
  if (nameLower.includes("jeans")) return "Jeans";
  if (nameLower.includes("sandália") || nameLower.includes("sandalia"))
    return "Sandália";
  if (nameLower.includes("bota")) return "Bota";

  return "Roupa";
}

export async function scrapeZaraProducts(
  htmlContent: string,
  downloadImages: boolean = true,
  gender: "masculino" | "feminino" | "unisex" = "masculino",
  imageDir?: string,
): Promise<Product[]> {
  const products: Product[] = [];
  const outputDir =
    imageDir || path.join(__dirname, "..", "..", "uploads", "products");

  // Create images directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Parsing HTML for ${gender} products...`);
  console.log(`Images will be saved to: ${outputDir}`);
  console.log(`HTML content length: ${htmlContent.length} characters`);

  // First, find all product entries with their images and links
  const productBlockPattern =
    /<li[^>]+class="[^"]*product-grid-product[^"]*"[^>]+data-productid="(\d+)"[^>]*>([\s\S]*?)<\/li>/g;

  console.log(`\n=== PHASE 1: Extracting product blocks ===`);

  let blockMatch;
  const productDataMap = new Map<
    string,
    { imageUrl: string; alt: string; link: string }
  >();

  let blockCount = 0;
  while ((blockMatch = productBlockPattern.exec(htmlContent)) !== null) {
    blockCount++;
    const dataProductId = blockMatch[1];
    const blockContent = blockMatch[2];

    console.log(`\n[Block ${blockCount}] Data-productid: ${dataProductId}`);
    console.log(`  Block content length: ${blockContent.length} chars`);

    // Extract product link to get the actual product code
    const linkMatch = /<a[^>]+href="([^"]+)"/.exec(blockContent);
    const link = linkMatch ? linkMatch[1] : "";

    // Extract product code from URL (e.g., p01437414.html -> 01437414)
    const urlProductCodeMatch = /p(\d+)\.html/.exec(link);
    const productCode = urlProductCodeMatch
      ? urlProductCodeMatch[1]
      : dataProductId;

    console.log(`  Link: ${link}`);
    console.log(`  Product code from URL: ${productCode}`);

    // Extract image URL - try multiple patterns
    let imageUrl = "";
    let altText = "";

    // Pattern 1: src before alt
    let imgMatch = /<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i.exec(
      blockContent,
    );

    if (imgMatch) {
      imageUrl = imgMatch[1];
      altText = imgMatch[2] || "";
    } else {
      // Pattern 2: alt before src
      imgMatch = /<img[^>]+alt="([^"]*)"[^>]*src="([^"]+)"[^>]*>/i.exec(
        blockContent,
      );
      if (imgMatch) {
        imageUrl = imgMatch[2];
        altText = imgMatch[1] || "";
      } else {
        // Pattern 3: just get src, ignore alt
        imgMatch = /<img[^>]+src="([^"]+)"[^>]*>/i.exec(blockContent);
        if (imgMatch) {
          imageUrl = imgMatch[1];
          altText = "";
        }
      }
    }

    console.log(`  Image regex matched: ${!!imageUrl}`);

    if (imageUrl) {
      imageUrl = imageUrl.replace(/&amp;/g, "&");

      console.log(`  Image URL: ${imageUrl}`);
      console.log(`  Alt: ${altText}`);

      if (!imageUrl.includes("transparent-background")) {
        productDataMap.set(productCode, {
          imageUrl,
          alt: altText,
          link,
        });
        console.log(`  ✓ Stored with key: ${productCode}`);
      } else {
        console.log(`  ✗ Skipped (transparent placeholder)`);
      }
    } else {
      console.log(`  ✗ No image found in block`);
    }
  }

  console.log(`\n=== PHASE 1 COMPLETE ===`);
  console.log(`Total blocks found: ${blockCount}`);
  console.log(`Products with images: ${productDataMap.size}`);

  console.log(`\n=== PHASE 2: Extracting product details ===`);

  const productInfoPattern =
    /<div class="product-grid-product-info">[\s\S]*?href="([^"]+)"[^>]*>[\s\S]*?<h3>([^<]+)<\/h3>[\s\S]*?<span class="money-amount__main">([^<]+)<\/span>[\s\S]*?<\/div><\/div><\/li>/g;

  let match;
  let productCount = 0;
  let matchCount = 0;

  while ((match = productInfoPattern.exec(htmlContent)) !== null) {
    matchCount++;
    try {
      const productUrl = match[1];
      const productName = match[2].trim();
      const price = match[3].trim();

      console.log(`\n[Info ${matchCount}] ${productName} - ${price}`);
      console.log(`  URL: ${productUrl}`);

      // Filter for upper body items only
      const nameLower = productName.toLowerCase();
      const isUpperBody = nameLower.match(
        /sweatshirt|blusão|blusao|camisa|polo|casaco|jacket|colete|t-shirt|camisola/i,
      );

      if (!isUpperBody) {
        console.log(`  ✗ Skipped (not upper body)`);
        continue;
      }

      console.log(`  ✓ Is upper body item`);
      productCount++;

      // Extract product ID from URL
      let productId = `zara_${Date.now()}_${productCount}`;
      const productCodeMatch = productUrl.match(/p(\d+)\.html/);
      if (productCodeMatch) {
        productId = productCodeMatch[1];
        console.log(`  Product ID extracted: ${productId}`);
      } else {
        console.log(`  ⚠ Could not extract product ID, using: ${productId}`);
      }

      const productData = productDataMap.get(productId);
      console.log(`  Looking up product data for ID: ${productId}`);
      console.log(`  Product data found: ${!!productData}`);

      let imageUrl = "";
      let localImagePath = "";
      let productLink = productUrl;

      if (productData) {
        imageUrl = productData.imageUrl;
        productLink = productData.link || productUrl;
        console.log(`  ✓ Found image URL: ${imageUrl}`);
        console.log(`  ✓ Product link: ${productLink}`);

        if (downloadImages && imageUrl) {
          const imageFilename = `zara_${productId}_${gender}.jpg`;
          localImagePath = path.join(outputDir, imageFilename);

          console.log(`  Attempting to download...`);
          console.log(`  Target file: ${localImagePath}`);

          try {
            await downloadImage(imageUrl, localImagePath);
            console.log(`  ✓ Downloaded successfully: ${imageFilename}`);
          } catch (error) {
            console.error(`  ✗ Download failed:`, error);
          }
        }
      } else {
        console.log(`  ✗ No product data found in map for ID: ${productId}`);
      }

      // Only add products that have images downloaded
      if (!localImagePath) {
        console.log(`  ✗ Skipped (no image downloaded): ${productName}`);
        continue;
      }

      const product: Product = {
        produto: productId,
        imagem: `/uploads/products/${path.basename(localImagePath)}`,
        nome: productName,
        tamanhosDisponiveis: ["XS", "S", "M", "L", "XL"],
        tipo: determineType(productName),
        preco: price,
        loja: "Zara",
        link: productLink,
        descricao: productData?.alt || productName,
        parteDoCorpo: determineBodyPart(productName, productName),
        genero: gender,
      };

      products.push(product);
      console.log(`  ✓ Added: ${productName} (${gender})`);
    } catch (error) {
      console.error(`Error processing product:`, error);
    }
  }

  console.log(`\n=== PHASE 2 COMPLETE ===`);
  console.log(`Total product info blocks matched: ${matchCount}`);
  console.log(`Upper body products found: ${productCount}`);
  console.log(`Products added to result: ${products.length}`);
  console.log(`\n=== SCRAPING COMPLETE ===`);

  return products;
}

// Clear the products uploads directory
export function clearProductsUploads(imageDir?: string): void {
  const dir =
    imageDir || path.join(__dirname, "..", "..", "uploads", "products");

  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    }
    console.log(`Cleared ${files.length} files from ${dir}`);
  } else {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}
