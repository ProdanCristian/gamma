import { fbEvents } from "@/lib/utils/facebook";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, data, sourceUrl } = body;

    console.log("Received event request:", {
      eventName,
      data,
      sourceUrl,
    });

    switch (eventName) {
      case "Search":
        await fbEvents.search(data.clientUserAgent, sourceUrl);
        break;

      case "Contact":
        if (
          !data.clientUserAgent ||
          !sourceUrl ||
          !data.firstName ||
          !data.lastName ||
          !data.phone
        ) {
          console.error("Contact event validation failed:", {
            data,
            sourceUrl,
          });
          throw new Error("Missing required parameters for Contact event");
        }
        await fbEvents.contact(
          {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            clientUserAgent: data.clientUserAgent,
          },
          sourceUrl
        );
        break;

      case "Purchase":
        if (!data.currency || !data.value) {
          console.error("Purchase event validation failed:", data);
          throw new Error("Missing required parameters for Purchase event");
        }
        await fbEvents.purchase(
          {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            clientUserAgent: data.clientUserAgent,
            currency: data.currency,
            value: data.value,
          },
          sourceUrl
        );
        break;

      case "InitiateCheckout":
        await fbEvents.initiateCheckout(data.clientUserAgent, sourceUrl);
        break;

      case "AddToWishlist":
        await fbEvents.addToWishlist(data.clientUserAgent, sourceUrl);
        break;

      case "AddToCart":
        await fbEvents.addToCart(data.clientUserAgent, sourceUrl);
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid event name" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Facebook event error:", error);
    return new Response(
      JSON.stringify({
        error: "Error processing event",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
