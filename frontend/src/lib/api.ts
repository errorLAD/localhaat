const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

class ApiClient {
  public getBaseUrl(): string {
    return getBaseUrl();
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('localhaat_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.getBaseUrl()}${endpoint}`;
    const headers = { ...this.getHeaders(), ...options.headers };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorObj: any = new Error(data.message || `Request failed with status ${response.status}`);
        errorObj.status = response.status;
        throw errorObj;
      }

      return data;
    } catch (error: any) {
      console.error(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Authentication
  async requestOtp(phone: string) {
    return this.request('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOtp(phone: string, otp: string, role?: string, name?: string) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, role, name }),
    });
  }

  async signup(data: { name: string; phone: string; password?: string; role?: string; email?: string; defaultLocation?: any }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signupCustomer(data: any) {
    return this.request('/auth/signup/customer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signupLogisticsPartner(data: any) {
    return this.request('/auth/signup/partner/logistics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signupTravellingPartner(data: any) {
    return this.request('/auth/signup/partner/travelling', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signupVillageAgent(data: any) {
    return this.request('/auth/signup/agent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadFile(file: string, fileName?: string) {
    return this.request('/upload', {
      method: 'POST',
      body: JSON.stringify({ file, fileName }),
    });
  }

  async login(phone: string, password?: string, role?: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password, role }),
    });
  }

  async demoLogin(role: string) {
    return this.request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async switchRole(role: string) {
    return this.request('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Products & Categories
  async getProducts(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/products${qs}`);
  }

  async getProductBySlug(slug: string) {
    return this.request(`/products/${slug}`);
  }

  async getCategories() {
    return this.request('/products/categories');
  }

  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // Orders
  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getMyOrders() {
    return this.request('/orders/my-orders');
  }

  async getOrderById(id: string) {
    return this.request(`/orders/${id}`);
  }

  // Parcels & Tracking Lifecycle
  async createParcel(parcelData: any) {
    return this.request('/parcels', {
      method: 'POST',
      body: JSON.stringify(parcelData),
    });
  }

  async getAvailableAgents(search?: string) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/parcels/agents${qs}`);
  }

  async searchParcelMatches(data: {
    pickupLocation: string;
    deliveryLocation: string;
    weightKg: number;
    sendDate?: string;
    sendTime?: string;
    flexibleDate?: boolean;
    customerOfferPrice?: number;
  }) {
    return this.request('/parcels/search-matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getParcelMatches(parcelId: string, params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/parcels/${parcelId}/matches${qs}`);
  }

  async selectParcelPartner(parcelId: string, payload: any) {
    return this.request(`/parcels/${parcelId}/select-partner`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getTripStopManifest(tripId: string) {
    return this.request(`/parcels/trips/${tripId}/manifest`);
  }

  async advanceParcelLifecycle(parcelId: string, payload: any) {
    return this.request(`/parcels/${parcelId}/lifecycle-step`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMyParcels() {
    return this.request('/parcels/my-parcels');
  }

  async getParcels(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/parcels${qs}`);
  }

  async getParcelDetails(trackingNumber: string) {
    return this.request(`/parcels/track/${trackingNumber}`);
  }

  async acceptParcel(parcelId: string) {
    return this.request(`/parcels/${parcelId}/accept`, {
      method: 'POST',
    });
  }

  async rejectParcel(parcelId: string) {
    return this.request(`/parcels/${parcelId}/reject`, {
      method: 'POST',
    });
  }

  // Stage 1: Pickup verification (Seller / Sender -> Partner)
  async verifyPickup(parcelId: string, pickupCode: string, locationName?: string, notes?: string) {
    return this.request(`/parcels/${parcelId}/verify-pickup`, {
      method: 'POST',
      body: JSON.stringify({ pickupCode, locationName, notes }),
    });
  }

  async verifyPickupCode(parcelId: string, pickupCode: string, locationName?: string, notes?: string) {
    return this.request(`/parcels/${parcelId}/verify-pickup-code`, {
      method: 'POST',
      body: JSON.stringify({ pickupCode, locationName, notes }),
    });
  }

  // Stage 2: Handover verification (Partner -> Village Agent Hub)
  async verifyHandover(parcelId: string, handoverCode: string, locationName?: string, notes?: string) {
    return this.request(`/parcels/${parcelId}/verify-handover`, {
      method: 'POST',
      body: JSON.stringify({ handoverCode, code: handoverCode, agentCode: handoverCode, agentHandoverCode: handoverCode, locationName, notes }),
    });
  }

  async verifyAgentHandoverCode(parcelId: string, agentHandoverCode: string, locationName?: string, notes?: string) {
    return this.request(`/parcels/${parcelId}/verify-agent-handover-code`, {
      method: 'POST',
      body: JSON.stringify({ agentHandoverCode, handoverCode: agentHandoverCode, agentCode: agentHandoverCode, locationName, notes }),
    });
  }

  async verifyAgentCode(parcelId: string, agentCode: string, locationName?: string, notes?: string) {
    return this.request(`/parcels/${parcelId}/verify-agent-code`, {
      method: 'POST',
      body: JSON.stringify({ agentCode, code: agentCode, handoverCode: agentCode, locationName, notes }),
    });
  }

  // Section 16: Manual Handover Confirmation Fallback (Agent audits when partner device offline)
  async confirmManualAgentHandover(parcelId: string, reason: string, locationName?: string) {
    return this.request(`/agent/parcels/${parcelId}/manual-handover`, {
      method: 'POST',
      body: JSON.stringify({ reason, locationName }),
    });
  }

  // Stage 3: Delivery verification (Village Agent / Partner -> Customer Delivery Code)
  async verifyDelivery(parcelId: string, deliveryPin: string, locationName?: string, notes?: string) {
    return this.request(`/parcels/${parcelId}/verify-delivery`, {
      method: 'POST',
      body: JSON.stringify({ deliveryPin, deliveryCode: deliveryPin, locationName, notes }),
    });
  }

  async verifyDeliveryCode(parcelId: string, deliveryCode: string, locationName?: string, notes?: string) {
    return this.request(`/parcels/${parcelId}/verify-delivery-code`, {
      method: 'POST',
      body: JSON.stringify({ deliveryCode, deliveryPin: deliveryCode, locationName, notes }),
    });
  }

  async updateParcelStatus(parcelId: string, status: string, notes?: string) {
    return this.request(`/parcels/${parcelId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Booking Requests (Sections 19, 21, 23, 32)
  async createBookingRequest(data: {
    parcelId?: string;
    parcelData?: any;
    tripId: string;
    partnerId: string;
    pickupStopId?: string;
    destinationStopId?: string;
    agreedPrice?: number;
  }) {
    return this.request('/parcels/booking-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPartnerBookingRequests(partnerId?: string) {
    const query = partnerId ? `?partnerId=${encodeURIComponent(partnerId)}` : '';
    return this.request(`/parcels/booking-requests/partner${query}`);
  }

  async getBookingRequestById(requestId: string) {
    return this.request(`/parcels/booking-requests/${requestId}`);
  }

  async acceptBookingRequest(requestId: string) {
    return this.request(`/parcels/booking-requests/${requestId}/accept`, {
      method: 'POST',
    });
  }

  async rejectBookingRequest(requestId: string, reason?: string, note?: string) {
    return this.request(`/parcels/booking-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, note }),
    });
  }

  async cancelBookingRequest(requestId: string) {
    return this.request(`/parcels/booking-requests/${requestId}/cancel`, {
      method: 'POST',
    });
  }

  // Payment Operations (Sections 24-30)
  async payCashForParcel(parcelId: string) {
    return this.request(`/parcels/${parcelId}/pay-cash`, {
      method: 'POST',
    });
  }

  async createParcelPaymentOrder(parcelId: string) {
    return this.request(`/parcels/${parcelId}/create-payment-order`, {
      method: 'POST',
    });
  }

  async verifyParcelPayment(
    parcelId: string,
    data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }
  ) {
    return this.request(`/parcels/${parcelId}/verify-payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmCashPayment(parcelId: string) {
    return this.request(`/parcels/${parcelId}/confirm-cash`, {
      method: 'POST',
    });
  }

  // Logistics Portal
  async getPartnerDashboard() {
    return this.request('/logistics/dashboard');
  }

  async togglePartnerOnline() {
    return this.request('/logistics/toggle-online', {
      method: 'POST',
    });
  }

  async getPartnerRoutes() {
    return this.request('/logistics/routes');
  }

  async createPartnerRoute(routeData: any) {
    return this.request('/logistics/routes', {
      method: 'POST',
      body: JSON.stringify(routeData),
    });
  }

  async updatePartnerRoute(routeId: string, routeData: any) {
    return this.request(`/logistics/routes/${routeId}`, {
      method: 'PUT',
      body: JSON.stringify(routeData),
    });
  }

  async deletePartnerRoute(routeId: string) {
    return this.request(`/logistics/routes/${routeId}`, {
      method: 'DELETE',
    });
  }

  async matchRoutes(origin: any, destination: any, weightKg?: number) {
    return this.request('/logistics/routes/match', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, weightKg }),
    });
  }

  async updateLiveLocation(latitude: number, longitude: number, trackingNumber?: string) {
    return this.request('/logistics/location-update', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, trackingNumber }),
    });
  }

  async registerVehicle(vehicleData: any) {
    return this.request('/logistics/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  // Partner Profile & Extended Multi-Entity System
  async getPartnerFullProfile() {
    return this.request('/logistics/profile');
  }

  async updatePartnerProfile(profileData: any) {
    return this.request('/logistics/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Pickup & Drop Locations
  async getPartnerLocations(type?: 'pickup' | 'drop', includeInactive?: boolean) {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (includeInactive) params.set('includeInactive', 'true');
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/logistics/locations${qs}`);
  }

  async addPartnerLocation(locationData: any) {
    return this.request('/logistics/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async updatePartnerLocation(id: string, locationData: any) {
    return this.request(`/logistics/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  }

  async deactivatePartnerLocation(id: string) {
    return this.request(`/logistics/locations/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  // Shops / Business Locations
  async getPartnerShops(includeInactive?: boolean) {
    const qs = includeInactive ? '?includeInactive=true' : '';
    return this.request(`/logistics/shops${qs}`);
  }

  async addPartnerShop(shopData: any) {
    return this.request('/logistics/shops', {
      method: 'POST',
      body: JSON.stringify(shopData),
    });
  }

  async updatePartnerShop(id: string, shopData: any) {
    return this.request(`/logistics/shops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shopData),
    });
  }

  async deactivatePartnerShop(id: string) {
    return this.request(`/logistics/shops/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  // Vehicles
  async getPartnerVehicles() {
    return this.request('/logistics/vehicles');
  }

  async addPartnerVehicle(vehicleData: any) {
    return this.request('/logistics/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async updatePartnerVehicle(id: string, vehicleData: any) {
    return this.request(`/logistics/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async deactivatePartnerVehicle(id: string) {
    return this.request(`/logistics/vehicles/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  // Drivers
  async getPartnerDrivers() {
    return this.request('/logistics/drivers');
  }

  async addPartnerDriver(driverData: any) {
    return this.request('/logistics/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  async updatePartnerDriver(id: string, driverData: any) {
    return this.request(`/logistics/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driverData),
    });
  }

  async deactivatePartnerDriver(id: string) {
    return this.request(`/logistics/drivers/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  // Trips (Stop-by-Stop Route Connection)
  async getPartnerTrips(status?: string) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request(`/logistics/trips${qs}`);
  }

  async createPartnerTrip(tripData: any) {
    return this.request('/logistics/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async updatePartnerTripStatus(id: string, tripStatus: string, operationalLocation?: string) {
    return this.request(`/logistics/trips/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ tripStatus, currentOperationalLocation: operationalLocation }),
    });
  }

  // Documents
  async getPartnerDocuments() {
    return this.request('/logistics/documents');
  }

  async uploadPartnerDocument(documentData: any) {
    return this.request('/logistics/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  // Payouts
  async requestPartnerPayout(amount: number, paymentMode?: string) {
    return this.request('/logistics/payouts', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMode }),
    });
  }

  // Village Agent Portal
  async getAgentDashboard() {
    return this.request('/agent/dashboard');
  }

  async getAgentProfile() {
    return this.request('/agent/profile');
  }

  async updateAgentProfile(profileData: any) {
    return this.request('/agent/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async toggleAgentStatus(isAvailable?: boolean) {
    return this.request('/agent/toggle-status', {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    });
  }

  async recordCashCollection(amount: number, parcelId?: string) {
    return this.request('/agent/cash-collection', {
      method: 'POST',
      body: JSON.stringify({ amount, parcelId }),
    });
  }

  // Business Logistics Portal (B2B Logistics Clients Only)
  async getBusinessDashboard() {
    return this.request('/business/dashboard');
  }

  async getBusinessShipments(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/business/shipments${qs}`);
  }

  async createBusinessShipment(shipmentData: any) {
    return this.request('/business/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  }

  async createBusinessBulkShipments(shipments: any[]) {
    return this.request('/business/shipments/bulk', {
      method: 'POST',
      body: JSON.stringify({ shipments }),
    });
  }

  async createBusinessPickupRequest(pickupData: any) {
    return this.request('/business/pickups', {
      method: 'POST',
      body: JSON.stringify(pickupData),
    });
  }

  async getBusinessInvoices() {
    return this.request('/business/invoices');
  }

  async updateBusinessProfile(profileData: any) {
    return this.request('/business/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changeBusinessPassword(passwords: { currentPassword?: string; newPassword: string }) {
    return this.request('/business/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    });
  }

  // Earnings & Payouts
  async getEarnings() {
    return this.request('/earnings');
  }

  async requestPayout(amount: number, paymentMode?: string, beneficiaryDetails?: any) {
    return this.request('/earnings/payout-request', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMode, beneficiaryDetails }),
    });
  }

  // Admin Portal
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminUsers(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/users${qs}`);
  }

  async getAdminKyc(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return this.request(`/admin/kyc${qs}`);
  }

  async verifyKyc(id: string, status: 'VERIFIED' | 'REJECTED', rejectionReason?: string) {
    return this.request(`/admin/kyc/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejectionReason }),
    });
  }

  async getAdminPayouts(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return this.request(`/admin/payouts${qs}`);
  }

  async processPayout(id: string, status: string, transactionRef?: string) {
    return this.request(`/admin/payouts/${id}/process`, {
      method: 'PUT',
      body: JSON.stringify({ status, transactionRef }),
    });
  }

  // Admin Business Accounts Management
  async getAdminBusinessAccounts(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/businesses${qs}`);
  }

  async createAdminBusinessAccount(accountData: any) {
    return this.request('/admin/businesses', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  async updateAdminBusinessAccount(id: string, accountData: any) {
    return this.request(`/admin/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    });
  }

  async resetAdminBusinessPassword(id: string, newPassword?: string) {
    return this.request(`/admin/businesses/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  async getAdminBusinessShipments(id: string) {
    return this.request(`/admin/businesses/${id}/shipments`);
  }

  // ================= E-COMMERCE / STORE ADMIN API =================
  async getStoreDashboard() {
    return this.request('/admin/store/dashboard');
  }

  // Categories
  async getStoreCategories() {
    return this.request('/admin/store/categories');
  }
  async createStoreCategory(data: any) {
    return this.request('/admin/store/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async updateStoreCategory(id: string, data: any) {
    return this.request(`/admin/store/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  async deleteStoreCategory(id: string) {
    return this.request(`/admin/store/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Subcategories
  async getStoreSubcategories() {
    return this.request('/admin/store/subcategories');
  }
  async createStoreSubcategory(data: any) {
    return this.request('/admin/store/subcategories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async updateStoreSubcategory(id: string, data: any) {
    return this.request(`/admin/store/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  async deleteStoreSubcategory(id: string) {
    return this.request(`/admin/store/subcategories/${id}`, {
      method: 'DELETE',
    });
  }

  // Products
  async getStoreProducts(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/store/products${qs}`);
  }
  async getStoreProductDetail(id: string) {
    return this.request(`/admin/store/products/${id}`);
  }
  async createStoreProduct(data: any) {
    return this.request('/admin/store/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async updateStoreProduct(id: string, data: any) {
    return this.request(`/admin/store/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  async deleteStoreProduct(id: string) {
    return this.request(`/admin/store/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Inventory
  async getStoreInventory(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/store/inventory${qs}`);
  }
  async adjustStoreStock(data: any) {
    return this.request('/admin/store/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async getStoreInventoryLogs() {
    return this.request('/admin/store/inventory/logs');
  }

  // Orders
  async getStoreOrders(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/store/orders${qs}`);
  }
  async getStoreOrderDetail(id: string) {
    return this.request(`/admin/store/orders/${id}`);
  }
  async updateStoreOrderStatus(id: string, data: { status?: string; note?: string; paymentStatus?: string }) {
    return this.request(`/admin/store/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Payments
  async getStorePayments() {
    return this.request('/admin/store/payments');
  }
  async processStoreRefund(id: string, data: { reason: string; amount?: number }) {
    return this.request(`/admin/store/payments/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Customers
  async getStoreCustomers() {
    return this.request('/admin/store/customers');
  }

  // Coupons
  async getStoreCoupons() {
    return this.request('/admin/store/coupons');
  }
  async createStoreCoupon(data: any) {
    return this.request('/admin/store/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async updateStoreCoupon(id: string, data: any) {
    return this.request(`/admin/store/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  async deleteStoreCoupon(id: string) {
    return this.request(`/admin/store/coupons/${id}`, {
      method: 'DELETE',
    });
  }

  // Reviews
  async getStoreReviews() {
    return this.request('/admin/store/reviews');
  }
  async updateStoreReviewStatus(id: string, status: string) {
    return this.request(`/admin/store/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
  async deleteStoreReview(id: string) {
    return this.request(`/admin/store/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  // Shipping & Delivery
  async getStoreShipping() {
    return this.request('/admin/store/shipping');
  }
  async assignStoreShipping(data: any) {
    return this.request('/admin/store/shipping/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Store Settings
  async getStoreSettings() {
    return this.request('/admin/store/settings');
  }
  async updateStoreSettings(data: any) {
    return this.request('/admin/store/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Public Tracking
  async trackPublic(trackingNumber: string) {
    return this.request(`/track/${trackingNumber}`);
  }

  // ================= ADMIN AGENT OPERATIONS =================
  async getAdminAgentDashboardStats() {
    return this.request('/admin/agents/dashboard-stats');
  }

  async getAdminAgents(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/agents${qs}`);
  }

  async getAdminLiveAgents() {
    return this.request('/admin/agents/live');
  }

  async getAdminAgentById(id: string) {
    return this.request(`/admin/agents/${id}`);
  }

  async createAdminAgent(data: any) {
    return this.request('/admin/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetAdminAgentPassword(id: string, newPassword: string) {
    return this.request(`/admin/agents/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  async bulkDeleteAdminAgents(agentIds: string[]) {
    return this.request('/admin/agents/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ agentIds }),
    });
  }

  async deleteAdminAgent(id: string) {
    return this.request(`/admin/agents/${id}`, {
      method: 'DELETE',
    });
  }

  async updateAdminAgentStatus(id: string, action: string, reason?: string, durationDays?: number) {
    return this.request(`/admin/agents/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action, reason, durationDays }),
    });
  }

  async updateAdminAgentProfile(id: string, data: any) {
    return this.request(`/admin/agents/${id}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminAgentPackages(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/agents/packages${qs}`);
  }

  async getAdminAgentEarnings(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/agents/earnings${qs}`);
  }

  async getAdminAgentPayouts(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/agents/payouts${qs}`);
  }

  async processAdminAgentPayout(id: string, action: string, transactionRef?: string, rejectionReason?: string) {
    return this.request(`/admin/agents/payouts/${id}/action`, {
      method: 'PUT',
      body: JSON.stringify({ action, transactionRef, rejectionReason }),
    });
  }

  async getAdminAgentReviews(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/agents/reviews${qs}`);
  }

  async moderateAdminAgentReview(id: string, status: string, hiddenReason?: string) {
    return this.request(`/admin/agents/reviews/${id}/moderate`, {
      method: 'PUT',
      body: JSON.stringify({ status, hiddenReason }),
    });
  }

  async getAdminAgentComplaints(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/agents/complaints${qs}`);
  }

  async resolveAdminAgentComplaint(id: string, status: string, resolutionNotes?: string) {
    return this.request(`/admin/agents/complaints/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ status, resolutionNotes }),
    });
  }

  async getAdminAgentDocuments(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/agents/documents${qs}`);
  }

  async verifyAdminAgentDocument(id: string, status: string, rejectionReason?: string) {
    return this.request(`/admin/agents/documents/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejectionReason }),
    });
  }

  async getAdminAgentActivityLogs(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/agents/activity-logs${qs}`);
  }

  async getAdminAuditLogs(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/agents/audit-logs${qs}`);
  }

  async getAdminAgentSettings() {
    return this.request('/admin/agents/settings');
  }

  async updateAdminAgentSettings(data: any) {
    return this.request('/admin/agents/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  getAdminAgentsCsvUrl() {
    return `${API_BASE_URL}/admin/agents/export/csv`;
  }

  // ================= ADMIN PARCELS API =================
  async getAdminParcelDashboardStats() {
    return this.request('/admin/parcels/dashboard-stats');
  }

  async getAdminParcels(params?: Record<string, any>) {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          cleanParams[k] = String(v);
        }
      });
    }
    const qs = Object.keys(cleanParams).length > 0 ? '?' + new URLSearchParams(cleanParams).toString() : '';
    return this.request(`/admin/parcels${qs}`);
  }

  async getAdminParcelById(id: string) {
    return this.request(`/admin/parcels/${id}`);
  }

  async findMatchingPartnersForParcel(id: string) {
    return this.request(`/admin/parcels/${id}/matches`);
  }

  async assignAdminParcelPartner(id: string, data: { partnerId: string; vehicleId?: string; note?: string }) {
    return this.request(`/admin/parcels/${id}/assign-partner`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignAdminParcelAgent(id: string, data: { agentId: string; note?: string }) {
    return this.request(`/admin/parcels/${id}/assign-agent`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyAdminParcelPickup(id: string, data: { bypassCode?: boolean; codeEntered?: string; notes?: string }) {
    return this.request(`/admin/parcels/${id}/verify-pickup`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyAdminParcelHandover(id: string, data: { bypassCode?: boolean; codeEntered?: string; notes?: string }) {
    return this.request(`/admin/parcels/${id}/verify-handover`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyAdminParcelDelivery(id: string, data: { bypassPin?: boolean; pinEntered?: string; notes?: string }) {
    return this.request(`/admin/parcels/${id}/verify-delivery`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async failAdminParcelDelivery(id: string, data: { reason: string; notes?: string; rescheduleDate?: string }) {
    return this.request(`/admin/parcels/${id}/fail-delivery`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async returnAdminParcel(id: string, data: { returnReason: string; returnPartnerId?: string; notes?: string }) {
    return this.request(`/admin/parcels/${id}/return`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelAdminParcel(id: string, data: { reason: string; processRefund?: boolean; refundAmount?: number }) {
    return this.request(`/admin/parcels/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminParcelDetails(id: string, data: any) {
    return this.request(`/admin/parcels/${id}/details`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createOrUpdateAdminParcelDispute(id: string, data: any) {
    return this.request(`/admin/parcels/${id}/disputes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addAdminParcelAuditNote(id: string, note: string) {
    return this.request(`/admin/parcels/${id}/audit-note`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async bulkAdminParcelActions(data: { parcelIds: string[]; action: string; partnerId?: string; reason?: string }) {
    return this.request('/admin/parcels/bulk-actions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminParcel(id: string, reason?: string) {
    return this.request(`/admin/parcels/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  async bulkDeleteAdminParcels(parcelIds: string[], reason?: string) {
    return this.request('/admin/parcels/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ parcelIds, reason }),
    });
  }

  async getAdminParcelAnalytics() {
    return this.request('/admin/parcels/analytics');
  }

  getAdminParcelsCsvUrl(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return `${API_BASE_URL}/admin/parcels/export/csv${qs}`;
  }

  // ================= ADMIN LOGISTICS MANAGEMENT =================
  async getAdminLogisticsStats() {
    return this.request('/admin/logistics/dashboard-stats');
  }

  async getAdminLogisticsLive(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/logistics/live${qs}`);
  }

  async getAdminLogisticsTrips(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/logistics/trips${qs}`);
  }

  async createAdminLogisticsTrip(data: any) {
    return this.request('/admin/logistics/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdminLogisticsTrip(id: string) {
    return this.request(`/admin/logistics/trips/${id}`);
  }

  async updateAdminLogisticsTripStatus(id: string, data: any) {
    return this.request(`/admin/logistics/trips/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateAdminLogisticsTripStopStatus(tripId: string, stopId: string, data: any) {
    return this.request(`/admin/logistics/trips/${tripId}/stops/${stopId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminLogisticsPartners(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/logistics/partners${qs}`);
  }

  async getAdminLogisticsPartner(id: string) {
    return this.request(`/admin/logistics/partners/${id}`);
  }

  async createAdminLogisticsPartner(data: any) {
    return this.request('/admin/logistics/partners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminLogisticsPartnerStatus(id: string, data: any) {
    return this.request(`/admin/logistics/partners/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminLogisticsPartner(id: string, reason?: string) {
    return this.request(`/admin/logistics/partners/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  async bulkDeleteAdminLogisticsPartners(partnerIds: string[], reason?: string) {
    return this.request('/admin/logistics/partners/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ partnerIds, reason }),
    });
  }

  async getAdminLogisticsRoutes() {
    return this.request('/admin/logistics/routes');
  }

  async createAdminLogisticsRoute(data: any) {
    return this.request('/admin/logistics/routes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdminLogisticsMatchingPartners(parcelId: string) {
    return this.request(`/admin/logistics/match/${parcelId}`);
  }

  async assignAdminLogisticsPartner(parcelId: string, data: any) {
    return this.request(`/admin/logistics/assign/${parcelId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdminLogisticsHandovers(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/logistics/handovers${qs}`);
  }

  async getAdminLogisticsEarnings(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/logistics/earnings${qs}`);
  }

  async getAdminLogisticsPayouts() {
    return this.request('/admin/logistics/payouts');
  }

  async processAdminLogisticsPayout(id: string, data: any) {
    return this.request(`/admin/logistics/payouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminLogisticsComplaints(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/logistics/complaints${qs}`);
  }

  async resolveAdminLogisticsComplaint(id: string, data: any) {
    return this.request(`/admin/logistics/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminLogisticsActivity() {
    return this.request('/admin/logistics/activity');
  }

  async getAdminLogisticsAnalytics() {
    return this.request('/admin/logistics/analytics');
  }
}

export const api = new ApiClient();
