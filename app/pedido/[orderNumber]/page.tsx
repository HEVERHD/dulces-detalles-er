"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BRANCHES } from "@/config/branches";
import DeliveryRouteMap from "@/components/maps/DeliveryRouteMap";

const STATUSES = [
    { key: "received", label: "Recibido", emoji: "\uD83D\uDCE9", description: "Tu pedido ha sido recibido. Pronto lo confirmaremos." },
    { key: "confirmed", label: "Confirmado", emoji: "\u2705", description: "Tu pedido ha sido confirmado. Estamos preparandolo." },
    { key: "preparing", label: "En preparacion", emoji: "\uD83C\uDF81", description: "Tu pedido esta siendo preparado con mucho amor." },
    { key: "delivered", label: "Entregado", emoji: "\uD83D\uDE80", description: "Tu pedido ha sido entregado. Gracias por tu compra!" },
] as const;

interface OrderItem {
    id: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    priceAtTime: number;
    total: number;
}

interface Order {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string | null;
    selectedBranch: string;
    subtotal: number;
    couponCode: string | null;
    discountAmount: number;
    total: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}

function maskPhone(phone: string) {
    if (phone.length <= 4) return phone;
    return phone.slice(0, 3) + "****" + phone.slice(-2);
}

function formatPrice(value: number) {
    return value.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    });
}

export default function OrderTrackingPage() {
    const params = useParams();
    const orderNumber = params.orderNumber as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!orderNumber) return;
        fetch(`/api/orders/${orderNumber}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.ok) setOrder(data.order);
                else setError(data.message || "Pedido no encontrado");
            })
            .catch(() => setError("Error de conexion"))
            .finally(() => setLoading(false));
    }, [orderNumber]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
                    <p className="text-sm text-slate-500">Cargando pedido...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl">
                    &#10060;
                </div>
                <h2 className="text-lg font-bold text-slate-900">Pedido no encontrado</h2>
                <p className="text-sm text-slate-500">
                    Verifica que el numero de pedido sea correcto.
                </p>
                <a href="/" className="text-sm font-semibold text-pink-600 underline">
                    Volver a la tienda
                </a>
            </div>
        );
    }

    const currentIndex = STATUSES.findIndex((s) => s.key === order.status);
    const branch = order.selectedBranch as "outlet" | "supercentro";
    const branchInfo = BRANCHES[branch] || BRANCHES.outlet;

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="text-center">
                <span className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-3">
                    &#128230; Seguimiento
                </span>
                <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">
                    Pedido {order.orderNumber}
                </h1>
                <p className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString("es-CO", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
            </div>

            {/* Progress bar */}
            <div className="glass-card rounded-2xl p-6 shadow-premium">
                <div className="flex items-center justify-between relative">
                    {/* Linea de fondo */}
                    <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-slate-200 rounded-full" />
                    {/* Linea de progreso */}
                    <div
                        className="absolute top-5 left-[10%] h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-700"
                        style={{ width: `${(currentIndex / (STATUSES.length - 1)) * 80}%` }}
                    />

                    {STATUSES.map((status, i) => {
                        const isActive = i <= currentIndex;
                        const isCurrent = i === currentIndex;
                        return (
                            <div key={status.key} className="relative z-10 flex flex-col items-center flex-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                                        isCurrent
                                            ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg scale-110 animate-pulse-soft"
                                            : isActive
                                            ? "bg-green-500 text-white"
                                            : "bg-slate-200 text-slate-400"
                                    }`}
                                >
                                    {isActive && !isCurrent ? "\u2713" : status.emoji}
                                </div>
                                <span
                                    className={`text-[10px] mt-2 text-center font-semibold ${
                                        isCurrent ? "text-pink-600" : isActive ? "text-green-600" : "text-slate-400"
                                    }`}
                                >
                                    {status.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Estado actual */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-700 font-semibold">
                        {STATUSES[currentIndex].description}
                    </p>
                </div>
            </div>

            {/* Mapa de ruta (solo si hay direccion de entrega) */}
            {order.deliveryAddress && (
                <DeliveryRouteMap
                    branchName={branchInfo.name}
                    branchCoordinates={branchInfo.coordinates}
                    deliveryAddress={order.deliveryAddress}
                    status={order.status}
                />
            )}

            {/* Datos del pedido */}
            <div className="glass-card rounded-2xl p-5 shadow-premium space-y-3">
                <h3 className="font-display font-bold text-slate-900 text-sm">Datos del pedido</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span className="text-xs text-slate-400">Cliente</span>
                        <p className="font-semibold text-slate-800">{order.customerName}</p>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400">Telefono</span>
                        <p className="font-semibold text-slate-800">{maskPhone(order.customerPhone)}</p>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400">Sucursal</span>
                        <p className="font-semibold text-slate-800">{branchInfo.name}</p>
                    </div>
                    {order.deliveryAddress && (
                        <div>
                            <span className="text-xs text-slate-400">Direccion</span>
                            <p className="font-semibold text-slate-800">{order.deliveryAddress}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Items */}
            <div className="glass-card rounded-2xl p-5 shadow-premium">
                <h3 className="font-display font-bold text-slate-900 text-sm mb-3">Productos</h3>
                <div className="space-y-3">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                            {item.productImage && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{item.productName}</p>
                                <p className="text-xs text-slate-400">{item.quantity} x {formatPrice(item.priceAtTime)}</p>
                            </div>
                            <span className="text-sm font-bold text-slate-700">{formatPrice(item.total)}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-100 mt-4 pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-semibold text-slate-700">{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.discountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-green-600">Descuento {order.couponCode && `(${order.couponCode})`}</span>
                            <span className="font-semibold text-green-600">-{formatPrice(order.discountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-base pt-1">
                        <span className="font-bold text-slate-900">Total</span>
                        <span className="font-extrabold text-pink-700">{formatPrice(order.total)}</span>
                    </div>
                </div>
            </div>

            {/* Contactar */}
            <div className="text-center">
                <a
                    href={`https://wa.me/${branchInfo.whatsapp}?text=${encodeURIComponent(`Hola, tengo una consulta sobre mi pedido *${order.orderNumber}*`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg text-sm transition-all"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Contactar tienda
                </a>
            </div>
        </div>
    );
}
