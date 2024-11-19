import { NextResponse } from "next/server";
import { amocrm } from "@/lib/amocrm";

function formatDateForAmo(date) {
  const pad = (num) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const offset = "+03:00";

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offset}`;
}

export async function GET(request) {
  try {
    const pipelines = await amocrm.getPipelines();
    const statuses = await amocrm.getStatuses(8625966);
    const customFields = await amocrm.getCustomFields();

    console.log("Custom Fields:", JSON.stringify(customFields, null, 2));

    return NextResponse.json({
      success: true,
      pipelines,
      statuses,
      customFields,
    });
  } catch (error) {
    console.error("Full error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const date = new Date();
    const formattedDate = formatDateForAmo(date);
    const body = await request.json();
    const { name, email, phone } = body;

    // Create contact first with email and phone
    const contactData = {
      name: name || "Unknown",
      custom_fields_values: [
        {
          field_code: "EMAIL",
          values: [
            {
              value: email || "",
              enum_code: "WORK",
            },
          ],
        },
        {
          field_code: "PHONE",
          values: [
            {
              value: phone || "",
              enum_code: "WORK",
            },
          ],
        },
      ],
    };

    const contactResponse = await amocrm.createContact(contactData);
    const contactId = contactResponse._embedded.contacts[0].id;

    if (!contactId) {
      throw new Error("Failed to create contact");
    }

    const leadData = {
      name: `${body.productName || "Product"} #${body.orderId || "12345"}`,
      pipeline_id: 8625966,
      status_id: 69959062,
      price: body.price || 1500,
      _embedded: {
        contacts: [
          {
            id: contactId,
          },
        ],
      },
      custom_fields_values: [
        {
          field_id: 1123895,
          values: [
            {
              value: body.productName || "Product 1",
            },
          ],
        },
        {
          field_id: 1123897,
          values: [
            {
              value: parseInt(body.orderId) || 12345,
            },
          ],
        },
        {
          field_id: 1410509,
          values: [
            {
              value: body.address || "Test Street 123, Chisinau",
            },
          ],
        },
        {
          field_id: 1544979,
          values: [
            {
              value: body.conversionName || name || "Unknown",
            },
          ],
        },
        {
          field_id: 1544983,
          values: [
            {
              value: body.productUrl || "https://gamma.md/product/test-product",
            },
          ],
        },
      ],
    };

    console.log("Creating lead with data:", JSON.stringify(leadData, null, 2));

    const response = await amocrm.createLead(leadData);
    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Full error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error,
      },
      { status: 500 }
    );
  }
}
