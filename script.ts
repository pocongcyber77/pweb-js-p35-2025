/// <reference path="./types.d.ts" />


export async function fetchUsers(): Promise<User[]> {

  const res = await fetch("https://dummyjson.com/users");
  if (!res.ok) throw new Error(`Users request failed: ${res.status}`);
  const data = (await res.json()) as ApiUsersResponse;
  return Array.isArray(data.users) ? data.users : [];
}

export async function fetchRecipes(): Promise<Recipe[]> {

  const res = await fetch("https://dummyjson.com/recipes");
  if (!res.ok) throw new Error(`Recipes request failed: ${res.status}`);
  const data = (await res.json()) as ApiRecipesResponse;
  return Array.isArray(data.recipes) ? data.recipes : [];
}

export function validateLogin(users: User[], username: string, password: string): User | null {

  if (!password) return null;
  const user = users.find(u => String(u.username).toLowerCase() === username.toLowerCase());
  return user ?? null;
}

export async function fetchUserByUsername(username: string): Promise<User | null> {

  const users = await fetchUsers();
  const u = users.find(x => String(x.username).toLowerCase() === username.toLowerCase());
  return u ?? null;
}

export function filterRecipes(
  recipes: Recipe[],
  query: string,
  cuisine: string,
  favorites: Set<number>
): Recipe[] {

  const q = (query || "").trim().toLowerCase();
  const byCuisine = (r: Recipe) => (cuisine ? r.cuisine === cuisine : true);
  const byFav = (r: Recipe) => (favorites.size ? favorites.has(r.id) : true);
  const byQuery = (r: Recipe) => {
    if (!q) return true;
    const hay = [r.name, r.cuisine, ...(r.ingredients || []), ...(r.tags || [])]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  };
  return recipes.filter(r => byCuisine(r) && byFav(r) && byQuery(r));
}

export function isUser(v: unknown): v is User {

  const u = v as User;
  return !!u && typeof u === "object" && typeof u.id === "number" && typeof u.username === "string" && typeof u.firstName === "string";
}

export function isRecipe(v: unknown): v is Recipe {
 
  const r = v as Recipe;
  return !!r && typeof r === "object" && typeof r.id === "number" && typeof r.name === "string";
}


