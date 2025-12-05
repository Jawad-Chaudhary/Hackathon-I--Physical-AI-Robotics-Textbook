import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/">
            Start Learning
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures() {
  return (
    <section className="features-section" style={{ padding: '4rem 0', backgroundColor: 'var(--ifm-color-emphasis-100)' }}>
      <div className="container">
        <div className="row">
          <div className="col col--4">
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <h3 style={{ color: 'var(--ifm-font-color-base)' }}>AI-Powered Learning</h3>
              <p style={{ color: 'var(--ifm-font-color-secondary)' }}>Personalized content that adapts to your background and learning style.</p>
            </div>
          </div>
          <div className="col col--4">
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <h3 style={{ color: 'var(--ifm-font-color-base)' }}>ROS 2 Fundamentals</h3>
              <p style={{ color: 'var(--ifm-font-color-secondary)' }}>Master Robot Operating System with hands-on examples and simulations.</p>
            </div>
          </div>
          <div className="col col--4">
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <h3 style={{ color: 'var(--ifm-font-color-base)' }}>Multi-Language Support</h3>
              <p style={{ color: 'var(--ifm-font-color-secondary)' }}>Read content in Urdu with preserved code blocks and LaTeX formulas.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome`}
      description="Learn Physical AI, Robotics, and ROS 2 with AI-powered personalization">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
