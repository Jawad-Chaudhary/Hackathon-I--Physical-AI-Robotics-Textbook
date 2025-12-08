import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Physical AI & Humanoid Textbook',
  tagline: 'Learn Physical AI, Robotics, and ROS 2',
  favicon: 'img/favicon.ico',
  customFields: {
    // // Production URLs - Railway deployments
    authUrl: 'https://hackathon-i-physical-ai-robotics-textbook-production.up.railway.app',
    apiUrl: 'https://clever-respect-production-5202.up.railway.app',
  //   authUrl: 'http://localhost:3001',
  //   apiUrl: 'http://localhost:8000'
  // },

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://hackathon-i-physical-ai-robotics-te.vercel.app/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Jawad-Chaudhary', // Usually your GitHub org/user name.
  projectName: 'Hackathon-I--Physical-AI-Robotics-Textbook', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/Jawad-Chaudhary/Hackathon-I--Physical-AI-Robotics-Textbook',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        language: ["en"],
      }),
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/favicon.ico',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Physical AI Textbook',
      logo: {
        alt: 'My Site Logo',
        src: 'img/favicon.ico',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Textbook',
        },
        {
          href: 'https://github.com/Jawad-Chaudhary/Hackathon-I--Physical-AI-Robotics-Textbook',
          label: 'GitHub',
          position: 'right',
        },
        {
          to: '/login',
          label: 'Login',
          position: 'right',
        },
        {
          to: '/signup',
          label: 'Sign Up',
          position: 'right',
          className: 'navbar-signup-btn',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Textbook',
              to: '/docs/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/in/muhammad-jawad-ullah-12a679257/',
            },
            {
              label: 'Discord',
              href: 'https://discord.com/users/1279016928282673164',
            },
            {
              label: 'Github',
              href: 'https://github.com/Jawad-Chaudhary',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI Textbook. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
