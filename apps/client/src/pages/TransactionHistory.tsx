import React, { useState } from 'react';
import { Card, DatePicker, Pagination, Select } from 'antd';
import { History, Filter } from 'lucide-react';
import dayjs from 'dayjs';
import { Header } from '../components/dashboard/Header';
import { TransactionListItem } from '../components/transactions/TransactionListItem';
import { QuickAddTransaction } from '../components/transactions/QuickAddTransaction';
import { MobileBottomNav } from '../components/dashboard/MobileBottomNav';
import { useTransactions, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';

const { RangePicker } = DatePicker;

export const TransactionHistoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[string | undefined, string | undefined]>([
    undefined,
    undefined,
  ]);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const { data: categories = [] } = useCategories();
  const deleteTxMutation = useDeleteTransaction();

  const { data, isLoading } = useTransactions({
    page,
    limit,
    categoryId: selectedCategory,
    from: dateRange[0],
    to: dateRange[1],
  });

  const transactions = data?.data || [];
  const total = data?.total || 0;

  const handleDelete = async (id: string) => {
    await deleteTxMutation.mutateAsync(id);
  };

  const handleDateChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
    } else {
      setDateRange([undefined, undefined]);
    }
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20 md:pb-16">
      <Header onOpenAddTransaction={() => setIsQuickAddOpen(true)} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Title Bar */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lịch Sử Giao Dịch</h1>
            <p className="text-xs text-gray-500">Xem toàn bộ lịch sử thu chi, lọc theo ngày và danh mục</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>Bộ lọc:</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Category Filter */}
            <Select
              allowClear
              placeholder="Tất cả danh mục"
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setPage(1);
              }}
              className="w-full sm:w-48"
              size="large"
              options={categories.map((c) => ({
                label: `${c.type === 'income' ? '+' : '-'} ${c.name}`,
                value: c.id,
              }))}
            />

            {/* Date Range Filter */}
            <RangePicker
              size="large"
              className="w-full sm:w-64 !rounded-xl"
              format="DD/MM/YYYY"
              onChange={handleDateChange}
            />
          </div>
        </div>

        {/* Transaction List */}
        <Card className="!rounded-2xl shadow-sm border border-gray-200/80">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy giao dịch nào phù hợp với bộ lọc.
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <TransactionListItem key={tx.id} transaction={tx} onDelete={handleDelete} />
              ))}

              {/* Server-side Pagination */}
              <div className="flex justify-center pt-4">
                <Pagination
                  current={page}
                  pageSize={limit}
                  total={total}
                  onChange={(p) => setPage(p)}
                  showSizeChanger={false}
                />
              </div>
            </div>
          )}
        </Card>
      </main>

      {/* Quick Add Transaction Drawer */}
      <QuickAddTransaction open={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />

      {/* Mobile Bottom Nav */}
      <MobileBottomNav onOpenAddTransaction={() => setIsQuickAddOpen(true)} />
    </div>
  );
};

export default TransactionHistoryPage;
