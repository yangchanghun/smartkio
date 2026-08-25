import { useCallback, useEffect, useState } from "react";
import { request } from "../api";
import { Category, Order, Product } from "../types";

export function useDashboardData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    try {
      const [nextCategories, nextProducts, nextOrders] = await Promise.all([
        request<Category[]>("/api/categories/"),
        request<Product[]>("/api/products/"),
        request<Order[]>("/api/orders/"),
      ]);
      setCategories(nextCategories);
      setProducts(nextProducts);
      setOrders(nextOrders);
      setError("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "데이터를 불러오지 못했습니다.",
      );
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { categories, products, orders, error, reload };
}
