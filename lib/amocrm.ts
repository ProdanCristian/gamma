interface AmoCredentials {
  client_id: string;
  client_secret: string;
  subdomain: string;
  access_token: string;
}

const AMO_CREDENTIALS: AmoCredentials = {
  subdomain: "trendforce",
  client_id: "a804ce46-0349-44cf-84da-57e7ea19887c",
  client_secret:
    "SpE5xTKGzdeVeNMCkmAUCNcVbDoxRvRSWujvl9hvjcxbWTVLJtnT2ycXPEI1PcOo",
  access_token:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImZjNTQ2MzNhOTBmOTQ4ZjliZWFjZmVkNTU5MGQzZmQ4ZDNhZTlkNzJjOTNjOTFiMDBiZDM2MWIwNTk0M2FhMzUyMDNjMzQ5Y2M4ODdkNjcyIn0.eyJhdWQiOiJhODA0Y2U0Ni0wMzQ5LTQ0Y2YtODRkYS01N2U3ZWExOTg4N2MiLCJqdGkiOiJmYzU0NjMzYTkwZjk0OGY5YmVhY2ZlZDU1OTBkM2ZkOGQzYWU5ZDcyYzkzYzkxYjAwYmQzNjFiMDU5NDNhYTM1MjAzYzM0OWNjODg3ZDY3MiIsImlhdCI6MTczMTk1MjU2NiwibmJmIjoxNzMxOTUyNTY2LCJleHAiOjE4ODgxODU2MDAsInN1YiI6IjEwNzg1NjUwIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxNjI0NjYyLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiNjI1MmI0YjYtM2Y2NS00Yjc5LWI1ZWUtMWI2ZmU1MWMyNjAwIiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.PLHKo5IW6n9SB4BOrUMmCK2CRhVyVRvdGfa7iB7Ba_TgzNIWBcAUrED3mbAJczZsvhd3mpGceT9XkJwS-LKr2yWuTOLLXlwnOsLRgnCaKQrtk3OX3WwMy7kZCo28grJOeP8JU8uZjmA9DgWLi9rDQ8TepEpYDYuUaEvUxcVcjTawgB4i5eNjaP4cl_Z0moPBgr80_d8nCH_F29_5AQoKTBJrLlgPUTaymYATmQR7s4TnLRyW5lC_3-CSjjrnreSrBJyL7W6C9yurlTvAFFHE04sfoTSSE5nGEFrxUJTXBikDZFUYjYxe15WLdZfQkzPR4PzOSNadd4jkxX0_spzXSw",
};

export class AmoCRM {
  private baseUrl: string;
  private accessToken: string;

  constructor() {
    this.baseUrl = `https://${AMO_CREDENTIALS.subdomain}.amocrm.ru`;
    this.accessToken = AMO_CREDENTIALS.access_token;
  }

  private async request(method: string, endpoint: string, data?: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v4/${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, details: ${JSON.stringify(
            errorData
          )}`
        );
      }

      return response.json();
    } catch (error: any) {
      throw new Error(`AmoCRM API Error: ${error.message}`);
    }
  }

  async getLeads() {
    return this.request("GET", "leads");
  }

  async createLead(leadData: any) {
    return this.request("POST", "leads", [leadData]);
  }

  async getContacts() {
    return this.request("GET", "contacts");
  }

  async createContact(contactData: any) {
    const response = await this.request("POST", "contacts", [contactData]);
    if (!response?._embedded?.contacts?.[0]) {
      throw new Error("Failed to create contact: Invalid response format");
    }
    return response;
  }

  async getCompanies() {
    return this.request("GET", "companies");
  }

  async createCompany(companyData: any) {
    return this.request("POST", "companies", [companyData]);
  }

  async getPipeline(pipelineId: number) {
    return this.request("GET", `leads/pipelines/${pipelineId}`);
  }

  async getCustomFields() {
    return this.request("GET", "leads/custom_fields");
  }

  async getPipelines() {
    return this.request("GET", "leads/pipelines");
  }

  async getStatuses(pipelineId: number) {
    return this.request("GET", `leads/pipelines/${pipelineId}/statuses`);
  }
}

export const amocrm = new AmoCRM();
