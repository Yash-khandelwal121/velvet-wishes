import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import { useState } from "react";
import loginStyles from "../../styles/login.css?url";

export const links = () => [{ rel: "stylesheet", href: loginStyles }];

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();
  const [shop, setShop] = useState("");

  return (
    <div className="login-container">
      {/* Left Column */}
      <div className="login-left">
        <div className="login-logo">
          <h1>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12v10H4V12"/>
              <path d="M2 7h20v5H2z"/>
              <path d="M12 22V7"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
            Velvet Wishes
          </h1>
          <p>✦ GIFT NOTES & WRAPPING ✦</p>
        </div>

        <div className="login-hero-text">
          <h2>Make Every Order<br/>a Memorable<br/><span>Gift Experience</span> ✨</h2>
          <p>Create beautiful gift notes and wrapping experiences that your customers will love.</p>
        </div>

        <div className="login-features">
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="8" width="18" height="12" rx="2" />
                <path d="M12 8v12" />
                <path d="M16 8V6a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
              </svg>
            </div>
            <div className="feature-text">
              <h4>Premium Gift Notes</h4>
              <p>Beautiful, customizable gift message templates</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div className="feature-text">
              <h4>Stunning Wrapping</h4>
              <p>Elegant wrapping themes for every occasion</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10" />
                <path d="M12 20V4" />
                <path d="M6 20v-6" />
              </svg>
            </div>
            <div className="feature-text">
              <h4>Powerful Analytics</h4>
              <p>Track performance and grow your gifting revenue</p>
            </div>
          </div>
        </div>

        <div className="login-illustration">
          <img src="/images/giftbox.png" alt="Premium Gift Box" />
        </div>

        <div className="page-footer">
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Secure & Encrypted
          </span>
          <span className="pipe">|</span>
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            24/7 Support
          </span>
        </div>
      </div>

      {/* Right Column */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12v10H4V12"/>
              <path d="M2 7h20v5H2z"/>
              <path d="M12 22V7"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
          </div>
          
          <h3>Welcome Back 👋</h3>
          <p>Log in to your Velvet Wishes account</p>

          {showForm && (
            <Form method="post" action="/auth/login" className="login-form">
              <div className="form-group">
                <label htmlFor="shop">Shop Domain</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <input
                    id="shop"
                    name="shop"
                    type="text"
                    placeholder="your-store.myshopify.com"
                    value={shop}
                    onChange={(e) => setShop(e.currentTarget.value)}
                    autoComplete="on"
                  />
                </div>
                <span className="form-hint">Enter your Shopify store domain</span>
              </div>

              <button type="submit" className="btn-primary">
                Continue
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>

              <div className="divider">OR</div>

              <button type="button" className="btn-secondary" onClick={(e) => {
                if(!shop) { document.getElementById('shop').focus(); }
                else { e.target.closest('form').submit(); }
              }}>
                <svg className="shopify-logo" viewBox="0 0 31 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M28.4552 24.3168C28.4552 24.3168 30.6552 20.3703 30.5694 15.0063C30.4815 10.1557 26.6974 9.17604 26.6974 9.17604C26.6974 9.17604 26.1362 6.3267 22.3789 3.52835C18.4908 0.63583 13.9189 0 13.9189 0C13.9189 0 10.6309 0.706247 7.02558 3.50459C3.12053 6.53931 2.3768 9.38722 2.3768 9.38722C2.3768 9.38722 0.354078 12.0125 0.052065 17.5262C-0.279611 23.3672 2.62886 28.5303 2.62886 28.5303L8.98801 34.3312C8.98801 34.3312 14.1565 35 15.2505 35C16.3424 35 22.342 34.401 22.342 34.401L28.4552 24.3168Z" fill="#95BF47"/>
                  <path d="M22.3789 3.52834C18.4908 0.635825 13.9189 0 13.9189 0C13.9189 0 10.6309 0.706243 7.02558 3.50458C3.12053 6.5393 2.3768 9.38721 2.3768 9.38721C2.3768 9.38721 0.354078 12.0125 0.052065 17.5262C-0.0818276 19.9863 0.347513 22.4632 1.15546 24.7176L16.2996 9.38318L21.4328 10.9634C21.4328 10.9634 22.0622 9.03541 22.2536 8.52862C22.4431 8.02184 22.5696 7.62531 22.5696 7.62531C22.5696 7.62531 25.1052 7.73031 26.6974 9.17603C26.6974 9.17603 26.1362 6.32669 22.3789 3.52834Z" fill="#7AB55C"/>
                  <path d="M12.9836 26.5413C12.9836 26.5413 13.3429 27.6017 15.5397 27.6017C17.7365 27.6017 18.0674 26.321 18.0674 25.4053C18.0674 23.3639 12.6074 23.4689 12.6074 19.3496C12.6074 16.5925 15.0214 15.6548 17.4332 16.0353C19.845 16.4158 20.8415 18.2323 20.8415 18.2323L19.4674 20.3168C19.4674 20.3168 18.3241 18.9959 16.7327 18.6657C15.1432 18.3355 14.5401 19.1294 14.5401 19.7431C14.5401 21.667 19.9806 21.0363 19.9806 25.3725C19.9806 28.5147 17.5148 29.8059 14.7397 29.5698C11.9647 29.3338 10.5186 27.5029 10.5186 27.5029L12.9836 26.5413Z" fill="#FFFFFF"/>
                </svg>
                Log in with Shopify
              </button>
            </Form>
          )}

          <div className="login-footer">
            Don't have an account? <a href="#">Contact support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
