import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/This is my Jenkins React-App --update to ECS--docker--deploy/i);
  expect(linkElement).toBeInTheDocument();
});
