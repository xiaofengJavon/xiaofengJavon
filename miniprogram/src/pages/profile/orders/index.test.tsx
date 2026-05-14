/**
 * 订单页面单元测试
 * 测试订单列表的各项功能
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Taro from '@tarojs/taro';
import OrdersPage from './index';
import { ApiService } from '../../../services/api';

// Mock Taro API
jest.mock('@tarojs/taro', () => ({
  useLoad: jest.fn((callback) => callback()),
  showToast: jest.fn(),
  showActionSheet: jest.fn(),
  showModal: jest.fn(),
}));

// Mock API Service
jest.mock('../../../services/api', () => ({
  ApiService: {
    getOrders: jest.fn(),
  },
}));

describe('订单页面测试', () => {
  const mockOrders = {
    data: [
      {
        id: '1',
        type: 'VIP',
        item: 'VIP会员-月度',
        amount: '9.90',
        status: 'PAID',
        createdAt: '2026-05-10T10:00:00Z',
      },
      {
        id: '2',
        type: 'CATEGORY',
        item: '新能源汽车-季度',
        amount: '4.00',
        status: 'PENDING',
        createdAt: '2026-05-11T15:30:00Z',
      },
    ],
    total: 2,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ApiService.getOrders as jest.Mock).mockResolvedValue(mockOrders);
  });

  test('应该正确渲染订单列表', async () => {
    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('我的订单')).toBeInTheDocument();
      expect(screen.getByText('VIP会员-月度')).toBeInTheDocument();
      expect(screen.getByText('新能源汽车-季度')).toBeInTheDocument();
    });
  });

  test('应该显示三个标签页', () => {
    render(<OrdersPage />);

    expect(screen.getByText('全部')).toBeInTheDocument();
    expect(screen.getByText('待支付')).toBeInTheDocument();
    expect(screen.getByText('已支付')).toBeInTheDocument();
  });

  test('点击标签页应该切换并重新加载数据', async () => {
    render(<OrdersPage />);

    const paidTab = screen.getByText('已支付');
    fireEvent.click(paidTab);

    await waitFor(() => {
      expect(ApiService.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PAID',
          page: 1,
          pageSize: 20,
        })
      );
    });
  });

  test('应该显示搜索框', () => {
    render(<OrdersPage />);

    const searchInput = screen.getByPlaceholderText('搜索订阅内容');
    expect(searchInput).toBeInTheDocument();
  });

  test('输入搜索关键词应该触发搜索', async () => {
    render(<OrdersPage />);

    const searchInput = screen.getByPlaceholderText('搜索订阅内容');
    fireEvent.input(searchInput, { detail: { value: 'VIP' } });
    fireEvent.confirm(searchInput);

    await waitFor(() => {
      expect(ApiService.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'VIP',
        })
      );
    });
  });

  test('点击时间筛选按钮应该显示选项', () => {
    render(<OrdersPage />);

    const timeFilterBtn = screen.getByText('时间');
    fireEvent.click(timeFilterBtn);

    expect(Taro.showActionSheet).toHaveBeenCalledWith(
      expect.objectContaining({
        itemList: ['最近7天', '最近30天', '最近3个月', '自定义时间'],
      })
    );
  });

  test('选择时间范围应该更新筛选条件', async () => {
    (Taro.showActionSheet as jest.Mock).mockImplementation(({ success }) => {
      success({ tapIndex: 0 }); // 选择"最近7天"
    });

    render(<OrdersPage />);

    const timeFilterBtn = screen.getByText('时间');
    fireEvent.click(timeFilterBtn);

    await waitFor(() => {
      expect(ApiService.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(String),
          endDate: expect.any(String),
        })
      );
    });
  });

  test('应该显示筛选标签', async () => {
    render(<OrdersPage />);

    const searchInput = screen.getByPlaceholderText('搜索订阅内容');
    fireEvent.input(searchInput, { detail: { value: 'VIP' } });

    await waitFor(() => {
      expect(screen.getByText(/关键词: VIP/)).toBeInTheDocument();
    });
  });

  test('点击清除按钮应该清空所有筛选', async () => {
    render(<OrdersPage />);

    // 设置搜索关键词
    const searchInput = screen.getByPlaceholderText('搜索订阅内容');
    fireEvent.input(searchInput, { detail: { value: 'VIP' } });

    await waitFor(() => {
      expect(screen.getByText('清除')).toBeInTheDocument();
    });

    // 点击清除按钮
    const clearBtn = screen.getByText('清除');
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
  });

  test('应该正确显示订单状态', () => {
    render(<OrdersPage />);

    waitFor(() => {
      expect(screen.getByText('已支付')).toBeInTheDocument();
      expect(screen.getByText('待支付')).toBeInTheDocument();
    });
  });

  test('应该正确格式化金额', () => {
    render(<OrdersPage />);

    waitFor(() => {
      expect(screen.getByText('¥9.90')).toBeInTheDocument();
      expect(screen.getByText('¥4.00')).toBeInTheDocument();
    });
  });

  test('空订单列表应该显示空状态', async () => {
    (ApiService.getOrders as jest.Mock).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('暂无订单记录')).toBeInTheDocument();
      expect(screen.getByText('完成订阅后，订单将在此显示')).toBeInTheDocument();
    });
  });

  test('加载失败应该显示错误提示', async () => {
    (ApiService.getOrders as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(Taro.showToast).toHaveBeenCalledWith({
        title: '加载失败',
        icon: 'none',
      });
    });
  });

  test('应该支持分页加载', async () => {
    const mockPage2 = {
      ...mockOrders,
      page: 2,
      data: [
        {
          id: '3',
          type: 'VIP',
          item: 'VIP会员-年度',
          amount: '99.00',
          status: 'PAID',
          createdAt: '2026-05-09T10:00:00Z',
        },
      ],
    };

    (ApiService.getOrders as jest.Mock)
      .mockResolvedValueOnce(mockOrders)
      .mockResolvedValueOnce(mockPage2);

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('加载更多')).toBeInTheDocument();
    });

    const loadMoreBtn = screen.getByText('加载更多');
    fireEvent.click(loadMoreBtn);

    await waitFor(() => {
      expect(ApiService.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });
  });

  test('最后一页应该显示结束提示', async () => {
    (ApiService.getOrders as jest.Mock).mockResolvedValue({
      ...mockOrders,
      totalPages: 1,
    });

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('— 已显示全部订单 —')).toBeInTheDocument();
    });
  });
});

