"use client";

import { useState } from "react";
import { HighlightGrid, type HighlightArticle } from "@/components/highlight-grid";

type FeaturedReadsToggleProps = {
  newestArticles: HighlightArticle[];
  mostReviewedArticles: HighlightArticle[];
};

type DisplayMode = "most-reviewed" | "newest";

export function FeaturedReadsToggle({
  newestArticles,
  mostReviewedArticles
}: FeaturedReadsToggleProps) {
  const [mode, setMode] = useState<DisplayMode>("most-reviewed");

  const descriptions: Record<DisplayMode, string> = {
    "most-reviewed": "Articles that triggered the strongest discussion and most reviews.",
    newest: "Fresh publications and recent updates from AI Help Center."
  };

  const articles = mode === "most-reviewed" ? mostReviewedArticles : newestArticles;

  return (
    <div className="featured-reads-section">
      <div className="toggle-row">
        <button
          type="button"
          className={`toggle-chip ${mode === "most-reviewed" ? "toggle-chip-active" : ""}`}
          onClick={() => setMode("most-reviewed")}
        >
          Most Reviewed
        </button>
        <button
          type="button"
          className={`toggle-chip ${mode === "newest" ? "toggle-chip-active" : ""}`}
          onClick={() => setMode("newest")}
        >
          Newest
        </button>
      </div>
      <HighlightGrid
        title="Featured Reads"
        description={descriptions[mode]}
        articles={articles}
      />
    </div>
  );
}
