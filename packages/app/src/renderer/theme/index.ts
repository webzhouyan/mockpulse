import { createTheme, Theme, alpha } from '@mui/material/styles';

export type ThemePresetKey = 'modern-indigo' | 'emerald-teal' | 'cyber-purple' | 'sunset-amber' | 'slate-minimal';
export type LayoutDensity = 'compact' | 'comfortable';

export interface ThemePresetOption {
  key: ThemePresetKey;
  nameZh: string;
  nameEn: string;
  primaryLight: string;
  primaryDark: string;
  secondaryLight: string;
  secondaryDark: string;
}

export const THEME_PRESETS: ThemePresetOption[] = [
  {
    key: 'modern-indigo',
    nameZh: '现代极光蓝 (默认)',
    nameEn: 'Modern Indigo (Default)',
    primaryLight: '#2563eb',
    primaryDark: '#3b82f6',
    secondaryLight: '#0ea5e9',
    secondaryDark: '#38bdf8'
  },
  {
    key: 'emerald-teal',
    nameZh: '清透翡翠青',
    nameEn: 'Emerald Teal',
    primaryLight: '#059669',
    primaryDark: '#10b981',
    secondaryLight: '#0d9488',
    secondaryDark: '#14b8a6'
  },
  {
    key: 'cyber-purple',
    nameZh: '赛博霓虹紫',
    nameEn: 'Cyber Purple',
    primaryLight: '#7c3aed',
    primaryDark: '#8b5cf6',
    secondaryLight: '#c026d3',
    secondaryDark: '#d946ef'
  },
  {
    key: 'sunset-amber',
    nameZh: '日落暖金橙',
    nameEn: 'Sunset Amber',
    primaryLight: '#d97706',
    primaryDark: '#f59e0b',
    secondaryLight: '#ea580c',
    secondaryDark: '#f97316'
  },
  {
    key: 'slate-minimal',
    nameZh: '极简石板灰',
    nameEn: 'Slate Minimal',
    primaryLight: '#475569',
    primaryDark: '#94a3b8',
    secondaryLight: '#64748b',
    secondaryDark: '#cbd5e1'
  }
];

export const getAppTheme = (
  mode: 'light' | 'dark',
  presetKey: ThemePresetKey = 'modern-indigo',
  density: LayoutDensity = 'compact'
): Theme => {
  const preset = THEME_PRESETS.find((p) => p.key === presetKey) || THEME_PRESETS[0];
  const isLight = mode === 'light';
  const isCompact = density === 'compact';

  const primaryMain = isLight ? preset.primaryLight : preset.primaryDark;
  const secondaryMain = isLight ? preset.secondaryLight : preset.secondaryDark;

  const bgDefault = isLight ? '#f8fafc' : '#0b0f19';
  const bgPaper = isLight ? '#ffffff' : '#151d2e';
  const borderColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        light: alpha(primaryMain, 0.8),
        dark: alpha(primaryMain, 1.2),
        contrastText: '#ffffff'
      },
      secondary: {
        main: secondaryMain,
        light: alpha(secondaryMain, 0.8),
        dark: alpha(secondaryMain, 1.2),
        contrastText: '#ffffff'
      },
      background: {
        default: bgDefault,
        paper: bgPaper
      },
      divider: borderColor,
      text: {
        primary: isLight ? '#0f172a' : '#f8fafc',
        secondary: isLight ? '#64748b' : '#94a3b8'
      },
      action: {
        hover: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
        selected: isLight ? alpha(primaryMain, 0.08) : alpha(primaryMain, 0.16)
      }
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: isCompact ? 13 : 14,
      button: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: isCompact ? '0.8rem' : '0.875rem'
      },
      body1: {
        fontSize: isCompact ? '0.875rem' : '0.925rem'
      },
      body2: {
        fontSize: isCompact ? '0.8rem' : '0.875rem'
      },
      subtitle1: {
        fontSize: isCompact ? '0.9rem' : '1rem'
      },
      subtitle2: {
        fontSize: isCompact ? '0.8rem' : '0.875rem'
      },
      caption: {
        fontSize: isCompact ? '0.7rem' : '0.75rem'
      }
    },
    shape: {
      borderRadius: isCompact ? 7 : 10
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: bgDefault,
            color: isLight ? '#0f172a' : '#f8fafc'
          },
          '*::-webkit-scrollbar': {
            width: '4px',
            height: '4px'
          },
          '*::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: isLight ? 'rgba(0, 0, 0, 0.16)' : 'rgba(255, 255, 255, 0.18)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: isLight ? 'rgba(0, 0, 0, 0.32)' : 'rgba(255, 255, 255, 0.36)'
            }
          }
        }
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: bgPaper,
            border: `1px solid ${borderColor}`
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: bgPaper,
            borderRadius: isCompact ? 10 : 14,
            border: `1px solid ${borderColor}`,
            boxShadow: isLight
              ? '0 20px 40px rgba(0, 0, 0, 0.1)'
              : '0 20px 40px rgba(0, 0, 0, 0.5)'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: bgPaper,
            borderRadius: isCompact ? 8 : 12,
            border: `1px solid ${borderColor}`
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: isCompact ? 6 : 8,
            padding: isCompact ? '3px 9px' : '6px 14px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none'
            }
          }
        }
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: isCompact ? 38 : 46
          },
          indicator: {
            height: isCompact ? 2 : 3,
            borderRadius: '2px 2px 0 0'
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: isCompact ? 38 : 46,
            padding: isCompact ? '4px 10px' : '8px 16px',
            fontWeight: 500,
            textTransform: 'none',
            fontSize: isCompact ? '0.78rem' : '0.85rem'
          }
        }
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
          variant: 'outlined'
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: isCompact ? 6 : 8,
            backgroundColor: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)',
            '& .MuiOutlinedInput-input': {
              padding: isCompact ? '6px 10px' : '8.5px 14px',
              fontSize: isCompact ? '0.8rem' : '0.875rem'
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: borderColor
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: primaryMain
            }
          }
        }
      },
      MuiSelect: {
        defaultProps: {
          size: 'small'
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: isCompact ? 6 : 8,
            margin: isCompact ? '1px 4px' : '2px 6px',
            padding: isCompact ? '4px 8px' : '8px 12px',
            '&.Mui-selected': {
              backgroundColor: isLight ? alpha(primaryMain, 0.1) : alpha(primaryMain, 0.2),
              '&:hover': {
                backgroundColor: isLight ? alpha(primaryMain, 0.15) : alpha(primaryMain, 0.25)
              }
            }
          }
        }
      }
    }
  });
};
