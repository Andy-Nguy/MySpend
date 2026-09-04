import React, { useState } from 'react';
import { Card, DatePicker, Pagination, Select } from 'antd';
import { History, Filter } from 'lucide-react';
import dayjs from 'dayjs';
import { Header } from '../components/dashboard/Header';
import { TransactionListItem } from '../components/transactions/TransactionListItem';
import { QuickAddTransaction } from '../components/transactions/QuickAddTransaction';
import { MobileBottomNav } from '../components/dashboard/MobileBottomNav';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useTransactions, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { CategoryTypeEnum } from '@myspend/libs';

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

  const { data, isLoading, isFetching } = useTransactions({
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

  const groupedTransactions = transactions.reduce((acc, tx) => {
    const date = dayjs(tx.transactionDate).format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => dayjs(b).unix() - dayjs(a).unix()
  );

  const formatDateHeader = (dateStr: string) => {
    const date = dayjs(dateStr);
    const formattedDate = date.format('DD/MM/YYYY');
    if (date.isSame(dayjs(), 'day')) return `HÔM NAY • ${formattedDate}`;
    if (date.isSame(dayjs().subtract(1, 'day'), 'day')) return `HÔM QUA • ${formattedDate}`;
    return date.format('DD MMMM, YYYY').toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Math.abs(amount)).replace('₫', 'đ');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-24 md:pb-16 overflow-x-hidden">
      <Header onOpenAddTransaction={() => setIsQuickAddOpen(true)} />

      <main className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 space-y-6">
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

        {isLoading && !transactions.length ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <LoadingSpinner size="lg" tip="Đang tải giao dịch..." />
          </div>
        ) : (
          <>
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
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Không tìm thấy giao dịch nào phù hợp với bộ lọc.
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedDates.map((date) => {
                    const dayTxs = groupedTransactions[date];
                    const daySum = dayTxs.reduce((sum, tx) => {
                      const amount = tx.category?.type === CategoryTypeEnum.INCOME ? tx.amount : -tx.amount;
                      return sum + amount;
                    }, 0);
                    const isNegative = daySum < 0;

                    return (
                      <div key={date} className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {formatDateHeader(date)}
                          </div>
                          <div
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              isNegative
                                ? 'bg-red-50 text-red-600'
                                : 'bg-emerald-50 text-emerald-600'
                            }`}
                          >
                            {formatCurrency(daySum)}
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          {dayTxs.map((tx) => (
                            <TransactionListItem
                              key={tx.id}
                              transaction={tx}
                              onDelete={handleDelete}
                              isDeleting={deleteTxMutation.isPending && deleteTxMutation.variables === tx.id}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}

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
          </>
        )}
      </main>

      {/* Quick Add Transaction Drawer */}
      <QuickAddTransaction open={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />

      {/* Mobile Bottom Nav */}
      <MobileBottomNav onOpenAddTransaction={() => setIsQuickAddOpen(true)} />
    </div>
  );
};

export default TransactionHistoryPage;
