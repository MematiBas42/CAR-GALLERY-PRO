import { generateTaxonomyData } from "../lib/taxonomy-utils";

async function main() {
  console.log("🌳 Generating Taxonomy Tree JSON...");
  const data = await generateTaxonomyData();
  if (data) {
    console.log("✅ Taxonomy tree generated successfully.");
  } else {
    console.log("⚠️ No live classifieds found, taxonomy might be empty.");
  }
}

main().catch(console.error);