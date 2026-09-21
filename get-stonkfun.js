const API_URL_TOP = 'https://www.stonkfun.xyz/api/public/v1/tokens?sort=marketcap';
const API_URL_NEWEST = 'https://www.stonkfun.xyz/api/public/v1/tokens?sort=newest';

async function fetchStonkfunTokens() {
  try {
    // Fetch Top tokens
    const topResponse = await fetch(API_URL_TOP);
    if (!topResponse.ok) {
      throw new Error(`Top API returned status ${topResponse.status}`);
    }
    const topData = await topResponse.json();
    const topTokens = (topData.data?.tokens || []).slice(0, 1); //1 token

    // Fetch Newest tokens
    const newestResponse = await fetch(API_URL_NEWEST);
    if (!newestResponse.ok) {
      throw new Error(`Newest API returned status ${newestResponse.status}`);
    }
    const newestData = await newestResponse.json();
    const newestTokens = (newestData.data?.tokens || []).slice(0, 1); //1 token

    // Combine and deduplicate by mint
    const combinedTokens = [...topTokens, ...newestTokens];
    const uniqueTokens = [];
    const seenMints = new Set();

    for (const token of combinedTokens) {
      if (!seenMints.has(token.mint)) {
        seenMints.add(token.mint);
        uniqueTokens.push(token);
      }
    }

    // console.log("mint,note");
    // uniqueTokens.forEach(token => {
    //   // note will be the token name.
    //   // Replace any commas in the name to not break the CSV format
    //   const note = (token.name || "").replace(/,/g, '');
    //   console.log(`${token.mint},${note}`);
    // });

    // Output all the metadata for the tokens
    console.log(JSON.stringify(uniqueTokens, null, 2));

  } catch (error) {
    console.error("Error fetching Stonkfun tokens:", error);
  }
}

fetchStonkfunTokens();
