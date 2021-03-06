import fetch from 'node-fetch';
import chalk from 'chalk';
import * as M from 'moment';

import {Account} from './account';
import {getDayIndex} from '../time';
import {parseAccountUrl} from '../libs/urls';

const BASE_URL = 'https://hackerrank.com';

export class HackerRankAccount implements Account {
  static title = 'HackerRank';
  static aliases = ['hackerrank', 'hr'];
  static statistic = 'submissions made';
  static theme = chalk.hex('#23b355');

  static resolveUrlToId(url: string) {
    return parseAccountUrl(url, /\/\/(?:www\.)?hackerrank\.com\/(?:profile\/)?([^/\s?]+)/i);
  }

  constructor(private username: string) {}

  get canonicalUrl() {
    return `https://hackerrank.com/${this.username}`;
  }

  submissions: Map<number, number> = new Map();

  async getReport(day: number) {
    if (!this.submissions.has(day)) {
      try {
        const contributions = await (await fetch(`${BASE_URL}/rest/hackers/${this.username}/submission_histories`)).json();
        for (const contributionDate of Object.keys(contributions)) {
          const contributionDay = getDayIndex(M(contributionDate));
          this.submissions.set(contributionDay, parseInt(contributions[contributionDate]));
        }
        if (!this.submissions.has(day)) {
          this.submissions.set(day, 0);
        }
      } catch {
        return null;
      }
    }

    return this.submissions.get(day) as number;
  }
}
