import { Collection, ObjectId } from "mongodb";
import { Nino, Ubicacion } from "./types.ts";

// Validar si una ubicación existe
export const validarUbicacion = async (
  ubicacionId: string,
  ubicacionCollection: Collection<Ubicacion>
) => {
  const ubicacion = await ubicacionCollection.findOne({
    _id: new ObjectId(ubicacionId),
  });
  return Boolean(ubicacion);
};

// Calcular la distancia entre dos puntos (fórmula Haversine)
export const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radio de la Tierra en km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en km
};
