/**
 * Photography used on the public site.
 *
 * These are Unsplash photographs, free to use under the Unsplash licence, and are
 * placeholders for the operator's own photography. To swap one out, replace `src`
 * with your own image (a file in /public works too) and update `alt` and `credit`.
 */
export interface SitePhoto {
  src: string;
  alt: string;
  credit: string;
}

const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70&w=${width}`;

export const PHOTOS: Record<
  "vaultRoom" | "bullion" | "jewellery" | "documents" | "regalia",
  SitePhoto
> = {
  vaultRoom: {
    src: unsplash("photo-1565126111587-f9fb04a432e4", 1600),
    alt: "Rows of safe deposit box doors inside a vault",
    credit: "Unsplash"
  },
  bullion: {
    src: unsplash("photo-1718752773195-c19c1c329156", 1000),
    alt: "Stacked one-kilo gold bullion bars",
    credit: "Unsplash"
  },
  jewellery: {
    src: unsplash("photo-1680068098871-9275069a4003", 1000),
    alt: "A diamond necklace photographed against a black ground",
    credit: "Unsplash"
  },
  documents: {
    src: unsplash("photo-1776135854606-6b198f87e04a", 1000),
    alt: "Aged paper documents laid flat",
    credit: "Unsplash"
  },
  regalia: {
    src: unsplash("photo-1588163307392-ce5223f593d0", 1000),
    alt: "A diamond-set tiara on a dark ground",
    credit: "Unsplash"
  }
};
