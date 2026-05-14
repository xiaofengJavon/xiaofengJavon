import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
  Card,
  Tag,
  Popconfirm,
  message,
  Tooltip,
  Switch,
  List,
  Row,
  Col,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'
import type { VipPlan, VipPlanFormData, VipFeature } from '../../types'
import {
  getVipPlans,
  createVipPlan,
  updateVipPlan,
  deleteVipPlan,
  toggleVipPlanStatus,
} from '../../services/api'

const { Title, Text } = Typography

const VipPlans: React.FC = () => {
  const [plans, setPlans] = useState<VipPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const res = await getVipPlans()
      setPlans(res.data)
    } catch {
      message.error('获取VIP套餐失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      planKey: 'CUSTOM',
      isEnabled: true,
      sortOrder: plans.length + 1,
      features: [{ icon: '📡', text: '全类目内容无限解锁' }],
    })
    setModalOpen(true)
  }

  const openEdit = (plan: VipPlan) => {
    setEditingId(plan.id || null)
    form.setFieldsValue({
      planKey: plan.key,
      planLabel: plan.label,
      price: plan.price,
      pricePerMonth: plan.per,
      badge: plan.badge,
      durationDays: plan.durationDays,
      features: plan.features,
      isEnabled: plan.isEnabled ?? true,
      sortOrder: plan.sortOrder ?? 0,
    })
    setModalOpen(true)
  }

  const handleSave = async (values: VipPlanFormData) => {
    setSaving(true)
    try {
      if (editingId) {
        await updateVipPlan(editingId, values)
        message.success('套餐更新成功')
      } else {
        await createVipPlan(values)
        message.success('套餐创建成功')
      }
      setModalOpen(false)
      fetchPlans()
    } catch (error: any) {
      message.error(error.response?.data?.message || (editingId ? '更新失败' : '创建失败'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteVipPlan(id)
      message.success('删除成功')
      fetchPlans()
    } catch {
      message.error('删除失败')
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleVipPlanStatus(id)
      message.success('状态切换成功')
      fetchPlans()
    } catch {
      message.error('状态切换失败')
    }
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            VIP套餐配置
          </Title>
          <Text type="secondary">管理VIP会员套餐价格和特权</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增套餐
        </Button>
      </div>

      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <Table
          loading={loading}
          dataSource={plans}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: '套餐标识',
              dataIndex: 'key',
              key: 'key',
              width: 120,
              render: (key: string) => <Tag color="blue">{key}</Tag>,
            },
            {
              title: '套餐名称',
              dataIndex: 'label',
              key: 'label',
              width: 100,
            },
            {
              title: '价格',
              dataIndex: 'price',
              key: 'price',
              width: 100,
              render: (price: number) => (
                <Text strong style={{ fontSize: 16, color: '#1677ff' }}>
                  ¥{price}
                </Text>
              ),
            },
            {
              title: '月均价格',
              dataIndex: 'per',
              key: 'per',
              width: 100,
            },
            {
              title: '有效天数',
              dataIndex: 'durationDays',
              key: 'durationDays',
              width: 100,
              render: (days: number) => `${days} 天`,
            },
            {
              title: '角标',
              dataIndex: 'badge',
              key: 'badge',
              width: 100,
              render: (badge?: string) =>
                badge ? <Tag color="gold">{badge}</Tag> : <Text type="secondary">无</Text>,
            },
            {
              title: '特权数量',
              key: 'features',
              width: 100,
              render: (_: unknown, record: VipPlan) => (
                <Text>{record.features?.length || 0} 项</Text>
              ),
            },
            {
              title: '操作',
              key: 'action',
              width: 150,
              render: (_: unknown, record: VipPlan) => (
                <Space>
                  <Tooltip title="编辑">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => openEdit(record)}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="确认删除该套餐？"
                    onConfirm={() => handleDelete(record.id!)}
                    okText="删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                  >
                    <Tooltip title="删除">
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Tooltip>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingId ? '编辑VIP套餐' : '新增VIP套餐'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="planKey"
                label="套餐标识"
                rules={[
                  { required: true, message: '请输入套餐标识' },
                  {
                    pattern: /^(MONTHLY|QUARTERLY|YEARLY|CUSTOM)$/,
                    message: '必须是 MONTHLY, QUARTERLY, YEARLY 或 CUSTOM',
                  },
                ]}
              >
                <Input
                  placeholder="MONTHLY/QUARTERLY/YEARLY/CUSTOM"
                  disabled={!!editingId}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="planLabel"
                label="套餐名称"
                rules={[{ required: true, message: '请输入套餐名称' }]}
              >
                <Input placeholder="月度/季度/年度" maxLength={50} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="套餐价格"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber
                  min={0.01}
                  max={999999.99}
                  precision={2}
                  prefix="¥"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="pricePerMonth"
                label="月均价格显示"
                rules={[{ required: true, message: '请输入月均价格' }]}
              >
                <Input placeholder="¥29/月" maxLength={20} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="badge" label="角标文字">
                <Input placeholder="推荐/最划算" maxLength={20} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="durationDays"
                label="有效天数"
                rules={[{ required: true, message: '请输入有效天数' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isEnabled"
                label="启用状态"
                valuePropName="checked"
              >
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sortOrder"
                label="排序顺序"
                rules={[{ required: true, message: '请输入排序' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="套餐特权">
            <Form.List name="features">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: 'flex', marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'icon']}
                        rules={[{ required: true, message: '请输入图标' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="📡" style={{ width: 60 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'text']}
                        rules={[{ required: true, message: '请输入特权描述' }]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Input placeholder="全类目内容无限解锁" maxLength={100} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusCircleOutlined />}
                  >
                    添加特权
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                {editingId ? '保存' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default VipPlans
