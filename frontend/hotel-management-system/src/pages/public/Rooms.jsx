import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import useRooms from '../../hooks/useRooms';
import { useLocalization } from '../../contexts';
import { Button } from '../../components/ui';
import Pagination from '../../components/composite/Pagination';
import RoomFilters from '../../components/features/RoomFilters';
import RoomCard from '../../components/features/RoomCard';
import RoomGrid from '../../components/features/RoomGrid';
import RoomSort from '../../components/features/RoomSort';
import EmptyState from '../../components/features/EmptyState';

const Rooms = () => {
  const { t, language } = useLocalization();
  const {
    rooms,
    allRooms, // allRooms is actually filtered but before pagination in my useRooms hook naming, let's check
    filteredRooms, // memoized filtered list from useRooms
    totalCount,
    filters,
    setFilters,
    sort,
    setSort,
    pagination,
    clearFilters
  } = useRooms();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const isUrdu = language === 'Urdu';

  return (
    <div className="min-h-screen bg-[var(--color-primary)]">
      {/* Page Header / Hero Section Placeholder */}
      <div className="bg-[var(--color-secondary)]/10 py-12 md:py-20 border-b border-[var(--glass-border)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-[2.5rem] md:text-[3.5rem] font-serif font-bold text-[var(--color-text-primary)] mb-4 leading-tight">
              {t('rooms_listing.title')}
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)]">
              {pagination.totalCount === 1
                ? t('rooms_listing.available_single')
                : t('rooms_listing.available').replace('{count}', pagination.totalCount)}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Filter Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24">
              <RoomFilters
                filters={filters}
                onChange={setFilters}
                filteredCount={pagination.totalCount}
                variant="sidebar"
              />
            </div>
          </aside>

          {/* Filter Drawer - Mobile */}
          <RoomFilters
            filters={filters}
            onChange={setFilters}
            isOpen={isMobileFiltersOpen}
            onClose={() => setIsMobileFiltersOpen(false)}
            filteredCount={pagination.totalCount}
            variant="drawer"
          />

          {/* Main Content Area */}
          <main className="flex-1">
            {/* Top Bar: Sort & Mobile Filter Toggle - Horizontal Flex for all screen sizes */}
            <div className="flex flex-row items-center justify-between gap-3 mb-8">
              <Button
                variant="outline"
                className="lg:hidden flex items-center h-10 px-3.5 border-[var(--glass-border)] hover:border-[#CFAF7E]/40 bg-glass/20 backdrop-blur-sm transition-all duration-300 w-auto group whitespace-nowrap"
                onClick={() => setIsMobileFiltersOpen(true)}
                rightIcon={<Filter size={14} className="text-[#CFAF7E] transition-transform duration-300 group-hover:scale-110" />}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-serif font-bold">
                    {isUrdu ? 'ترجیحات' : 'Refine'}
                  </span>
                  <span className="text-[12px] font-bold text-[var(--color-text-primary)]">
                    {t('rooms_listing.filters')}
                  </span>
                </div>
              </Button>

              <div className="lg:ms-auto">
                <RoomSort value={sort} onChange={setSort} className="w-auto" />
              </div>
            </div>

            {/* Room Results Grid */}
            {rooms.length > 0 ? (
              <>
                <RoomGrid rooms={rooms} />

                {/* Pagination Section */}
                <div className="mt-12 pt-8 border-t border-[var(--glass-border)]">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalCount}
                    pageSize={pagination.pageSize}
                    onPageChange={pagination.setPage}
                    onPageSizeChange={pagination.setPageSize}
                    showSizeSelector={true}
                  />
                </div>
              </>
            ) : (
              <EmptyState onClear={clearFilters} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
