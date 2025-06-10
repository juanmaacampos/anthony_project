# Styles Organization

This folder contains all CSS styles organized by component type.

## Structure

- `layout/` - Header, Footer, and main layout components
- `sections/` - Main content sections (Menu, Location, Contact)
- `navigation/` - Navigation components (Navbar)
- `ui/` - Reusable UI components (MenuItem, etc.)
- `components/` - Additional component-specific styles

## Main Files

- `index.css` - Main stylesheet that imports all component styles
- `App.css` - Global application styles

## Usage

Import the main `index.css` in your App.jsx to get all styles:
```jsx
import './styles/index.css'
```
