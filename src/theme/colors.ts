export const colors = {
  background: '#0B0E14',
  surface: '#161A26',
  surfaceRaised: '#1C2232',
  surfaceBorder: '#262C40',
  green: '#00E676',
  greenBackground: '#123A2A',
  primary: '#00E676',
  red: '#FF5252',
  redBackground: '#421F2A',
  amber: '#FFB300',
  amberBackground: '#403216',
  purple: '#7C4DFF',
  slate: '#64748B',
  slateBackground: '#202738',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#262C40',
  white: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;

export const statusPalette = {
  operating: { foreground: colors.green, background: colors.greenBackground },
  stopped: { foreground: colors.red, background: colors.redBackground },
  maintenance: { foreground: colors.amber, background: colors.amberBackground },
  offline: { foreground: colors.slate, background: colors.slateBackground },
} as const;