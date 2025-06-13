# 🎯 CheckoutForm - Quick Integration Guide

## 📁 Files Created

```
src/
├── firebase.js                     # Firebase configuration
├── components/
│   ├── CheckoutForm.jsx            # Main checkout component
│   ├── CheckoutForm.README.md      # Detailed documentation  
│   └── CheckoutFormTest.jsx        # Test component
└── pages/
    └── CheckoutPage.jsx            # Example usage page
```

## 🚀 Quick Start

### 1. Update Restaurant ID

In `src/components/CheckoutForm.jsx`, line 13:

```javascript
// ⚠️ CHANGE THIS FOR EACH RESTAURANT
const CURRENT_RESTAURANT_ID = "YOUR_RESTAURANT_UID_HERE";
```

**How to get Restaurant UID:**
1. Go to your CMS panel
2. Login with restaurant account
3. Press F12 → Console → Run: `firebase.auth().currentUser.uid`
4. Copy that UID

### 2. Configure Firebase Region

In `src/firebase.js`, line 11:

```javascript
export const functions = getFunctions(app, 'southamerica-east1'); // Your region
```

### 3. Add to Your App

```jsx
// In your main App.jsx or routing
import CheckoutForm from './components/CheckoutForm.jsx';

function App() {
  return (
    <div>
      {/* Your existing content */}
      <CheckoutForm />
    </div>
  );
}
```

### 4. Cart Integration

Before showing CheckoutForm, make sure cart data is in localStorage:

```javascript
// Add items to cart
const cartItems = [
  { name: "Pizza", price: 1500, quantity: 2 },
  { name: "Soda", price: 500, quantity: 1 }
];
const total = 3500;

localStorage.setItem('cartItems', JSON.stringify(cartItems));
localStorage.setItem('cartTotal', total.toString());
```

## 🧪 Testing

### Option 1: Use Test Component
```jsx
import CheckoutFormTest from './components/CheckoutFormTest.jsx';

// This automatically loads test data
<CheckoutFormTest />
```

### Option 2: Use Example Page  
```jsx
import CheckoutPage from './pages/CheckoutPage.jsx';

// This shows the component with sample data
<CheckoutPage />
```

## 🔥 Cloud Functions Required

Make sure these Cloud Functions are deployed:

```javascript
// functions/index.js should export:
exports.createMercadoPagoPreference = onCall(async (request) => {
  // Your MercadoPago integration
});

exports.mercadoPagoWebhook = onRequest(async (req, res) => {
  // Your webhook handler
});
```

Deploy with:
```bash
firebase deploy --only functions
```

## 📋 Component Features

✅ **Auto-loading cart from localStorage**
✅ **Complete form validation**  
✅ **Cash payment (saves to Firestore)**
✅ **MercadoPago integration (via Cloud Functions)**
✅ **Restaurant data loading**
✅ **Responsive design**
✅ **Error handling**
✅ **Loading states**
✅ **Automatic redirects**

## 🎯 Payment Flow

### Cash Payment:
1. User fills form → 2. Saves to Firestore → 3. Redirects to `/estado-pedido?orderId=X`

### MercadoPago:  
1. User fills form → 2. Calls Cloud Function → 3. Gets `init_point` → 4. Redirects to MercadoPago → 5. After payment, returns to `/estado-pedido?orderId=X`

## 🔧 Customization

### Colors & Styling
Edit the `<style jsx>` section in CheckoutForm.jsx:

```javascript
.submit-button {
  background-color: #28a745; // Change to your brand color
}

.checkout-form {
  border-radius: 8px; // Adjust border radius
}
```

### Form Fields
Add/remove fields in the customer info section:

```jsx
<div className="form-group">
  <label htmlFor="newField">New Field</label>
  <input
    type="text"
    id="newField"
    name="newField"
    value={customerInfo.newField}
    onChange={handleInputChange}
  />
</div>
```

## 🚨 Important Notes

- **Security**: Never expose secret keys in frontend code
- **Testing**: Use MercadoPago test credentials during development  
- **Validation**: Server-side validation is handled by Cloud Functions
- **Mobile**: Component is fully responsive
- **Accessibility**: Form includes proper labels and ARIA attributes

## 📞 Support

If you encounter issues:

1. Check browser console for error messages
2. Verify Firebase configuration is correct
3. Ensure Cloud Functions are deployed
4. Test with simple cart data first
5. Check network tab for failed requests

## 🎉 Ready to Go!

Your CheckoutForm is now ready for integration. Simply:

1. ✅ Update the Restaurant ID
2. ✅ Configure Firebase region  
3. ✅ Deploy Cloud Functions
4. ✅ Add to your restaurant page
5. ✅ Test with sample data

Happy coding! 🚀
