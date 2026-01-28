export async function GET(req) {
  try {
    const response = await fetch(
      "https://api.jsonbin.io/v3/b/6824b8128960c979a5996cfa/latest",
      {
        headers: {
          "X-Master-Key":
            "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`JSONBin API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data.record),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch gallery images" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}