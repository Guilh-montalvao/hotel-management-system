"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";

interface BreadcrumbNavigationProps {
  customItems?: Array<{
    label: string;
    href?: string;
  }>;
}

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

export function BreadcrumbNavigation({
  customItems,
}: BreadcrumbNavigationProps) {
  const pathname = usePathname();

  // Mapeamento de rotas para nomes amigáveis
  const routeNames: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/guests": "Hóspedes",
    "/rooms": "Quartos",
    "/bookings": "Reservas",
    "/payments": "Pagamentos",
    "/reports": "Relatórios",
    "/diagnosticos": "Diagnósticos",
  };

  // Gerar breadcrumbs baseado na URL atual
  const generateBreadcrumbs = (): BreadcrumbItemType[] => {
    if (customItems) {
      return [{ label: "Hotel", href: "/dashboard" }, ...customItems];
    }

    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItemType[] = [
      { label: "Hotel", href: "/dashboard" },
    ];

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      const item: BreadcrumbItemType = {
        label:
          routeNames[currentPath] ||
          segment.charAt(0).toUpperCase() + segment.slice(1),
      };

      if (!isLast) {
        item.href = currentPath;
      }

      breadcrumbs.push(item);
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null; // Não mostrar breadcrumb na página inicial
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href} className="flex items-center gap-1">
                    {index === 0 && <HomeIcon className="h-4 w-4" />}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="flex items-center gap-1">
                  {index === 0 && <HomeIcon className="h-4 w-4" />}
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
