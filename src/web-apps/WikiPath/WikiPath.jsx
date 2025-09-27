import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import "./WikiPath.css";

const WikiPath = () => {
  const [startPage, setStartPage] = useState(null);
  const [endPage, setEndPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [clicks, setClicks] = useState(0);

  async function fetchRandomPage() {
    const res = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
    return res.json();
  }

  async function fetchPageHtml(title) {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`
    );
    return res.text();
  }

  async function startNewGame() {
    const page1 = await fetchRandomPage();
    const page2 = await fetchRandomPage();

    setStartPage(page1);
    setEndPage(page2);

    setCurrentPage(page1.title);
    setClicks(0);

    const html = await fetchPageHtml(page1.title);
    const sanitizedHtml = sanitizeWikiHtml(html);
    setHtmlContent(sanitizedHtml);
  }

  async function navigateToPage(title) {
    setClicks((c) => c + 1);
    setCurrentPage(title);

    const html = await fetchPageHtml(title);
    const sanitizedHtml = sanitizeWikiHtml(html);
    setHtmlContent(sanitizedHtml);

    const normalizeTitle = (t) => t.replace(/_/g, " ").trim();

    if (normalizeTitle(title) === normalizeTitle(endPage?.title)) {
        console.log("Page Found!!")
      alert("🎉 You reached the goal page!");
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
    <div className="page-container">
        <h1>Wiki Path</h1>
        <div className="start-options">
            <button className="start-button" onClick={startNewGame}>
                New Game
            </button>

            <div>
                <p>
                    <strong>Start:</strong> {startPage?.title || ""}
                </p>
                <p>
                    <strong>Goal:</strong> {endPage?.title || ""}
                </p>
                <p>Clicks: {clicks}</p>
            </div>
        </div>

      {htmlContent && (
        <div
          onClick={handleContentClick}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }}
          style={{
            textAlign: "left",
            margin: "1rem auto",
            padding: "1rem",
            maxWidth: "900px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "white",
            height: "70vh",
            overflowY: "scroll",
          }}
        />
      )}
    </div>
  );
};

export default WikiPath;