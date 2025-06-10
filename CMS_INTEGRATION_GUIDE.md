# 🍽️ CMS Menu Integration - Complete Setup Guide

## ✅ Installation Complete!

Your React + Vite project now has a complete CMS menu integration! Here's what was installed:

### 📁 Files Created/Updated:

```
src/cms-menu/
├── menu-sdk.js          # Firebase SDK for menu data
├── useMenu.js           # React hooks for menu & cart
├── MenuComponents.jsx   # Ready-to-use React components
├── MenuComponents.css   # Complete styling
├── config.js           # Firebase configuration
└── index.js            # Main exports

src/pages/
└── MenuPage.jsx         # Example implementation

package.json             # Firebase dependency added
```

## 🔧 Configuration Required

### 1. Update Firebase Config

Edit `src/cms-menu/config.js`:

```javascript
export const MENU_CONFIG = {
  firebaseConfig: {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com", 
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
  },
  restaurantId: "your-restaurant-uid-here"
};
```

### 2. Get Restaurant UID

1. Go to your CMS admin panel
2. Login as the restaurant owner
3. Open browser console (F12)
4. Run: `firebase.auth().currentUser.uid`
5. Copy the UID to `config.js`

## 🚀 Usage Examples

### Basic Menu Display

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

### Complete Menu with Cart

```jsx
import { MenuWithCart } from './cms-menu/MenuComponents';
import { createMenuSDK } from './cms-menu/menu-sdk';
import { MENU_CONFIG } from './cms-menu/config';

function MenuPage() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  
  return <MenuWithCart menuSDK={menuSDK} />;
}
```

### Custom Implementation

```jsx
import { useMenuIntegration, MenuDisplay, Cart } from './cms-menu';
import { MENU_CONFIG } from './cms-menu/config';

function CustomMenuPage() {
  const { 
    restaurant, 
    menu, 
    loading, 
    error,
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    total 
  } = useMenuIntegration(MENU_CONFIG);

  return (
    <div className="custom-layout">
      <h1>{restaurant?.name}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <MenuDisplay menu={menu} onAddToCart={addToCart} loading={loading} error={error} />
        <Cart 
          cart={cart} 
          onUpdateQuantity={updateQuantity} 
          onRemove={removeFromCart} 
          onClear={clearCart} 
          total={total} 
        />
      </div>
    </div>
  );
}
```

## 🎨 Available Components

### `<MenuDisplay>`
- Shows complete menu with categories and items
- Props: `menu`, `loading`, `error`, `onAddToCart`, `showImages`, `showPrices`, `showDescription`

### `<MenuItem>`
- Individual menu item component  
- Props: `item`, `onAddToCart`, `showImage`, `showPrice`, `showDescription`

### `<Cart>`
- Shopping cart with quantity controls
- Props: `cart`, `onUpdateQuantity`, `onRemove`, `onClear`, `total`

### `<MenuWithCart>`
- Complete solution with menu + cart
- Props: `menuSDK`

## 🎣 Available Hooks

### `useMenu(menuSDK)`
Returns: `{ restaurant, menu, loading, error }`

### `useCart()`
Returns: `{ cart, addToCart, updateQuantity, removeFromCart, clearCart, total, itemCount }`

### `useMenuIntegration(config)`
Returns: Combined menu + cart data and functions

## 🎯 Features Included

✅ **Firebase Integration** - Connects to your CMS database  
✅ **Restaurant Info** - Displays restaurant name and details  
✅ **Menu Categories** - Organized menu structure  
✅ **Shopping Cart** - Add, remove, update quantities  
✅ **Featured Items** - Highlight special dishes  
✅ **Availability Status** - Show/hide unavailable items  
✅ **Responsive Design** - Works on all devices  
✅ **Loading States** - Smooth user experience  
✅ **Error Handling** - Graceful error messages  
✅ **TypeScript Ready** - Can be easily converted  

## 🔧 Customization

### Styling
Edit `src/cms-menu/MenuComponents.css` to match your design:

```css
.menu-item {
  /* Your custom styles */
}

.add-button {
  /* Your brand colors */
}
```

### Components
Extend or modify components in `MenuComponents.jsx`:

```jsx
export function CustomMenuItem({ item, onAddToCart }) {
  // Your custom implementation
}
```

## 📱 Integration with Existing App

To integrate with your current `App.jsx`:

```jsx
import MenuPage from './pages/MenuPage';

function App() {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="App">
      {/* Your existing components */}
      {showMenu && <MenuPage />}
    </div>
  );
}
```

## 🐛 Troubleshooting

### Firebase Connection Issues
1. Check your Firebase config in `config.js`
2. Verify your restaurant UID is correct
3. Ensure Firebase project has Firestore enabled

### Menu Not Loading
1. Check browser console for errors
2. Verify your restaurant exists in the CMS
3. Check Firestore security rules

### Cart Issues
1. Ensure menu items have valid price fields
2. Check that items have unique IDs

## 🎉 You're Ready!

Your CMS menu integration is complete! Just update the configuration and you'll have a fully functional restaurant menu with shopping cart.

**Next Steps:**
1. Configure Firebase settings
2. Test with your CMS data  
3. Customize styling as needed
4. Deploy your application

Need help? Check the example files in `src/pages/MenuPage.jsx`!
