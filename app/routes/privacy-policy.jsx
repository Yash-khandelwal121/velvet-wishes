import { Link } from "react-router";
import privacyStyles from "../styles/privacy-policy.css?url";

export const links = () => [
  { rel: "stylesheet", href: privacyStyles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" }
];

export const meta = () => {
  return [
    { title: "Privacy Policy | Velvet Wishes - Gift Notes & Wrapping" },
    { name: "description", content: "Privacy Policy for Velvet Wishes. Learn how we collect, use, and protect your personal information and Shopify store data." },
  ];
};

export default function PrivacyPolicy() {
  return (
    <div className="privacy-page-container">
      {/* Hero Section */}
      <section className="privacy-hero">
        <div className="hero-content">
          <h1 className="hero-title">Privacy Policy</h1>
          <p className="hero-subtitle">
            Your privacy matters to us. Velvet Wishes is committed to protecting your personal information and providing a safe, transparent experience for Shopify merchants.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="privacy-content">
        
        <div className="glass-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <h2 className="card-title">1. Information We Collect</h2>
          </div>
          <div className="card-body">
            <p>We collect information to provide better services to our users. This includes:</p>
            <ul>
              <li><strong>Store Information:</strong> Shop domain, email address, and store settings provided by Shopify upon installation.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our application, such as features used and time spent on the app.</li>
              <li><strong>Gift Note Data:</strong> Gift messages, sender/recipient names, and preferences submitted by your customers via the storefront extension.</li>
            </ul>
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            </div>
            <h2 className="card-title">2. How We Use Information</h2>
          </div>
          <div className="card-body">
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li>To provide, maintain, and improve our services and features.</li>
              <li>To attach gift notes to orders directly within your Shopify admin.</li>
              <li>To communicate with you regarding updates, support, and billing.</li>
              <li>To ensure the security and stability of our application.</li>
            </ul>
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h2 className="card-title">3. Shopify Store Data</h2>
          </div>
          <div className="card-body">
            <p>Velvet Wishes operates as a Shopify app and interacts directly with your store. We request specific access scopes including:</p>
            <ul>
              <li><strong>write_products:</strong> To configure default gift wrapping settings on your store products.</li>
              <li><strong>write_metaobjects & write_metaobject_definitions:</strong> To save gift note templates and preferences directly to your store's metafields, ensuring fast storefront rendering.</li>
            </ul>
            <p>We do not access or modify data outside of these explicitly approved scopes.</p>
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 className="card-title">4. Data Security</h2>
          </div>
          <div className="card-body">
            <p>We implement industry-standard security measures to protect your data from unauthorized access, alteration, disclosure, or destruction. This includes encryption of sensitive data, secure API communication with Shopify, and regular security audits.</p>
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h2 className="card-title">5. Third-Party Services</h2>
          </div>
          <div className="card-body">
            <p>We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, or assist us in analyzing how our service is used. These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 12.5v.01"/><path d="M12 16v.01"/><path d="M11 12.5v.01"/></svg>
            </div>
            <h2 className="card-title">6. Cookies</h2>
          </div>
          <div className="card-body">
            <p>We use cookies and similar tracking technologies to track the activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h2 className="card-title">7. Data Retention</h2>
          </div>
          <div className="card-body">
            <p>We will retain your Personal Information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies. When you uninstall our app, we receive an uninstalled webhook from Shopify and proceed to delete your session data.</p>
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2 className="card-title">8. Your Rights</h2>
          </div>
          <div className="card-body">
            <p>As a merchant or a customer of a merchant using Velvet Wishes, you have the right to request access to, correction of, or deletion of your personal data. We comply fully with Shopify's GDPR webhooks (Customers Data Request, Customers Redact, Shop Redact) to automatically process these requests within 48 hours.</p>
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
            </div>
            <h2 className="card-title">9. Changes to this Privacy Policy</h2>
          </div>
          <div className="card-body">
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes.</p>
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <h2 className="card-title">10. Contact Information</h2>
          </div>
          <div className="card-body">
            <p>If you have any questions about this Privacy Policy, please contact us.</p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="contact-section">
          <a href="mailto:nonex278@gmail.com" className="contact-card">
            <div className="contact-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div>
              <div className="contact-text">Email us anytime</div>
              <div className="contact-email">nonex278@gmail.com</div>
            </div>
          </a>
        </div>

      </main>

      {/* Footer */}
      <footer className="privacy-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">V</div>
            <div className="footer-copyright">
              © 2026 Velvet Wishes – Gift Notes & Wrapping. All Rights Reserved.
            </div>
          </div>
          <div className="footer-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <a href="mailto:nonex278@gmail.com">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
