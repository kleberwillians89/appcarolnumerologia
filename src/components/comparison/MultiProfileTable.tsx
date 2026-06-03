import { SavedProfile } from '@/utils/profileStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MultiProfileTableProps {
  profiles: SavedProfile[];
}

export default function MultiProfileTable({ profiles }: MultiProfileTableProps) {
  const numbers = [
    { key: 'soul', label: 'Alma' },
    { key: 'destiny', label: 'Destino' },
    { key: 'dom', label: 'Dom' },
    { key: 'talent', label: 'Talento' },
    { key: 'dream', label: 'Sonho' }
  ];

  return (
    <Card className="bg-slate-800/50 border-yellow-500/20">
      <CardHeader>
        <CardTitle className="text-white">Tabela Comparativa - {profiles.length} Perfis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-yellow-500 font-bold">Número</TableHead>
                {profiles.map(p => (
                  <TableHead key={p.id} className="text-slate-300">{p.profileName}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {numbers.map(num => (
                <TableRow key={num.key} className="border-slate-700">
                  <TableCell className="font-semibold text-white">{num.label}</TableCell>
                  {profiles.map(p => (
                    <TableCell key={p.id} className="text-slate-300">
                      {p.results?.[num.key as keyof typeof p.results] || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
