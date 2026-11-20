import { Brand } from "@/components/brand";
import { Mark } from "@/components/brand-mark";
import { GlyphDisplay } from "@/components/glyph-display";
import { Playground } from "@/components/playground";
import { CodeBlock } from "@/components/code-block";
import { docs, example, repository, setupCommands } from "@/lib/content";

function ArrowRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <header className="site-header" id="top">
        <div className="container navigation">
          <Brand />
          <nav aria-label="Main navigation">
            <a href="#playground">Playground</a>
            <a href="#how-it-works">How it works</a>
            <a href={repository}>GitHub</a>
          </nav>
          <a
            className="button button-small button-outline nav-docs"
            href={docs}
          >
            Documentation <ArrowRight />
          </a>
        </div>
      </header>
      <main id="main">
        <div className="intro-screen">
          <section className="hero container" aria-labelledby="hero-title">
            <div className="hero-copy">
              <span className="eyebrow">
                <Mark className="hero-brand-mark" size={18} />
                GLYPH ANIMATION FOR THE WEB
              </span>
              <h1 id="hero-title">
                Small glyphs.
                <br />
                <span>Big personality.</span>
              </h1>
              <p className="hero-description">
                Turn text and SVG paths into glowing glyphs. Animate between
                them with a few lines of JavaScript.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#playground">
                  Try the playground <ArrowRight />
                </a>
                <a className="text-link" href={docs}>
                  Read the docs <ArrowRight />
                </a>
              </div>
            </div>
            <div className="hero-specimen">
              <GlyphDisplay hero autoplay />
            </div>
          </section>
          <section
            className="feature-strip container"
            aria-label="Library essentials"
          >
            <dl>
              <dt>Zero dependencies</dt>
              <dd>Just native browser APIs.</dd>
            </dl>
            <dl>
              <dt>Any framework</dt>
              <dd>Plain JavaScript. TypeScript included.</dd>
            </dl>
            <dl>
              <dt>Text + SVG</dt>
              <dd>Separate nodes. One shared grid.</dd>
            </dl>
          </section>
        </div>
        <section
          className="section container"
          id="playground"
          aria-labelledby="playground-title"
        >
          <Playground />
        </section>
        <section
          className="section container how-section"
          id="how-it-works"
          aria-labelledby="how-title"
        >
          <div className="section-heading">
            <div>
              <span className="section-kicker">HOW IT WORKS</span>
              <h2 id="how-title">From content to motion.</h2>
            </div>
            <a className="text-link" href={`${repository}#prepare-content`}>
              Explore the API <ArrowRight />
            </a>
          </div>
          <div className="how-layout">
            <ol className="how-steps">
              <li>
                <span className="step-number" aria-hidden="true">
                  01
                </span>
                <div>
                  <h3>Prepare your frames</h3>
                  <p>
                    Use text, filled SVG paths, or both. Nanodes converts your
                    content into glyphs.
                  </p>
                </div>
              </li>
              <li>
                <span className="step-number" aria-hidden="true">
                  02
                </span>
                <div>
                  <h3>Mount your display</h3>
                  <p>
                    Pass the frames to a host element. Set the color, size, and
                    glow to suit your site.
                  </p>
                </div>
              </li>
              <li>
                <span className="step-number" aria-hidden="true">
                  03
                </span>
                <div>
                  <h3>Make it move</h3>
                  <p>
                    Cycle automatically or advance on click. Reduced motion is
                    respected automatically.
                  </p>
                </div>
              </li>
            </ol>
            <div className="example-block">
              <CodeBlock
                title="hello.js"
                code={example}
                language="javascript"
                label="JavaScript usage example"
              />
              <p className="example-note">
                Add <code>{'<div id="display"></div>'}</code> to your page and
                include <code>dist/styles.css</code>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="closing-screen" id="get-started">
        <section
          className="get-started container"
          aria-labelledby="start-title"
        >
          <div className="get-started-copy">
            <span className="section-kicker">GET STARTED</span>
            <h2 id="start-title">
              Bring glyphs
              <br />
              to your site.
            </h2>
            <p>
              Build the library from source, then follow the API docs to create
              your first display.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href={docs}>
                Read the docs <ArrowRight />
              </a>
              <a className="text-link" href={repository}>
                View source <ArrowRight />
              </a>
            </div>
          </div>
          <div className="setup-block">
            <CodeBlock
              title="Build from source"
              code={setupCommands}
              language="shell"
              label="Setup commands"
            />
            <p className="example-note">Requires Node.js and npm.</p>
          </div>
        </section>
        <div className="site-footer container">
          <Brand />
          <p className="creator">
            Built by <a href="https://github.com/Kashif-Rezwi">Kashif Rezwi</a>
          </p>
          <nav className="footer-links" aria-label="Footer navigation">
            <a href={docs}>Docs</a>
            <a href={repository}>GitHub</a>
            <a href={`${repository}/blob/main/LICENSE`}>MIT License</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
