import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import "./WikiPath.css";

const WikiPath = () => {
  const [startPage, setStartPage] = useState(null);
  const [endPage, setEndPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [clicks, setClicks] = useState(0);
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const [showGoalCard, setShowGoalCard] = useState(false);
  const [settings, setSettings] = useState({
    excludeDisambiguation: true,
    excludeLists: true,
    minExtractLength: 150,
    showHoverExtract: true,
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function fetchRandomPage() {
    const res = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
    return res.json();
  }

  async function fetchFilteredRandomPage(settings = {}) {
    let page;
    let attempts = 0;

    do {
      page = await fetchRandomPage();
      attempts++;
      // Filter Rules
      if (settings.excludeDisambiguation && page.type === "disambiguation") {
        continue;
      }

      if (settings.excludeLists && page.title.startsWith("List of")) {
        continue;
      }

      if (settings.minExtractLength && page.extract.length < settings.minExtractLength) {
        continue;
      }

      // Passed filters
      console.log(`Found page after ${attempts} attempts`);
      return page;
    } while (attempts < 15); // safety stop

    console.warn(`Failed to find a valid page after ${attempts} attempts`);
    return page;
  }

  async function fetchPageHtml(title) {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`
    );
    return res.text();
  }

  async function startNewGame() {
    const page1 = await fetchFilteredRandomPage(settings);
    const page2 = await fetchFilteredRandomPage(settings);

    setStartPage(page1);
    setEndPage(page2);

    setCurrentPage(page1.title);
    setClicks(0);

    const html = await fetchPageHtml(page1.title);
    const sanitizedHtml = sanitizeWikiHtml(html);
    setHtmlContent(sanitizedHtml);

    // Reset/Start Game Timer
    setTime(0);
    setTimerRunning(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
  }

  async function navigateToPage(title) {
    setClicks((c) => c + 1);
    setCurrentPage(title);

    const html = await fetchPageHtml(title);
    const sanitizedHtml = sanitizeWikiHtml(html);
    setHtmlContent(sanitizedHtml);

    const normalizeTitle = (t) => t.replace(/_/g, " ").trim();

    if (normalizeTitle(title) === normalizeTitle(endPage?.title)) {
      // TODO:: Add Popup
      setTimerRunning(false);
      clearInterval(timerRef.current);
      alert(`🎉 You reached the goal page in ${clicks + 1} clicks and ${time} seconds!`);
    }
  }

function handleContentClick(e) {
  e.preventDefault();
  console.log(e);
  const link = e.target.closest("a[data-wiki-title]");
  if (!link) return;

  e.preventDefault();
  const newTitle = link.getAttribute("data-wiki-title");
  navigateToPage(newTitle);
}

  
function sanitizeWikiHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Rewrite all internal wiki links
  doc.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href");
    const rel = a.getAttribute("rel");

    if (rel && rel.endsWith("WikiLink")) {
      a.setAttribute("data-wiki-title", decodeURIComponent(href.replace("./", "")));
    }
  });

  return doc.body.innerHTML;
}

  return (
    <div className="wiki-path-container">
        <div className="title">Wiki Path</div>
        <div className="game-panels">
          <div className="game-panel">
              <label>
                Page Min Abstract Length:{" "}
                <input
                  type="number"
                  value={settings.minExtractLength}
                  onChange={(e) =>
                    setSettings({ ...settings, minExtractLength: Number(e.target.value) })
                  }
                  style={{ width: "4rem" }}
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.showHoverCards}
                  onChange={(e) =>
                    setSettings({ ...settings, showHoverCards: e.target.checked })
                  }
                />
                Show Goal Abstract on Click/Hover
              </label>
          </div>
          <div className="game-panel">
            <button className="start-button" onClick={startNewGame}>
                New Game
            </button>

            <p>
              <strong>Start:</strong> {startPage?.title || ""}
            </p>

            <p
              className="hover-target"
              onClick={() => setShowGoalCard((prev) => !prev)}
            >
              <strong>Goal:</strong> {endPage?.title || ""}
              {settings.showHoverCards && endPage && (
                <span
                  className={`hover-card ${showGoalCard ? "visible" : ""}`}
                >
                  {endPage.extract}
                </span>
              )}
            </p>
            <p>
                <strong>Clicks:</strong> {clicks}
            </p>
            <p>
              <strong>Time:</strong> {time}s
            </p>
          </div>
        </div>

      {htmlContent && (
        <div
          className="embedded-wiki"
          onClick={handleContentClick}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }}
        />
      )}
    </div>
  );
};

export default WikiPath;