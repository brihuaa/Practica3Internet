import { MongoClient, ObjectId } from "mongodb";
import { validarUbicacion, haversine } from "./utils.ts";
import { Nino, Ubicacion } from "./types.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");

if (!MONGO_URL) {
  console.error("MONGO_URL no está configurada");
  Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.info("Conectado a MongoDB");

const db = client.db("navidad");
const ninosCollection = db.collection<Nino>("ninos");
const ubicacionesCollection = db.collection<Ubicacion>("ubicaciones");

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const method = req.method;
  const path = url.pathname;

  if (method === "POST" && path === "/ubicacion") {
    const data = await req.json();
    const { nombre, coordenadas } = data;

    if (!nombre || !coordenadas || coordenadas.length !== 2) {
      return new Response(JSON.stringify({ error: "Datos inválidos" }), { status: 400 });
    }

    const existeNombre = await ubicacionesCollection.findOne({ nombre });
    if (existeNombre) {
      return new Response(
        JSON.stringify({ error: "El nombre de la ubicación ya existe" }),
        { status: 400 }
      );
    }

    const insertResult = await ubicacionesCollection.insertOne({ nombre, coordenadas });
    return new Response(
      JSON.stringify({ message: "Ubicación creada", id: insertResult.toString() }),
      { status: 201 }
    );
  }

  if (method === "POST" && path === "/ninos") {
    const data = await req.json();
    const { nombre, comportamiento, ubicacionId } = data;

    if (!nombre || !comportamiento || !ubicacionId) {
      return new Response(JSON.stringify({ error: "Faltan datos obligatorios" }), {
        status: 400,
      });
    }

    if (!["bueno", "malo"].includes(comportamiento)) {
      return new Response(JSON.stringify({ error: "Comportamiento inválido" }), {
        status: 400,
      });
    }

    const ubicacionValida = await validarUbicacion(ubicacionId, ubicacionesCollection);
    if (!ubicacionValida) {
      return new Response(
        JSON.stringify({ error: "La ubicación especificada no existe" }),
        { status: 400 }
      );
    }

    const insertResult = await ninosCollection.insertOne({ nombre, comportamiento, ubicacionId });
    return new Response(
      JSON.stringify({ message: "Niño agregado", id: insertResult.toString() }),
      { status: 201 }
    );
  }

  if (method === "GET" && path === "/ninos/buenos") {
    const buenos = await ninosCollection.find({ comportamiento: "bueno" }).toArray();
    return new Response(JSON.stringify(buenos), { status: 200 });
  }

  if (method === "GET" && path === "/ninos/malos") {
    const malos = await ninosCollection.find({ comportamiento: "malo" }).toArray();
    return new Response(JSON.stringify(malos), { status: 200 });
  }

  if (method === "GET" && path === "/entregas") {
    const ubicaciones = await ubicacionesCollection.find().toArray();
    const resultado = await Promise.all(
      ubicaciones.map(async (ubicacion) => {
        const count = await ninosCollection.countDocuments({
          ubicacionId: ubicacion._id.toString(),
          comportamiento: "bueno",
        });
        return { ...ubicacion, ninosBuenos: count };
      })
    );
    resultado.sort((a, b) => b.ninosBuenos - a.ninosBuenos);
    return new Response(JSON.stringify(resultado), { status: 200 });
  }

  return new Response("Not found", { status: 404 });
};

Deno.serve({ port: 6768 }, handler);
