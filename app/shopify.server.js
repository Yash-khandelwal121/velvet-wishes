import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { billingConfig } from "./billing";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import { updateStoreMetafield } from "./utils/metafields.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  billing: billingConfig,
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
  hooks: {
    afterAuth: async ({ session, admin }) => {
      shopify.registerWebhooks({ session });
      const shop = session.shop;
      let settings = await prisma.storeSettings.findUnique({ where: { shop } });
      if (!settings) {
        settings = await prisma.storeSettings.create({ data: { shop } });
      }
      
      const payload = {
        fontColor: settings.fontColor,
        textColor: settings.textColor,
        buttonColor: settings.buttonColor,
        accentColor: settings.accentColor,
        cardTitle: settings.cardTitle,
        maxCards: settings.maxCards,
        activeCards: settings.activeCards || '["design_1"]',
        cardOrder: settings.cardOrder || '["design_1"]',
      };
      
      try {
        await updateStoreMetafield(admin.graphql, payload);
        console.log(`Successfully synced default metafield on install for ${shop}`);
      } catch (e) {
        console.error(`Failed to sync metafield on auth for ${shop}`, e);
      }
    },
  },
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
