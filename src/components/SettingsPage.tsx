import React, { useEffect, useState } from 'react';
import { Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { enableGoogleSheetsSync, enableWhatsappMock, hasSupabaseConfig } from '@/config/env';
import { appSettingsService } from '@/services/appSettingsService';
import { premiumClasses } from '@/config/premiumClasses';

export const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [googleSheetsEnabled, setGoogleSheetsEnabled] = useState(enableGoogleSheetsSync);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [savedWebhookUrl, savedGoogleSheetsEnabled, savedWhatsappEnabled] = await Promise.all([
          appSettingsService.getSetting<string>('google_sheets_webhook_url'),
          appSettingsService.getSetting<boolean>('enable_google_sheets_sync'),
          appSettingsService.getSetting<boolean>('whatsapp_enabled'),
        ]);
        setWebhookUrl(savedWebhookUrl || '');
        setGoogleSheetsEnabled(savedGoogleSheetsEnabled ?? enableGoogleSheetsSync);
        setWhatsappEnabled(savedWhatsappEnabled ?? true);
      } catch (error) {
        toast({
          title: 'Não foi possível carregar configurações',
          description: error instanceof Error ? error.message : 'Tente novamente.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    await appSettingsService.saveSetting('google_sheets_webhook_url', webhookUrl);
    await appSettingsService.saveSetting('enable_google_sheets_sync', googleSheetsEnabled);
    await appSettingsService.saveSetting('whatsapp_enabled', whatsappEnabled);
    setSaving(false);

    toast({
      title: 'Configurações salvas',
      description: 'As preferências da plataforma foram atualizadas.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[#C9A96E] text-sm font-semibold tracking-[0.2em]">ADMIN</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">Configurações</h2>
        <p className={`${premiumClasses.muted} mt-2 max-w-2xl`}>Integrações preparadas para produção, sem tokens sensíveis no frontend.</p>
      </div>

      <Card className={premiumClasses.card}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="w-5 h-5 text-[#C9A96E]" />
            Integrações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {!hasSupabaseConfig && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-100">
              Supabase ainda não está configurado. As configurações serão mantidas localmente em modo de preparação.
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="settings-webhook" className={premiumClasses.label}>URL do Webhook Google Sheets</Label>
            <Input
              id="settings-webhook"
              value={webhookUrl}
              onChange={(event) => setWebhookUrl(event.target.value)}
              placeholder="https://script.google.com/macros/s/SEU_SCRIPT_ID/exec"
              className={premiumClasses.input}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-[#F8F5EF]/15 bg-[#070D1D]/70 p-4">
            <div>
              <p className="font-medium text-white">Ativar envio para Google Sheets</p>
              <p className={`text-sm ${premiumClasses.muted}`}>
                {enableGoogleSheetsSync ? 'Integração pronta para POST real quando houver URL.' : 'Integração desativada por ambiente.'}
              </p>
            </div>
            <Switch checked={googleSheetsEnabled} onCheckedChange={setGoogleSheetsEnabled} disabled={loading} />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-[#F8F5EF]/15 bg-[#070D1D]/70 p-4">
            <div>
              <p className="font-medium text-white">Status WhatsApp API</p>
              <p className={`text-sm ${premiumClasses.muted}`}>
                {enableWhatsappMock ? 'Mock ativo no frontend. API real deve ser feita por backend seguro.' : 'Mock desligado. Abertura manual por wa.me preparada.'}
              </p>
            </div>
            <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} disabled={loading} />
          </div>

          <Button onClick={handleSave} disabled={saving || loading} className={premiumClasses.primaryButton}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : loading ? 'Carregando...' : 'Salvar configurações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
