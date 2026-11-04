import { getCategoryColor } from './categoryUtils';

test('assigns a stable color to groceries', () => {
  expect(getCategoryColor('Groceries')).toEqual({bg: '#dcfce7', text: '#166534'});
});

test('handles unknown categories with a neutral fallback', () => {
  expect(getCategoryColor(undefined)).toEqual({bg: '#e2e8f0', text: '#334155'});
});
