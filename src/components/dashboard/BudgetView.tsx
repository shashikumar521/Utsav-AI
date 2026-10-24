import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { BudgetCategory, BudgetItem, PaymentStatus } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface BudgetViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ onShowToast }) => {
  const {
    activeEvent,
    budgetItems,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    totalBudget,
    actualSpent,
    remainingBudget,
    formatCurrency,
  } = useEvents();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState<BudgetCategory>('Catering');
  const [formName, setFormName] = useState('');
  const [formPlanned, setFormPlanned] = useState<number>(50000);
  const [formActual, setFormActual] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<PaymentStatus>('Pending');
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

  const filteredItems =
    selectedCategory === 'All'
      ? budgetItems
      : budgetItems.filter(b => b.category === selectedCategory);

  // Category sum calculation
  const categorySummary: Record<string, { planned: number; actual: number }> = {};
  categories.forEach(cat => {
    categorySummary[cat] = { planned: 0, actual: 0 };
  });
  budgetItems.forEach(b => {
    if (!categorySummary[b.category]) {
      categorySummary[b.category] = { planned: 0, actual: 0 };
    }
    categorySummary[b.category].planned += Number(b.planned) || 0;
    categorySummary[b.category].actual += Number(b.actual) || 0;
  });

  const openAddModal = () => {
    setFormCategory('Catering');
    setFormName('');
    setFormPlanned(50000);
    setFormActual(0);
    setFormStatus('Pending');
    setFormNotes('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormName(item.name);
    setFormPlanned(item.planned);
    setFormActual(item.actual);
    setFormStatus(item.status);
    setFormNotes(item.notes || '');
    setFormError('');
  };

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

    if (editingItem) {
      updateBudgetItem(editingItem.id, {
        category: formCategory,
        name: formName.trim(),
        planned: Number(formPlanned),
        actual: Number(formActual),
        status: formStatus,
        notes: formNotes.trim(),
      });
      onShowToast(`Updated "${formName}"`, 'success');
      setEditingItem(null);
    } else {
      addBudgetItem({
        category: formCategory,
        name: formName.trim(),
        planned: Number(formPlanned),
        actual: Number(formActual),
        status: formStatus,
        notes: formNotes.trim(),
      });
      onShowToast(`Added expense line item "${formName}"`, 'success');
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteBudgetItem(itemToDelete.id);
    onShowToast(`Removed budget entry "${itemToDelete.name}"`, 'info');
    setItemToDelete(null);
  };

  const budgetUsagePercent =
    totalBudget > 0 ? Math.min(100, Math.round((actualSpent / totalBudget) * 100)) : 0;

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* Header & KPI Summary */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#755a2a]">
              Financial Architecture
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#392538]">
              Budget Studio &amp; Rupee Allocation
            </h2>
            <p className="text-xs text-[#4C454A] mt-0.5">
              Target Envelope: {formatCurrency(totalBudget)} for {activeEvent?.name}
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#392538] text-white text-xs font-semibold hover:bg-[#231123] transition shadow-xs self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-sm text-[#C5A46D]">add</span>
            <span>Add Expense Item</span>
          </button>
        </div>

        {/* 3 Metric Figures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E8E1D5]">
          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Total Target Budget
            </span>
            <p className="font-serif text-xl font-bold text-[#392538] mt-0.5">
              {formatCurrency(totalBudget)}
            </p>
            <span className="text-[11px] text-[#4C454A]">Locked financial cap</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Actual / Committed Spend
            </span>
            <p className="font-serif text-xl font-bold text-[#392538] mt-0.5">
              {formatCurrency(actualSpent)}
            </p>
            <span className="text-[11px] text-[#4C454A]">
              {budgetUsagePercent}% of planned envelope
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5]">
            <span className="text-[10px] font-bold text-[#755a2a] uppercase tracking-wider">
              Remaining Unlocked
            </span>
            <p className="font-serif text-xl font-bold text-[#4A6B53] mt-0.5">
              {formatCurrency(remainingBudget)}
            </p>
            <span className="text-[11px] text-[#4C454A]">
              Available buffer &amp; contingency
            </span>
          </div>
        </div>

        {/* Global Progress Gauge */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex justify-between items-center text-xs text-[#4C454A]">
            <span>Spend Velocity</span>
            <span className="font-semibold text-[#392538]">
              {formatCurrency(actualSpent)} / {formatCurrency(totalBudget)} ({budgetUsagePercent}%)
            </span>
          </div>
          <div className="w-full bg-[#ECE6DA] h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-[#392538] h-full transition-all duration-500"
              style={{ width: `${budgetUsagePercent}%` }}
            />
            <div
              className="bg-[#C5A46D] h-full transition-all duration-500"
              style={{ width: `${100 - budgetUsagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'All'
              ? 'bg-[#392538] text-white shadow-xs'
              : 'bg-white text-[#4C454A] hover:bg-[#F4EFE6] border border-[#E8E1D5]'
          }`}
        >
          All Categories ({budgetItems.length})
        </button>
        {categories.map(cat => {
          const isSelected = selectedCategory === cat;
          const count = budgetItems.filter(b => b.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#392538] text-white shadow-xs'
                  : 'bg-white text-[#4C454A] hover:bg-[#F4EFE6] border border-[#E8E1D5]'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Category Breakdown Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {categories.slice(0, 4).map(cat => {
          const data = categorySummary[cat] || { planned: 0, actual: 0 };
          return (
            <div
              key={cat}
              className="p-3 rounded-xl bg-white border border-[#E8E1D5] shadow-2xs flex flex-col gap-1"
            >
              <span className="text-[10px] font-bold text-[#755a2a] uppercase">{cat}</span>
              <span className="font-serif text-sm font-bold text-[#392538]">
                {formatCurrency(data.planned)}
              </span>
              <span className="text-[10px] text-[#4C454A]">
                Paid: {formatCurrency(data.actual)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Expense Line Items Table */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E8E1D5] flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-[#392538]">
            Line Items ({filteredItems.length})
          </h3>
          <span className="text-xs text-[#755a2a] font-medium">
            Category: {selectedCategory}
          </span>
        </div>

        {filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#E8E1D5] text-[10px] uppercase font-bold text-[#755a2a]">
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Item / Service</th>
                  <th className="py-2.5 px-4 text-right">Planned (INR)</th>
                  <th className="py-2.5 px-4 text-right">Actual Paid</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D5]">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-[#FAF7F0]/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#755a2a]">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#392538]">
                      <div>{item.name}</div>
                      {item.notes && (
                        <div className="text-[11px] text-[#4C454A] italic">{item.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[#392538]">
                      {formatCurrency(item.planned)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[#4A6B53]">
                      {formatCurrency(item.actual)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'Paid'
                            ? 'bg-[#4A6B53]/10 text-[#4A6B53]'
                            : item.status === 'Deposit Paid'
                            ? 'bg-[#C5A46D]/20 text-[#755a2a]'
                            : 'bg-[#C97862]/10 text-[#C97862]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 rounded text-[#4C454A] hover:text-[#392538] hover:bg-[#F4EFE6]"
                          title="Edit line item"
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
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#4C454A]">
            No expense items found in this category. Click "Add Expense Item" to track allocations.
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {(isAddModalOpen || editingItem) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#392538]/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#E8E1D5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] mb-4">
              <h3 className="font-serif text-lg font-bold text-[#392538]">
                {editingItem ? 'Edit Budget Line Item' : 'Add Expense Line Item'}
              </h3>
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
                <label className="block font-semibold text-[#4C454A] mb-1">Category *</label>
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
                <label className="block font-semibold text-[#4C454A] mb-1">
                  Item / Service Description *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Mandap Floral Canopies, Live Catering Counter"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">
                    Planned Allocation (INR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formPlanned}
                    onChange={e => setFormPlanned(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#4C454A] mb-1">
                    Actual Amount Paid
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formActual}
                    onChange={e => setFormActual(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8E1D5] text-[#392538]"
                  />
                </div>
              </div>

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
                <label className="block font-semibold text-[#4C454A] mb-1">Notes / Terms</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Balance due 2 days before event"
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
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!itemToDelete}
        title="Delete Expense Entry"
        message={`Are you sure you want to remove "${itemToDelete?.name}" from your celebration budget?`}
        confirmLabel="Remove Item"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
