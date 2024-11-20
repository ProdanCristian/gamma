import bizSdk from "facebook-nodejs-business-sdk";

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

export const fbEvents = {
  async search(clientUserAgent: string, sourceUrl: string) {
    const userData = new bizSdk.UserData().setClientUserAgent(clientUserAgent);
    const event = new bizSdk.ServerEvent()
      .setEventName("Search")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setUserData(userData);

    return sendEvent(event);
  },

  async contact(clientUserAgent: string, sourceUrl: string) {
    const userData = new bizSdk.UserData().setClientUserAgent(clientUserAgent);
    const event = new bizSdk.ServerEvent()
      .setEventName("Contact")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setUserData(userData);

    return sendEvent(event);
  },

  async purchase(purchaseData: PurchaseData, sourceUrl: string) {
    const userData = new bizSdk.UserData().setClientUserAgent(
      purchaseData.clientUserAgent
    );

    if (purchaseData.firstName) userData.setFirstName(purchaseData.firstName);
    if (purchaseData.lastName) userData.setLastName(purchaseData.lastName);
    if (purchaseData.email) userData.setEmails([purchaseData.email]);
    if (purchaseData.phone) userData.setPhones([purchaseData.phone]);
    if (purchaseData.city) userData.setCity(purchaseData.city);
    if (purchaseData.state) userData.setState(purchaseData.state);
    if (purchaseData.zipCode) userData.setZip(purchaseData.zipCode);

    const event = new bizSdk.ServerEvent()
      .setEventName("Purchase")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setUserData(userData)
      .setCustomData(
        new bizSdk.CustomData()
          .setCurrency(purchaseData.currency)
          .setValue(purchaseData.value)
      );

    return sendEvent(event);
  },

  async completeRegistration(customerInfo: CustomerInfo, sourceUrl: string) {
    const userData = new bizSdk.UserData().setClientUserAgent(
      customerInfo.clientUserAgent
    );

    if (customerInfo.firstName) userData.setFirstName(customerInfo.firstName);
    if (customerInfo.lastName) userData.setLastName(customerInfo.lastName);
    if (customerInfo.phone) userData.setPhones([customerInfo.phone]);

    const event = new bizSdk.ServerEvent()
      .setEventName("CompleteRegistration")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setUserData(userData);

    return sendEvent(event);
  },

  async initiateCheckout(clientUserAgent: string, sourceUrl: string) {
    const userData = new bizSdk.UserData().setClientUserAgent(clientUserAgent);
    const event = new bizSdk.ServerEvent()
      .setEventName("InitiateCheckout")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setUserData(userData);

    return sendEvent(event);
  },

  async addToWishlist(clientUserAgent: string, sourceUrl: string) {
    const userData = new bizSdk.UserData().setClientUserAgent(clientUserAgent);
    const event = new bizSdk.ServerEvent()
      .setEventName("AddToWishlist")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setUserData(userData);

    return sendEvent(event);
  },

  async addToCart(clientUserAgent: string, sourceUrl: string) {
    const userData = new bizSdk.UserData().setClientUserAgent(clientUserAgent);
    const event = new bizSdk.ServerEvent()
      .setEventName("AddToCart")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setUserData(userData);

    return sendEvent(event);
  },

  async pageView(customerInfo: CustomerInfo, sourceUrl: string) {
    const userData = new bizSdk.UserData().setClientUserAgent(
      customerInfo.clientUserAgent
    );

    if (customerInfo.firstName) userData.setFirstName(customerInfo.firstName);
    if (customerInfo.lastName) userData.setLastName(customerInfo.lastName);

    const event = new bizSdk.ServerEvent()
      .setEventName("PageView")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(sourceUrl)
      .setActionSource("website")
      .setUserData(userData);

    return sendEvent(event);
  },
};

async function sendEvent(serverEvent: any) {
  eventRequest.setEvents([serverEvent]);

  try {
    const response = await eventRequest.execute();
    return response;
  } catch (error) {
    console.error("Error sending Facebook event:", error);
    throw error;
  }
}
