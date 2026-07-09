import React, { useEffect, useState } from 'react';
import { Button, Table, Input, Space, Modal, Form, Select, Tag, Upload } from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  createUser,
  deleteUser,
  downloadUserTemplate,
  getUsers,
  importUsers,
  resetPassword,
  updateUser,
} from '@/api/admin';
import type { User, ImportResult } from '@/types';
import PageHeader from '@/components/PageHeader';
import { useResponsive } from '@/hooks/useResponsive';
import { message } from '@/utils/message';

function UserManage() {
  const { isMobile } = useResponsive();
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    const res = await getUsers({ page, size: 10, keyword });
    setData(res.records);
    setTotal(res.total);
  };

  useEffect(() => {
    load();
  }, [page, keyword]);

  const openModal = (user?: User) => {
    setEditing(user || null);
    form.setFieldsValue(user || { role: 'USER', status: 1 });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateUser(editing.id, values);
      message.success('更新成功');
    } else {
      await createUser(values);
      message.success('创建成功');
    }
    setOpen(false);
    load();
  };

  const handleImport = async (file: File) => {
    const result = await importUsers(file);
    setImportResult(result);
    message.success(`导入完成：成功 ${result.success}，失败 ${result.failed}`);
    load();
    return false;
  };

  return (
    <div>
      <PageHeader
        title="用户管理"
        subtitle="管理系统用户，支持批量导入"
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={downloadUserTemplate}>
              下载模板
            </Button>
            <Button icon={<UploadOutlined />} onClick={() => { setImportOpen(true); setImportResult(null); }}>
              批量导入
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增用户
            </Button>
          </Space>
        }
      />

      <div className="content-card">
        <div className="content-card-body">
          <Input.Search
            placeholder="搜索用户名/姓名"
            className="table-search"
            onSearch={setKeyword}
            allowClear
          />
          <Table
        rowKey="id"
        dataSource={data}
            scroll={{ x: isMobile ? 720 : undefined }}
            pagination={{ current: page, total, onChange: setPage, showTotal: (t) => `共 ${t} 条` }}
        columns={[
          { title: '用户名', dataIndex: 'username' },
          { title: '姓名', dataIndex: 'realName' },
          { title: '角色', dataIndex: 'role', render: (r: string) => (r === 'ADMIN' ? '管理员' : '用户') },
          {
            title: '状态',
            dataIndex: 'status',
            render: (s: number) => (s === 1 ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag>),
          },
          {
            title: '操作',
            render: (_, row) => (
              <Space>
                <Button type="link" onClick={() => openModal(row)}>
                  编辑
                </Button>
                <Button
                  type="link"
                  onClick={() =>
                    Modal.confirm({
                      title: '重置为默认密码 123456？',
                      onOk: async () => {
                        await resetPassword(row.id);
                        message.success('已重置');
                      },
                    })
                  }
                >
                  重置密码
                </Button>
                <Button
                  type="link"
                  danger
                  onClick={() =>
                    Modal.confirm({
                      title: '确认删除？',
                      onOk: async () => {
                        await deleteUser(row.id);
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

      <Modal title={editing ? '编辑用户' : '新增用户'} open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical">
          {!editing && (
            <>
              <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="password" label="密码">
                <Input.Password placeholder="默认 123456" />
              </Form.Item>
            </>
          )}
          <Form.Item name="realName" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select options={[{ label: '用户', value: 'USER' }, { label: '管理员', value: 'ADMIN' }]} />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Select options={[{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal title="批量导入用户" open={importOpen} onCancel={() => setImportOpen(false)} footer={null}>
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
                dataSource={importResult.errors}
                rowKey="row"
                columns={[
                  { title: '行号', dataIndex: 'row' },
                  { title: '用户名', dataIndex: 'username' },
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

export default UserManage;
