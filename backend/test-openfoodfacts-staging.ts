async function testStaging() {
  const urls = {
    "Staging v2 search": "https://world.openfoodfacts.net/api/v2/search?q=milk&fields=product_name,nutriments&page_size=3",
    "Production v2 search": "https://world.openfoodfacts.org/api/v2/search?q=milk&fields=product_name,nutriments&page_size=3"
  };

  for (const [desc, url] of Object.entries(urls)) {
    try {
      console.log(`Fetching ${desc}: ${url}`);
      const res = await fetch(url, {
        headers: {
          "User-Agent": "StudentHealthApp - Android/iOS - Version 1.0 (contact@example.com)",
          "Accept": "application/json"
        }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`Products returned: ${data.products?.length || 0}`);
        if (data.products && data.products.length > 0) {
          console.log("Sample product name:", data.products[0].product_name);
        }
      }
    } catch (err: any) {
      console.error(`Error for ${desc}:`, err.message);
    }
    console.log("----------------------------");
  }
}
testStaging();
