import React, { useState, useMemo } from 'react';
import { useEvents } from '../../context/EventContext';
import {
  BudgetCategory,
  BudgetItem,
  PaymentStatus,
  BudgetEstimatorInput,
  BudgetEstimateBreakdown,
  DecorStyle,
  FoodPreference,
  VenueType,
  PriceVerificationStatus,
  PricingUnit,
} from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { calculateRealWorldBudget, generateComparisonTiers } from '../../utils/budgetEngine';

interface BudgetViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateToVenues?: () => void;
}

const CITIES = [
  'Hyderabad',
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Ahmedabad',
  'Jaipur',
  'Chennai',
  'Pune',
];

const LOCALITIES_MAP: Record<string, string[]> = {
  Hyderabad: ['Gachibowli', 'Madhapur', 'Banjara Hills', 'Jubilee Hills', 'Hitec City', 'Secunderabad', 'Raidurg', 'Shamshabad'],
  Bengaluru: ['Sadashivnagar', 'Indiranagar', 'Koramangala', 'Whitefield', 'Old Airport Road', 'Jayanagar'],
  Mumbai: ['Bandra West', 'Juhu', 'Vile Parle East', 'Worli', 'Andheri West'],
  Delhi: ['Vasant Kunj', 'South Extension', 'Chanakyapuri', 'Connaught Place'],
  Ahmedabad: ['Bodakdev', 'SG Highway', 'Sindhu Bhavan', 'Satellite'],
};

