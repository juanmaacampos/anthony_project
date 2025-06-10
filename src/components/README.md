# Components Organization

This folder contains all React components organized by type and functionality.

## Structure

- `layout/` - Layout components (Header, Footer)
- `sections/` - Main content sections (Menu, Location, Contact)
- `navigation/` - Navigation components (Navbar)
- `ui/` - Reusable UI components (MenuItem, etc.)

## Index Files

Each folder has an `index.js` file that exports all components from that folder, making imports cleaner:

```jsx
// Instead of:
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// You can use:
import { Header, Footer } from './components/layout'
```

## Component Structure

Each component should:
- Have its own file with PascalCase naming
- Import its styles from the organized styles folder
- Be exported as default from its file
- Be re-exported from the folder's index.js
