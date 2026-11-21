export const repository = "https://github.com/Kashif-Rezwi/nanodes";
export const docs = `${repository}#readme`;

// Original, filled silhouettes in the library's 24-unit sampling space.
export const shapes = [
  {
    id: "spark",
    name: "CREATE",
    color: "#a8c2ff",
    svg: "M12 1L15 9L23 12L15 15L12 23L9 15L1 12L9 9Z",
  },
  {
    id: "orbit",
    name: "EXPLORE",
    color: "#aacfee",
    svg: "M12 1A11 11 0 1 0 12 23A11 11 0 1 0 12 1ZM12 5A7 7 0 1 1 12 19A7 7 0 1 1 12 5Z",
  },
  {
    id: "blocks",
    name: "NANODES",
    color: "#c5baff",
    svg: "M2 2H10V10H2ZM14 2H22V10H14ZM2 14H10V22H2ZM14 14H22V22H14Z",
  },
] as const;

export const example = `import { prepareFrames, mountDisplay }
  from 'nanodes';
import 'nanodes/styles.css';

const frames = prepareFrames([
  { label: 'Hello', nodes: [{ type: 'text', text: 'HELLO' }] },
  { label: 'World', nodes: [{ type: 'text', text: 'WORLD' }] },
]);

const display = mountDisplay(
  document.querySelector('#display'),
  frames,
  { variant: 'text', transition: 'shimmer' }
);

// When your component unmounts:
// display.destroy();`;

export const setupCommands = `npm install nanodes`;
