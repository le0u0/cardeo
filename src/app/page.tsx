import { HomeIntro } from "@/app/_home/intro/intro";
import { CharacterCollections } from "@/app/_home/character-collections/character-collections";
import { FeaturedPicks } from "@/app/_home/featured-picks/featured-picks";

export default function HomePage() {
  const referenceArt = process.env.REFERENCE_ART !== "false";
  return (
    <>
      <HomeIntro referenceArt={referenceArt} />
      <CharacterCollections />
      <FeaturedPicks referenceArt={referenceArt} />
    </>
  );
}
