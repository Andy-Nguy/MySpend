import React, { useEffect } from 'react';
import { Form, Input, Modal, Select, Switch } from 'antd';
import {
  AnnouncementPriorityEnum,
  AnnouncementTypeEnum,
  IAnnouncement,
  ICreateAnnouncementDto,
  IUpdateAnnouncementDto,
} from '@myspend/libs';

interface AdminAnnouncementDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ICreateAnnouncementDto | IUpdateAnnouncementDto) => Promise<void>;
  initialData?: IAnnouncement | null;
  loading?: boolean;
}

export const AdminAnnouncementDialog: React.FC<AdminAnnouncementDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [form] = Form.useForm();
  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          title: initialData.title,
          version: initialData.version,
          type: initialData.type,
          priority: initialData.priority,
          isActive: initialData.isActive,
          isPopup: initialData.isPopup,
          content: initialData.content,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          type: AnnouncementTypeEnum.FEATURE,
          priority: AnnouncementPriorityEnum.MEDIUM,
          isActive: true,
          isPopup: true,
        });
      }
    }
  }, [open, initialData, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
      onClose();
    } catch {
      // Form validation error
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa thông báo cập nhật' : 'Tạo thông báo cập nhật mới'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      cancelButtonProps={{ disabled: loading }}
      closable={!loading}
      maskClosable={!loading}
      okText={isEdit ? 'Lưu thay đổi' : 'Tạo thông báo'}
      cancelText="Hủy"
      width={600}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{
          type: AnnouncementTypeEnum.FEATURE,
          priority: AnnouncementPriorityEnum.MEDIUM,
          isActive: true,
          isPopup: true,
        }}
      >
        {/* Title */}
        <Form.Item
          name="title"
          label="Tiêu đề thông báo"
          rules={[
            { required: true, message: 'Vui lòng nhập tiêu đề thông báo' },
            { max: 255, message: 'Tiêu đề không được vượt quá 255 ký tự' },
          ]}
        >
          <Input placeholder="Ví dụ: Ra mắt tính năng Báo cáo & Lịch sử giao dịch" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Type */}
          <Form.Item
            name="type"
            label="Loại cập nhật"
            rules={[{ required: true, message: 'Vui lòng chọn loại cập nhật' }]}
          >
            <Select
              options={[
                { label: '✨ Tính năng mới', value: AnnouncementTypeEnum.FEATURE },
                { label: '🐛 Sửa lỗi', value: AnnouncementTypeEnum.BUG_FIX },
                { label: '🛠️ Bảo trì hệ thống', value: AnnouncementTypeEnum.MAINTENANCE },
                { label: '📢 Thông báo chung', value: AnnouncementTypeEnum.GENERAL },
              ]}
            />
          </Form.Item>

          {/* Priority */}
          <Form.Item
            name="priority"
            label="Mức ưu tiên"
            rules={[{ required: true, message: 'Vui lòng chọn mức ưu tiên' }]}
          >
            <Select
              options={[
                { label: 'Thấp', value: AnnouncementPriorityEnum.LOW },
                { label: 'Trung bình', value: AnnouncementPriorityEnum.MEDIUM },
                { label: 'Cao', value: AnnouncementPriorityEnum.HIGH },
              ]}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-xl mb-4 border border-gray-100">
          {/* isPopup */}
          <Form.Item
            name="isPopup"
            valuePropName="checked"
            className="!mb-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-800 block">Hiện Popup tự động</span>
                <span className="text-xs text-gray-500">Tự bật modal khi user đăng nhập</span>
              </div>
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </div>
          </Form.Item>

          {/* isActive */}
          <Form.Item
            name="isActive"
            valuePropName="checked"
            className="!mb-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-800 block">Kích hoạt ngay</span>
                <span className="text-xs text-gray-500">Người dùng có thể xem được</span>
              </div>
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </div>
          </Form.Item>
        </div>

        {/* Content */}
        <Form.Item
          name="content"
          label="Nội dung cập nhật (hỗ trợ xuống dòng/gạch đầu dòng)"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung cập nhật' }]}
        >
          <Input.TextArea
            rows={6}
            placeholder={`- Bổ sung màn hình Báo cáo tài chính theo tháng
- Thêm biểu đồ cơ cấu chi tiêu trực quan
- Cải thiện tốc độ tải trang`}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
