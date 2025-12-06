import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element,
  Link: ({ children }) => <a>{children}</a>,
  useLocation: () => ({ pathname: '/' }),
}), { virtual: true });

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      media: '(prefers-color-scheme: dark)'
    });
  }
});

test('рендерится навигация с разделом "Записи"', () => {
  render(<App />);
  expect(screen.getByText('Записи')).toBeInTheDocument();
});
