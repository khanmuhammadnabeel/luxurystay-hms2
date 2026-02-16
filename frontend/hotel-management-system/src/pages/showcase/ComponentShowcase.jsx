import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";  // ../../ not ../
import { 
  Button, 
  Input, 
  Label, 
  ErrorMessage 
} from '../../components/ui';  // ../../ not ../
import { Mail, Lock, User, Search } from 'lucide-react';

function ComponentShowcase() {
  const { theme, toggleTheme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value) => {
    if (value && !value.includes('@')) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-h1 text-text-primary">Component Library</h1>
          <Button 
            variant="outline" 
            onClick={toggleTheme}
            leftIcon={theme === 'dark' ? '🌙' : '☀️'}
          >
            {theme === 'dark' ? 'Dark' : 'Light'} Mode
          </Button>
        </div>

        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="text-h2 text-text-primary">Buttons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" leftIcon={<Mail size={16} />}>Icon Left</Button>
            <Button variant="primary" rightIcon={<Search size={16} />}>Icon Right</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="space-y-4">
          <h2 className="text-h2 text-text-primary">Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                label="Default Input"
                placeholder="Enter text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="With Icon"
                leftIcon={<User size={16} />}
                placeholder="Username"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                clearable
              />
            </div>
            <div className="space-y-4">
              <Input
                label="With Error"
                error="This field is required"
                placeholder="Required field"
              />
              <Input
                label="With Character Counter"
                maxLength={20}
                placeholder="Max 20 chars"
              />
              <Input
                label="Filled Variant"
                variant="filled"
                placeholder="Filled style"
              />
            </div>
          </div>
        </section>

        {/* Labels & Error Messages */}
        <section className="space-y-4">
          <h2 className="text-h2 text-text-primary">Labels & Errors</h2>
          <div className="flex flex-col space-y-4 max-w-md">
            <Label htmlFor="test" required>Required Label</Label>
            <Label htmlFor="test" tooltip="This is helpful information">
              Label with Tooltip
            </Label>
            <Label htmlFor="test" error>Error Label</Label>
            
            <ErrorMessage 
              message="This is an inline error message" 
              mode="inline"
            />
            
            <div className="relative inline-block">
              <Button variant="outline">Hover for tooltip</Button>
              <ErrorMessage 
                message="This is a tooltip error" 
                mode="tooltip"
                visible={false} // Controlled by hover state in real use
              />
            </div>
          </div>
        </section>

        {/* Toast Example */}
        <section className="space-y-4">
          <h2 className="text-h2 text-text-primary">Toast Notification</h2>
          <Button 
            variant="primary"
            onClick={() => {
              // In a real app, you'd use notification context
              alert('Toast would appear here - uses ErrorMessage with mode="toast"');
            }}
          >
            Show Toast Demo
          </Button>
        </section>
      </div>
    </div>
  );
}

export default ComponentShowcase;