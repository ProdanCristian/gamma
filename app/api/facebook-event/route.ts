import { fbEvents } from "@/lib/utils/facebook";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { eventName, data, sourceUrl } = req.body;

    switch (eventName) {
      case "Search":
        await fbEvents.search(data.clientUserAgent, sourceUrl);
        break;

      case "Contact":
        await fbEvents.contact(data.clientUserAgent, sourceUrl);
        break;

      case "Purchase":
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

      case "CompleteRegistration":
        await fbEvents.completeRegistration(
          {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            clientUserAgent: data.clientUserAgent,
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

      case "PageView":
        await fbEvents.pageView(
          {
            firstName: data.firstName,
            lastName: data.lastName,
            clientUserAgent: data.clientUserAgent,
          },
          sourceUrl
        );
        break;

      default:
        return res.status(400).json({ error: "Invalid event name" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Facebook event error:", error);
    res.status(500).json({ error: "Error processing event" });
  }
}
