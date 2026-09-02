import React from 'react';
import { Button, Popconfirm, Space, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Edit2, Trash2, Sparkles, Bug, Wrench, Info, CheckCircle2, XCircle } from 'lucide-react';
import {
  AnnouncementPriorityEnum,
  AnnouncementTypeEnum,
  IAnnouncement,
} from '@myspend/libs';

interface AdminAnnouncementTableProps {
  data: IAnnouncement[];
  loading: boolean;
  onEdit: (item: IAnnouncement) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export const AdminAnnouncementTable: React.FC<AdminAnnouncementTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const getTypeTag = (type: AnnouncementTypeEnum) => {
    switch (type) {
      case AnnouncementTypeEnum.FEATURE:
        return (
          <Tag color="success" className="inline-flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3" /> Tính năng
          </Tag>
        );
      case AnnouncementTypeEnum.BUG_FIX:
        return (
          <Tag color="warning" className="inline-flex items-center gap-1 font-medium">
            <Bug className="w-3 h-3" /> Sửa lỗi
          </Tag>
        );
      case AnnouncementTypeEnum.MAINTENANCE:
        return (
          <Tag color="processing" className="inline-flex items-center gap-1 font-medium">
            <Wrench className="w-3 h-3" /> Bảo trì
          </Tag>
        );
      default:
        return (
          <Tag color="default" className="inline-flex items-center gap-1 font-medium">
            <Info className="w-3 h-3" /> Chung
          </Tag>
        );
    }
  };

  const getPriorityTag = (priority: AnnouncementPriorityEnum) => {
    switch (priority) {
      case AnnouncementPriorityEnum.HIGH:
        return <Tag color="error">Cao</Tag>;
      case AnnouncementPriorityEnum.MEDIUM:
        return <Tag color="blue">Trung bình</Tag>;
      default:
        return <Tag color="default">Thấp</Tag>;
    }
  };

  const columns: ColumnsType<IAnnouncement> = [
    {
      title: 'Tiêu đề thông báo',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: IAnnouncement) => (
        <div>
          <span className="font-semibold text-gray-900">{title}</span>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-md">
            {record.content}
          </p>
        </div>
      ),
    },
    {
      title: 'Phân loại',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type: AnnouncementTypeEnum) => getTypeTag(type),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: AnnouncementPriorityEnum) => getPriorityTag(priority),
    },
    {
      title: 'Hiện Popup',
      dataIndex: 'isPopup',
      key: 'isPopup',
      width: 120,
      render: (isPopup: boolean) =>
        isPopup ? (
          <Tag color="cyan" className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Có
          </Tag>
        ) : (
          <Tag color="default" className="inline-flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Không
          </Tag>
        ),
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      render: (isActive: boolean, record: IAnnouncement) => (
        <Switch
          checked={isActive}
          onChange={() => onToggleActive(record.id)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: 'Ngày phát hành',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 140,
      render: (date: string | Date) =>
        date
          ? new Intl.DateTimeFormat('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date(date))
          : '-',
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 110,
      align: 'right',
      render: (_, record: IAnnouncement) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<Edit2 className="w-4 h-4 text-emerald-700" />}
            onClick={() => onEdit(record)}
            aria-label="Sửa thông báo"
          />
          <Popconfirm
            title="Xác nhận xóa thông báo này?"
            description="Thông báo sẽ bị ẩn và không thể khôi phục."
            onConfirm={() => onDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2 className="w-4 h-4" />}
              aria-label="Xóa thông báo"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Tổng cộng ${total} thông báo`,
        }}
        scroll={{ x: 750 }}
      />
    </div>
  );
};
