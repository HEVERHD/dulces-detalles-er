export const BRANCH_STORAGE_KEY = "dd-default-branch";

export type Branch = "outlet" | "supercentro";

export interface BranchInfo {
  id: Branch;
  name: string;
  fullName: string;
  address: string;
  reference: string;
  phone: string;
  whatsapp: string;
  coordinates: { lat: number; lng: number };
  gradientClass: string;
  colorHex: string;
}

export const BRANCHES: Record<Branch, BranchInfo> = {
  outlet: {
    id: "outlet",
    name: "Outlet del Bosque",
    fullName: "Centro Comercial Outlet del Bosque",
    address: "Centro Comercial Outlet del Bosque",
    reference: "Frente a la Olimpica",
    phone: "+57 350 473 7638",
    whatsapp: "573504737638",
    coordinates: { lat: 10.4053, lng: -75.5460 },
    gradientClass: "from-pink-500 to-rose-500",
    colorHex: "#ec4899",
  },
  supercentro: {
    id: "supercentro",
    name: "Supercentro Los Ejecutivos",
    fullName: "Centro Comercial Supercentro Los Ejecutivos",
    address: "Centro Comercial Supercentro",
    reference: "Al lado del BBVA",
    phone: "+57 320 230 4977",
    whatsapp: "573202304977",
    coordinates: { lat: 10.3910, lng: -75.5140 },
    gradientClass: "from-amber-500 to-orange-500",
    colorHex: "#f59e0b",
  },
};

export const CARTAGENA_CENTER = { lat: 10.3997, lng: -75.5144 };

export const DELIVERY_RADIUS_METERS = 5000;
