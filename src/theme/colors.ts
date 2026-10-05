export const colors = {
  background: '#0B1320',
  surface: '#162235',
  surfaceRaised: '#1B2B42',
  surfaceBorder: '#26364D',
  green: '#10B981',
  greenBackground: '#064E3B',
  red: '#EF4444',
  redBackground: '#7F1D1D',
  amber: '#F59E0B',
  amberBackground: '#78350F',
  slate: '#64748B',
  slateBackground: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#243247',
  white: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;

export const statusPalette = {
  operating: { foreground: colors.green, background: colors.greenBackground },
  stopped: { foreground: colors.red, background: colors.redBackground },
  maintenance: { foreground: colors.amber, background: colors.amberBackground },
  offline: { foreground: colors.slate, background: colors.slateBackground },
} as const;