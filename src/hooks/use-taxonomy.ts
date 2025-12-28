import useSWR from "swr";

export interface TaxonomyOption {
  v: string; // value
  l: string; // label
}

export interface ModelNode extends TaxonomyOption {
  vr: TaxonomyOption[]; // variants
}

export interface MakeNode extends TaxonomyOption {
  m: ModelNode[]; // models
}

export interface TaxonomyData {
  taxonomyTree: MakeNode[];
  ranges: {
    year: { min: number; max: number };
    price: { min: number; max: number };
    odoReading: { min: number; max: number };
  };
  attributes: {
    fuelType: string[];
    transmission: string[];
    bodyType: string[];
    colour: string[];
    ulezCompliance: string[];
    odoUnit: string[];
    currency: string[];
    doors: number[];
    seats: number[];
  };
  totalCount: number;
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTaxonomy() {
  const { data, error, isLoading } = useSWR<TaxonomyData>("/api/taxonomy", fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: true,
    dedupingInterval: 60000, 
  });

  const taxonomy = data?.taxonomyTree || [];

  return {
    data,
    isLoading,
    isError: error,
    taxonomy,
    ranges: data?.ranges,
    attributes: data?.attributes,
    totalCount: data?.totalCount || 0,
    getModels: (makeId: string) => getModelsForMake(taxonomy, makeId),
    getVariants: (makeId: string, modelId: string) => getVariantsForModel(taxonomy, makeId, modelId)
  };
}

export function getModelsForMake(taxonomy: MakeNode[], makeId: string): ModelNode[] {
  if (!makeId) return [];
  const make = taxonomy.find((m) => m.v === makeId);
  return make ? make.m : [];
}

export function getVariantsForModel(taxonomy: MakeNode[], makeId: string, modelId: string): TaxonomyOption[] {
  if (!makeId || !modelId) return [];
  const make = taxonomy.find((m) => m.v === makeId);
  const model = make?.m.find((md) => md.v === modelId);
  return model ? model.vr : [];
}
