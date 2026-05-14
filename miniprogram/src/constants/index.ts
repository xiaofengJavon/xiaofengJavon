
import type { Article, User, SubscriptionTier } from '../types';

export const BASE_ARTICLES: Article[] = []; 

// Avoid using enum as keys directly to prevent undefined issues in some build environments
export const SUBSCRIPTION_PRICES = {
  'MONTHLY': 29.00,
  'QUARTERLY': 78.00,
  'YEARLY': 268.00,
};

export const SINGLE_CATEGORY_PRICES = {
  'MONTHLY': 2.00,
  'QUARTERLY': 4.00,
  'YEARLY': 12.00,
};

export const SUBSCRIPTION_NAMES = {
  'MONTHLY': '月度会员',
  'QUARTERLY': '季度会员',
  'YEARLY': '年度会员',
  'NONE': '免费用户',
};

// Mock User with some expiring subscriptions for demo
export const MOCK_USER: User = {
  id: 'guest',
  wxOpenid: 'guest',
  isVip: false,
  subscriptionTier: 'NONE' as SubscriptionTier,
  subscriptions: [],
  subscribedCategories: [],
  subscriptionExpiries: {},
  readArticleIds: [],
  unlockedArticleIds: [],
  favorites: [],
  credits: 0,
};

// --- PRESET AI RESPONSES ---
export const PRESET_AI_RESPONSES = {
  general: [
    "根据目前的产业数据分析，这一趋势将持续到2025年底。主要驱动力来自于下游需求的爆发式增长以及政策层面的持续扶持。",
    "这是一个非常好的问题。从产业链上下游来看，核心利润区正在向下游应用端转移，建议关注具备品牌溢价能力的头部企业。",
    "综合多家研报观点，该技术路线的成熟度虽然在提高，但成本控制仍是商业化落地的最大瓶颈。",
    "从历史周期来看，当前正处于行业去库存的尾声，预计下个季度开始将迎来温和复苏。",
    "值得注意的是，跨界巨头的入局正在重塑竞争格局，原有的行业壁垒可能会被颠覆性技术打破。"
  ],
  industry: [
    "数据显示，该细分领域的市场规模年复合增长率超过15%。技术迭代速度快是该行业的主要特征，因此研发投入占比是衡量企业竞争力的关键指标。",
    "供应链的国产化替代进程正在加速。特别是在核心材料环节，国内龙头企业已经实现了技术突破，市场份额有望进一步提升。",
    "产能过剩是当前面临的主要挑战。行业正在经历优胜劣汰的洗牌期，具备成本优势和渠道优势的企业将最终胜出。",
    "数字化转型正在赋能该产业。通过引入AI和大数据分析，生产效率提升了约20%，同时库存周转天数显著下降。",
    "投资者应重点关注该领域的'隐形冠军'，这些企业在细分赛道拥有极高的技术壁垒和稳定的客户粘性。"
  ],
  policy: [
    "该政策的出台旨在规范市场秩序，长期来看有利于行业健康发展。短期内，合规成本较高的中小企业可能会面临经营压力。",
    "根据最新发布的文件解读，政府将在税收优惠、融资支持和人才引进三个方面加大扶持力度，利好高新技术企业。",
    "这标志着监管思路的转变，从'事前审批'转向'事中事后监管'。企业应加强内部合规体系建设，以适应新的监管环境。",
    "地方性法规的实施细则通常会根据当地产业特点进行微调。建议密切关注各省市发改委发布的具体操作指南。",
    "该项标准已被确立为强制性国家标准。未达标的企业将面临整改或退出市场的风险，行业集中度将进一步提高。"
  ]
};
