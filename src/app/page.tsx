import { Home } from "@/app/components/layout/home";

export default function HomePage() {
  return <Home referenceArt={process.env.REFERENCE_ART !== "false"} />;
}
