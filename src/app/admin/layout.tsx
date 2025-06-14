"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { listenForNavigationChanges } from "@/store/slices/navigationSlice";
import { fetchPageContent } from "@/store/slices/contentSlice";
import AdminLayout from "./AdminLayout";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(listenForNavigationChanges());
    dispatch(fetchPageContent());
  }, [dispatch]);

  return <AdminLayout>{children}</AdminLayout>;
}
