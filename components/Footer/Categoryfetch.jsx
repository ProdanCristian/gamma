import CategoryList from "./CategoryList";

const API_BASE_URL = "http://localhost:3000";

async function getCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 }, // This ensures fresh data
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const result = await response.json();
    console.log("Categories data:", result); // Debug log
    return result.data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function getSubcategories(categoryId) {
  if (!categoryId) return [];

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/subCategories?categoryId=${categoryId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch subcategories");
    }

    const result = await response.json();
    console.log("Subcategories data:", result); // Debug log
    return result.data || [];
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
}

async function CategoryFetch({ locale }) {
  // Fetch categories immediately
  const initialCategories = await getCategories();
  console.log("Initial categories:", initialCategories); // Debug log

  return (
    <CategoryList
      locale={locale}
      categories={initialCategories}
      getSubcategories={getSubcategories}
    />
  );
}

export default CategoryFetch;
