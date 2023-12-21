import OpenAI from "openai"

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

const form = document.getElementById("generate-form") as HTMLFormElement
const iframe = document.getElementById("generated-code") as HTMLIFrameElement

form.addEventListener("submit", async (event) => {
  event.preventDefault()
  const formData = new FormData(form)
  const prompt = formData.get("prompt") as string

  const chatCompletionStream = await openai.chat.completions.create({
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
    // Streaming activated
    stream: true,
  })

  let code = ""
  const onNewToken = updateIframeFn()
  // Syntaxe pour lire un stream
  for await (const message of chatCompletionStream) {
    // console.log(message)
    // Traiter chaque message reçu
    const isDone = message.choices[0].finish_reason === "stop"
    if (isDone) {
      break
    }

    const token = message.choices[0].delta.content || ""
    code += token
    console.log(code)
    onNewToken(code)
  }
})

// Mise à jour de l'iframe avec un certain délai
const updateIframe = (code: string) => {
  // Mettre à jour l'iframe avec le code
  iframe.srcdoc = `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... other head elements ... -->
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    ${code}
  </body>
</html>`
}

const updateIframeFn = () => {
  let date = new Date()
  let timeout: number | null = null
  // Logique pour créer ou annuler un timeout
  return (code: string) => {
    // Mise à jour de l'iframe toute les secondes
    if (new Date().getTime() - date.getTime() > 1000) {
      date = new Date()
      updateIframe(code)
    }
    // Annulation du timeout s'il existe
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    // Création d'un nouveau timeout
    timeout = setTimeout(() => updateIframe(code), 1000)
  }
}
