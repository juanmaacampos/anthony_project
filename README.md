# 🍽️ Anthony Project - Restaurant Menu CMS Integration

A modern React + Vite restaurant website with integrated CMS menu system.

## ✨ Features

- 🎨 Modern, responsive design
- 🍽️ **CMS Menu Integration** - Dynamic menu management with Firebase
- 🛒 Shopping cart functionality
- 📱 Mobile-first approach
- ⚡ Fast performance with Vite
- 🎭 Smooth animations with GSAP

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🍽️ CMS Menu Integration

This project includes a complete CMS menu integration system that allows you to:

- Connect to Firebase-based restaurant CMS
- Display dynamic menus with categories and items
- Add shopping cart functionality
- Handle featured items and availability status
- Responsive design for all devices

### 🔧 Setup CMS Integration

1. **Configure Firebase** in `src/cms-menu/config.js`:
   ```javascript
   export const MENU_CONFIG = {
     firebaseConfig: {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       // ... other config
     },
     restaurantId: "your-restaurant-uid"
   };
   ```

2. **Get Restaurant UID**:
   - Login to your CMS admin panel
   - Open browser console (F12)
   - Run: `firebase.auth().currentUser.uid`
   - Copy the UID to config.js

3. **Test the integration**:
   ```bash
   # Run test script
   ./test-cms-integration.sh
   
   # Or start demo mode
   npm run dev
   # Visit: /pages/DemoMenuPage.jsx
   ```

### 📁 CMS Files Structure

```
src/cms-menu/
├── menu-sdk.js          # Firebase SDK integration
├── useMenu.js           # React hooks for menu & cart
├── MenuComponents.jsx   # Ready-to-use components
├── MenuComponents.css   # Complete styling
├── config.js           # Firebase configuration
└── index.js            # Main exports

src/pages/
├── MenuPage.jsx         # Full integration example
└── DemoMenuPage.jsx     # Demo with sample data
```

### 🎯 Usage Examples

#### Basic Menu Display
```jsx
import { MenuDisplay } from './cms-menu/MenuComponents';
import { useMenuIntegration } from './cms-menu/useMenu';
import { MENU_CONFIG } from './cms-menu/config';

function RestaurantMenu() {
  const { menu, loading, error, addToCart } = useMenuIntegration(MENU_CONFIG);
  
  return (
    <MenuDisplay 
      menu={menu} 
      loading={loading} 
      error={error}
      onAddToCart={addToCart}
    />
  );
}
```

#### Complete Menu with Cart
```jsx
import { MenuWithCart } from './cms-menu/MenuComponents';
import { createMenuSDK } from './cms-menu/menu-sdk';
import { MENU_CONFIG } from './cms-menu/config';

function MenuPage() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  return <MenuWithCart menuSDK={menuSDK} />;
}
```

## 📖 Documentation

- 📋 **[CMS Integration Guide](./CMS_INTEGRATION_GUIDE.md)** - Complete setup instructions
- 🏗️ **[Project Organization](./ORGANIZATION.md)** - File structure and conventions
- 🔧 **[Test Script](./test-cms-integration.sh)** - Verify your installation

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Test CMS integration
./test-cms-integration.sh
```

## 📁 Project Structure

```
anthony_project/
├── src/
│   ├── cms-menu/           # CMS integration system
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── styles/            # CSS files
│   └── utils/             # Utility functions
├── public/                # Static assets
└── integration-package/   # CMS package files
```

## 🎨 Available Components

### CMS Components
- `<MenuDisplay>` - Complete menu with categories
- `<MenuItem>` - Individual menu item
- `<Cart>` - Shopping cart with controls
- `<MenuWithCart>` - All-in-one solution

### Hooks
- `useMenu(menuSDK)` - Menu data management
- `useCart()` - Shopping cart functionality  
- `useMenuIntegration(config)` - Complete integration

## 🌟 Features

- ✅ Firebase integration
- ✅ Restaurant info display
- ✅ Menu categories and items
- ✅ Shopping cart functionality
- ✅ Featured items support
- ✅ Availability status
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ TypeScript ready

## 📱 Demo

Visit `/pages/DemoMenuPage.jsx` to see the CMS integration in action with sample data.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test the integration
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.