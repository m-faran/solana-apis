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

const API_URL = process.env.TOKENS_API_BASE_URL || 'https://api.tokens.xyz/api/v2/lists/stocks';
const API_KEY = process.env.TOKENS_API_KEY;

if (!API_KEY) {
  console.error("Error: TOKENS_API_KEY is missing from environment variables.");
  process.exit(1);
}

async function fetchStocks() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const tokens = data.tokens || [];

    // --- xStocks filtering ---
    const xStocks = tokens.filter(token => {
      const name = token.name || "";
      const isOndo = name.toLowerCase().includes('ondo');
      const isBackpack = name.toLowerCase().includes('backpack');
      const isXStock = name.toLowerCase().includes('xstock');
    
      return !isOndo && !isBackpack && isXStock;
    });
    
    // Print mint, symbol, and name
    // console.log(`// Total xStocks found: ${xStocks.length}`);
    // console.log("Mint,Symbol,Name");
    // xStocks.forEach(stock => {
    //   // Replace commas in name/symbol to avoid breaking the CSV output
    //   const name = (stock.name || 'N/A').replace(/,/g, '');
    //   const symbol = (stock.symbol || 'N/A').replace(/,/g, '');
    //   console.log(`${stock.mint},${symbol},${name}`);
    // });

    // --- Pre/IPO/T-Stocks filtering ---
    const selectedStocks = tokens.filter(token => {
      const name = token.name || "";
      const isOndo = name.toLowerCase().includes('ondo');
      const isBackpack = name.toLowerCase().includes('backpack');
      const isXStock = name.toLowerCase().includes('xstock');
      const isSpaceX = name.toLowerCase().includes('spacex');
      
      const isPre = name.toLowerCase().includes('prestock');
      const isIpo = name.toLowerCase().includes('ipo') && !name.toLowerCase().includes('chipotle');
      const isT = name.toLowerCase().startsWith('t-') || name.toLowerCase().includes('tstock');
    
      return !isOndo && !isBackpack && !isXStock && !isSpaceX && (isPre || isIpo || isT);
    });
    
    console.log(`// Total Pre/IPO/T-Stocks found: ${selectedStocks.length}`);
    console.log("Mint,Symbol,Name");
    selectedStocks.forEach(stock => {
      const name = (stock.name || 'N/A').replace(/,/g, '');
      const symbol = (stock.symbol || 'N/A').replace(/,/g, '');
      console.log(`${stock.mint},${symbol},${name}`);
    });

    const targetSymbols = [
      'AAPLx', 'GOOGLx', 'MSFTx', 'AMZNx', 'NVDAx', 'TSLAx', 'METAx', 'NFLXx', 'ORCLx',
      'AMDx', 'KOx', 'MCDx', 'WMTx', 'COSTx', 'PEPx', 'LULUx', 'UBERx', 'EBAYx', 'Vx',
      'MAx', 'PYPLx', 'AXPx', 'JPMx', 'BACx', 'COINx', 'HOODx', 'INTCx', 'IBMx', 'CSCOx',
      'ADBEx', 'CRMx', 'PLTRx'
    ];

    const specificStocks = tokens.filter(token => targetSymbols.includes(token.symbol));

    // console.log("mint,note");
    // specificStocks.forEach(stock => {
    //   console.log(`${stock.mint},${stock.name}`);
    // });
    
    // Output the entire metadata for one single token
    // if (specificStocks.length > 0) {
    //   console.log(JSON.stringify(specificStocks[0], null, 2));
    // }

  } catch (error) {
    console.error("Error fetching stocks:", error);
  }
}

fetchStocks();
