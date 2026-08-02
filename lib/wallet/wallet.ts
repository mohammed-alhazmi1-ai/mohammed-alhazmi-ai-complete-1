/**
 * Wallet / Credits system
 * freeCredits + paidCredits + referralCredits
 */
export class WalletService {
  freeCredits = 0;
  paidCredits = 0;
  referralCredits = 0;

  get total() {
    return this.freeCredits + this.paidCredits + this.referralCredits;
  }

  canSpend(amount: number) {
    return this.total >= amount;
  }

  // In real app: update via Prisma + transaction log
  async spend(amount: number, description: string) {
    if (!this.canSpend(amount)) throw new Error('رصيد غير كافٍ');
    // Prefer deducting free first
    let remaining = amount;
    if (this.freeCredits >= remaining) {
      this.freeCredits -= remaining;
    } else {
      remaining -= this.freeCredits;
      this.freeCredits = 0;
      if (this.paidCredits >= remaining) {
        this.paidCredits -= remaining;
      } else {
        remaining -= this.paidCredits;
        this.paidCredits = 0;
        this.referralCredits -= remaining;
      }
    }
    return { newBalance: this.total, description };
  }
}
