export interface SiteConfig {
  title: string;
  description: string;
  author: {
    name: string;
    bio: string;
    motto: string;
    avatar?: {
      src: string;
      alt: string;
    };
  };
  links: Array<{
    label: string;
    href: string;
    kind: "github" | "email" | "other";
  }>;
  topics: Array<{
    title: string;
    description: string;
    href: `/notes/${string}/`;
    directory: `notes/${string}`;
  }>;
  paths: {
    notes: "/notes/";
    about: "/about/";
  };
}

export const siteConfig: SiteConfig = {
  title: "Rainy Days",
  description: "记录学习方法、工具实践与阶段复盘的个人知识库。",
  author: {
    name: "你的名字",
    bio: "在这里整理真正学会的知识，也记录下一次行动。",
    motto: "持续输入，主动实践，定期复盘。",
    avatar: {
      src: "/images/avatar-placeholder.svg",
      alt: "个人头像占位图",
    },
  },
  links: [],
  topics: [
    {
      title: "学习方法",
      description: "把目标、练习和反馈连成可持续的学习循环。",
      href: "/notes/learning-methods/sustainable-review/",
      directory: "notes/learning-methods",
    },
    {
      title: "工具实践",
      description: "用简单工具降低记录和检索知识的成本。",
      href: "/notes/tools/markdown-workflow/",
      directory: "notes/tools",
    },
    {
      title: "阶段复盘",
      description: "从每周证据中识别进展、阻力与下一步。",
      href: "/notes/reflections/weekly-review/",
      directory: "notes/reflections",
    },
  ],
  paths: {
    notes: "/notes/",
    about: "/about/",
  },
};
