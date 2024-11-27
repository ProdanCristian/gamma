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
    const { name, email, phone, products, orderIds, address, deliveryCost } =
      body;

    // Format products information for details
    const productsInfo = products
      .map(
        (product) =>
          `[] ${product.name} (Cantitate: ${product.quantity} | ${
            product.discountPrice || product.price
          } lei) | COD PRODUS: ${product.id}`
      )
      .join("\n\n");

    // Format lead name with product names and IDs
    const leadName = products
      .map((product) => `${product.name} #${product.id}`)
      .join("\n");

    // Create contact first with email and phone
    const contactData = {
      name: name,
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
      name: leadName,
      pipeline_id: 8625966,
      status_id: 69959062,
      price: body.total,
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
              value: productsInfo,
            },
          ],
        },
        {
          field_id: 1410509,
          values: [
            {
              value: address || "",
            },
          ],
        },
        {
          field_id: 1606519,
          values: [
            {
              value: "Ramburs",
            },
          ],
        },
        {
          field_id: 1606937,
          values: [
            {
              value: orderIds.join(", "),
            },
          ],
        },
        {
          field_id: 1606939,
          values: [
            {
              value: deliveryCost === 0 ? "Gratis" : `${deliveryCost} lei`,
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
