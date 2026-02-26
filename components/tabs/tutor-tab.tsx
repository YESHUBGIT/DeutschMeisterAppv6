"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, SendHorizontal, Sparkles } from "lucide-react"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

const starterPrompts = [
  "Start a beginner conversation about ordering coffee.",
  "Explain when to use weil vs denn with examples.",
  "I want to practice modal verbs with you.",
  "Correct my sentence: Ich habe gestern gegangen.",
]

export function TutorTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)


  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) {
      return
    }

    setIsSending(true)
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }]
    setMessages(nextMessages)
    setInput("")

    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (!response.ok) {
        throw new Error("Tutor API error")
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I could not reach the tutor server. Please try again in a moment.",
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void sendMessage(input)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4 py-6">
        <h1 className="text-4xl font-bold text-foreground">Tutor Conversation</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Practice natural German conversations with your personal tutor.
        </p>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Live Conversation
          </CardTitle>
          <CardDescription>
            Ask for explanations, corrections, or start a guided dialogue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="rounded-xl border border-border bg-muted/40 p-4 text-left text-sm text-muted-foreground hover:bg-muted"
                  onClick={() => void sendMessage(prompt)}
                >
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {prompt}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {isSending && (
                <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                  Tutor is thinking...
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Write a message in English or German"
              disabled={isSending}
            />
            <Button type="submit" disabled={isSending} className="gap-2">
              <SendHorizontal className="h-4 w-4" />
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
