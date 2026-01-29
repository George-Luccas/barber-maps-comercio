"use server"

import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"
import { CITIES } from "../_constants/locations"

export async function getCities() {
  try {
    const dbCities = await db.city.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    const dbCityNames = dbCities.map(c => c.name);
    
    // Merge predefined cities with DB cities ensuring uniqueness
    const allCities = Array.from(new Set([...CITIES, ...dbCityNames])).sort();

    return allCities;
  } catch (error) {
    console.error("Erro ao buscar cidades:", error);
    // Fallback to constants if DB fails
    return CITIES;
  }
}

export async function addCity(cityName: string) {
  try {
    if (!cityName || cityName.trim() === "") {
        return { success: false, error: "Nome da cidade inválido" };
    }

    const formattedName = cityName.trim(); // Mantém Case Sensitive original ou ajusta conforme regra de negócio?
    // A lista CITIES tem "São Paulo", "Cuiabá" etc. Vamos manter a formatação enviada pelo usuário, 
    // mas verificar duplicidade case-insensitive na verificação lógica se necessário, 
    // porém o unique do banco é case sensitive por padrão no Postgres salvo configuração collation.
    
    // Verifica se já existe no banco (busca exata ou case insensitive via findFirst com mode: insensitive)
    const existing = await db.city.findFirst({
        where: {
            name: {
                equals: formattedName,
                mode: 'insensitive'
            }
        }
    });

    if (existing) {
        return { success: true, city: existing.name }; // Já existe, retorna sucesso pois o objetivo é ter a cidade disponível
    }

    // Verifica se já está na lista estática (opcional, para não duplicar no DB o que já tem na const)
    const inStatic = CITIES.some(c => c.toLowerCase() === formattedName.toLowerCase());
    if (inStatic) {
        // Se já está na estática, não precisa salvar no banco se a lógica no getCities faz o merge.
        // Mas se quisermos persistir tudo no banco eventualmente, poderíamos salvar.
        // Por hora, retornamos sucesso.
        return { success: true, city: CITIES.find(c => c.toLowerCase() === formattedName.toLowerCase()) || formattedName };
    }

    const newCity = await db.city.create({
      data: {
        name: formattedName
      }
    });

    revalidatePath("/barbearia");
    return { success: true, city: newCity.name };

  } catch (error) {
    console.error("Erro ao adicionar cidade:", error);
    return { success: false, error: "Erro ao adicionar cidade" };
  }
}
