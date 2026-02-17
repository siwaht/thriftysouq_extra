import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Currency } from '../lib/supabase';

interface CurrencyContextType {
  currency: Currency | null;
  currencies: Currency[];
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
  convertPrice: (price: number) => number;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currency, setCurrencyState] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setCurrencies(data);

        const savedCurrencyCode = localStorage.getItem('selectedCurrency');
        const savedCurrency = data.find(c => c.code === savedCurrencyCode);
        const defaultCurrency = data.find(c => c.is_default) || data[0];

        setCurrencyState(savedCurrency || defaultCurrency);
      }
    } catch (error) {
      console.error('Error loading currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency.code);
  };

  const convertPrice = (price: number): number => {
    if (!currency) return price;
    return price * currency.exchange_rate;
  };

  const formatPrice = (price: number): string => {
    if (!currency) return `$${price.toFixed(2)}`;
    const converted = convertPrice(price);
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencies,
        setCurrency,
        formatPrice,
        convertPrice,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
