"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage({ type: "error", text: "Ingresa tu email" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setEmail("");
        setName("");
      } else {
        setMessage({ type: "error", text: data.error || "Error al suscribirse" });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error al procesar suscripción. Intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">📬</span>
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Suscríbete a nuestro Newsletter
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Recibe promociones exclusivas, nuevos productos y consejos para
            regalar
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre (opcional)"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {isSubmitting ? "..." : "Suscribirse"}
          </button>
        </div>

        {message && (
          <div
            className={`text-sm p-3 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <p className="text-xs text-slate-500">
          Al suscribirte aceptas recibir emails promocionales. Puedes
          darte de baja en cualquier momento.
        </p>
      </form>
    </div>
  );
}
