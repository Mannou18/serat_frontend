/**
 * It's suggested to configure the RESTful endpoints in this file
 * so that there is only one source of truth, future update of endpoints
 * could be done from here without refactoring on multiple places throughout the app
 */
const API = {
  auth: {
    login: '/login',
    signUp: '/signup',
  },
};

// Export all services
export { API };

// Export individual services for easy importing
export { default as authService } from './auth.service';
export { default as clientService } from './client.service';
export { default as productService } from './product.service';
export { default as categoryService } from './category.service';
export { default as carBrandService } from './carBrand.service';
export { default as carService } from './car.service';
export { default as salesService } from './sales.service';
export { default as servicesService } from './services.service';
