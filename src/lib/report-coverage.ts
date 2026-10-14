import type { PropertyData } from '@/types';

export function planningCoverageMessage(coverage: PropertyData['planningCoverage'], kind: 'applications' | 'constraints') {
  const sources = coverage?.sources?.filter(source => source.kind === kind);
  if (!sources?.length) return {
    title: 'Search coverage not verified',
    detail: 'This saved report does not record whether every source responded. An empty section should not be read as confirmation that no records exist. Regenerate the report and check the local authority planning register before relying on it.',
    incomplete: true,
  };
  const incomplete = sources.some(source => source.status !== 'available');
  const failed = sources.filter(source => source.status !== 'available').map(source => source.name).join(', ');
  if (incomplete) return {
    title: kind === 'applications' ? 'Planning application search incomplete' : 'Planning constraint search incomplete',
    detail: `${failed} did not provide a complete result for this report. Any records shown are those successfully retrieved. Check the local authority planning register for a fuller history; do not interpret missing records as no planning activity or restrictions.`,
    incomplete: true,
  };
  return {
    title: kind === 'applications' ? 'No matching applications returned' : 'No matching constraints returned',
    detail: kind === 'applications'
      ? 'The connected sources returned no matching applications within the stated search area and date ranges. Coverage varies by authority and older or unindexed applications may be absent. Check the local authority register for the full property history.'
      : 'No intersecting records were returned from the selected published datasets. Coverage varies by location; this is not confirmation that the property is free of planning restrictions. Confirm relevant designations with the local authority.',
    incomplete: false,
  };
}

export const ENVIRONMENTAL_COVERAGE = {
  radon: {
    title: 'Specialist radon check recommended',
    detail: 'A property-specific radon result is not included in the sources connected to this report. This is a coverage limitation, not a low-risk finding. Check the UKradon map and obtain a property-specific assessment if needed.',
  },
  mining: {
    title: 'Specialist mining check recommended',
    detail: 'A property-specific mining search is not included in this report. No conclusion has been drawn about past workings or mining-related subsidence. Check the official mining search service and obtain a search where relevant.',
  },
  ground: {
    title: 'Specialist ground-stability check recommended',
    detail: 'This report does not include a licensed ground-stability assessment. Geological and subsidence risks have not been determined; discuss any concerns with your surveyor or conveyancer.',
  },
};
