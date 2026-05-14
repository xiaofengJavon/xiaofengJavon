import { Category, ArticleType } from '../types';

export const getCategoryGradient = (category: Category, type: ArticleType) => {
  // Distinct gradients for Policy Categories
  if (type === 'policy') {
      if (category.includes('宏观')) return 'from-red-700 to-red-900';
      if (category.includes('法规') || category.includes('地方')) return 'from-sky-600 to-sky-800';
      if (category.includes('标准')) return 'from-slate-600 to-gray-800';
      if (category.includes('解读')) return 'from-amber-600 to-orange-800';
      return 'from-red-800 to-red-950'; // Default Policy
  }

  // Industry Categories
  if (category.includes('新能源')) return 'from-emerald-500 to-teal-700';
  if (category.includes('数字')) return 'from-blue-500 to-indigo-700';
  if (category.includes('制造') || category.includes('智能')) return 'from-slate-600 to-slate-800';
  if (category.includes('医药') || category.includes('健康')) return 'from-cyan-500 to-blue-600';
  if (category.includes('未来')) return 'from-violet-600 to-fuchsia-800';
  
  return 'from-indigo-500 to-purple-700'; // Default Fallback
};

export const isExpiringSoon = (dateStr?: string) => {
  if (!dateStr) return false;
  const today = new Date();
  const expiry = new Date(dateStr);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30; // Alert if less than 30 days
};
