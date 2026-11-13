import { Hero } from "@/app/_home/hero";
import { CharacterCollections } from "@/app/_home/character-collections";
import { FeaturedPicks } from "@/app/_home/featured-picks";

export default function HomePage() {
  const referenceArt = process.env.REFERENCE_ART !== "false";
  return (
    <>
      <Hero referenceArt={referenceArt} />
      <CharacterCollections />
      <FeaturedPicks referenceArt={referenceArt} />
    </>
  );
}
