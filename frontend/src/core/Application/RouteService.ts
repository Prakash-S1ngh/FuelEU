import { useState, useEffect } from "react";
import { RouteAPI } from "../../adapters/infrastructure/routeApi";
import type { Route } from "../domains/Route";

const api = new RouteAPI();

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchRoutes() {
    setLoading(true);
    const data = await api.getAllRoutes();
    setRoutes(data);
    setLoading(false);
  }

  async function setBaseline(id: string) {
    await api.setBaseline(id);
    await fetchRoutes();
  }

  useEffect(() => {
    fetchRoutes();
  }, []);

  return { routes, loading, setBaseline };
}