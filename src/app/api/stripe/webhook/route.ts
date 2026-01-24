export async function POST() {
  return Response.json(
    {
      error: "Deprecated endpoint. Use /api/webhooks/stripe",
    },
    { status: 410 }
  );
}
