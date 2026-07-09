// ─── Service catalog configuration ──────────────────────────────────────────
// This is the single source of truth for every service KeebForge can sell.
// The order form and any future invoice/report screens should read from here
// rather than hard-coding service names/prices, so pricing changes happen
// in one place.

export type ServiceUnit = "per_switch" | "per_stabilizer" | "flat" | "quote";

export interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  /** Price in INR. `null` when unit === "quote". */
  price: number | null;
  unit: ServiceUnit;
  popular?: boolean;
  highlight?: boolean;
  combo?: boolean;
  /** IDs of services this combo replaces — those get auto-deselected + disabled. */
  replaces?: string[];
  /** IDs that cannot be selected at the same time as this one. */
  exclusiveWith?: string[];
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  services: ServiceDefinition[];
}

export interface ServiceCategoryGroup {
  id: string;
  name: string;
  subcategories: ServiceSubcategory[];
}

export const SERVICE_CATALOG: ServiceCategoryGroup[] = [
  {
    id: "keyboard",
    name: "Keyboard",
    subcategories: [
      {
        id: "switch-services",
        name: "Switch Services",
        services: [
          {
            id: "switch-lube-standard",
            name: "Switch Lubing — Standard",
            description:
              "Housing + stem lube on a factory spring. Quick turnaround, noticeably smoother.",
            price: 15,
            unit: "per_switch",
            popular: true,
            exclusiveWith: ["switch-lube-premium"],
          },
          {
            id: "switch-lube-premium",
            name: "Switch Lubing — Premium",
            description:
              "Full disassembly, spring + leaf lubed individually, bagged and shaken for even coverage.",
            price: 25,
            unit: "per_switch",
            highlight: true,
            exclusiveWith: ["switch-lube-standard"],
          },
          {
            id: "switch-filming",
            name: "Switch Filming",
            description: "Reduces stem wobble and deepens the sound signature.",
            price: 10,
            unit: "per_switch",
          },
          {
            id: "switch-spring-swap",
            name: "Spring Swap",
            description: "Swap to your choice of spring weight (springs supplied by customer or KeebForge).",
            price: 8,
            unit: "per_switch",
          },
          {
            id: "switch-lube-film-combo",
            name: "Lube + Film Combo",
            description:
              "Premium lube and filming done together — the full treatment for a single switch.",
            price: 30,
            unit: "per_switch",
            popular: true,
            combo: true,
            replaces: ["switch-lube-standard", "switch-lube-premium", "switch-filming"],
          },
        ],
      },
      {
        id: "stabilizer-services",
        name: "Stabilizer Services",
        services: [
          {
            id: "stab-clipping",
            name: "Stabilizer Clipping",
            description: "Removes rattle-prone legs for a cleaner sound.",
            price: 20,
            unit: "per_stabilizer",
          },
          {
            id: "stab-lubing",
            name: "Stabilizer Lubing",
            description: "Dielectric grease + lube on wire and housing contact points.",
            price: 25,
            unit: "per_stabilizer",
          },
          {
            id: "stab-bandaid",
            name: "Stabilizer Bandaid Mod",
            description: "Foam strips under the PCB to eliminate stem-tick.",
            price: 30,
            unit: "per_stabilizer",
          },
          {
            id: "stab-full-tuning",
            name: "Full Stabilizer Tuning",
            description:
              "Clipping, lubing, and the bandaid mod done as one package — our most requested stab job.",
            price: 60,
            unit: "per_stabilizer",
            popular: true,
            combo: true,
            replaces: ["stab-clipping", "stab-lubing", "stab-bandaid"],
          },
        ],
      },
      {
        id: "build-soldering",
        name: "Build & Soldering Services",
        services: [
          {
            id: "full-build",
            name: "Full Keyboard Build",
            description:
              "Soldering, switch/stabilizer install, foam, and final assembly from parts to finished board.",
            price: 1500,
            unit: "flat",
            highlight: true,
          },
          {
            id: "hotswap-assembly",
            name: "Hotswap Assembly (No Soldering)",
            description: "Switch and keycap install on a hotswap PCB.",
            price: 800,
            unit: "flat",
          },
          {
            id: "desoldering",
            name: "Desoldering Service",
            description: "Removes soldered switches without damaging the PCB.",
            price: 500,
            unit: "flat",
          },
          {
            id: "foam-mod",
            name: "Foam Mod Installation",
            description: "Case foam, plate foam, or tape mod for sound tuning.",
            price: 300,
            unit: "flat",
          },
          {
            id: "case-weight",
            name: "Case Weight Installation",
            description: "Fitting and securing a brass/steel case weight.",
            price: 200,
            unit: "flat",
          },
        ],
      },
      {
        id: "custom-pcb-design",
        name: "Custom PCB & Keyboard Design",
        services: [
          {
            id: "custom-pcb-design",
            name: "Custom PCB Design",
            description: "Layout design for a fully custom keyboard PCB, scoped to your requirements.",
            price: null,
            unit: "quote",
          },
          {
            id: "custom-case-design",
            name: "Custom Case Design",
            description: "CAD design for a custom keyboard case, milled or 3D printed.",
            price: null,
            unit: "quote",
          },
          {
            id: "qmk-via-config",
            name: "Firmware / QMK-VIA Configuration",
            description: "Keymap, layers, and lighting configured and flashed for you.",
            price: 500,
            unit: "flat",
          },
        ],
      },
    ],
  },
  {
    id: "mouse",
    name: "Mouse",
    subcategories: [
      {
        id: "mouse-switch-services",
        name: "Mouse Switch Services",
        services: [
          {
            id: "mouse-switch-standard",
            name: "Mouse Switch Replacement — Standard",
            description: "Replace worn mechanical switches with fresh standard switches.",
            price: 20,
            unit: "per_switch",
          },
          {
            id: "mouse-switch-optical",
            name: "Mouse Switch Replacement — Optical",
            description: "Upgrade to optical switches for a crisper, more durable click.",
            price: 30,
            unit: "per_switch",
            highlight: true,
          },
        ],
      },
      {
        id: "mouse-mods-repairs",
        name: "Mouse Mods & Repairs",
        services: [
          {
            id: "mouse-skate-replacement",
            name: "Mouse Skate Replacement",
            description: "Fresh PTFE skates for smoother glide.",
            price: 300,
            unit: "flat",
          },
          {
            id: "mouse-cable-replacement",
            name: "Mouse Cable Replacement (Paracord)",
            description: "Swap the stock cable for a flexible paracord cable.",
            price: 400,
            unit: "flat",
            popular: true,
          },
          {
            id: "mouse-shell-repair",
            name: "Mouse Shell Repair",
            description: "Repairs cracks or chips in the mouse shell.",
            price: 600,
            unit: "flat",
          },
          {
            id: "mouse-full-mod",
            name: "Mouse Full Mod",
            description: "Skates, cable, and grip tape done together as one package.",
            price: 1000,
            unit: "flat",
            combo: true,
            replaces: ["mouse-skate-replacement", "mouse-cable-replacement"],
          },
        ],
      },
    ],
  },
];

/** Flat lookup map, built once, for O(1) access by id. */
export const SERVICE_BY_ID: Record<string, ServiceDefinition> = SERVICE_CATALOG.reduce(
  (acc, group) => {
    for (const sub of group.subcategories) {
      for (const svc of sub.services) acc[svc.id] = svc;
    }
    return acc;
  },
  {} as Record<string, ServiceDefinition>
);

export function getServiceLineTotal(svc: ServiceDefinition, quantity: number): number | null {
  if (svc.unit === "quote" || svc.price === null) return null;
  if (svc.unit === "flat") return svc.price;
  return svc.price * Math.max(1, quantity);
}

export function unitLabel(unit: ServiceUnit): string {
  switch (unit) {
    case "per_switch":
      return "per switch";
    case "per_stabilizer":
      return "per stabilizer";
    case "flat":
      return "flat";
    case "quote":
      return "quote";
  }
}