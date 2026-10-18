/**
 * Geometry of the conditions tree. Lines and chips share ONE coordinate
 * system (the viewBox): the SVG draws the lines, and each chip is placed at
 * x/w and y/h percent of the same box. The chips are sized in container
 * units (cqw), so the whole thing is a true scaled drawing at any width.
 *
 * Naming follows the map's data: "fruits" are the top chips (SYMPTOMS in
 * root-map.ts), "symptoms" are the middle chips (CONDITIONS there), and
 * "roots" are the bottom chips.
 */

export interface Pt {
  readonly x: number;
  readonly y: number;
}

/** A root chip and the curve that reaches its top-centre from the trunk base. */
export interface RootGeo extends Pt {
  readonly start: Pt;
  readonly c1: Pt;
  readonly c2: Pt;
}

export interface TreeGeo {
  readonly w: number;
  readonly h: number;
  /** Chip font size, height and side padding, in cqw (percent of the tree's width). */
  readonly fs: number;
  readonly ch: number;
  readonly pad: number;
  readonly canopy: { readonly cx: number; readonly cy: number; readonly rx: number; readonly ry: number; readonly bumps: number };
  readonly fruits: Readonly<Record<string, Pt>>;
  readonly symptoms: Readonly<Record<string, Pt>>;
  /** Where each symptom's branch leaves the trunk. */
  readonly attach: Readonly<Record<string, Pt>>;
  readonly roots: Readonly<Record<string, RootGeo>>;
  readonly trunkTop: Pt;
  readonly trunkHalfTop: number;
  readonly trunkHalfBase: number;
  readonly groundY: number;
  readonly groundX: readonly [number, number];
  readonly howLabel: Pt;
  readonly whyLabel: Pt;
}

export const DESKTOP_TREE: TreeGeo = {
  w: 1000,
  h: 760,
  fs: 1.5,
  ch: 3.8,
  pad: 1.9,
  canopy: { cx: 500, cy: 172, rx: 405, ry: 138, bumps: 12 },
  fruits: {
    immune: { x: 330, y: 80 },
    hormones: { x: 660, y: 90 },
    gut: { x: 200, y: 165 },
    skin: { x: 500, y: 150 },
    sugar: { x: 790, y: 170 },
    fertility: { x: 330, y: 245 },
    brain: { x: 640, y: 250 },
  },
  symptoms: {
    digestion: { x: 150, y: 400 },
    inflammation: { x: 330, y: 365 },
    bloodsugar: { x: 500, y: 430 },
    hormonal: { x: 670, y: 365 },
    nervous: { x: 865, y: 418 },
  },
  attach: {
    digestion: { x: 481, y: 538 },
    inflammation: { x: 481, y: 456 },
    bloodsugar: { x: 500, y: 470 },
    hormonal: { x: 519, y: 462 },
    nervous: { x: 520, y: 530 },
  },
  roots: {
    deficiency: { x: 190, y: 612, start: { x: 482, y: 560 }, c1: { x: 420, y: 582 }, c2: { x: 205, y: 562 } },
    stress: { x: 110, y: 715, start: { x: 490, y: 560 }, c1: { x: 440, y: 640 }, c2: { x: 260, y: 688 } },
    sleep: { x: 405, y: 690, start: { x: 498, y: 560 }, c1: { x: 498, y: 625 }, c2: { x: 405, y: 622 } },
    toxins: { x: 745, y: 738, start: { x: 512, y: 560 }, c1: { x: 513, y: 745 }, c2: { x: 745, y: 690 } },
    genetics: { x: 610, y: 632, start: { x: 518, y: 560 }, c1: { x: 518, y: 605 }, c2: { x: 575, y: 600 } },
    infections: { x: 890, y: 652, start: { x: 526, y: 560 }, c1: { x: 650, y: 566 }, c2: { x: 890, y: 555 } },
  },
  trunkTop: { x: 500, y: 320 },
  trunkHalfTop: 20,
  trunkHalfBase: 26,
  groundY: 560,
  groundX: [40, 960],
  howLabel: { x: 500, y: 505 },
  whyLabel: { x: 500, y: 585 },
};

export const MOBILE_TREE: TreeGeo = {
  w: 360,
  h: 1115,
  fs: 3.2,
  ch: 8.9,
  pad: 2.4,
  canopy: { cx: 180, cy: 172, rx: 160, ry: 148, bumps: 10 },
  fruits: {
    skin: { x: 120, y: 76 },
    gut: { x: 216, y: 76 },
    immune: { x: 230, y: 124 },
    sugar: { x: 108, y: 172 },
    brain: { x: 255, y: 172 },
    hormones: { x: 150, y: 220 },
    fertility: { x: 190, y: 268 },
  },
  symptoms: {
    digestion: { x: 265, y: 410 },
    inflammation: { x: 112, y: 460 },
    bloodsugar: { x: 258, y: 510 },
    hormonal: { x: 90, y: 560 },
    nervous: { x: 274, y: 610 },
  },
  attach: {
    digestion: { x: 187, y: 440 },
    inflammation: { x: 173, y: 490 },
    bloodsugar: { x: 187, y: 540 },
    hormonal: { x: 173, y: 590 },
    nervous: { x: 187, y: 640 },
  },
  roots: {
    deficiency: { x: 85, y: 805, start: { x: 172, y: 715 }, c1: { x: 172, y: 757 }, c2: { x: 100, y: 763 } },
    stress: { x: 95, y: 900, start: { x: 180, y: 715 }, c1: { x: 180, y: 880 }, c2: { x: 95, y: 862 } },
    sleep: { x: 100, y: 1000, start: { x: 186, y: 715 }, c1: { x: 186, y: 985 }, c2: { x: 100, y: 962 } },
    infections: { x: 260, y: 1055, start: { x: 192, y: 715 }, c1: { x: 190, y: 1065 }, c2: { x: 262, y: 1010 } },
    toxins: { x: 282, y: 935, start: { x: 198, y: 715 }, c1: { x: 198, y: 900 }, c2: { x: 282, y: 880 } },
    genetics: { x: 285, y: 845, start: { x: 204, y: 715 }, c1: { x: 204, y: 767 }, c2: { x: 282, y: 790 } },
  },
  trunkTop: { x: 180, y: 310 },
  trunkHalfTop: 8,
  trunkHalfBase: 17,
  groundY: 715,
  groundX: [14, 346],
  howLabel: { x: 180, y: 372 },
  whyLabel: { x: 180, y: 742 },
};

