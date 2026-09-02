import type { CategoryId } from "../../types";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  icon: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "beverages", label: "Beverages", icon: "🥤" },
  { id: "board-games", label: "Board Games", icon: "🎲" },
  { id: "books", label: "Books", icon: "📚" },
  { id: "brews", label: "Brews", icon: "🍺" },
  { id: "characters", label: "Characters", icon: "🦸" },
  { id: "comics", label: "Comics", icon: "💥" },
  { id: "food", label: "Food", icon: "🍔" },
  { id: "movies", label: "Movies", icon: "🎬" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "people", label: "People", icon: "🧑" },
  { id: "places", label: "Places", icon: "🗺️" },
  { id: "sports", label: "Sports", icon: "🏆" },
  { id: "toys", label: "Toys", icon: "🧸" },
  { id: "tv-shows", label: "TV Shows", icon: "📺" },
  { id: "video-games", label: "Video Games", icon: "🎮" },
  { id: "other", label: "Other", icon: "✨" },
];
