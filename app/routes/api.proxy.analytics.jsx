import prisma from "../db.server";

export async function action({ request }) {
  // Only allow POST requests
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Handle CORS for App Proxy
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const data = await request.json();
    const { shop, action } = data; // action could be 'view', 'select', 'submit'

    if (!shop || !action) {
      return Response.json({ error: "Missing required fields" }, { status: 400, headers });
    }

    let analytics = await prisma.analytics.findUnique({
      where: { shop },
    });

    if (!analytics) {
      analytics = await prisma.analytics.create({
        data: { shop },
      });
    }

    const updateData = {};
    if (action === "view") updateData.views = { increment: 1 };
    if (action === "select") updateData.selects = { increment: 1 };
    if (action === "submit") updateData.submits = { increment: 1 };

    await prisma.analytics.update({
      where: { shop },
      data: updateData,
    });

    return Response.json({ success: true }, { headers });
  } catch (error) {
    console.error("Analytics Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500, headers });
  }
}