export interface TreePath {
  readonly key: string;
  readonly d: string;
}

export interface TwigPath extends TreePath {
  /** The fruit (top chip) this twig hangs from, and the symptom it leads to. */
  readonly fruit: string;
  readonly symptom: string;
}

export interface TreeArt {
  readonly canopy: string;
  readonly trunkLeft: string;
  readonly trunkRight: string;
  readonly trunk: string;
  readonly ground: string;
  readonly twigs: readonly TwigPath[];
  readonly branches: readonly TreePath[];
  readonly roots: readonly TreePath[];
}

const f = (n: number): string => String(Math.round(n * 10) / 10);

function cubic(a: Pt, c1: Pt, c2: Pt, b: Pt): string {
  return `M${f(a.x)},${f(a.y)} C${f(c1.x)},${f(c1.y)} ${f(c2.x)},${f(c2.y)} ${f(b.x)},${f(b.y)}`;
}

/** A soft cloud: a squared-off ellipse's worth of overlapping round bumps, as one closed outline. */
function cloud(c: TreeGeo['canopy']): string {
  const pts: Pt[] = [];
  for (let i = 0; i < c.bumps; i++) {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / c.bumps;
    const cs = Math.cos(a);
    const sn = Math.sin(a);
    // Squared-off (|cos|^0.5): boxier than an ellipse, so the cloud is wide at the top and bottom, where chips sit.
    pts.push({ x: c.cx + c.rx * Math.sign(cs) * Math.abs(cs) ** 0.5, y: c.cy + c.ry * Math.sign(sn) * Math.abs(sn) ** 0.5 });
  }
  let d = `M${f(pts[0].x)},${f(pts[0].y)}`;
  for (let i = 1; i <= c.bumps; i++) {
    const p = pts[i % c.bumps];
    const q = pts[i - 1];
    const r = Math.hypot(p.x - q.x, p.y - q.y) * 0.78;
    d += ` A${f(r)},${f(r)} 0 0 1 ${f(p.x)},${f(p.y)}`;
  }
  return `${d}Z`;
}

/** Every line of the tree, each drawn in the direction the traced path travels: fruit, symptom, trunk, root. */
export function buildTree(
  g: TreeGeo,
  links: {
    readonly fruitToSymptom: Readonly<Record<string, readonly string[]>>;
  },
): TreeArt {
  const half = (g.ch / 100) * g.w * 0.5;

  const twigs: TwigPath[] = [];
  for (const [fruit, symptoms] of Object.entries(links.fruitToSymptom)) {
    const a = g.fruits[fruit];
    for (const symptom of symptoms) {
      const b = g.symptoms[symptom];
      const start = { x: a.x, y: a.y + half };
      const end = { x: b.x, y: b.y - half };
      const mid = (start.y + end.y) / 2;
      twigs.push({
        key: `${fruit}>${symptom}`,
        fruit,
        symptom,
        d: cubic(start, { x: start.x, y: mid }, { x: end.x, y: mid }, end),
      });
    }
  }

  // Each branch leaves the trunk at its own height and curves up and out to the chip's bottom-centre.
  const branches: TreePath[] = Object.keys(g.symptoms).map((id) => {
    const s = g.symptoms[id];
    const a = g.attach[id];
    const start = { x: s.x, y: s.y + half };
    const dy = a.y - start.y;
    return {
      key: id,
      d: cubic(start, { x: start.x + (a.x - start.x) * 0.15, y: start.y + dy * 0.7 }, { x: a.x + (start.x - a.x) * 0.55, y: a.y }, a),
    };
  });

  const roots: TreePath[] = Object.entries(g.roots).map(([id, r]) => ({
    key: id,
    d: cubic(r.start, r.c1, r.c2, { x: r.x, y: r.y - half }),
  }));

  const top = g.trunkTop;
  const h = g.groundY - top.y;
  const narrow = g.trunkHalfTop;
  const wide = g.trunkHalfBase;
  const trunkSide = (sign: 1 | -1): string =>
    `M${f(top.x + sign * narrow)},${f(top.y)} C${f(top.x + sign * narrow)},${f(top.y + h * 0.5)} ${f(top.x + sign * wide)},${f(g.groundY - h * 0.3)} ${f(top.x + sign * wide)},${f(g.groundY - 14)} C${f(top.x + sign * wide)},${f(g.groundY - 5)} ${f(top.x + sign * (wide + 8))},${f(g.groundY - 1)} ${f(top.x + sign * (wide + 22))},${f(g.groundY)}`;

  return {
    canopy: cloud(g.canopy),
    trunkLeft: trunkSide(-1),
    trunkRight: trunkSide(1),
    trunk: cubic(top, { x: top.x, y: top.y + h * 0.4 }, { x: top.x, y: g.groundY - h * 0.3 }, { x: top.x, y: g.groundY }),
    ground: `M${g.groundX[0]},${g.groundY} L${g.groundX[1]},${g.groundY}`,
    twigs,
    branches,
    roots,
  };
}
