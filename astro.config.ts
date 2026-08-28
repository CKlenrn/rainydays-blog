import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { siteConfig } from "./src/config/site";

export default defineConfig({
  site: "https://rainydays.cn",
  output: "static",
  integrations: [
    starlight({
      title: siteConfig.title,
      description: siteConfig.description,
      favicon: "/favicon.svg",
      locales: {
        root: {
          label: "简体中文",
          lang: "zh-CN",
        },
      },
      lastUpdated: false,
      pagefind: true,
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "知识库首页",
          link: siteConfig.paths.notes,
        },
        ...siteConfig.topics.map((topic) => ({
          label: topic.title,
          items: [{ autogenerate: { directory: topic.directory } }],
        })),
      ],
    }),
  ],
});
