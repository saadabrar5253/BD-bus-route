import React, { useState } from 'react';
import { X, Flag, CheckCircle2, AlertTriangle } from 'lucide-react';
import { UserReport } from '../types';

interface ReportModalProps {
  targetId: string;
  targetName: string;
  targetType: 'bus' | 'stop' | 'place';
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (report: Omit<UserReport, 'id' | 'created_at' | 'status'>) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  targetId,
  targetName,
  targetType,
  isOpen,
  onClose,
  onSubmitReport,
}) => {
  const [reportType, setReportType] = useState<UserReport['report_type']>('wrong_route');
  const [details, setDetails] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    onSubmitReport({
      report_type: reportType,
      target_id: targetId,
      target_name: targetName,
      target_type: targetType,
      details: details.trim(),
      reporter_name: reporterName.trim() || undefined,
      reporter_contact: reporterContact.trim() || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <Flag className="w-5 h-5" />
            <h3 className="text-lg font-black text-slate-900">
              Report Incorrect Information
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Thank you for reporting!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your feedback for <strong>{targetName}</strong> has been submitted to the verification review system.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <span className="text-xs text-slate-500 font-medium">Reporting item:</span>
              <div className="font-black text-slate-900 text-sm mt-0.5">
                {targetName} ({targetType.toUpperCase()})
              </div>
            </div>

            {/* Issue Category (Specification #24) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                What is the issue?
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as UserReport['report_type'])}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                <option value="wrong_route">Wrong Bus Route / Missing Stops</option>
                <option value="wrong_number">Wrong Bus Number / Operator</option>
                <option value="wrong_stop">Wrong Bus Stop Location</option>
                <option value="wrong_phone">Wrong Emergency or Hospital Phone</option>
                <option value="wrong_location">Wrong GPS Location</option>
                <option value="permanently_closed">Permanently Closed / Discontinued</option>
                <option value="wrong_hours">Wrong Opening Hours</option>
                <option value="duplicate">Duplicate Entry</option>
                <option value="other">Other Issue</option>
              </select>
            </div>

            {/* Details Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Describe the correct information:
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
                rows={3}
                placeholder="Please describe what should be updated (e.g. correct stop sequence, real phone number, road name)..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Optional contact */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block font-medium text-slate-500 mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-500 mb-1">Contact (Optional)</label>
                <input
                  type="text"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  placeholder="e.g. Mobile or Email"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
