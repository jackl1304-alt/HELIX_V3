import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Clock, Plus, Search, AlertCircle, TrendingUp,
  FileText, BarChart3, Target, CheckCircle,
} from "@/components/icons";
import { CaseCard } from '@/components/case/CaseCard';
import {
  normalizeOngoingApproval,
  statusTone,
  toneStyle,
  type AnyRecord,
} from '@/lib/caseNormalize';
import { cn } from '@/lib/utils';

interface OngoingApproval {
  id: string;
  productName: string;
  company: string;
  region: string;
  regulatoryBody: string;
  submissionDate: string;
  expectedApproval: string;
  currentPhase: string;
  deviceClass: string;
  status: 'submitted' | 'under-review' | 'pending-response' | 'nearly-approved' | 'approved' | 'rejected';
  progressPercentage: number;
  estimatedCosts: string;
  contactPerson: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export default function LaufendeZulassungen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newApproval, setNewApproval] = useState<Partial<OngoingApproval>>({
    status: 'submitted',
    priority: 'medium',
    progressPercentage: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['ongoing-approvals'],
    queryFn: async (): Promise<OngoingApproval[]> => {
      const response = await fetch('/api/ongoing-approvals');
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`Failed to fetch ongoing approvals: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const createApprovalMutation = useMutation({
    mutationFn: async (approval: Omit<OngoingApproval, 'id'>) => {
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approval),
      });
      if (!response.ok) throw new Error('Failed to create approval');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ongoing-approvals'] });
      setIsCreating(false);
      setNewApproval({ status: 'submitted', priority: 'medium', progressPercentage: 0 });
      toast({
        title: "✅ Zulassung hinzugefügt",
        description: "Der neue Zulassungsprozess wurde erfolgreich erfasst.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Fehler",
        description: "Zulassung konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const filteredApprovals = approvals.filter((approval) => {
    const matchesSearch =
      approval.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.regulatoryBody.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || approval.status === selectedStatus;
    const matchesRegion = selectedRegion === 'all' || approval.region === selectedRegion;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const getStatusBadge = (status: OngoingApproval['status']) => {
    const t = toneStyle(statusTone(status));
    return (
      <Badge className={cn('border', t.bg, t.text, t.border)}>
        {String(status).replace(/-/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: OngoingApproval['priority']) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-700',
    } as const;
    return (
      <Badge className={cn('border-0', colors[priority] ?? colors.medium)}>
        {String(priority).toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalCount = approvals.length;
  const nearlyApprovedCount = approvals.filter((a) => a.status === 'nearly-approved').length;
  const criticalCount = approvals.filter((a) => a.priority === 'critical').length;
  const avgProgress =
    approvals.length > 0
      ? Math.round(approvals.reduce((s, a) => s + a.progressPercentage, 0) / approvals.length)
      : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 via-teal-600 to-blue-700 rounded-2xl shadow-lg">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Laufende Zulassungen</h1>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {filteredApprovals.length} Aktive Projekte
              </div>
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-semibold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Live Tracking
              </div>
              <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-xl text-sm font-semibold flex items-center gap-1">
                <Target className="w-4 h-4" />
                Meilenstein-Management
              </div>
            </div>
            <p className="text-gray-600 text-lg">
              Klickbare Tabs pro Verfahren — Übersicht, Verlauf, Dokumente, Quellen & Aktionen
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
              <div className="text-3xl font-bold text-green-600">{avgProgress}%</div>
              <div className="text-sm text-green-600 font-medium">Ø Fortschritt</div>
            </div>
            <div className="text-right bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
              <div className="text-sm text-blue-600 font-medium">Gesamt Projekte</div>
            </div>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg px-6 py-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Neue Zulassung starten
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neuen Zulassungsprozess erfassen</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Produktname"
                  value={newApproval.productName || ''}
                  onChange={(e) => setNewApproval((prev) => ({ ...prev, productName: e.target.value }))}
                />
                <Input
                  placeholder="Unternehmen"
                  value={newApproval.company || ''}
                  onChange={(e) => setNewApproval((prev) => ({ ...prev, company: e.target.value }))}
                />
                <Select
                  value={newApproval.region || ''}
                  onValueChange={(value) => setNewApproval((prev) => ({ ...prev, region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="EU">EU</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                    <SelectItem value="Canada">Kanada</SelectItem>
                    <SelectItem value="Brazil">Brasilien</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Zulassungsbehörde"
                  value={newApproval.regulatoryBody || ''}
                  onChange={(e) => setNewApproval((prev) => ({ ...prev, regulatoryBody: e.target.value }))}
                />
                <Input
                  type="date"
                  placeholder="Eingereicht am"
                  value={newApproval.submissionDate || ''}
                  onChange={(e) => setNewApproval((prev) => ({ ...prev, submissionDate: e.target.value }))}
                />
                <Input
                  type="date"
                  placeholder="Erwartete Genehmigung"
                  value={newApproval.expectedApproval || ''}
                  onChange={(e) => setNewApproval((prev) => ({ ...prev, expectedApproval: e.target.value }))}
                />
                <Input
                  placeholder="Produktklasse"
                  value={newApproval.deviceClass || ''}
                  onChange={(e) => setNewApproval((prev) => ({ ...prev, deviceClass: e.target.value }))}
                />
                <Input
                  placeholder="Geschätzte Kosten"
                  value={newApproval.estimatedCosts || ''}
                  onChange={(e) => setNewApproval((prev) => ({ ...prev, estimatedCosts: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Abbrechen
                </Button>
                <Button
                  onClick={() => createApprovalMutation.mutate(newApproval as Omit<OngoingApproval, 'id'>)}
                  disabled={createApprovalMutation.isPending || !newApproval.productName}
                >
                  Zulassung erfassen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aktive Prozesse</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Fast genehmigt</p>
                <p className="text-2xl font-bold text-green-600">{nearlyApprovedCount}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Kritische Priorität</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ø Fortschritt</p>
                <p className="text-2xl font-bold text-purple-600">{avgProgress}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="pending-response">Pending Response</SelectItem>
                <SelectItem value="nearly-approved">Nearly Approved</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Regionen</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="EU">EU</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="China">China</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approvals list — each item is a CaseCard with sticky header + 5 tabs */}
      <div className="space-y-4">
        {filteredApprovals.map((approval) => (
          <CaseCard
            key={approval.id}
            data={normalizeOngoingApproval(approval as AnyRecord)}
          />
        ))}
      </div>

      {filteredApprovals.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Keine laufenden Zulassungen</h2>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedStatus !== 'all' || selectedRegion !== 'all'
                  ? 'Keine Zulassungen entsprechen den aktuellen Filtern.'
                  : 'Aktuell sind keine Zulassungsprozesse erfasst.'}
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Erste Zulassung erfassen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden screen-reader status summary */}
      <span className="sr-only" aria-live="polite">
        {filteredApprovals.map((a) => (
          <React.Fragment key={a.id}>
            {getStatusBadge(a.status)} {getPriorityBadge(a.priority)} {a.productName}.{' '}
          </React.Fragment>
        ))}
      </span>
    </div>
  );
}
