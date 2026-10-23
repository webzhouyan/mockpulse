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
  useTheme
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded';
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
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t.settings.title}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Appearance & Themes */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
            <PaletteRoundedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t.settings.appearance}
            </Typography>
          </Box>

          <Box sx={{ pl: 3.2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Light / Dark Mode */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">{t.settings.themeMode}</Typography>
              <RadioGroup
                row
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value as 'light' | 'dark')}
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

            {/* Presets */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">{t.settings.themePreset}</Typography>
              <Select
                size="small"
                value={themePreset}
                onChange={(e) => setThemePreset(e.target.value as ThemePresetKey)}
                sx={{ minWidth: 180 }}
              >
                {THEME_PRESETS.map((preset) => (
                  <MenuItem key={preset.key} value={preset.key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: themeMode === 'light' ? preset.primaryLight : preset.primaryDark
                        }}
                      />
                      <Typography variant="body2">
                        {locale === 'en' ? preset.nameEn : preset.nameZh}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Layout Density */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
            <ViewQuiltRoundedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t.settings.layout}
            </Typography>
          </Box>

          <Box sx={{ pl: 3.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">{t.settings.layout}</Typography>
            <RadioGroup
              row
              value={layoutDensity}
              onChange={(e) => setLayoutDensity(e.target.value as LayoutDensity)}
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

        <Divider />

        {/* Language i18n */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
            <TranslateRoundedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t.settings.language}
            </Typography>
          </Box>

          <Box sx={{ pl: 3.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">{t.settings.language}</Typography>
            <Select
              size="small"
              value={locale}
              onChange={(e) => setLocale(e.target.value as SupportedLocale)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="zh-CN">{t.settings.langZh}</MenuItem>
              <MenuItem value="en">{t.settings.langEn}</MenuItem>
            </Select>
          </Box>
        </Box>

        <Divider />

        {/* Data & Logs */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">{t.settings.maxLogs}</Typography>
            <TextField
              size="small"
              type="number"
              value={settings?.maxLogsPerEnvironment || 100}
              onChange={(e) => updateSettings({ maxLogsPerEnvironment: Number(e.target.value) })}
              sx={{ width: 100 }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">{t.settings.prettyPrint}</Typography>
            <Switch
              size="small"
              checked={!!settings?.storagePrettyPrint}
              onChange={(e) => updateSettings({ storagePrettyPrint: e.target.checked })}
            />
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<FolderOpenRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => apiService.showFolder('storage')}
            sx={{ alignSelf: 'flex-start', mt: 0.5 }}
          >
            {t.settings.storageFolder}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button variant="contained" size="small" onClick={onClose} sx={{ px: 2.5 }}>
          {t.settings.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
