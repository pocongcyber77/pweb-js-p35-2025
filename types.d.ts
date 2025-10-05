// Global type declarations for DummyJSON Users and Recipes
// File ini memaparkan bentuk data dari API agar konsisten di seluruh proyek.

interface ApiUsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName?: string;
  email?: string;
  image?: string;
  // Not returned by API; included for validation shape
  password?: string;
}

interface ApiRecipesResponse {
  recipes: Recipe[];
  total: number;
  skip: number;
  limit: number;
}

type Difficulty = "Easy" | "Medium" | "Hard" | string;

interface Recipe {
  id: number;
  name: string;
  image: string;
  cuisine: string;
  difficulty: Difficulty;
  cookTimeMinutes: number;
  rating: number; // 0..5
  ingredients: string[];
  instructions?: string[];
  tags?: string[];
  caloriesPerServing?: number;
  [extra: string]: unknown;
}

// Utility predicates
declare function isUser(v: unknown): v is User;
declare function isRecipe(v: unknown): v is Recipe;


