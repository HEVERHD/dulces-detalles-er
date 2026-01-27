"use client";

import { useState } from "react";

interface AppliedCoupon {
  id: string;
  code: string;
  type: string;
  value: number;
  discountAmount: number;
}

interface CouponInputProps {
  cartTotal: number;
  onCouponApplied: (coupon: AppliedCoupon) => void;
  onCouponRemoved: () => void;
  appliedCoupon: AppliedCoupon | null;
}

export default function CouponInput({
  cartTotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!code.trim()) {
      setError("Ingresa un código de cupón");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          cartTotal,
        }),
      });

      const data = await res.json();

      if (data.valid) {
        onCouponApplied(data.coupon);
        setCode("");
        setError(null);
      } else {
        setError(data.error || "Cupón inválido");
      }
    } catch (err) {
      setError("Error al validar el cupón");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setCode("");
    setError(null);
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎟️</span>
            <div>
              <p className="text-sm font-semibold text-green-800">
                Cupón aplicado
              </p>
              <p className="text-xs text-green-700">
                Código: <span className="font-bold">{appliedCoupon.code}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            Quitar
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-green-700">Descuento:</span>
          <span className="font-bold text-green-800">
            -${appliedCoupon.discountAmount.toLocaleString()} COP
          </span>
        </div>
        {appliedCoupon.type === "percentage" && (
          <p className="text-xs text-green-600 mt-1">
            {appliedCoupon.value}% de descuento
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleApplyCoupon();
              }
            }}
            placeholder="Código de cupón"
            disabled={isValidating}
            className={`w-full px-4 py-2 border rounded-lg text-sm ${
              error
                ? "border-red-300 focus:ring-red-500"
                : "border-slate-300 focus:ring-pink-500"
            } focus:ring-2 focus:border-transparent disabled:opacity-50`}
          />
          {code && !isValidating && (
            <button
              onClick={() => {
                setCode("");
                setError(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
        <button
          onClick={handleApplyCoupon}
          disabled={isValidating || !code.trim()}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {isValidating ? "..." : "Aplicar"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <p className="text-xs text-slate-500">
        💡 Ingresa tu código de descuento si tienes uno
      </p>
    </div>
  );
}
