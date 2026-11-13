import { Home } from "@/views/home";

export default function HomePage() {
  return <Home referenceArt={process.env.REFERENCE_ART !== "false"} />;
}
