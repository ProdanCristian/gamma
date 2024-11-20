import * as bizSdk from "facebook-nodejs-business-sdk";
import crypto from "crypto";

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const pixelId = process.env.FACEBOOK_PIXEL_ID;

const api = bizSdk.FacebookAdsApi.init(accessToken || "");
const eventRequest = new bizSdk.EventRequest(accessToken || "", pixelId || "");

interface CustomerInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  clientUserAgent: string;
}

interface PurchaseData extends CustomerInfo {
  currency: string;
  value: number;
}

interface ContactData extends CustomerInfo {
  firstName: string;
  lastName: string;
  phone: string;
}

const hashData = (data: string): string => {
  if (!data) return "";
  return crypto.createHash("sha256").update(data).digest("hex");
};

const formatUserData = (
  userData: bizSdk.UserData,
  info: CustomerInfo
): void => {
  if (info.firstName) userData.setFirstName(hashData(info.firstName));
  if (info.lastName) userData.setLastName(hashData(info.lastName));
  if (info.email) userData.setEmails([hashData(info.email)]);
  if (info.phone) userData.setPhones([hashData(info.phone.replace(/\D/g, ""))]);
  if (info.city) userData.setCity(hashData(info.city));
  if (info.state) userData.setState(hashData(info.state));
  if (info.zipCode) userData.setZip(hashData(info.zipCode));

  userData.setClientUserAgent(info.clientUserAgent);
  userData.setClientIpAddress("0.0.0.0");
  userData.setFbp("fb.1.1558571054389.1098115397");
  userData.setFbc("fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890");
};

async function sendEvent(serverEvent: bizSdk.ServerEvent) {
  try {
    eventRequest.setEvents([serverEvent]);
    const response = await eventRequest.execute();
    console.log("Facebook event sent successfully:", {
      eventName: serverEvent.event_name,
      eventId: serverEvent.event_id,
      timestamp: serverEvent.event_time,
    });
    return response;
  } catch (error: any) {
    console.error("Error sending Facebook event:", {
      error: error.message,
      eventName: serverEvent.event_name,
      eventId: serverEvent.event_id,
      response: error.response?.data,
      status: error.status,
      fullError: error,
    });
    throw error;
  }
}

export const fbEvents = {
  async search(clientUserAgent: string, sourceUrl: string) {
    const userData = new bizSdk.UserData();
    formatUserData(userData, { clientUserAgent });

    const event = new bizSdk.ServerEvent()
      .setEventName("Search")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setEventId(crypto.randomUUID())
      .setUserData(userData);

    return sendEvent(event);
  },

  async contact(contactData: ContactData, sourceUrl: string) {
    const userData = new bizSdk.UserData();
    formatUserData(userData, contactData);

    const event = new bizSdk.ServerEvent()
      .setEventName("Contact")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setEventId(crypto.randomUUID())
      .setUserData(userData);

    return sendEvent(event);
  },

  async purchase(purchaseData: PurchaseData, sourceUrl: string) {
    const userData = new bizSdk.UserData();
    formatUserData(userData, purchaseData);

    const customData = new bizSdk.CustomData()
      .setCurrency(purchaseData.currency)
      .setValue(purchaseData.value);

    const event = new bizSdk.ServerEvent()
      .setEventName("Purchase")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setEventId(crypto.randomUUID())
      .setUserData(userData)
      .setCustomData(customData);

    return sendEvent(event);
  },

  async initiateCheckout(clientUserAgent: string, sourceUrl: string) {
    const userData = new bizSdk.UserData();
    formatUserData(userData, { clientUserAgent });

    const event = new bizSdk.ServerEvent()
      .setEventName("InitiateCheckout")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setEventId(crypto.randomUUID())
      .setUserData(userData);

    return sendEvent(event);
  },

  async addToWishlist(clientUserAgent: string, sourceUrl: string) {
    const userData = new bizSdk.UserData();
    formatUserData(userData, { clientUserAgent });

    const event = new bizSdk.ServerEvent()
      .setEventName("AddToWishlist")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setEventId(crypto.randomUUID())
      .setUserData(userData);

    return sendEvent(event);
  },

  async addToCart(clientUserAgent: string, sourceUrl: string) {
    const userData = new bizSdk.UserData();
    formatUserData(userData, { clientUserAgent });

    const event = new bizSdk.ServerEvent()
      .setEventName("AddToCart")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setEventId(crypto.randomUUID())
      .setUserData(userData);

    return sendEvent(event);
  },

  async pageView(customerInfo: CustomerInfo, sourceUrl: string) {
    const userData = new bizSdk.UserData();
    formatUserData(userData, customerInfo);

    const event = new bizSdk.ServerEvent()
      .setEventName("PageView")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setEventId(crypto.randomUUID())
      .setUserData(userData);

    return sendEvent(event);
  },
};
