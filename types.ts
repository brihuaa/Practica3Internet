import { ObjectId } from "mongodb";

// Esquema para niños
export type Nino = {
  id: string;
  nombre: string;
  comportamiento: "bueno" | "malo";
  ubicacionId: string;
};

// Esquema para ubicaciones
export type Ubicacion = {
  id: string;
  nombre: string;
  coordenadas: [number, number]; // Latitud, Longitud
};
