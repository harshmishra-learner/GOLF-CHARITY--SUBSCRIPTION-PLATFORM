import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatMonthYear(month: number, year: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1))
}

export function generateRandomNumbers(count: number, max: number): number[] {
  const numbers: number[] = []
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * max) + 1
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
  }
  return numbers.sort((a, b) => a - b)
}

export function getCurrentMonthYear() {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

export function isAdmin(email: string, adminEmails: string[]): boolean {
  return adminEmails.includes(email)
}
