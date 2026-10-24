import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { GuestItem, VendorItem, RSVPStatus, VendorCategory } from '../../types';
import { 
  Users, Store, Plus, Search, Mail, Phone, CheckCircle2, 
  Clock, XCircle, Trash2, Edit2, ShieldCheck
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const GuestsVendorsView: React.FC = () => {
  const { 
    currentEvent, 
    guests, 
    vendors, 
    addGuest, 
    updateGuest, 
    deleteGuest, 
    addVendor, 
    updateVendor, 
    deleteVendor, 
    formatCurrency 
  } = useEvents();

  const [activeTab, setActiveTab] = useState<'guests' | 'vendors'>('guests');

  // Guest state
  const [guestSearch, setGuestSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<'all' | 'Confirmed' | 'Pending' | 'Declined'>('all');
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<string | null>(null);

  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    phone: '',
    group: 'Family',
    rsvpStatus: 'Pending' as RSVPStatus,
    dietaryRestrictions: '',
    plusOnes: 0,
    tableAssignment: '',
    notes: '',
  });

  // Vendor state
  const [vendorSearch, setVendorSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);

  const [vendorForm, setVendorForm] = useState({
    name: '',
    category: 'Venue' as VendorCategory,
    contactPerson: '',
    email: '',
    phone: '',
    priceQuote: 0,
    paidAmount: 0,
    status: 'Booked' as 'Inquiry' | 'Shortlisted' | 'Booked' | 'Completed' | 'Declined',
    contractSigned: false,
    rating: 5,
    notes: '',
  });

  // Guest calculations
  const totalGuests = guests.reduce((acc, g) => acc + 1 + (g.plusOnes || 0), 0);
  const confirmedGuests = guests
    .filter(g => (g.rsvpStatus === 'Confirmed' || g.rsvp === 'confirmed'))
    .reduce((acc, g) => acc + 1 + (g.plusOnes || 0), 0);
  const pendingGuests = guests
    .filter(g => (g.rsvpStatus === 'Pending' || g.rsvp === 'pending'))
    .reduce((acc, g) => acc + 1 + (g.plusOnes || 0), 0);
  const declinedGuests = guests
    .filter(g => (g.rsvpStatus === 'Declined' || g.rsvp === 'declined'))
    .reduce((acc, g) => acc + 1 + (g.plusOnes || 0), 0);

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
                          g.group.toLowerCase().includes(guestSearch.toLowerCase()) ||
                          (g.email && g.email.toLowerCase().includes(guestSearch.toLowerCase()));
    const statusVal = g.rsvpStatus || (g.rsvp === 'confirmed' ? 'Confirmed' : g.rsvp === 'declined' ? 'Declined' : 'Pending');
    const matchesRsvp = rsvpFilter === 'all' || statusVal === rsvpFilter;
    return matchesSearch && matchesRsvp;
  });

  // Vendor calculations
  const totalVendorQuotes = vendors.reduce((acc, v) => acc + (v.priceQuote || v.estimatedCost || 0), 0);
  const totalVendorPaid = vendors.reduce((acc, v) => acc + (v.paidAmount || 0), 0);
  const bookedVendorsCount = vendors.filter(v => v.status === 'Booked' || v.status === 'Completed').length;

  const filteredVendors = vendors.filter(v => {
    const contactStr = v.contactPerson || v.contact || '';
    const matchesSearch = v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                          v.category.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                          contactStr.toLowerCase().includes(vendorSearch.toLowerCase());
    const matchesCat = categoryFilter === 'all' || v.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Handlers for Guest
  const openAddGuest = () => {
    setEditingGuest(null);
    setGuestForm({
      name: '',
      email: '',
      phone: '',
      group: 'Family',
      rsvpStatus: 'Pending',
      dietaryRestrictions: '',
      plusOnes: 0,
      tableAssignment: '',
      notes: '',
    });
    setIsGuestModalOpen(true);
  };

  const openEditGuest = (guest: GuestItem) => {
    setEditingGuest(guest);
    const rsvpVal = (guest.rsvpStatus || (guest.rsvp === 'confirmed' ? 'Confirmed' : guest.rsvp === 'declined' ? 'Declined' : 'Pending')) as RSVPStatus;
    setGuestForm({
      name: guest.name,
      email: guest.email || '',
      phone: guest.phone || '',
      group: guest.group || 'Family',
      rsvpStatus: rsvpVal,
      dietaryRestrictions: guest.dietaryRestrictions || guest.dietary || '',
      plusOnes: guest.plusOnes || 0,
      tableAssignment: guest.tableAssignment || '',
      notes: guest.notes || '',
    });
    setIsGuestModalOpen(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.name.trim()) return;

    if (editingGuest) {
      updateGuest(editingGuest.id, guestForm);
    } else {
      addGuest(guestForm);
    }
    setIsGuestModalOpen(false);
  };

  // Handlers for Vendor
  const openAddVendor = () => {
    setEditingVendor(null);
    setVendorForm({
      name: '',
      category: 'Venue',
      contactPerson: '',
      email: '',
      phone: '',
      priceQuote: 0,
      paidAmount: 0,
      status: 'Booked',
      contractSigned: false,
      rating: 5,
      notes: '',
    });
    setIsVendorModalOpen(true);
  };

  const openEditVendor = (vendor: VendorItem) => {
    setEditingVendor(vendor);
    const statusVal = vendor.status === 'Quoted' ? 'Shortlisted' : vendor.status;
    setVendorForm({
      name: vendor.name,
      category: vendor.category,
      contactPerson: vendor.contactPerson || vendor.contact || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      priceQuote: vendor.priceQuote || vendor.estimatedCost || 0,
      paidAmount: vendor.paidAmount || 0,
      status: statusVal as any,
      contractSigned: vendor.contractSigned || false,
      rating: vendor.rating || 5,
      notes: vendor.notes || '',
    });
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) return;

    if (editingVendor) {
      updateVendor(editingVendor.id, vendorForm);
    } else {
      addVendor(vendorForm);
    }
    setIsVendorModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-plum/10">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-plum">
            Guests & Vendor Roster
          </h1>
          <p className="text-xs md:text-sm text-plum/60 mt-1">
            {currentEvent?.title || currentEvent?.name} · RSVP coordination and vendor contract governance
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-ivory-warm rounded-lg border border-plum/10 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'guests'
                ? 'bg-plum text-ivory-warm shadow-xs'
                : 'text-plum/70 hover:text-plum'
            }`}
          >
            <Users size={14} />
            Guest RSVP ({totalGuests})
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'vendors'
                ? 'bg-plum text-ivory-warm shadow-xs'
                : 'text-plum/70 hover:text-plum'
            }`}
          >
            <Store size={14} />
            Vendor Roster ({vendors.length})
          </button>
        </div>
      </div>

      {/* ===================== GUESTS TAB ===================== */}
      {activeTab === 'guests' && (
        <div className="space-y-6">
          {/* Guest Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white p-4 rounded-xl border border-plum/10 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-plum/50">Total Invited</span>
              <p className="font-serif text-2xl font-bold text-plum mt-1">{totalGuests}</p>
              <span className="text-[11px] text-plum/60 mt-0.5 block">{guests.length} invitations sent</span>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">Confirmed (Attending)</span>
              <p className="font-serif text-2xl font-bold text-emerald-900 mt-1">{confirmedGuests}</p>
              <span className="text-[11px] text-emerald-700/80 mt-0.5 block">
                {totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0}% attendance rate
              </span>
            </div>

            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">Awaiting Response</span>
              <p className="font-serif text-2xl font-bold text-amber-900 mt-1">{pendingGuests}</p>
              <span className="text-[11px] text-amber-700/80 mt-0.5 block">Follow-up reminders recommended</span>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-plum/10 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-plum/50">Regretfully Declined</span>
              <p className="font-serif text-2xl font-bold text-plum/70 mt-1">{declinedGuests}</p>
              <span className="text-[11px] text-plum/50 mt-0.5 block">Catering headcount adjusted</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-plum/10">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-plum/40" />
                <input
                  type="text"
                  placeholder="Search guest name, party, or email..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-ivory-warm/40 border border-plum/15 rounded-lg focus:outline-none focus:border-plum"
                />
              </div>

              {/* RSVP status filters */}
              <div className="flex items-center gap-1">
                {(['all', 'Confirmed', 'Pending', 'Declined'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setRsvpFilter(status)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                      rsvpFilter === status
                        ? 'bg-plum text-ivory-warm'
                        : 'text-plum/60 hover:bg-ivory-warm'
                    }`}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={openAddGuest}
              className="px-3.5 py-1.5 bg-plum text-ivory-warm text-xs font-semibold rounded-lg hover:bg-plum-light transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus size={14} />
              Add Guest
            </button>
          </div>

          {/* Guest Table */}
          <div className="bg-white rounded-xl border border-plum/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ivory-warm/60 border-b border-plum/10 text-[11px] font-semibold text-plum/60 uppercase tracking-wider">
                    <th className="py-3 px-4">Guest Name</th>
                    <th className="py-3 px-4">Group / Side</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Party Size</th>
                    <th className="py-3 px-4">Dietary & Table</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-plum/5 text-xs">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-plum/50">
                        <Users size={32} className="mx-auto mb-2 text-plum/20" />
                        <p className="font-serif text-base text-plum/80 font-medium">No guests found</p>
                        <p className="text-xs text-plum/50 mt-1">Adjust your filters or add the first guest to your list</p>
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((guest) => {
                      const totalParty = 1 + (guest.plusOnes || 0);
                      const displayStatus = guest.rsvpStatus || (guest.rsvp === 'confirmed' ? 'Confirmed' : guest.rsvp === 'declined' ? 'Declined' : 'Pending');
                      return (
                        <tr key={guest.id} className="hover:bg-ivory-warm/20 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-plum">
                            {guest.name}
                            {guest.notes && (
                              <span className="block text-[11px] font-normal text-plum/50 mt-0.5 truncate max-w-xs">
                                {guest.notes}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-plum/5 text-plum">
                              {guest.group}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              displayStatus === 'Confirmed'
                                ? 'bg-emerald-100/70 text-emerald-800'
                                : displayStatus === 'Pending'
                                ? 'bg-amber-100/70 text-amber-800'
                                : 'bg-rose-100/70 text-rose-800'
                            }`}>
                              {displayStatus === 'Confirmed' && <CheckCircle2 size={12} />}
                              {displayStatus === 'Pending' && <Clock size={12} />}
                              {displayStatus === 'Declined' && <XCircle size={12} />}
                              {displayStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-plum/80 font-medium">
                            {totalParty} {totalParty === 1 ? 'person' : 'guests'}
                            {(guest.plusOnes || 0) > 0 && (
                              <span className="text-[10px] text-plum/50 block font-normal">
                                (+{guest.plusOnes} guest{(guest.plusOnes || 0) > 1 ? 's' : ''})
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-plum/70">
                            {guest.tableAssignment && (
                              <span className="font-medium text-plum block">
                                Table: {guest.tableAssignment}
                              </span>
                            )}
                            {(guest.dietaryRestrictions || guest.dietary) ? (
                              <span className="text-[11px] text-terracotta block truncate max-w-xs">
                                {guest.dietaryRestrictions || guest.dietary}
                              </span>
                            ) : (
                              <span className="text-[11px] text-plum/40 italic">No restrictions</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-plum/60">
                            {guest.email && (
                              <div className="flex items-center gap-1 truncate max-w-xs">
                                <Mail size={12} className="text-plum/40 shrink-0" />
                                <span className="truncate">{guest.email}</span>
                              </div>
                            )}
                            {guest.phone && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Phone size={12} className="text-plum/40 shrink-0" />
                                <span>{guest.phone}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditGuest(guest)}
                                className="p-1.5 text-plum/60 hover:text-plum hover:bg-plum/5 rounded transition-colors"
                                title="Edit Guest"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => setGuestToDelete(guest.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                                title="Remove Guest"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VENDORS TAB ===================== */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          {/* Vendor Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white p-4 rounded-xl border border-plum/10 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-plum/50">Contract Commitments</span>
              <p className="font-serif text-2xl font-bold text-plum mt-1">{formatCurrency(totalVendorQuotes)}</p>
              <span className="text-[11px] text-plum/60 mt-0.5 block">{vendors.length} vendors on roster</span>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">Disbursed / Paid</span>
              <p className="font-serif text-2xl font-bold text-emerald-900 mt-1">{formatCurrency(totalVendorPaid)}</p>
              <span className="text-[11px] text-emerald-700/80 mt-0.5 block">
                {totalVendorQuotes > 0 ? Math.round((totalVendorPaid / totalVendorQuotes) * 100) : 0}% of quotes settled
              </span>
            </div>

            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">Outstanding Vendor Balance</span>
              <p className="font-serif text-2xl font-bold text-amber-900 mt-1">
                {formatCurrency(Math.max(0, totalVendorQuotes - totalVendorPaid))}
              </p>
              <span className="text-[11px] text-amber-700/80 mt-0.5 block">{bookedVendorsCount} confirmed partners</span>
            </div>
          </div>

          {/* Vendor Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-plum/10">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-plum/40" />
                <input
                  type="text"
                  placeholder="Search vendor name, partner, category..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-ivory-warm/40 border border-plum/15 rounded-lg focus:outline-none focus:border-plum"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs bg-ivory-warm/40 border border-plum/15 rounded-lg focus:outline-none focus:border-plum text-plum font-medium"
              >
                <option value="all">All Categories</option>
                <option value="Venue">Venue</option>
                <option value="Catering">Catering</option>
                <option value="Decoration">Decor</option>
                <option value="Photography">Photography</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              onClick={openAddVendor}
              className="px-3.5 py-1.5 bg-plum text-ivory-warm text-xs font-semibold rounded-lg hover:bg-plum-light transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus size={14} />
              Add Vendor
            </button>
          </div>

          {/* Vendor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center rounded-xl border border-plum/10 text-plum/50">
                <Store size={36} className="mx-auto mb-2 text-plum/20" />
                <p className="font-serif text-lg text-plum/80 font-medium">No vendors registered</p>
                <p className="text-xs text-plum/50 mt-1">Add your venue, caterer, or photographer to track contracts and disbursements</p>
              </div>
            ) : (
              filteredVendors.map((vendor) => {
                const quoteVal = vendor.priceQuote || vendor.estimatedCost || 0;
                const paidVal = vendor.paidAmount || 0;
                const balanceDue = quoteVal - paidVal;
                const contactPerson = vendor.contactPerson || vendor.contact;
                return (
                  <div key={vendor.id} className="bg-white rounded-xl border border-plum/10 p-5 shadow-xs hover:border-gold/40 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-terracotta">
                            {vendor.category}
                          </span>
                          <h3 className="font-serif text-lg font-semibold text-plum mt-0.5 leading-snug">
                            {vendor.name}
                          </h3>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                          vendor.status === 'Booked' || vendor.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : vendor.status === 'Shortlisted' || vendor.status === 'Quoted'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {vendor.status}
                        </span>
                      </div>

                      {contactPerson && (
                        <p className="text-xs text-plum/70 mt-1 font-medium">
                          Contact: {contactPerson}
                        </p>
                      )}

                      {/* Contact Badges */}
                      <div className="mt-3 space-y-1 text-xs text-plum/60 border-t border-plum/5 pt-2.5">
                        {vendor.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-plum/40" />
                            <span>{vendor.phone}</span>
                          </div>
                        )}
                        {vendor.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-plum/40" />
                            <span className="truncate">{vendor.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck size={12} className={vendor.contractSigned ? "text-emerald-600" : "text-amber-500"} />
                          <span className={vendor.contractSigned ? "text-emerald-800 font-medium" : "text-amber-700"}>
                            {vendor.contractSigned ? 'Formal Contract Executed' : 'Awaiting Signed Contract'}
                          </span>
                        </div>
                      </div>

                      {vendor.notes && (
                        <p className="text-[11px] text-plum/60 mt-3 bg-ivory-warm/40 p-2 rounded-lg italic">
                          "{vendor.notes}"
                        </p>
                      )}
                    </div>

                    {/* Financial Summary & Actions */}
                    <div className="mt-4 pt-3 border-t border-plum/10">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-plum/50">Quote: <strong className="text-plum font-semibold">{formatCurrency(quoteVal)}</strong></span>
                        <span className="text-plum/50">Paid: <strong className="text-emerald-700 font-semibold">{formatCurrency(paidVal)}</strong></span>
                      </div>

                      {balanceDue > 0 && (
                        <div className="text-[11px] text-amber-700 bg-amber-50/70 px-2 py-1 rounded text-right mb-3">
                          Balance Due: <strong className="font-semibold">{formatCurrency(balanceDue)}</strong>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditVendor(vendor)}
                          className="px-2.5 py-1 text-xs font-medium text-plum bg-ivory-warm hover:bg-plum/10 rounded transition-colors flex items-center gap-1"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => setVendorToDelete(vendor.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Vendor"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ===================== GUEST MODAL ===================== */}
      {isGuestModalOpen && (
        <div className="fixed inset-0 z-50 bg-plum/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-plum/15 my-8">
            <h2 className="font-serif text-2xl font-semibold text-plum mb-1">
              {editingGuest ? 'Edit Guest RSVP' : 'Add Guest to Celebration'}
            </h2>
            <p className="text-xs text-plum/60 mb-5">
              Track attendance, seating requirements, and dietary preferences.
            </p>

            <form onSubmit={handleSaveGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-plum mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Singhania"
                  value={guestForm.name}
                  onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">Group / Party</label>
                  <input
                    type="text"
                    placeholder="e.g. Bride Family, College, VIP"
                    value={guestForm.group}
                    onChange={(e) => setGuestForm({ ...guestForm, group: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">RSVP Status</label>
                  <select
                    value={guestForm.rsvpStatus}
                    onChange={(e) => setGuestForm({ ...guestForm, rsvpStatus: e.target.value as RSVPStatus })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum text-plum font-medium"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">Plus-Ones / Extra Guests</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={guestForm.plusOnes}
                    onChange={(e) => setGuestForm({ ...guestForm, plusOnes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">Table / Seating Zone</label>
                  <input
                    type="text"
                    placeholder="e.g. Table 4, Courtyard Rose"
                    value={guestForm.tableAssignment}
                    onChange={(e) => setGuestForm({ ...guestForm, tableAssignment: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="vikram@example.com"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">Mobile / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+91 98250 11223"
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-plum mb-1">Dietary Restrictions & Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Strict Jain vegetarian, Nut allergy, Gluten-free"
                  value={guestForm.dietaryRestrictions}
                  onChange={(e) => setGuestForm({ ...guestForm, dietaryRestrictions: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-plum mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Requires airport shuttle on 14th evening..."
                  value={guestForm.notes}
                  onChange={(e) => setGuestForm({ ...guestForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-plum/10">
                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-plum/70 hover:text-plum hover:bg-plum/5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-plum text-ivory-warm rounded-lg hover:bg-plum-light transition-all shadow-xs"
                >
                  {editingGuest ? 'Save Changes' : 'Confirm Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== VENDOR MODAL ===================== */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-plum/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-plum/15 my-8">
            <h2 className="font-serif text-2xl font-semibold text-plum mb-1">
              {editingVendor ? 'Edit Vendor Details' : 'Add Vendor Partner'}
            </h2>
            <p className="text-xs text-plum/60 mb-5">
              Record contract quotes, contact persons, and disbursement balances.
            </p>

            <form onSubmit={handleSaveVendor} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">Vendor / Studio Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Haveli Heritage"
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">Category</label>
                  <select
                    value={vendorForm.category}
                    onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value as VendorCategory })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum text-plum font-medium"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Decoration">Decor</option>
                    <option value="Photography">Photography</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Pradeep Solanki"
                    value={vendorForm.contactPerson}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">Status</label>
                  <select
                    value={vendorForm.status}
                    onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum text-plum font-medium"
                  >
                    <option value="Inquiry">Inquiry</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Booked">Booked</option>
                    <option value="Completed">Completed</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">Agreed Quote Price</label>
                  <input
                    type="number"
                    min="0"
                    value={vendorForm.priceQuote}
                    onChange={(e) => setVendorForm({ ...vendorForm, priceQuote: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">Amount Paid / Advance</label>
                  <input
                    type="number"
                    min="0"
                    value={vendorForm.paidAmount}
                    onChange={(e) => setVendorForm({ ...vendorForm, paidAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="events@royalhaveli.com"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-plum mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+91 97230 45678"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="contractSigned"
                  checked={vendorForm.contractSigned}
                  onChange={(e) => setVendorForm({ ...vendorForm, contractSigned: e.target.checked })}
                  className="rounded border-plum/30 text-plum focus:ring-plum"
                />
                <label htmlFor="contractSigned" className="text-xs font-medium text-plum cursor-pointer">
                  Legal Contract Signed & Filed
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-plum mb-1">Deliverables & Clauses Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 50% balance due 7 days prior to reception..."
                  value={vendorForm.notes}
                  onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-ivory-warm/40 border border-plum/20 rounded-lg focus:outline-none focus:border-plum"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-plum/10">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-plum/70 hover:text-plum hover:bg-plum/5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-plum text-ivory-warm rounded-lg hover:bg-plum-light transition-all shadow-xs"
                >
                  {editingVendor ? 'Save Vendor' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation for Guest */}
      <ConfirmationModal
        isOpen={!!guestToDelete}
        title="Remove Guest from Roster"
        message="Are you sure you want to remove this guest? Any party counts and seating allocations associated with them will be cleared."
        confirmLabel="Remove Guest"
        isDestructive={true}
        onConfirm={() => {
          if (guestToDelete) {
            deleteGuest(guestToDelete);
            setGuestToDelete(null);
          }
        }}
        onCancel={() => setGuestToDelete(null)}
      />

      {/* Delete Confirmation for Vendor */}
      <ConfirmationModal
        isOpen={!!vendorToDelete}
        title="Remove Vendor from Roster"
        message="Are you sure you want to delete this vendor? This will remove all contract quotes and logged disbursements."
        confirmLabel="Remove Vendor"
        isDestructive={true}
        onConfirm={() => {
          if (vendorToDelete) {
            deleteVendor(vendorToDelete);
            setVendorToDelete(null);
          }
        }}
        onCancel={() => setVendorToDelete(null)}
      />
    </div>
  );
};
