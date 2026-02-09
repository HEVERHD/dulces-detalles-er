// app/carrito/page.tsx
"use client";

import { useCart } from "@/components/CartContext";
import CouponInput from "@/components/CouponInput";
import AddressAutocomplete from "@/components/maps/AddressAutocomplete";
import { useEffect, useState } from "react";


type Branch = "outlet" | "supercentro";

const WHATSAPP_OUTLET_BOSQUE = "573504737628";
const WHATSAPP_SUPERCENTRO = "573202304977";
const BRANCH_STORAGE_KEY = "dd-default-branch";

function getBranchLabel(branch: Branch) {
    return branch === "outlet"
        ? "Outlet del Bosque"
        : "Supercentro Los Ejecutivos";
}

interface AppliedCoupon {
    id: string;
    code: string;
    type: string;
    value: number;
    discountAmount: number;
}

export default function CartPage() {
    const {
        items,
        totalItems,
        totalAmount,
        updateQuantity,
        removeItem,
        clearCart,
    } = useCart();

    const [branch, setBranch] = useState<Branch>("outlet");
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
    const [deliveryAddress, setDeliveryAddress] = useState("");

    // Calcular total final con descuento
    const finalTotal = appliedCoupon
        ? Math.max(0, totalAmount - appliedCoupon.discountAmount)
        : totalAmount;

    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = window.localStorage.getItem(BRANCH_STORAGE_KEY);
        if (stored === "outlet" || stored === "supercentro") {
            setBranch(stored);
        }
    }, []);

    const formatPrice = (value: number) =>
        value.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        });

    const handleSendWhatsAppOrder = async () => {
        if (typeof window === "undefined" || items.length === 0) return;

        const phone =
            branch === "supercentro"
                ? WHATSAPP_SUPERCENTRO
                : WHATSAPP_OUTLET_BOSQUE;

        const lines = items.map(
            (it) =>
                `- ${it.quantity} x ${it.name} (${formatPrice(
                    it.price
                )} c/u) = ${formatPrice(it.price * it.quantity)}`
        );

        // Construir info de descuento si hay cupón aplicado
        const discountInfo = appliedCoupon
            ? `\n💚 Cupón aplicado: *${appliedCoupon.code}*\nDescuento: *${formatPrice(appliedCoupon.discountAmount)}*\n`
            : "";

        const text = `Hola, vengo desde la web de *Dulces Detalles ER* 💖

Quiero hacer este pedido:

${lines.join("\n")}

Subtotal: *${formatPrice(totalAmount)}*${discountInfo}
Total aproximado: *${formatPrice(finalTotal)}*
Sucursal: *${getBranchLabel(branch)}*${deliveryAddress ? `\nDireccion de entrega: *${deliveryAddress}*` : ""}

¿Me ayudan a confirmar disponibilidad y formas de pago?`;

        // Si hay un cupón aplicado, incrementar su contador de uso
        if (appliedCoupon) {
            try {
                await fetch("/api/coupons/use", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ couponId: appliedCoupon.id }),
                });
            } catch (error) {
                console.error("Error al registrar uso del cupón:", error);
                // Continuar con el pedido aunque falle el registro
            }
        }

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
                <p className="text-sm text-slate-500">Tu carrito está vacío por ahora.</p>
                <a href="/" className="text-xs font-semibold text-pink-600 underline">
                    Ver detalles para agregar 💖
                </a>
            </div>
        );
    }

    return (
        <div className="px-4 pb-24 space-y-5">
            <header className="pt-4 flex items-center justify-between gap-2">
                <h1 className="text-lg font-extrabold text-slate-900">
                    Tu carrito ({totalItems})
                </h1>
                <p className="text-[11px] text-slate-400 text-right">
                    Sucursal:{" "}
                    <span className="font-semibold text-pink-600">
                        {getBranchLabel(branch)}
                    </span>
                </p>
            </header>

            <div className="space-y-3">
                {items.map((item) => (
                    <article
                        key={item.id}
                        className="flex gap-3 rounded-2xl border border-slate-100 bg-white shadow-sm p-3"
                    >
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900 line-clamp-2">
                                    {item.name}
                                </h2>
                                <p className="text-[11px] text-pink-600 mt-1">
                                    {formatPrice(item.price)} c/u
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-1">
                                <div className="inline-flex items-center gap-2 bg-slate-50 rounded-full px-2 py-1">
                                    <button
                                        onClick={() =>
                                            updateQuantity(item.id, item.quantity - 1)
                                        }
                                        className="w-6 h-6 rounded-full bg-white border border-slate-200 text-xs flex items-center justify-center"
                                    >
                                        -
                                    </button>
                                    <span className="text-xs font-semibold text-slate-800 min-w-[1.5rem] text-center">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            updateQuantity(item.id, item.quantity + 1)
                                        }
                                        className="w-6 h-6 rounded-full bg-white border border-slate-200 text-xs flex items-center justify-center"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-[11px] text-slate-400 hover:text-red-500"
                                >
                                    Quitar
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Cupón de descuento */}
            <div className="mt-4">
                <CouponInput
                    cartTotal={totalAmount}
                    onCouponApplied={setAppliedCoupon}
                    onCouponRemoved={() => setAppliedCoupon(null)}
                    appliedCoupon={appliedCoupon}
                />
            </div>

            {/* Dirección de entrega */}
            <div className="mt-4">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Direccion de entrega (opcional)
                </label>
                <AddressAutocomplete
                    value={deliveryAddress}
                    onChange={setDeliveryAddress}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                    Escribe tu direccion para incluirla en el pedido por WhatsApp
                </p>
            </div>

            <div className="mt-2 rounded-2xl border border-pink-100 bg-pink-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold text-slate-800">
                        {formatPrice(totalAmount)}
                    </span>
                </div>

                {appliedCoupon && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600">Descuento:</span>
                        <span className="font-semibold text-green-600">
                            -{formatPrice(appliedCoupon.discountAmount)}
                        </span>
                    </div>
                )}

                <div className="border-t border-pink-200 pt-2 flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Total aproximado:</span>
                    <span className="font-extrabold text-pink-700 text-lg">
                        {formatPrice(finalTotal)}
                    </span>
                </div>

                <p className="text-[11px] text-slate-500">
                    El valor final puede variar según personalización y disponibilidad de
                    productos. Te confirmamos todo por WhatsApp.
                </p>

                <div className="flex justify-between items-center mt-2 gap-3">
                    <button
                        onClick={clearCart}
                        className="text-[11px] text-slate-400 hover:text-red-500 underline"
                    >
                        Vaciar carrito
                    </button>
                    <button
                        onClick={handleSendWhatsAppOrder}
                        className="inline-flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 text-xs shadow-md"
                    >
                        💬 Enviar pedido por WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}
