import { BillingInterval, BillingReplacementBehavior } from "@shopify/shopify-app-react-router/server";

export const MONTHLY_PLAN_50 = "Premium Plan A ($50/month)";
export const MONTHLY_PLAN_70 = "Premium Plan B ($70/month)";
export const MONTHLY_PLAN_100 = "Premium Plan C ($100/month)";

export const billingConfig = {
  [MONTHLY_PLAN_50]: {
    interval: BillingInterval.Every30Days,
    trialDays: 1,
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
    lineItems: [
      {
        amount: 50,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      },
    ],
  },
  [MONTHLY_PLAN_70]: {
    interval: BillingInterval.Every30Days,
    trialDays: 1,
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
    lineItems: [
      {
        amount: 70,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      },
    ],
  },
  [MONTHLY_PLAN_100]: {
    interval: BillingInterval.Every30Days,
    trialDays: 1,
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
    lineItems: [
      {
        amount: 100,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      },
    ],
  },
};
