"use client";

import { SidebarProps } from "../inventory/sidebar";
import { parseAsString, useQueryStates } from "nuqs";
import TaxonomyFilters from "../inventory/TaxonomyFilters";
import { RangeFilter } from "../inventory/RangeFilters";

interface HomepageTaxonomyFiltersProps extends SidebarProps {}
const HomepageTaxonomyFilters = ({
  searchParams,
  minMaxValue,
}: HomepageTaxonomyFiltersProps) => {
  const { _min, _max } = minMaxValue;
  const [, setState] = useQueryStates(
    {
      make: parseAsString.withDefault(""),
      model: parseAsString.withDefault(""),
      modelVariant: parseAsString.withDefault(""),
      minYear: parseAsString.withDefault(""),
      maxYear: parseAsString.withDefault(""),
      minPrice: parseAsString.withDefault(""),
      maxPrice: parseAsString.withDefault(""),
    },
    { shallow: false }
  );

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    switch (name) {
      case "make":
        await setState({ make: value, model: null, modelVariant: null });
        break;
      case "model":
        await setState({ model: value, modelVariant: null });
        break;
      default:
        await setState({ [name]: value });
    }
  };

  return (
    <div>
      <TaxonomyFilters
        searchParams={searchParams}
        handleChange={handleChange}
      />
      <RangeFilter
        label="Year"
        minName="minYear"
        maxName="maxYear"
        defaultMin={_min.year || 1925}
        defaultMax={_max.year || new Date().getFullYear()}
        handleChange={handleChange}
        searchParams={searchParams}
      />
      <RangeFilter
        label="Price"
        minName="minPrice"
        maxName="maxPrice"
        defaultMin={_min.price || 0}
        defaultMax={_max.price || 21474836}
        handleChange={handleChange}
        searchParams={searchParams}
        increment={1000000}
        thousandSeparator
        currency={{
          currencyCode: "EUR",
        }}
      />
    </div>
  );
};

export default HomepageTaxonomyFilters;
