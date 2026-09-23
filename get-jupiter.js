const fs = require('node:fs');

function loadEnv() {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    // Ignore if .env doesn't exist
  }
}

loadEnv();

const JUPITER_API_KEY = process.env.JUPITER_API_KEY;

if (!JUPITER_API_KEY) {
  console.warn("Warning: JUPITER_API_KEY is missing from environment variables, proceeding anyway...");
}

async function fetchTokenPrice() {
  try {
    console.log("1. Fetching Token Prices from Jupiter Price API...");
    // You can add any Solana token mint address here (xstock, stonkfun memestock, etc.)
    // SOL: So11111111111111111111111111111111111111112
    // BONK (memecoin): DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
    // USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
    const tokenMints = [
      "So11111111111111111111111111111111111111112",
      "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    ].join(',');
    
    // Jupiter's Price API Endpoint v3
    const priceUrl = `https://api.jup.ag/price/v3?ids=${tokenMints}`;
    
    const headers = {
      'Content-Type': 'application/json'
    };
    if (JUPITER_API_KEY) {
      headers['x-api-key'] = JUPITER_API_KEY;
    }

    const priceResponse = await fetch(priceUrl, {
      method: 'GET',
      headers
    });

    if (!priceResponse.ok) {
      throw new Error(`Price API returned status ${priceResponse.status}: ${await priceResponse.text()}`);
    }

    const priceData = await priceResponse.json();
    console.log("Prices retrieved successfully:");
    
    // Display prices
    // for (const [mint, info] of Object.entries(priceData)) {
    //    console.log(`\nToken Mint: ${mint}`);
    //    console.log(`Price (USD): $${info.usdPrice}`);
    //    console.log(`24h Change: ${info.priceChange24h}%`);
    // }
    
    // Print the whole output from the api call
    console.log(JSON.stringify(priceData, null, 2));

    console.log("\nJupiter API price test completed successfully!");

  } catch (error) {
    console.error("Error testing Jupiter Price API:", error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }
}

fetchTokenPrice();
