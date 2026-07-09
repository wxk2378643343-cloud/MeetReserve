import { useEffect, useState } from 'react';
import { Button, Table, Input, Space, Modal, Form, InputNumber, Select, Tag, Upload } from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  createRoom,
  deleteRoom,
  downloadRoomTemplate,
  getRooms,
  importRooms,
  updateRoom,
} from '@/api/admin';
import type { Room, ImportResult } from '@/types';
import PageHeader from '@/components/PageHeader';
import { useResponsive } from '@/hooks/useResponsive';
import { message } from '@/utils/message';

function RoomManage() {
  const { isMobile } = useResponsive();
  const [data, setData] = useState<Room[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    const res = await getRooms({ page, size: 10, keyword });
    setData(res.records);
    setTotal(res.total);
  };

  useEffect(() => {
    load();
  }, [page, keyword]);

  const openModal = (room?: Room) => {
    setEditing(room || null);
    form.setFieldsValue(room || { capacity: 10, status: 1 });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateRoom(editing.id, values);
      message.success('更新成功');
    } else {
      await createRoom(values);
      message.success('创建成功');
    }
    setOpen(false);
    load();
  };

  const handleImport = async (file: File) => {
    const result = await importRooms(file);
    setImportResult(result);
    message.success(`导入完成：成功 ${result.success}，失败 ${result.failed}`);
    load();
    return false;
  };

  return (
    <div>
      <PageHeader
        title="会议室管理"
        subtitle="维护会议室信息，支持 Excel 批量导入"
        extra={
          <Space wrap>
            <Button icon={<DownloadOutlined />} onClick={downloadRoomTemplate}>
              下载模板
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => {
                setImportOpen(true);
                setImportResult(null);
              }}
            >
              批量导入
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增会议室
            </Button>
          </Space>
        }
      />

      <div className="content-card">
        <div className="content-card-body">
          <Input.Search
            placeholder="搜索会议室名称"
            className="table-search"
            onSearch={setKeyword}
            allowClear
          />
          <Table
            rowKey="id"
            dataSource={data}
            scroll={{ x: isMobile ? 640 : undefined }}
            pagination={{ current: page, total, onChange: setPage, showTotal: (t) => `共 ${t} 条` }}
            columns={[
              { title: '名称', dataIndex: 'name', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
              { title: '位置', dataIndex: 'location' },
              { title: '容量', dataIndex: 'capacity', width: 80 },
              { title: '设备', dataIndex: 'equipment', ellipsis: true },
              {
                title: '状态',
                dataIndex: 'status',
                width: 90,
                render: (s: number) => (s === 1 ? <Tag color="success">可用</Tag> : <Tag>停用</Tag>),
              },
              {
                title: '操作',
                width: 140,
                fixed: isMobile ? 'right' : undefined,
                render: (_, row) => (
                  <Space>
                    <Button type="link" onClick={() => openModal(row)}>
                      编辑
                    </Button>
                    <Button
                      type="link"
                      danger
                      onClick={() =>
                        Modal.confirm({
                          title: '确认删除该会议室？',
                          onOk: async () => {
                            await deleteRoom(row.id);
                            message.success('已删除');
                            load();
                          },
                        })
                      }
                    >
                      删除
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </div>
      </div>

      <Modal
        title={editing ? '编辑会议室' : '新增会议室'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label="位置">
            <Input />
          </Form.Item>
          <Form.Item name="capacity" label="容量" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="equipment" label="设备">
            <Input placeholder="投影仪、白板等" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select options={[{ label: '可用', value: 1 }, { label: '停用', value: 0 }]} />
          </Form.Item>
          <Form.Item name="description" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="批量导入会议室" open={importOpen} onCancel={() => setImportOpen(false)} footer={null}>
        <Upload.Dragger accept=".xlsx,.xls" beforeUpload={handleImport} showUploadList={false}>
          <p>点击或拖拽 Excel 文件到此处</p>
        </Upload.Dragger>
        {importResult && (
          <div style={{ marginTop: 16 }}>
            <p>
              总计 {importResult.total} · 成功 {importResult.success} · 失败 {importResult.failed}
            </p>
            {importResult.errors.length > 0 && (
              <Table
                size="small"
                pagination={false}
                scroll={{ x: 360 }}
                dataSource={importResult.errors}
                rowKey="row"
                columns={[
                  { title: '行号', dataIndex: 'row', width: 60 },
                  { title: '名称', dataIndex: 'username' },
                  { title: '原因', dataIndex: 'reason' },
                ]}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default RoomManage;
