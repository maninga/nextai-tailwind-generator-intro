import OpenAI from "openai"

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

console.log(
  "import.meta.env.VITE_OPENAI_API_KEY",
  import.meta.env.VITE_OPENAI_API_KEY
)

const form = document.getElementById("generate-form") as HTMLFormElement

form.addEventListener("submit", async (event) => {
  event.preventDefault()
  const formData = new FormData(form)
  const prompt = formData.get("prompt") as string

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an expert in creating websites with Tailwind.
Your task is to generate html code with tailwind based on the user prompt.
You reply only with html code without any text before or after.
You reply with only valid html.
You never reply using markdown syntax.`,
      },
      { role: "user", content: prompt },
    ],
    model: "gpt-3.5-turbo",
  })

  const iframe = document.getElementById("generated-code") as HTMLIFrameElement
  const code = chatCompletion.choices[0].message.content

  if (!code) {
    alert("Failed to generate code. Please try again.")
    return
  }
  iframe.srcdoc = `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... other head elements ... -->
    <link type="text/css" href="https://cdn.tailwindcss.com" rel="stylesheet" />
  </head>
  <body>
    ${code}
  </body>
</html>`

  console.log("chatCompletion", chatCompletion)
})
