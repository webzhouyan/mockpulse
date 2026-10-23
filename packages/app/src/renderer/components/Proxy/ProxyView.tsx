import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import MultipleStopRoundedIcon from '@mui/icons-material/MultipleStopRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Header } from '@mockoon/commons';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';

export const ProxyView: React.FC = () => {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const { activeEnvironment, updateActiveEnvironment, layoutDensity } = useApp();
  const isCompact = layoutDensity === 'compact';

  if (!activeEnvironment) return null;

  const reqHeaders: Header[] = activeEnvironment.proxyReqHeaders || [];
  const resHeaders: Header[] = activeEnvironment.proxyResHeaders || [];

  const handleAddReqHeader = () => {
    updateActiveEnvironment((env) => ({
      ...env,
      proxyReqHeaders: [...(env.proxyReqHeaders || []), { key: '', value: '' }]
    }));
  };

  const handleUpdateReqHeader = (index: number, key: string, value: string) => {
    updateActiveEnvironment((env) => ({
      ...env,
      proxyReqHeaders: (env.proxyReqHeaders || []).map((h, i) =>
        i === index ? { key, value } : h
      )
    }));
  };

  const handleDeleteReqHeader = (index: number) => {
    updateActiveEnvironment((env) => ({
      ...env,
      proxyReqHeaders: (env.proxyReqHeaders || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddResHeader = () => {
    updateActiveEnvironment((env) => ({
      ...env,
      proxyResHeaders: [...(env.proxyResHeaders || []), { key: '', value: '' }]
    }));
  };

  const handleUpdateResHeader = (index: number, key: string, value: string) => {
    updateActiveEnvironment((env) => ({
      ...env,
      proxyResHeaders: (env.proxyResHeaders || []).map((h, i) =>
        i === index ? { key, value } : h
      )
    }));
  };

  const handleDeleteResHeader = (index: number) => {
    updateActiveEnvironment((env) => ({
      ...env,
      proxyResHeaders: (env.proxyResHeaders || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        p: isCompact ? 2.5 : 4
      }}
    >
      <Box sx={{ maxWidth: 840, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MultipleStopRoundedIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t.proxy.title}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
            {t.proxy.subtitle}
          </Typography>
        </Box>

        {/* Proxy Server Config */}
        <Paper variant="outlined" sx={{ p: isCompact ? 2.5 : 3, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormControlLabel
            sx={{ ml: 0 }}
            control={
              <Switch
                checked={!!activeEnvironment.proxyMode}
                onChange={(e) => {
                  const proxyMode = e.target.checked;
                  updateActiveEnvironment((env) => ({ ...env, proxyMode }));
                }}
                sx={{ mr: 1 }}
              />
            }
            label={
              <Typography sx={{ fontWeight: 600 }}>
                {t.proxy.enableProxy || '启用代理转发模式'}
              </Typography>
            }
          />

          <Box>
            <TextField
              fullWidth
              size="small"
              label={t.proxy.proxyHost || '目标服务器地址'}
              placeholder="https://api.example.com"
              disabled={!activeEnvironment.proxyMode}
              value={activeEnvironment.proxyHost || ''}
              onChange={(e) => {
                const proxyHost = e.target.value;
                updateActiveEnvironment((env) => ({ ...env, proxyHost }));
              }}
              InputProps={{
                sx: { fontFamily: "'Fira Code', monospace", fontSize: '0.85rem', borderRadius: 1.5 }
              }}
            />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block' }}>
              {locale === 'zh-CN'
                ? '当收到客户端请求且本环境未定义匹配的 Mock 接口时，服务将请求透明转发至该目标 URL。'
                : 'Unmatched requests will be forwarded to this target host.'}
            </Typography>
          </Box>

          <FormControlLabel
            sx={{ ml: 0 }}
            control={
              <Switch
                disabled={!activeEnvironment.proxyMode}
                checked={!!activeEnvironment.proxyRemovePrefix}
                onChange={(e) => {
                  const proxyRemovePrefix = e.target.checked;
                  updateActiveEnvironment((env) => ({ ...env, proxyRemovePrefix }));
                }}
                sx={{ mr: 1 }}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t.proxy.removePrefix || '转发时剔除环境前缀 (Remove Prefix)'}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {locale === 'zh-CN'
                    ? '若开启，在向上游目标服务器转发请求时将自动去除当前环境设置的 endpointPrefix 前缀。'
                    : 'Remove environment endpoint prefix when forwarding.'}
                </Typography>
              </Box>
            }
          />
        </Paper>

        {/* Proxy Request Headers */}
        <Paper variant="outlined" sx={{ p: isCompact ? 2.5 : 3, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowForwardRoundedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {locale === 'zh-CN' ? '代理请求头 (Proxy Request Headers)' : 'Proxy Request Headers'}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              disabled={!activeEnvironment.proxyMode}
              startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={handleAddReqHeader}
              sx={{ fontSize: '0.75rem', py: 0.3, textTransform: 'none', borderRadius: 1.5 }}
            >
              {locale === 'zh-CN' ? '添加代理请求头' : 'Add Request Header'}
            </Button>
          </Box>

          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {locale === 'zh-CN'
              ? '在向上游目标服务器发起代理请求时自动附加的 Headers（如 Authorization、Host 等）。'
              : 'Headers added to proxied requests sent to the upstream target.'}
          </Typography>

          <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 1.5 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: alpha(theme.palette.text.primary, 0.03) }}>
                <TableRow>
                  <TableCell sx={{ width: '45%', fontWeight: 700, fontSize: '0.75rem', py: 0.8 }}>
                    {locale === 'zh-CN' ? '键名 (Header)' : 'Header'}
                  </TableCell>
                  <TableCell sx={{ width: '45%', fontWeight: 700, fontSize: '0.75rem', py: 0.8 }}>
                    {locale === 'zh-CN' ? '键值 (Value)' : 'Value'}
                  </TableCell>
                  <TableCell align="center" sx={{ width: '10%', py: 0.8 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {reqHeaders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 2, color: theme.palette.text.disabled, fontSize: '0.75rem' }}>
                      {locale === 'zh-CN' ? '暂未添加任何代理请求头' : 'No proxy request headers configured'}
                    </TableCell>
                  </TableRow>
                ) : (
                  reqHeaders.map((header, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ py: 0.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          disabled={!activeEnvironment.proxyMode}
                          placeholder="Header Name"
                          value={header.key}
                          onChange={(e) => handleUpdateReqHeader(idx, e.target.value, header.value)}
                          InputProps={{ sx: { height: 28, fontSize: '0.78rem', fontFamily: "'Fira Code', monospace" } }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          disabled={!activeEnvironment.proxyMode}
                          placeholder="Header Value"
                          value={header.value}
                          onChange={(e) => handleUpdateReqHeader(idx, header.key, e.target.value)}
                          InputProps={{ sx: { height: 28, fontSize: '0.78rem', fontFamily: "'Fira Code', monospace" } }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 0.5 }}>
                        <IconButton
                          size="small"
                          disabled={!activeEnvironment.proxyMode}
                          onClick={() => handleDeleteReqHeader(idx)}
                          sx={{ '&:hover': { color: theme.palette.error.main } }}
                        >
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Paper>

        {/* Proxy Response Headers */}
        <Paper variant="outlined" sx={{ p: isCompact ? 2.5 : 3, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowBackRoundedIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {locale === 'zh-CN' ? '代理响应头 (Proxy Response Headers)' : 'Proxy Response Headers'}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              disabled={!activeEnvironment.proxyMode}
              startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={handleAddResHeader}
              sx={{ fontSize: '0.75rem', py: 0.3, textTransform: 'none', borderRadius: 1.5 }}
            >
              {locale === 'zh-CN' ? '添加代理响应头' : 'Add Response Header'}
            </Button>
          </Box>

          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {locale === 'zh-CN'
              ? '向上游服务器获取响应并返回给客户端时自动附加或覆盖的 Headers。'
              : 'Headers added to proxied responses returned to the client.'}
          </Typography>

          <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 1.5 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: alpha(theme.palette.text.primary, 0.03) }}>
                <TableRow>
                  <TableCell sx={{ width: '45%', fontWeight: 700, fontSize: '0.75rem', py: 0.8 }}>
                    {locale === 'zh-CN' ? '键名 (Header)' : 'Header'}
                  </TableCell>
                  <TableCell sx={{ width: '45%', fontWeight: 700, fontSize: '0.75rem', py: 0.8 }}>
                    {locale === 'zh-CN' ? '键值 (Value)' : 'Value'}
                  </TableCell>
                  <TableCell align="center" sx={{ width: '10%', py: 0.8 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {resHeaders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 2, color: theme.palette.text.disabled, fontSize: '0.75rem' }}>
                      {locale === 'zh-CN' ? '暂未添加任何代理响应头' : 'No proxy response headers configured'}
                    </TableCell>
                  </TableRow>
                ) : (
                  resHeaders.map((header, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ py: 0.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          disabled={!activeEnvironment.proxyMode}
                          placeholder="Header Name"
                          value={header.key}
                          onChange={(e) => handleUpdateResHeader(idx, e.target.value, header.value)}
                          InputProps={{ sx: { height: 28, fontSize: '0.78rem', fontFamily: "'Fira Code', monospace" } }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          disabled={!activeEnvironment.proxyMode}
                          placeholder="Header Value"
                          value={header.value}
                          onChange={(e) => handleUpdateResHeader(idx, header.key, e.target.value)}
                          InputProps={{ sx: { height: 28, fontSize: '0.78rem', fontFamily: "'Fira Code', monospace" } }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 0.5 }}>
                        <IconButton
                          size="small"
                          disabled={!activeEnvironment.proxyMode}
                          onClick={() => handleDeleteResHeader(idx)}
                          sx={{ '&:hover': { color: theme.palette.error.main } }}
                        >
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Paper>
      </Box>
    </Box>
  );
};

