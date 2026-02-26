"use client"

import { signIn } from "next-auth/react"
import { BookOpen, Mail, Globe2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function SignInPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-50 via-background to-sky-100">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-24 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row lg:gap-16">
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-4 py-2 text-sm font-medium text-amber-800">
            <Sparkles className="h-4 w-4" />
            DeutschMeister Cloud Login
          </div>
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            Willkommen zur deutschen Lernreise
          </h1>
          <p className="text-lg text-muted-foreground">
            Speichere deinen Fortschritt, synchronisiere Vokabeln und lerne von jedem Gerät.
            Erstelle ein Konto mit deiner E-Mail und starte direkt.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Lernpfade speichern</p>
                <p className="text-sm text-muted-foreground">Dein Lernbaum bleibt immer erhalten.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm">
              <Globe2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Cloud Sync</p>
                <p className="text-sm text-muted-foreground">Weiterlernen auf jedem Gerät.</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md border-border/60 bg-card/90 shadow-xl backdrop-blur">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Jetzt anmelden</h2>
              <p className="text-sm text-muted-foreground">
                Sichere deine Fortschritte mit einem Klick.
              </p>
            </div>
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={() => signIn("cognito", { callbackUrl: "/" })}
            >
              <Mail className="h-5 w-5" />
              Mit E-Mail fortfahren
            </Button>
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              Wir verwenden AWS Cognito für sichere Anmeldung. Deine Daten bleiben privat.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
