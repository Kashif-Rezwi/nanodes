import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="not-found container">
      <span className="section-kicker">404</span>
      <h1>This frame is empty.</h1>
      <p>The page you&apos;re looking for isn&apos;t here.</p>
      <Link className="button button-primary" href="/">
        Back to Nanodes
      </Link>
    </main>
  );
}
