async function testNutritionUrls() {
  const urls = {
    "V1 world production": "https://world.openfoodfacts.org/cgi/search.pl?search_terms=milk&search_simple=1&action=process&json=1&page_size=3",
    "V2 world search by categories": "https://world.openfoodfacts.org/api/v2/search?categories_tags=milk&fields=code,product_name,nutriments&page_size=3",
    "V2 world search by name/text (q)": "https://world.openfoodfacts.org/api/v2/search?q=milk&fields=code,product_name,nutriments&page_size=3",
    "V2 world search by search_terms": "https://world.openfoodfacts.org/api/v2/search?search_terms=milk&fields=code,product_name,nutriments&page_size=3",
  };

  for (const [desc, url] of Object.entries(urls)) {
    try {
      console.log(`Fetching: ${desc}`);
      const res = await fetch(url, {
        headers: {
          "User-Agent": "StudentHealthApp - Android/iOS - Version 1.0 (contact@example.com)",
          "Accept": "application/json"
        }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`Products returned: ${data.products?.length || data.count || 0}`);
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
testNutritionUrls();
