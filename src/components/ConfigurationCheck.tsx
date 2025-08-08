'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export function ConfigurationCheck() {
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="h-6 w-6" />
            Konfiguration erforderlich
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Willkommen bei CommuniTrack! Um zu beginnen, müssen Sie zunächst Ihre Supabase-Konfiguration einrichten.
            </p>

            <div className="bg-muted p-4 rounded-md space-y-3">
              <h3 className="font-semibold text-sm">Schritt-für-Schritt Anleitung:</h3>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>
                  Gehen Sie zu{' '}
                  <a 
                    href="https://supabase.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    supabase.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Erstellen Sie ein neues Projekt oder wählen Sie ein bestehendes aus</li>
                <li>Gehen Sie zu <strong>Settings → API</strong></li>
                <li>Kopieren Sie die <strong>Project URL</strong> und den <strong>anon/public key</strong></li>
                <li>Erstellen Sie eine <code className="bg-background px-1 rounded">.env.local</code> Datei im Projektverzeichnis</li>
                <li>Führen Sie das SQL-Schema aus <code className="bg-background px-1 rounded">supabase_schema.sql</code> aus</li>
                <li>Erstellen Sie einen Storage Bucket namens "attachments"</li>
              </ol>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Inhalt für .env.local:</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(envContent, 'env')}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-3 w-3" />
                  {copied === 'env' ? 'Kopiert!' : 'Kopieren'}
                </Button>
              </div>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{envContent}
              </pre>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>💡 Tipp:</strong> Nach der Konfiguration startet die Anwendung automatisch neu und Sie können sich registrieren oder anmelden.
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-3 rounded-md">
              <p className="text-sm text-orange-800">
                <strong>⚠️ Wichtig:</strong> Vergessen Sie nicht, das SQL-Schema zu importieren und den Storage Bucket zu erstellen, damit alle Funktionen ordnungsgemäß funktionieren.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
