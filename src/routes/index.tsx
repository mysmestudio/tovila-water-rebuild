import { createFileRoute } from "@tanstack/react-router";

// The Tovila site is plain static HTML/CSS/JS in /public (index.html and siblings).
// This route only forwards "/" to the static home page; it contains no app logic.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tovila Water Solutions | Water Treatment & Engineering in Accra, Ghana" },
      {
        name: "description",
        content:
          "Water treatment, purification and water engineering for homes, businesses, industry and institutions in Ghana. Request a free water assessment.",
      },
      {
        property: "og:title",
        content: "Tovila Water Solutions | Water Treatment & Engineering in Ghana",
      },
      {
        property: "og:description",
        content:
          "Complete water treatment, purification and water engineering solutions designed around your water source, application and budget.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <script
        dangerouslySetInnerHTML={{
          __html: 'window.location.replace("/index.html");',
        }}
      />
      <noscript>
        <a href="/index.html">Continue to Tovila Water Solutions</a>
      </noscript>
    </div>
  );
}
