import useSWR from "swr";
import { useEffect } from "react";
import { setIsLoading } from "./use-loading";

export interface TaxonomyOption { v: string; l: string; }
export interface ModelNode extends TaxonomyOption { vr: TaxonomyOption[]; }
export interface MakeNode extends TaxonomyOption { m: ModelNode[]; }

export interface TaxonomyData {
  taxonomyTree: MakeNode[];
  ranges: { year: { min: number; max: number }; price: { min: number; max: number }; odoReading: { min: number; max: number }; };
  attributes: { fuelType: string[]; transmission: string[]; bodyType: string[]; colour: string[]; ulezCompliance: string[]; odoUnit: string[]; currency: string[]; doors: number[]; seats: number[]; };
  totalCount: number;
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// World-class Separation: Fetch static tree ONCE
export function useTaxonomy() {
  const { data, error, isLoading } = useSWR<TaxonomyData>("/api/taxonomy", fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 3600000, 
  });

  useEffect(() => {
    setIsLoading(isLoading, "taxonomy-static-fetch");
    return () => setIsLoading(false, "taxonomy-static-fetch");
  }, [isLoading]);

  return {
    data,
    isLoading,
    isError: error,
    taxonomy: data?.taxonomyTree || [],
    ranges: data?.ranges,
    attributes: data?.attributes,
    totalCount: data?.totalCount || 0,
  };
}

// World-class Reactivity: Fetch dynamic counts separately
export function useClassifiedCount(queryString: string, initialCount: number) {
    const { data, isLoading, isValidating } = useSWR(
        `/api/classifieds/count?${queryString}`,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 500,
            keepPreviousData: true, 
        }
    );

    const isFetching = isLoading || isValidating;

    useEffect(() => {
        setIsLoading(isFetching, "count-fetch");
        return () => setIsLoading(false, "count-fetch");
    }, [isFetching]);

    return {
        count: data?.count ?? initialCount,
        slug: data?.slug ?? null,
        isLoading: isFetching
    };
}

export function getModelsForMake(taxonomy: MakeNode[], makeId: string): ModelNode[] {
  if (!makeId) return [];
  return taxonomy.find((m) => m.v === makeId)?.m || [];
}

export function getVariantsForModel(taxonomy: MakeNode[], makeId: string, modelId: string): TaxonomyOption[] {
  if (!makeId || !modelId) return [];
  const make = taxonomy.find((m) => m.v === makeId);
  return make?.m.find((md) => md.v === modelId)?.vr || [];
}