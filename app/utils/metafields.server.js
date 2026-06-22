export const METAFIELD_NAMESPACE = "giftnote";
export const METAFIELD_KEY = "settings";

export async function updateStoreMetafield(graphql, settings) {
  const settingsJson = JSON.stringify(settings);
  
  const response = await graphql(
    `
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          value
        }
        userErrors {
          field
          message
        }
      }
    }
    `,
    {
      variables: {
        metafields: [
          {
            ownerId: await getAppInstallationId(graphql),
            namespace: METAFIELD_NAMESPACE,
            key: METAFIELD_KEY,
            type: "json",
            value: settingsJson,
          },
        ],
      },
    }
  );

  const data = await response.json();
  if (data.data?.metafieldsSet?.userErrors?.length > 0) {
    console.error("Metafield update errors:", data.data.metafieldsSet.userErrors);
  }
  return data;
}

async function getAppInstallationId(graphql) {
  const response = await graphql(
    `
    query {
      currentAppInstallation {
        id
      }
    }
    `
  );
  const data = await response.json();
  return data.data.currentAppInstallation.id;
}
