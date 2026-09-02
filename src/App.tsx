import { RankingsProvider, useRankings } from "./context/RankingsContext";
import { NavBar } from "./components/nav/NavBar";
import { CategoryPicker } from "./components/landing/CategoryPicker";
import { ItemListBuilder } from "./components/itemBuilder/ItemListBuilder";
import { ComparisonScreen } from "./components/comparison/ComparisonScreen";
import { TierBoard } from "./components/tierBoard/TierBoard";
import { RankingsLibrary } from "./components/rankingsLibrary/RankingsLibrary";

function Screens() {
  const { viewState } = useRankings();

  switch (viewState.view) {
    case "landing":
      return <CategoryPicker />;
    case "rankings-library":
      return <RankingsLibrary />;
    case "item-builder":
      return <ItemListBuilder rankingId={viewState.rankingId} />;
    case "comparison":
      return <ComparisonScreen rankingId={viewState.rankingId} />;
    case "tier-board":
      return <TierBoard rankingId={viewState.rankingId} />;
  }
}

function App() {
  return (
    <RankingsProvider>
      <NavBar />
      <Screens />
    </RankingsProvider>
  );
}

export default App;
