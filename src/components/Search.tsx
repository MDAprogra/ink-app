// src/components/Search.tsx
"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
//import { useDebouncedCallback } from "use-debounce"; // Optionnel, sinon voir note plus bas*

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // On utilise un petit délai pour ne pas recharger la page à chaque lettre tapée (Debounce)
  // Si tu n'as pas 'use-debounce', tu peux utiliser la version simple ci-dessous
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    
    // Met à jour l'URL sans recharger toute la page
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Recherche
      </label>
      <input
        className="peer block w-full rounded-md border border-border bg-background py-[9px] pl-10 text-sm outline-2 placeholder:text-muted-fg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("q")?.toString()}
      />
      {/* Icône Loupe (SVG) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-fg peer-focus:text-foreground"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
    </div>
  );
}