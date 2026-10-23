import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  TextField,
  Switch,
  IconButton,
  alpha,
  useTheme
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import { useApp } from '../../store/AppContext';
import { useI18n, SupportedLocale } from '../../i18n';
import { THEME_PRESETS, ThemePresetKey, LayoutDensity } from '../../theme';
import { apiService } from '../../services/api.service';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { t, locale, setLocale } = useI18n();
  const {
    settings,
    updateSettings,
    themeMode,
    setThemeMode,
    themePreset,
    setThemePreset,
    layoutDensity,
    setLayoutDensity
  } = useApp();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'none',
          boxShadow: '0 24px 48px rgba(0,0,0,0.25)'
        }
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          px: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
          {t.settings.title}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': { color: theme.palette.text.primary }
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3, pt: '24px !important', display: 'flex', flexDirection: 'column', gap: 2.2 }}>
        {/* Appearance & Themes */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
            <PaletteRoundedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
              {t.settings.appearance}
            </Typography>
          </Box>

          <Box sx={{ pl: 3.2, display: 'flex', flexDirection: 'column', gap: 1.4 }}>
            {/* Light / Dark Mode */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {t.settings.themeMode}
              </Typography>
              <Box sx={{ width: 220, display: 'flex', justifyContent: 'flex-end' }}>
                <RadioGroup
                  row
                  value={themeMode}
                  onChange={(e) => setThemeMode(e.target.value as 'light' | 'dark')}
                  sx={{ mr: -0.5 }}
                >
                  <FormControlLabel
                    value="light"
                    control={<Radio size="small" />}
                    label={<Typography variant="body2">{t.settings.modeLight}</Typography>}
                  />
                  <FormControlLabel
                    value="dark"
                    control={<Radio size="small" />}
                    label={<Typography variant="body2">{t.settings.modeDark}</Typography>}
                  />
                </RadioGroup>
              </Box>
            </Box>

            {/* Presets */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {t.settings.themePreset}
              </Typography>
              <Box sx={{ width: 220, display: 'flex', justifyContent: 'flex-end' }}>
                <Select
                  size="small"
                  value={themePreset}
                  onChange={(e) => setThemePreset(e.target.value as ThemePresetKey)}
                  fullWidth
                  sx={{
                    height: 32,
                    fontSize: '0.8rem',
                    borderRadius: 1.5
                  }}
                >
                  {THEME_PRESETS.map((preset) => (
                    <MenuItem key={preset.key} value={preset.key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor:
                              themeMode === 'light' ? preset.primaryLight : preset.primaryDark
                          }}
                        />
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          {locale === 'en' ? preset.nameEn : preset.nameZh}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Layout Density */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
            <ViewQuiltRoundedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
              {t.settings.layout}
            </Typography>
          </Box>

          <Box sx={{ pl: 3.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t.settings.layout}
            </Typography>
            <Box sx={{ width: 220, display: 'flex', justifyContent: 'flex-end' }}>
              <RadioGroup
                row
                value={layoutDensity}
                onChange={(e) => setLayoutDensity(e.target.value as LayoutDensity)}
                sx={{ mr: -0.5 }}
              >
                <FormControlLabel
                  value="compact"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">{t.settings.layoutCompact}</Typography>}
                />
                <FormControlLabel
                  value="comfortable"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">{t.settings.layoutComfortable}</Typography>}
                />
              </RadioGroup>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Language i18n */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
            <TranslateRoundedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
              {t.settings.language}
            </Typography>
          </Box>

          <Box sx={{ pl: 3.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t.settings.language}
            </Typography>
            <Box sx={{ width: 220, display: 'flex', justifyContent: 'flex-end' }}>
              <Select
                size="small"
                value={locale}
                onChange={(e) => setLocale(e.target.value as SupportedLocale)}
                fullWidth
                sx={{
                  height: 32,
                  fontSize: '0.8rem',
                  borderRadius: 1.5
                }}
              >
                <MenuItem value="zh-CN" sx={{ fontSize: '0.8rem' }}>
                  {t.settings.langZh}
                </MenuItem>
                <MenuItem value="en" sx={{ fontSize: '0.8rem' }}>
                  {t.settings.langEn}
                </MenuItem>
              </Select>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Storage & Logs */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
            <StorageRoundedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
              {t.settings.storageAndLogs || '存储与日志'}
            </Typography>
          </Box>

          <Box sx={{ pl: 3.2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {t.settings.maxLogs}
              </Typography>
              <Box sx={{ width: 220, display: 'flex', justifyContent: 'flex-end' }}>
                <TextField
                  size="small"
                  type="number"
                  value={settings?.maxLogsPerEnvironment || 100}
                  onChange={(e) => updateSettings({ maxLogsPerEnvironment: Number(e.target.value) })}
                  InputProps={{
                    sx: { height: 32, fontSize: '0.8rem', borderRadius: 1.5 }
                  }}
                  sx={{ width: 120 }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {t.settings.prettyPrint}
              </Typography>
              <Box sx={{ width: 220, display: 'flex', justifyContent: 'flex-end' }}>
                <Switch
                  size="small"
                  checked={!!settings?.storagePrettyPrint}
                  onChange={(e) => updateSettings({ storagePrettyPrint: e.target.checked })}
                />
              </Box>
            </Box>

            {/* Storage directory entry button */}
            <Box sx={{ mt: 0.5 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FolderOpenRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => apiService.showFolder('storage')}
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  px: 1.8,
                  py: 0.6,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  backgroundColor: alpha(theme.palette.text.primary, 0.03),
                  '&:hover': {
                    borderColor: theme.palette.text.secondary,
                    backgroundColor: alpha(theme.palette.text.primary, 0.07)
                  }
                }}
              >
                {t.settings.storageFolder}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 1.5,
          px: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
          justifyContent: 'flex-end'
        }}
      >
        <Button
          variant="contained"
          size="medium"
          onClick={onClose}
          disableElevation
          sx={{
            px: 3.2,
            py: 0.65,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.82rem',
            fontWeight: 600,
            backgroundColor: theme.palette.primary.main,
            color: '#ffffff',
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.28)}`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
              transform: 'translateY(-1px)'
            },
            '&:active': {
              transform: 'translateY(0)'
            }
          }}
        >
          {t.settings.close || '关闭'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
