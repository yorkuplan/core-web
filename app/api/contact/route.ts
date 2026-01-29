export async function POST(req: Request) {
  try {
    const { name, email, type, message } = await req.json()

    const formAction = process.env.GFORM_ACTION_URL
    const nameId = process.env.GFORM_NAME_ID
    const emailId = process.env.GFORM_EMAIL_ID
    const typeId = process.env.GFORM_TYPE_ID
    const messageId = process.env.GFORM_MESSAGE_ID

    if (!formAction || !nameId || !emailId || !typeId || !messageId) {
      return new Response(
        JSON.stringify({ error: "Missing Google Form configuration." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    // Map form values to Google Forms expected values
    const typeMap: Record<string, string> = {
      feedback: "General Feedback",
      bug: "Report Incorrect Data",
      feature: "Feature Suggestion",
      other: "Other",
    }

    const params = new URLSearchParams()
    params.append(`entry.${nameId}`, name ?? "")
    params.append(`entry.${emailId}`, email ?? "")
    params.append(`entry.${typeId}`, typeMap[type] || type)
    params.append(`entry.${messageId}`, message ?? "")

    console.log("Submitting to Google Forms:", formAction)
    console.log("Params:", params.toString())

    const resp = await fetch(formAction, {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      redirect: "manual", // Google Forms redirects on success; catch it
    })

    // Google Forms returns 303 redirect on success, which is ok
    if (!resp.ok && resp.status !== 303) {
      const detail = await resp.text()
      console.error("Google Forms error:", resp.status, detail)
      return new Response(
        JSON.stringify({
          error: "Failed to submit to Google Forms",
          detail,
          status: resp.status,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      )
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
