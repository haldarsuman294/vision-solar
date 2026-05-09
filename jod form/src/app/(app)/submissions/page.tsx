'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) setSubmissions(await res.json());
      } catch (e) { console.error(e); }
    }
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter(s => 
    s.formTitle.toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(s.data).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Submissions</h1>
          <p className="text-mid-gray mt-1">Review and manage all incoming form responses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-light-gray shadow-sm">
        <CardHeader className="pb-3 border-b border-light-gray/50">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mid-gray" />
              <Input 
                placeholder="Search by form name or content..." 
                className="pl-9 bg-off-white/50 border-light-gray/80 focus:bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-mid-gray font-medium">
              Showing {filtered.length} submissions
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-off-white/50">
              <TableRow>
                <TableHead className="font-bold text-charcoal py-4">Form Name</TableHead>
                <TableHead className="font-bold text-charcoal py-4">Response Preview</TableHead>
                <TableHead className="font-bold text-charcoal py-4">Date Submitted</TableHead>
                <TableHead className="font-bold text-charcoal py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-mid-gray">
                    No submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sub) => (
                  <TableRow key={sub.id} className="group hover:bg-vision-green/[0.02] transition-colors">
                    <TableCell className="font-semibold text-charcoal">
                      {sub.formTitle}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(sub.data).slice(0, 2).map(([k, v]: any) => (
                          <Badge key={k} variant="secondary" className="bg-light-gray/40 text-charcoal font-normal text-[10px]">
                            <span className="font-bold mr-1">{k}:</span> {String(v)}
                          </Badge>
                        ))}
                        {Object.keys(sub.data).length > 2 && (
                          <span className="text-[10px] text-mid-gray">+{Object.keys(sub.data).length - 2} more</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-dark-gray text-sm">
                      {new Date(sub.submittedAt).toLocaleDateString()} at {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-mid-gray hover:text-charcoal">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
