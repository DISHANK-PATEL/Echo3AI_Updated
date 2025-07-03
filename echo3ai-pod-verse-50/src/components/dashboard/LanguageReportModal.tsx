
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LanguageReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: {
    id: number;
    title: string;
  };
}

interface LanguageIssue {
  id: number;
  phrase: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
}

const LanguageReportModal: React.FC<LanguageReportModalProps> = ({ isOpen, onClose, podcast }) => {
  const [report, setReport] = useState<LanguageIssue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && report.length === 0) {
      fetchLanguageReport();
    }
  }, [isOpen]);

  const fetchLanguageReport = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReport([
        {
          id: 1,
          phrase: "Strong language detected",
          timestamp: "12:34",
          severity: 'medium',
          category: 'Profanity'
        },
        {
          id: 2,
          phrase: "Mild inappropriate content",
          timestamp: "25:18",
          severity: 'low',
          category: 'Content Advisory'
        },
        {
          id: 3,
          phrase: "Potentially offensive term",
          timestamp: "31:42",
          severity: 'high',
          category: 'Language'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Shield className="w-4 h-4 text-green-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500/30 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'low':
        return 'border-green-500/30 bg-green-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[500px] h-[400px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-teal-300">Language Safety Report</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-2">{podcast.title}</p>
        </DialogHeader>

        <div className="mt-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 border border-gray-700 rounded-lg">
                  <Skeleton className="w-4 h-4 bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-gray-700" />
                    <Skeleton className="h-3 w-1/2 bg-gray-700" />
                  </div>
                  <Skeleton className="w-12 h-6 bg-gray-700" />
                </div>
              ))}
            </div>
          ) : report.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-400 mb-2">All Clear!</h3>
              <p className="text-gray-400">No language safety issues detected in this episode.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {report.map((issue) => (
                <div
                  key={issue.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg ${getSeverityColor(issue.severity)}`}
                >
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <p className="font-medium text-white">{issue.phrase}</p>
                    <p className="text-sm text-gray-400">{issue.category}</p>
                  </div>
                  <div className="text-sm font-mono text-teal-300 bg-gray-800 px-2 py-1 rounded">
                    {issue.timestamp}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && report.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400">
            Found {report.length} potential language safety issue{report.length !== 1 ? 's' : ''} in this episode.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LanguageReportModal;