export const BudgetView: React.FC<BudgetViewProps> = ({ onShowToast, onNavigateToVenues }) => {
  const {
    activeEvent,
    budgetItems,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    applyBudgetEstimate,
    totalBudget,
    actualSpent,
    remainingBudget,
    formatCurrency,
  } = useEvents();

  // Active view tab: 'items' | 'estimator' | 'compare' | 'export'
  const [activeSubTab, setActiveSubTab] = useState<'items' | 'estimator' | 'compare' | 'export'>('items');

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null);

  // Estimator Form State
  const initialCity = activeEvent?.city?.includes('Hyderabad')
    ? 'Hyderabad'
    : activeEvent?.city?.includes('Bengaluru')
    ? 'Bengaluru'
    : activeEvent?.city?.includes('Mumbai')
    ? 'Mumbai'
    : activeEvent?.city?.includes('Delhi')
    ? 'Delhi'
    : activeEvent?.city?.includes('Ahmedabad')
    ? 'Ahmedabad'
    : 'Hyderabad';

  const [estCity, setEstCity] = useState<string>(initialCity);
  const [estLocality, setEstLocality] = useState<string>('Gachibowli');
  const [estEventType, setEstEventType] = useState<string>(activeEvent?.type || activeEvent?.eventType || 'Wedding');
  const [estGuestCount, setEstGuestCount] = useState<number>(activeEvent?.guestCount || 100);
  const [estVenueType, setEstVenueType] = useState<VenueType>('banquet_hall');
  const [estFoodPref, setEstFoodPref] = useState<FoodPreference>('both');
  const [estDecorStyle, setEstDecorStyle] = useState<DecorStyle>('standard');
  const [estServices, setEstServices] = useState<string[]>([
    'catering',
    'decoration',
    'photography',
    'entertainment',
    'cake',
  ]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeEstimate, setActiveEstimate] = useState<BudgetEstimateBreakdown | null>(() => {
    return calculateRealWorldBudget({
      eventType: activeEvent?.type || 'Wedding',
      city: initialCity,
      locality: 'Gachibowli',
      eventDate: activeEvent?.date || '',
      guestCount: activeEvent?.guestCount || 100,
      venueType: 'banquet_hall',
      foodPreference: 'both',
      decorStyle: 'standard',
      requiredServices: ['catering', 'decoration', 'photography', 'entertainment', 'cake'],
    });
  });

  // 4 Tiers Comparison State
  const comparisonTiers = useMemo(() => {
    return generateComparisonTiers({
      eventType: estEventType,
      city: estCity,
      locality: estLocality,
      eventDate: activeEvent?.date || '',
      guestCount: estGuestCount,
      venueType: estVenueType,
      foodPreference: estFoodPref,
      decorStyle: estDecorStyle,
      requiredServices: estServices,
    });
  }, [estEventType, estCity, estLocality, activeEvent?.date, estGuestCount, estVenueType, estFoodPref, estDecorStyle, estServices]);

  // Form states for manual / user-quotation expense entry
  const [formCategory, setFormCategory] = useState<BudgetCategory>('Catering');
  const [formName, setFormName] = useState('');
  const [formPlanned, setFormPlanned] = useState<number>(50000);
  const [formActual, setFormActual] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<PaymentStatus>('Pending');
  const [formUnit, setFormUnit] = useState<PricingUnit>('fixed');
  const [formUnitPrice, setFormUnitPrice] = useState<number>(50000);
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formVerification, setFormVerification] = useState<PriceVerificationStatus>('user_provided');
  const [formProviderName, setFormProviderName] = useState('');
  const [formSourceUrl, setFormSourceUrl] = useState('');
  const [formIsDeposit, setFormIsDeposit] = useState(false);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const categories: BudgetCategory[] = [
    'Venue',
    'Catering',
    'Decoration',
    'Photography',
    'Entertainment',
    'Invitations',
    'Transportation',
    'Other',
  ];

  // Filtering
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return budgetItems;
    if (selectedCategory === 'Deposits') return budgetItems.filter(b => b.isSecurityDeposit);
    return budgetItems.filter(b => b.category === selectedCategory);
  }, [budgetItems, selectedCategory]);

  // Operating vs Security Deposit separation
  const operatingItems = useMemo(() => budgetItems.filter(b => !b.isSecurityDeposit), [budgetItems]);
  const securityDepositItems = useMemo(() => budgetItems.filter(b => b.isSecurityDeposit), [budgetItems]);

  const totalOperatingPlanned = useMemo(() => operatingItems.reduce((acc, curr) => acc + (Number(curr.planned) || 0), 0), [operatingItems]);
  const totalSecurityDeposits = useMemo(() => securityDepositItems.reduce((acc, curr) => acc + (Number(curr.planned) || 0), 0), [securityDepositItems]);

  // Category breakdown calculation
  const categorySummary: Record<string, { planned: number; actual: number }> = {};
  categories.forEach(cat => {
    categorySummary[cat] = { planned: 0, actual: 0 };
  });
  operatingItems.forEach(b => {
    if (!categorySummary[b.category]) {
      categorySummary[b.category] = { planned: 0, actual: 0 };
    }
    categorySummary[b.category].planned += Number(b.planned) || 0;
    categorySummary[b.category].actual += Number(b.actual) || 0;
  });

  // Calculate Real-World Estimate Action
  const handleCalculateEstimate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCalculating(true);
    try {
      const res = await fetch('/api/budget/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: estEventType,
          city: estCity,
          locality: estLocality,
          eventDate: activeEvent?.date || '',
          guestCount: estGuestCount,
          venueType: estVenueType,
          foodPreference: estFoodPref,
          decorStyle: estDecorStyle,
          requiredServices: estServices,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.estimate) {
          setActiveEstimate(data.estimate);
          onShowToast(`Calculated verified ${estCity} budget estimate`, 'success');
          return;
        }
      }
    } catch {
      // Local fallback calculation engine
    }

    const localEstimate = calculateRealWorldBudget({
      eventType: estEventType,
      city: estCity,
      locality: estLocality,
      eventDate: activeEvent?.date || '',
      guestCount: estGuestCount,
      venueType: estVenueType,
      foodPreference: estFoodPref,
      decorStyle: estDecorStyle,
      requiredServices: estServices,
    });
    setActiveEstimate(localEstimate);
    setIsCalculating(false);
    onShowToast(`Calculated realistic budget for ${estGuestCount} guests in ${estCity}`, 'success');
  };

  // Apply Estimate to Event Budget
  const handleApplyEstimate = (estToApply: BudgetEstimateBreakdown) => {
    applyBudgetEstimate(estToApply);
    setActiveSubTab('items');
  };

  // Open manual add modal
  const openAddModal = () => {
    setFormCategory('Catering');
    setFormName('');
    setFormPlanned(35000);
    setFormActual(0);
    setFormStatus('Pending');
    setFormUnit('fixed');
    setFormUnitPrice(35000);
    setFormQuantity(1);
    setFormVerification('user_provided');
    setFormProviderName('');
    setFormSourceUrl('');
    setFormIsDeposit(false);
    setFormNotes('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormName(item.name);
    setFormPlanned(item.planned);
    setFormActual(item.actual);
    setFormStatus(item.status);
    setFormUnit(item.unit || 'fixed');
    setFormUnitPrice(item.unitPrice || item.planned);
    setFormQuantity(item.quantity || 1);
    setFormVerification(item.verificationStatus || 'user_provided');
    setFormProviderName(item.providerName || '');
    setFormSourceUrl(item.sourceUrl || '');
    setFormIsDeposit(!!item.isSecurityDeposit);
    setFormNotes(item.notes || '');
    setFormError('');
  };

  // Save line item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Item name or service description is required.');
      return;
    }
    if (formPlanned < 0 || formActual < 0) {
      setFormError('Amounts cannot be negative.');
      return;
    }

    const calculatedPlanned =
      formUnit === 'per_guest' || formUnit === 'quantity'
        ? Math.round(formUnitPrice * formQuantity)
        : Number(formPlanned);

    if (editingItem) {
      updateBudgetItem(editingItem.id, {
        category: formCategory,
        name: formName.trim(),
        planned: calculatedPlanned,
        actual: Number(formActual),
        status: formStatus,
        unit: formUnit,
        unitPrice: Number(formUnitPrice),
        quantity: Number(formQuantity),
        verificationStatus: formVerification,
        providerName: formProviderName.trim() || undefined,
        sourceUrl: formSourceUrl.trim() || undefined,
        isSecurityDeposit: formIsDeposit,
        notes: formNotes.trim(),
      });
      onShowToast(`Updated "${formName}"`, 'success');
      setEditingItem(null);
    } else {
      addBudgetItem({
        category: formCategory,
        name: formName.trim(),
        planned: calculatedPlanned,
        actual: Number(formActual),
        status: formStatus,
        unit: formUnit,
        unitPrice: Number(formUnitPrice),
        quantity: Number(formQuantity),
        verificationStatus: formVerification,
        providerName: formProviderName.trim() || undefined,
        sourceUrl: formSourceUrl.trim() || undefined,
        isSecurityDeposit: formIsDeposit,
        verifiedDate: new Date().toISOString().split('T')[0],
        notes: formNotes.trim(),
      });
      onShowToast(`Added budget line item "${formName}"`, 'success');
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteBudgetItem(itemToDelete.id);
    onShowToast(`Removed budget entry "${itemToDelete.name}"`, 'info');
    setItemToDelete(null);
  };

  const toggleService = (srv: string) => {
    setEstServices(prev =>
      prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]
    );
  };

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* =========================================================================
           TOP SUMMARY & KPI DASHBOARD
      ========================================================================= */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a] bg-[#F4EFE6] px-2 py-0.5 rounded">
                Real-World Estimator &amp; Ledger
              </span>
              <span className="text-xs text-[#4C454A]">·</span>
              <span className="text-xs font-semibold text-[#392538]">{activeEvent?.city || 'Local Benchmarks'}</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#392538] mt-1">
              Celebration Budget &amp; Estimator
            </h2>
            <p className="text-xs text-[#4C454A] mt-0.5">
              Itemized expenses for <strong className="text-[#392538]">{activeEvent?.name}</strong> based on verified local pricing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToVenues && (
              <button
                onClick={onNavigateToVenues}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F0] text-[#392538] hover:bg-[#F4EFE6] border border-[#E8E1D5] text-xs font-semibold transition shadow-2xs"
                title="Discover real venues in your selected city"
              >
                <span className="material-symbols-outlined text-sm text-[#755a2a]">location_on</span>
                <span>Discover Venues</span>
              </button>
            )}

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#392538] text-white text-xs font-semibold hover:bg-[#231123] transition shadow-xs"
            >
              <span className="material-symbols-outlined text-sm text-[#C5A46D]">add</span>
              <span>Add Expense / Quote</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E8E1D5]">
          <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Operating Budget
            </span>
            <p className="font-serif text-xl font-bold text-[#392538] mt-0.5">
              {formatCurrency(totalBudget)}
            </p>
            <span className="text-[11px] text-[#4C454A]">Planned total allocation</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Disbursed / Paid
            </span>
            <p className="font-serif text-xl font-bold text-[#4A6B53] mt-0.5">
              {formatCurrency(actualSpent)}
            </p>
            <span className="text-[11px] text-[#4C454A]">Confirmed advances paid</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Remaining to Pay
            </span>
            <p className="font-serif text-xl font-bold text-[#C97862] mt-0.5">
              {formatCurrency(remainingBudget)}
            </p>
            <span className="text-[11px] text-[#4C454A]">Balance to settle</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Refundable Deposits
            </span>
            <p className="font-serif text-xl font-bold text-[#755a2a] mt-0.5">
              {formatCurrency(totalSecurityDeposits)}
            </p>
            <span className="text-[11px] text-[#755a2a] font-medium">100% refundable cash</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex justify-between items-center text-xs text-[#4C454A]">
            <span>Budget Utilization</span>
            <span className="font-semibold text-[#392538]">
              {formatCurrency(actualSpent)} of {formatCurrency(totalBudget)} committed ({totalBudget > 0 ? Math.round((actualSpent / totalBudget) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full bg-[#ECE6DA] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#C5A46D] h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalBudget > 0 ? Math.min(100, (actualSpent / totalBudget) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
           NAVIGATION SUB-TABS
      ========================================================================= */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-[#E8E1D5] shadow-xs text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('items')}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            activeSubTab === 'items' ? 'bg-[#392538] text-white shadow-2xs' : 'text-[#4C454A] hover:bg-[#FAF7F0]'
          }`}
        >
          <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
          <span>Itemized Expenses ({budgetItems.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('estimator')}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            activeSubTab === 'estimator' ? 'bg-[#392538] text-white shadow-2xs' : 'text-[#4C454A] hover:bg-[#FAF7F0]'
          }`}
        >
          <span className="material-symbols-outlined text-sm text-[#C5A46D]">calculate</span>
          <span>Real-World Estimator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('compare')}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            activeSubTab === 'compare' ? 'bg-[#392538] text-white shadow-2xs' : 'text-[#4C454A] hover:bg-[#FAF7F0]'
          }`}
        >
          <span className="material-symbols-outlined text-sm">view_column</span>
          <span>Compare 4 Tiers</span>
        </button>

        <button
          onClick={() => setActiveSubTab('export')}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 ml-auto transition ${
            activeSubTab === 'export' ? 'bg-[#392538] text-white shadow-2xs' : 'text-[#4C454A] hover:bg-[#FAF7F0]'
          }`}
        >
          <span className="material-symbols-outlined text-sm">print</span>
          <span>Export &amp; Print</span>
        </button>
      </div>

      {/* =========================================================================
           TAB 1: ITEMIZED EXPENSES TABLE
      ========================================================================= */}
      {activeSubTab === 'items' && (
        <div className="flex flex-col gap-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-[#E8E1D5] shadow-xs">
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a] mr-1">
                Category:
              </span>
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedCategory === 'All' ? 'bg-[#392538] text-white font-semibold' : 'text-[#4C454A] hover:bg-[#FAF7F0]'
                }`}
              >
                All ({budgetItems.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    selectedCategory === cat ? 'bg-[#392538] text-white font-semibold' : 'text-[#4C454A] hover:bg-[#FAF7F0]'
                  }`}
                >
                  {cat} ({budgetItems.filter(b => b.category === cat).length})
                </button>
              ))}
              <button
                onClick={() => setSelectedCategory('Deposits')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedCategory === 'Deposits' ? 'bg-[#755a2a] text-white font-semibold' : 'text-[#755a2a] bg-[#FAF7F0] hover:bg-[#F4EFE6]'
                }`}
              >
                Refundable Deposits ({securityDepositItems.length})
              </button>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-[#E8E1D5] text-[#755a2a] font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">Line Item &amp; Formula</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Pricing Basis</th>
                    <th className="py-3 px-3 text-right">Planned (₹)</th>
                    <th className="py-3 px-3 text-right">Actual Paid (₹)</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1D5]">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#4C454A] text-xs">
                        No expense items match current category. Click "Add Expense" or use the Real-World Estimator.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#FAF7F0]/60 transition ${
                          item.isSecurityDeposit ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-[#392538] flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {item.isSecurityDeposit && (
                              <span className="text-[9px] font-bold text-[#755a2a] bg-[#F4EFE6] px-1.5 py-0.2 rounded border border-[#E8E1D5]">
                                Refundable
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-[11px] text-[#4C454A] mt-0.5 line-clamp-1" title={item.notes}>
                              {item.notes}
                            </p>
                          )}
                          {item.sourceUrl && (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-[#755a2a] hover:underline inline-flex items-center gap-0.5 mt-0.5"
                            >
                              <span>Evidence Source</span>
                              <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                            </a>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#E8E1D5] text-[10px] font-semibold text-[#755a2a]">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-[11px] text-[#4C454A]">
                          {item.unit === 'per_guest' ? (
                            <span>₹{item.unitPrice?.toLocaleString('en-IN')}/guest × {item.quantity || activeEvent?.guestCount}</span>
                          ) : item.unit === 'quantity' ? (
                            <span>₹{item.unitPrice?.toLocaleString('en-IN')} × {item.quantity}</span>
                          ) : item.unit === 'per_day' ? (
                            <span>Daily Tariff</span>
                          ) : (
                            <span>Fixed Quote</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-[#392538]">
                          {formatCurrency(item.planned)}
                        </td>

                        <td className="py-3 px-3 text-right font-semibold text-[#4A6B53]">
                          {formatCurrency(item.actual || 0)}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              item.verificationStatus === 'published'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : item.verificationStatus === 'vendor_confirmed'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : item.verificationStatus === 'user_provided'
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.verificationStatus === 'published'
                              ? 'Official Tariff'
                              : item.verificationStatus === 'vendor_confirmed'
                              ? 'Vendor Confirmed'
                              : item.verificationStatus === 'user_provided'
                              ? 'User Quotation'
                              : 'Estimated'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              item.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'Deposit Paid'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1 rounded text-[#4C454A] hover:text-[#392538] hover:bg-[#FAF7F0]"
                              title="Edit item"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button
                              onClick={() => setItemToDelete(item)}
                              className="p-1 rounded text-[#4C454A] hover:text-red-600 hover:bg-red-50"
                              title="Delete item"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Footer Summary */}
            <div className="p-4 bg-[#FAF7F0] border-t border-[#E8E1D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-[#4C454A]">
                Showing <strong>{filteredItems.length}</strong> items (Operating total: <strong>{formatCurrency(totalOperatingPlanned)}</strong> + Refundable deposits: <strong>{formatCurrency(totalSecurityDeposits)}</strong>)
              </div>

              <div className="flex items-center gap-4 font-bold text-sm text-[#392538]">
                <span>Total Cash Needed: {formatCurrency(totalOperatingPlanned + totalSecurityDeposits)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
           TAB 2: REAL-WORLD BUDGET ESTIMATOR WIZARD
      ========================================================================= */}
      {activeSubTab === 'estimator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-col gap-4 text-xs">
            <div className="pb-3 border-b border-[#E8E1D5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a]">
                Step 1: Event Details
              </span>
              <h3 className="font-serif text-lg font-bold text-[#392538]">
                Configure Celebration Parameters
              </h3>
              <p className="text-[#4C454A] mt-0.5">
                Calculates expenses based on verified tariffs for your selected city and scale.
              </p>
            </div>

            <form onSubmit={handleCalculateEstimate} className="flex flex-col gap-3">
              {/* City Selection */}
              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">Celebration City *</label>
                <select
                  value={estCity}
                  onChange={e => {
                    setEstCity(e.target.value);
                    setEstLocality(LOCALITIES_MAP[e.target.value]?.[0] || 'Main City');
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538] font-medium"
                >
                  {CITIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Locality */}
              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">Locality / Neighborhood</label>
                <select
                  value={estLocality}
                  onChange={e => setEstLocality(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                >
                  {(LOCALITIES_MAP[estCity] || ['Central']).map(loc => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type & Guest Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Event Type</label>
                  <select
                    value={estEventType}
                    onChange={e => setEstEventType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday">Birthday Party</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Festival">Festival / Diwali</option>
                    <option value="Corporate">Corporate Gala</option>
                    <option value="Intimate Soirée">Intimate Soirée</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">
                    Guests: <span className="font-bold text-[#392538]">{estGuestCount}</span>
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="3000"
                    step="5"
                    value={estGuestCount}
                    onChange={e => setEstGuestCount(parseInt(e.target.value, 10) || 50)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  />
                </div>
              </div>

              {/* Venue Type */}
              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">Venue Type</label>
                <select
                  value={estVenueType}
                  onChange={e => setEstVenueType(e.target.value as VenueType)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                >
                  <option value="banquet_hall">Banquet Hall (Standard AC Hall)</option>
                  <option value="function_hall">Function Hall (Community / Medium)</option>
                  <option value="convention_center">Convention Center (High Capacity)</option>
                  <option value="hotel">5-Star Hotel Ballroom</option>
                  <option value="outdoor">Outdoor Lawn / Heritage Courtyard</option>
                  <option value="restaurant">Restaurant / Private Dining Room</option>
                  <option value="home">Home / Private Residence (₹0 Venue Rent)</option>
                </select>
              </div>

              {/* Food Preference & Decor Style */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Food Preference</label>
                  <select
                    value={estFoodPref}
                    onChange={e => setEstFoodPref(e.target.value as FoodPreference)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  >
                    <option value="vegetarian">Pure Vegetarian</option>
                    <option value="non_vegetarian">Non-Vegetarian</option>
                    <option value="both">Both Veg &amp; Non-Veg</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Decor Tier</label>
                  <select
                    value={estDecorStyle}
                    onChange={e => setEstDecorStyle(e.target.value as DecorStyle)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  >
                    <option value="simple">Simple &amp; Elegant</option>
                    <option value="standard">Standard Full Celebration</option>
                    <option value="premium">Premium Signature</option>
                    <option value="luxury">Royal Luxury &amp; Bespoke</option>
                  </select>
                </div>
              </div>

              {/* Required Services Checkboxes */}
              <div>
                <label className="block font-semibold text-[#4C454A] mb-1.5">Required Services</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'catering', label: 'Catering Feast' },
                    { id: 'decoration', label: 'Decorations & Florals' },
                    { id: 'photography', label: 'Photography & Video' },
                    { id: 'entertainment', label: 'DJ & Sound System' },
                    { id: 'cake', label: 'Celebration Cake' },
                    { id: 'invitations', label: 'Invitations & Cards' },
                    { id: 'transportation', label: 'Guest Shuttles' },
                  ].map(srv => (
                    <label
                      key={srv.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] cursor-pointer hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={estServices.includes(srv.id)}
                        onChange={() => toggleService(srv.id)}
                        className="rounded text-[#392538] focus:ring-[#C5A46D] accent-[#392538]"
                      />
                      <span className="text-[11px] font-medium text-[#392538]">{srv.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isCalculating}
                className="w-full py-2.5 mt-2 bg-[#392538] hover:bg-[#231123] text-white rounded-xl font-semibold shadow-xs flex items-center justify-center gap-1.5 transition"
              >
                <span className="material-symbols-outlined text-sm text-[#C5A46D]">refresh</span>
                <span>{isCalculating ? 'Calculating...' : 'Recalculate Estimate'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Live Transparent Estimate Breakdown */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {activeEstimate && (
              <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-col gap-4 text-xs">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E1D5]">
                  <div>
                    <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
                      {activeEstimate.tierLabel} Plan · {activeEstimate.city}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#392538] mt-0.5">
                      {formatCurrency(activeEstimate.totalEstimatedExpense)}
                    </h3>
                    <p className="text-[11px] text-[#4C454A]">
                      Operating range: {formatCurrency(activeEstimate.lowEstimate)} – {formatCurrency(activeEstimate.highEstimate)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApplyEstimate(activeEstimate)}
                    className="px-4 py-2 bg-[#392538] text-white rounded-xl font-semibold hover:bg-[#231123] shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-sm text-[#C5A46D]">check_circle</span>
                    <span>Apply to Active Event</span>
                  </button>
                </div>

                {/* Mathematical Explanation Banner */}
                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E8E1D5] text-[11px] text-[#4C454A] leading-relaxed">
                  {activeEstimate.explanation}
                </div>

                {/* Itemized Lines with Formulas */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#392538] text-xs">Itemized Pricing Breakdown</h4>
                  <div className="divide-y divide-[#E8E1D5] border border-[#E8E1D5] rounded-xl overflow-hidden">
                    {activeEstimate.items.map((line, idx) => (
                      <div key={idx} className="p-3 bg-white flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-[#392538] flex items-center gap-1.5">
                            <span>{line.name}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FAF7F0] text-[#755a2a] border border-[#E8E1D5]">
                              {line.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#755a2a] font-medium mt-0.5">
                            Formula: {line.formula}
                          </div>
                          <div className="text-[10px] text-[#4C454A] mt-0.5 flex items-center gap-2">
                            <span>Provider: {line.providerName}</span>
                            {line.sourceUrl && (
                              <a
                                href={line.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#755a2a] hover:underline"
                              >
                                Evidence Link
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-[#392538] text-sm">
                            {formatCurrency(line.planned)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra Charges Breakdown */}
                <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E1D5] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#4C454A]">
                    <span>Operating Subtotal:</span>
                    <span className="font-semibold text-[#392538]">
                      {formatCurrency(activeEstimate.operatingSubtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#4C454A]">
                    <span>Estimated GST &amp; Service Charges (Catering 5% / Services ~12-18%):</span>
                    <span className="font-semibold text-[#392538]">
                      {formatCurrency(activeEstimate.estimatedTaxes)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#4C454A]">
                    <span>Safety Contingency Buffer (8%):</span>
                    <span className="font-semibold text-[#392538]">
                      {formatCurrency(activeEstimate.contingencyAllowance)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#392538] font-bold pt-1.5 border-t border-[#E8E1D5]">
                    <span>Total Operating Expense:</span>
                    <span>{formatCurrency(activeEstimate.totalEstimatedExpense)}</span>
                  </div>
                </div>

                {/* Refundable Security Deposit Box (Explicitly Separated!) */}
                {activeEstimate.refundableSecurityDeposit > 0 && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-amber-900 block">
                        Refundable Security Deposit Requirement
                      </span>
                      <span className="text-[11px] text-amber-800">
                        100% refundable by venue post-inspection. Excluded from expense totals.
                      </span>
                    </div>
                    <div className="font-bold text-amber-900 text-sm">
                      {formatCurrency(activeEstimate.refundableSecurityDeposit)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
           TAB 3: COMPARE 4 TIERS SIDE-BY-SIDE
      ========================================================================= */}
      {activeSubTab === 'compare' && (
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-col gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a]">
              Plan Comparison
            </span>
            <h3 className="font-serif text-xl font-bold text-[#392538] mt-0.5">
              Compare 4 Tiers for {estGuestCount} Guests in {estCity}
            </h3>
            <p className="text-[#4C454A]">
              Explore exact cost differences between Simple, Standard, Premium, and Luxury production levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {(['simple', 'standard', 'premium', 'luxury'] as DecorStyle[]).map(style => {
              const tier = comparisonTiers[style];
              const isCurrent = estDecorStyle === style;

              return (
                <div
                  key={style}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'bg-[#FAF7F0] border-[#392538] ring-1 ring-[#392538] shadow-xs'
                      : 'bg-white border-[#E8E1D5] hover:border-[#C5A46D]'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a]">
                      {tier.tierLabel}
                    </span>
                    <h4 className="font-serif text-xl font-bold text-[#392538] mt-1">
                      {formatCurrency(tier.totalEstimatedExpense)}
                    </h4>
                    <p className="text-[11px] text-[#4C454A] mt-0.5">
                      ~{formatCurrency(Math.round(tier.totalEstimatedExpense / estGuestCount))} / guest
                    </p>

                    <div className="space-y-2 mt-4 pt-3 border-t border-[#E8E1D5]">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#4C454A]">Venue Cost:</span>
                        <span className="font-semibold text-[#392538]">
                          {formatCurrency(tier.items.find(i => i.category === 'Venue')?.planned || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#4C454A]">Food &amp; Catering:</span>
                        <span className="font-semibold text-[#392538]">
                          {formatCurrency(tier.items.find(i => i.category === 'Catering')?.planned || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#4C454A]">Decorations:</span>
                        <span className="font-semibold text-[#392538]">
                          {formatCurrency(tier.items.find(i => i.category === 'Decoration')?.planned || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#4C454A]">Photography:</span>
                        <span className="font-semibold text-[#392538]">
                          {formatCurrency(tier.items.find(i => i.category === 'Photography')?.planned || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] pt-1 border-t border-[#E8E1D5]/60">
                        <span className="text-[#755a2a]">Security Deposit:</span>
                        <span className="font-semibold text-[#755a2a]">
                          {formatCurrency(tier.refundableSecurityDeposit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyEstimate(tier)}
                    className={`w-full py-2 mt-4 rounded-xl font-semibold transition ${
                      isCurrent
                        ? 'bg-[#392538] text-white hover:bg-[#231123]'
                        : 'bg-[#F4EFE6] text-[#392538] hover:bg-[#ECE6DA]'
                    }`}
                  >
                    {isCurrent ? 'Apply Current Plan' : 'Apply This Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
           TAB 4: EXPORT & PRINT DOSSIER
      ========================================================================= */}
      {activeSubTab === 'export' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-col gap-6 text-xs max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a]">
                Utsav AI Celebration Dossier
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#392538]">
                {activeEvent?.name} — Budget Dossier
              </h3>
              <p className="text-[#4C454A]">
                Location: {activeEvent?.location || activeEvent?.city} · Date: {activeEvent?.date || 'Upcoming'} · Guests: {activeEvent?.guestCount}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#392538] text-white rounded-xl font-semibold hover:bg-[#231123] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>Print Dossier</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-[#FAF7F0] rounded-xl border border-[#E8E1D5]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#755a2a]">Total Operating Budget</span>
              <p className="font-serif text-lg font-bold text-[#392538] mt-0.5">{formatCurrency(totalBudget)}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#755a2a]">Amount Disbursed</span>
              <p className="font-serif text-lg font-bold text-[#4A6B53] mt-0.5">{formatCurrency(actualSpent)}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#755a2a]">Remaining Balance</span>
              <p className="font-serif text-lg font-bold text-[#C97862] mt-0.5">{formatCurrency(remainingBudget)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#392538]">Itemized Accounting Lines</h4>
            <div className="divide-y divide-[#E8E1D5] border border-[#E8E1D5] rounded-xl overflow-hidden">
              {budgetItems.map(item => (
                <div key={item.id} className="p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-[#392538]">{item.name}</span>
                    <span className="text-[10px] text-[#755a2a] ml-2 font-medium">({item.category})</span>
                    {item.notes && <p className="text-[11px] text-[#4C454A]">{item.notes}</p>}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#392538]">{formatCurrency(item.planned)}</span>
                    <p className="text-[10px] text-[#4C454A]">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
           ADD / EDIT EXPENSE & REAL QUOTATION MODAL
      ========================================================================= */}
      {(isAddModalOpen || editingItem) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#392538]/50 backdrop-blur-xs overflow-y-auto"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-[#E8E1D5] my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#392538]">
                  {editingItem ? 'Edit Budget Line' : 'Add Expense / Real Vendor Quote'}
                </h3>
                <p className="text-xs text-[#4C454A]">
                  Enter verified provider charges or custom quotes
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1 rounded-lg text-[#4C454A] hover:bg-[#F4EFE6]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 rounded bg-red-50 text-red-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveItem} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">
                  Item / Service Description *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Royal Farsan Live Counter (Bawarchi Catering)"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538] focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as BudgetCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Pricing Basis</label>
                  <select
                    value={formUnit}
                    onChange={e => setFormUnit(e.target.value as PricingUnit)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  >
                    <option value="fixed">Fixed Service Total</option>
                    <option value="per_guest">Per Guest / Per Plate</option>
                    <option value="quantity">Quantity Based (kg / units)</option>
                    <option value="per_day">Daily Rental Tariff</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Unit Calculation Fields */}
              {(formUnit === 'per_guest' || formUnit === 'quantity') ? (
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF7F0] rounded-xl border border-[#E8E1D5]">
                  <div>
                    <label className="block font-semibold text-[#4C454A] mb-1">
                      Rate {formUnit === 'per_guest' ? 'Per Guest (₹)' : 'Per Unit (₹)'}
                    </label>
                    <input
                      type="number"
                      value={formUnitPrice}
                      onChange={e => {
                        const rate = parseFloat(e.target.value) || 0;
                        setFormUnitPrice(rate);
                        setFormPlanned(Math.round(rate * formQuantity));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8E1D5] text-[#392538]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#4C454A] mb-1">
                      {formUnit === 'per_guest' ? 'Guest Count' : 'Units Count'}
                    </label>
                    <input
                      type="number"
                      value={formQuantity}
                      onChange={e => {
                        const qty = parseFloat(e.target.value) || 1;
                        setFormQuantity(qty);
                        setFormPlanned(Math.round(formUnitPrice * qty));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8E1D5] text-[#392538]"
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">
                    Planned Total (₹) *
                  </label>
                  <input
                    type="number"
                    value={formPlanned}
                    onChange={e => setFormPlanned(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">
                    Actual Disbursed (₹)
                  </label>
                  <input
                    type="number"
                    value={formActual}
                    onChange={e => setFormActual(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Payment Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Deposit Paid">Deposit Paid</option>
                    <option value="Paid">Fully Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Verification Status</label>
                  <select
                    value={formVerification}
                    onChange={e => setFormVerification(e.target.value as PriceVerificationStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  >
                    <option value="user_provided">User-Provided Quotation</option>
                    <option value="vendor_confirmed">Vendor-Confirmed Quote</option>
                    <option value="published">Official Published Tariff</option>
                    <option value="estimated">Estimated Allowance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Provider / Vendor Name</label>
                  <input
                    type="text"
                    value={formProviderName}
                    onChange={e => setFormProviderName(e.target.value)}
                    placeholder="e.g. Hyderabad Bawarchi Caterers"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">Quotation Link / Reference</label>
                  <input
                    type="text"
                    value={formSourceUrl}
                    onChange={e => setFormSourceUrl(e.target.value)}
                    placeholder="e.g. https://... or Quote #482"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  />
                </div>
              </div>

              {/* Is Security Deposit Checkbox */}
              <label className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50 border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsDeposit}
                  onChange={e => setFormIsDeposit(e.target.checked)}
                  className="rounded text-[#755a2a] focus:ring-[#755a2a] accent-[#755a2a]"
                />
                <span className="text-[11px] font-semibold text-[#755a2a]">
                  This is a Refundable Security Deposit (Excludes from operating expense total)
                </span>
              </label>

              <div>
                <label className="block font-semibold text-[#4C454A] mb-1">Notes / Terms</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. 50% advance required 15 days before event"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D5]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#F4EFE6] text-[#392538] hover:bg-[#ECE6DA] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#392538] text-white font-semibold hover:bg-[#231123]"
                >
                  {editingItem ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!itemToDelete}
        title="Delete Budget Item"
        message={`Are you sure you want to delete the expense entry "${itemToDelete?.name}"?`}
        confirmLabel="Delete Item"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
