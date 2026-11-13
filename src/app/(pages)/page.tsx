import { Home } from "@/app/sections/home/home";

export default function HomePage() {
  return <Home referenceArt={process.env.REFERENCE_ART !== "false"} />;
}
