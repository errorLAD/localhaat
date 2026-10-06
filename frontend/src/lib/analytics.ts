// Analytics & Marketing Conversion Tracking for LocalHaat
// Google Analytics 4 (GA4) & Google Ads Integration

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '';

/**
 * Track page views
 */
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag || !GA_TRACKING_ID) return;
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

/**
 * Track custom events (e.g., add_to_cart, purchase, parcel_created)
 */
export const trackEvent = (action: string, params: Record<string, any> = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  try {
    window.gtag('event', action, params);
  } catch (err) {
    console.debug('[Analytics] Failed to dispatch event:', action, err);
  }
};

/**
 * Specialized conversion events
 */
export const analyticsEvents = {
  viewItem: (product: { id: string; title: string; price: number; category?: string }) => {
    trackEvent('view_item', {
      currency: 'INR',
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          item_category: product.category,
          price: product.price,
        },
      ],
    });
  },

  addToCart: (product: { id: string; title: string; price: number; quantity?: number }) => {
    trackEvent('add_to_cart', {
      currency: 'INR',
      value: product.price * (product.quantity || 1),
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          price: product.price,
          quantity: product.quantity || 1,
        },
      ],
    });
  },

  removeFromCart: (product: { id: string; title: string; price: number }) => {
    trackEvent('remove_from_cart', {
      currency: 'INR',
      value: product.price,
      items: [{ item_id: product.id, item_name: product.title, price: product.price }],
    });
  },

  beginCheckout: (value: number, itemCount: number) => {
    trackEvent('begin_checkout', {
      currency: 'INR',
      value,
      items_count: itemCount,
    });
  },

  purchase: (order: { id: string; value: number; deliveryPin?: string }) => {
    trackEvent('purchase', {
      transaction_id: order.id,
      currency: 'INR',
      value: order.value,
    });
  },

  parcelCreated: (parcel: { trackingNumber: string; weightKg: number; offerPrice?: number }) => {
    trackEvent('parcel_created', {
      tracking_number: parcel.trackingNumber,
      weight_kg: parcel.weightKg,
      value: parcel.offerPrice,
    });
  },

  parcelTracked: (trackingNumber: string) => {
    trackEvent('parcel_tracking', {
      tracking_number: trackingNumber,
    });
  },

  partnerSignup: (category: string) => {
    trackEvent('partner_signup', {
      partner_category: category,
    });
  },

  agentSignup: () => {
    trackEvent('agent_signup', {});
  },
};
