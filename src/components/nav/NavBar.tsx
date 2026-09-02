import { useRankings } from "../../context/RankingsContext";
import styles from "./NavBar.module.css";

// The real Pub Meeple nav also has Blog / Contact / Support / Top Nine -
// out of scope for this clone, so only the two functional sections ship.
export function NavBar() {
  const { viewState, navigate } = useRankings();

  const isLanding = viewState.view === "landing" || viewState.view === "item-builder";
  const isLibrary = viewState.view === "rankings-library";

  return (
    <header className={styles.bar}>
      <button className={styles.brand} onClick={() => navigate({ view: "landing" })}>
        🏆 Ranking Engine
      </button>
      <nav className={styles.links}>
        <button
          className={isLanding ? styles.activeLink : styles.link}
          onClick={() => navigate({ view: "landing" })}
        >
          Ranking Engine
        </button>
        <button
          className={isLibrary ? styles.activeLink : styles.link}
          onClick={() => navigate({ view: "rankings-library" })}
        >
          Rankings
        </button>
      </nav>
    </header>
  );
}
