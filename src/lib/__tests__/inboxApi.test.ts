import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { inboxApi } from '../inboxApi';

const BASE = '*/api';

const emptyPage = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
};

describe('inboxApi BE contract tests', () => {
  describe('getList', () => {
    it('response has briefTitle (not title), sentAt (not createdAt), briefId', async () => {
      const { data } = await inboxApi.getList();
      const page = data.data;

      expect(page).toHaveProperty('content');
      expect(Array.isArray(page.content)).toBe(true);

      const item = page.content[0];
      expect(item).toHaveProperty('briefTitle');
      expect(item).not.toHaveProperty('title');
      expect(item).toHaveProperty('sentAt');
      expect(item).not.toHaveProperty('createdAt');
      expect(item).toHaveProperty('briefId');
      expect(item).toHaveProperty('deliveryId');
      expect(item).toHaveProperty('legalField');
      expect(item).toHaveProperty('status');
    });

    it('uses status query param and does not send legacy filter', async () => {
      expect.assertions(3);

      server.use(
        http.get(`${BASE}/lawyer/inbox`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('status')).toBe('DELIVERED');
          expect(url.searchParams.has('filter')).toBe(false);
          return HttpResponse.json({
            result: true,
            message: '성공',
            data: emptyPage,
          });
        }),
      );

      const { data } = await inboxApi.getList(0, 20, 'DELIVERED');
      expect(data.data.content).toEqual([]);
    });

    it('omits status query param for all inbox items', async () => {
      expect.assertions(2);

      server.use(
        http.get(`${BASE}/lawyer/inbox`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.has('status')).toBe(false);
          return HttpResponse.json({
            result: true,
            message: '성공',
            data: emptyPage,
          });
        }),
      );

      const { data } = await inboxApi.getList(0, 20);
      expect(data.data.content).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('uses all, newCount, reviewing, confirmed, rejected, responded (BE InboxStatsResponse)', async () => {
      const { data } = await inboxApi.getStats();
      const stats = data.data;

      expect(stats).toHaveProperty('all');
      expect(stats).toHaveProperty('newCount');
      expect(stats).toHaveProperty('reviewing');
      expect(stats).toHaveProperty('confirmed');
      expect(stats).toHaveProperty('rejected');
      expect(stats).toHaveProperty('responded');
      expect(stats).not.toHaveProperty('total');
      expect(stats).not.toHaveProperty('pending');
      expect(typeof stats.all).toBe('number');
      expect(typeof stats.newCount).toBe('number');
      expect(typeof stats.confirmed).toBe('number');
    });
  });

  describe('getById', () => {
    it('has clientEmail (not clientId)', async () => {
      const { data } = await inboxApi.getById('aa0e8400-e29b-41d4-a716-446655440005');
      const detail = data.data;

      expect(detail).toHaveProperty('deliveryId');
      expect(detail).toHaveProperty('briefId');
      expect(detail).toHaveProperty('title');
      expect(detail).toHaveProperty('legalField');
      expect(detail).toHaveProperty('content');
      expect(detail).toHaveProperty('keywords');
      expect(detail).toHaveProperty('keyIssues');
      expect(detail).toHaveProperty('status');
      expect(detail).toHaveProperty('clientName');
      expect(detail).toHaveProperty('clientEmail');
      expect(detail).not.toHaveProperty('clientId');
      expect(detail).toHaveProperty('sentAt');
    });
  });

  describe('updateStatus', () => {
    it('returns deliveryId, status, respondedAt', async () => {
      const { data } = await inboxApi.updateStatus(
        'aa0e8400-e29b-41d4-a716-446655440005',
        'CONFIRMED',
      );
      const result = data.data;

      expect(result).toHaveProperty('deliveryId');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('respondedAt');
    });
  });
});
