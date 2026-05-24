import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/store/authSlice';
import productsReducer from '@/features/products/store/productsSlice';
import ordersReducer from '@/features/orders/store/ordersSlice';
import usersReducer from '@/features/users/store/usersSlice';
import dashboardReducer from '@/features/dashboard/store/dashboardSlice';
import themeReducer from '@/features/theme/store/themeSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
  orders: ordersReducer,
  users: usersReducer,
  dashboard: dashboardReducer,
  theme: themeReducer,
});

export default rootReducer;
