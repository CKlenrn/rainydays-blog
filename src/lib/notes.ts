import { getCollection } from "astro:content";

export interface NoteSummary {
  title: string;
  description: string;
  href: string;
  date?: Date;
  tags: string[];
}

export async function getRecentNotes(limit = 3): Promise<NoteSummary[]> {
  const notes = (await getCollection("docs"))
    .map((entry) => {
      const id = entry.id.replaceAll("\\", "/").replace(/\.(md|mdx)$/, "");
      return {
        entry,
        id,
        date: entry.data.updated ?? entry.data.published,
      };
    })
    .filter(({ entry, id }) => {
      const finalSegment = id.split("/").at(-1);
      return id.startsWith("notes/") && finalSegment !== "index" && entry.data.draft !== true;
    })
    .sort((a, b) => {
      if (a.date && b.date) {
        const dateDifference = b.date.getTime() - a.date.getTime();
        if (dateDifference !== 0) return dateDifference;
      } else if (a.date) {
        return -1;
      } else if (b.date) {
        return 1;
      }

      return a.id.localeCompare(b.id, "en");
    })
    .slice(0, Math.max(0, limit));

  return notes.map(({ entry, id, date }) => ({
    title: entry.data.title,
    description: entry.data.description ?? "",
    href: `/${id}/`,
    date,
    tags: entry.data.tags,
  }));
}

