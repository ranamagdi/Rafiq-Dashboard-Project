# Redux Setup (React + TypeScript + Toolkit)

This project uses **Redux Toolkit** with custom hooks and an authentication initializer for managing global state.

---

## 1. Store Configuration

The Redux store is created using `configureStore` and includes the `user` slice.

```ts
// app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## 2. Typed Redux Hooks

Custom hooks are created to simplify usage of `dispatch` and `selector` with TypeScript.

```ts
// hooks/reduxHooks.ts
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### ✅ Benefits

* Avoids repeating types
* Safer TypeScript usage
* Cleaner components

---

## 3. Provider Setup

Redux is connected to the app using `Provider`.

```tsx
// main.tsx
import { Provider } from "react-redux";
import { store } from "./app/store";

<Provider store={store}>
  <App />
</Provider>
```

---

## 4. Auth State Initialization

An `AuthInitializer` component loads persisted user data from `localStorage` and restores it into Redux.

```tsx
// components/AuthInitializer.tsx
import { useEffect } from "react";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { setUserMetaData } from "../../features/user/userSlice";

const AuthInitializer = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) return;

    try {
      const parsedUser = JSON.parse(savedUser);
      dispatch(setUserMetaData(parsedUser));
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user");
    }
  }, [dispatch]);

  return null;
};

export default AuthInitializer;
```

---

## 5. App Integration

The initializer runs once at app startup.

```tsx
// App.tsx
import AuthInitializer from "./components/authInitializer";

function App() {
  return (
    <div className="App">
      <AuthInitializer />
      <Header />
      <AppRoutes />
    </div>
  );
}
```

---

## 🔄 Data Flow Summary

1. User logs in → data stored in Redux + localStorage
2. App reloads → `AuthInitializer` runs
3. localStorage data → parsed → dispatched to Redux
4. Redux state restored globally

---

## ⚡ Best Practices

* Use **Redux Toolkit slices** for state logic
* Always use **typed hooks** (`useAppDispatch`, `useAppSelector`)
* Keep **side effects** (like localStorage) outside slices
* Validate stored data before parsing

---


