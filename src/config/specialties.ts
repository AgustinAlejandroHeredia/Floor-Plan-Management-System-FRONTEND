import type { SpecialtyTag } from '@/types/types'

// Not a real trade specialty - the layout/view detector's AEC_speciality
// reuses this config purely so the admin form has one canonical dropdown
// source. Deliberately NOT added to SpecialtyTag itself: that type is used
// exhaustively elsewhere (filterMapping, specialtyTagOptions), and this
// value isn't something a blueprint's own `specialties` field should offer.
export type SpecialtyConfig = {
  tag: SpecialtyTag | 'blueprint_layout_classification'
  label: string      // display label
  aiTag: string      // matches AEC_speciality in models/models.json
  hasModel: boolean  // true when an AI model exists for this specialty
  color: string      // rgba badge background color
}

export const SPECIALTIES: SpecialtyConfig[] = [
  { tag: 'structure',       label: 'Structure',       aiTag: 'Structure',       hasModel: false, color: 'rgba(120, 120, 140, 0.55)' },
  { tag: 'architecture',    label: 'Architecture',    aiTag: 'Architecture',    hasModel: true,  color: 'rgba(59, 130, 246, 0.55)'  },
  { tag: 'cold_water',      label: 'Cold Water',      aiTag: 'Cold Water',      hasModel: false, color: 'rgba(6, 182, 212, 0.55)'   },
  { tag: 'hot_water',       label: 'Hot Water',       aiTag: 'Hot Water',       hasModel: false, color: 'rgba(249, 115, 22, 0.55)'  },
  { tag: 'electrical',      label: 'Electrical',      aiTag: 'Electrical',      hasModel: false, color: 'rgba(234, 179, 8, 0.55)'   },
  { tag: 'gas',             label: 'Gas',             aiTag: 'Gas',             hasModel: false, color: 'rgba(34, 197, 94, 0.55)'   },
  { tag: 'sewerage',        label: 'Sewerage',        aiTag: 'Sewerage',        hasModel: false, color: 'rgba(161, 100, 55, 0.55)'  },
  { tag: 'rainwater',       label: 'Rainwater',       aiTag: 'Rainwater',       hasModel: false, color: 'rgba(20, 184, 166, 0.55)'  },
  { tag: 'notes',           label: 'Notes',           aiTag: 'Notes',           hasModel: false, color: 'rgba(168, 85, 247, 0.55)'  },
  { tag: 'tables',          label: 'Tables',          aiTag: 'Tables',          hasModel: false, color: 'rgba(236, 72, 153, 0.55)'  },
  { tag: 'blueprint_layout_classification',  label: 'Blueprint Layout classification',  aiTag: 'Blueprint Layout classification',  hasModel: true,  color: 'rgba(99, 102, 241, 0.55)'  },
];

export const specialtyByTag = Object.fromEntries(
  SPECIALTIES.map(s => [s.tag, s]),
) as Record<SpecialtyTag, SpecialtyConfig>
