import { mentorleveltype } from "../types";

export function getLevelColor(level: mentorleveltype) {
  switch (level) {
    case "beginner guide":
      return "bg-zinc-700 ";
    case "uplifter":
      return "bg-blue-900";
    case "pathfinder":
      return "bg-green-900";
    case "illuminator":
      return "bg-purple-900";
    case "trailblazer":
      return "bg-cyan-900";
    case "master of art":
      return "bg-indigo-900";
    case "grandmaster":
      return "bg-red-900";
    default:
      return "text-gray-500"; // Fallback color
  }
}
