import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Button,
  Input,
  Label,
  ErrorMessage,
  Card,
  Modal,
  Divider,
  Drawer,
  Dropdown,
  Select,
  Checkbox,
  Radio,
  Toggle
} from '../../components/ui';
import { Mail, Lock, User, Search, Star, Heart } from 'lucide-react';

function ComponentShowcase() {
  const { theme, toggleTheme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState('center');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState('right');
  const [heartActive, setHeartActive] = useState(false);
  const [starActive, setStarActive] = useState(false);

  // New Component States
  const [selectValue, setSelectValue] = useState('');
  const [multiSelectValue, setMultiSelectValue] = useState(['wifi']);
  const [checkboxState, setCheckboxState] = useState({
    basic: false,
    rounded: true,
    card: false,
    indeterminate: true
  });
  const [radioValue, setRadioValue] = useState('king');
  const [toggleState, setToggleState] = useState({
    basic: false,
    icon: true,
    text: false
  });

  const validateEmail = (value) => {
    if (value && !value.includes('@')) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* ============================================ */}
        {/* HEADER - Theme Toggle & Title */}
        {/* ============================================ */}
        <div className="flex justify-between items-center">
          <h1 className="text-h1 text-text-primary">LuxuryStay Component Library</h1>
          <Button
            variant="outline"
            onClick={toggleTheme}
            leftIcon={theme === 'dark' ? '🌙' : '☀️'}
          >
            {theme === 'dark' ? 'Dark' : 'Light'} Mode
          </Button>
        </div>

        {/* ============================================ */}
        {/* BUTTONS - All variants, sizes, states */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className="text-h2 text-text-primary border-b border-accent/20 pb-2 select-none">Buttons</h2>

          {/* Variants */}
          <div>
            <h3 className="text-h4 text-text-secondary mb-3 select-none">Variants</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="text-h4 text-text-secondary mb-3 select-none">Sizes</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
              {/* Heart button with toggle */}
              <Button
                variant={heartActive ? "primary" : "outline"}
                size="icon"
                onClick={() => setHeartActive(!heartActive)}
                style={{ color: heartActive ? '#FF69B4' : 'inherit' }}
              >
                <Heart size={18} fill={heartActive ? '#FF69B4' : 'none'} />
              </Button>
            </div>
          </div>

          {/* With Icons */}
          <div>
            <h3 className="text-h4 text-text-secondary mb-3 select-none">With Icons</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" leftIcon={<Mail size={16} />}>Left Icon</Button>
              <Button variant="primary" rightIcon={<Search size={16} />}>Right Icon</Button>



              {/* Star button with toggle */}
              <Button
                variant="outline"
                onClick={() => setStarActive(!starActive)}
                style={{ color: starActive ? '#FFD700' : 'inherit' }}
                leftIcon={<Star size={16} fill={starActive ? '#FFD700' : 'none'} />}
              >
                Favorite
              </Button>
            </div>
          </div>

          {/* States */}
          <div>
            <h3 className="text-h4 text-text-secondary mb-3 select-none">States</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" loading>Loading</Button>
              <Button variant="primary" disabled>Disabled</Button>
              <Button variant="outline" disabled>Disabled</Button>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* INPUTS - All variants with labels & errors */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className="text-h2 text-text-primary border-b border-accent/20 pb-2 select-none">Inputs</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-h4 text-text-secondary mb-3 select-none">Basic Input</h3>
                <Input
                  label="Default Input"
                  placeholder="Enter text..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>

              <div>
                <h3 className="text-h4 text-text-secondary mb-3 select-none">With Icons</h3>
                <Input
                  label="Username"
                  leftIcon={<User size={16} />}
                  placeholder="johndoe"
                />
              </div>

              <div>
                <h3 className="text-h4 text-text-secondary mb-3 select-none">Password with Toggle</h3>
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  clearable
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-h4 text-text-secondary mb-3 select-none">With Error</h3>
                <Input
                  label="Email"
                  error="Please enter a valid email"
                  placeholder="test@example.com"
                  leftIcon={<Mail size={16} />}
                />
              </div>

              <div>
                <h3 className="text-h4 text-text-secondary mb-3 select-none">Character Counter</h3>
                <Input
                  label="Bio"
                  maxLength={50}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <h3 className="text-h4 text-text-secondary mb-3 select-none">Filled Variant</h3>
                <Input
                  label="Search"
                  variant="filled"
                  leftIcon={<Search size={16} />}
                  placeholder="Search..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* LABELS & ERROR MESSAGES */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className="text-h2 text-text-primary border-b border-accent/20 pb-2 select-none">Labels & Errors</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Labels */}
            <div className="space-y-4">
              <h3 className="text-h4 text-text-secondary mb-3 select-none">Label Variants</h3>

              <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                <Label htmlFor="basic">Basic Label</Label>
                <Label htmlFor="required" required>Required Label</Label>
                <Label htmlFor="tooltip" tooltip="Additional information">With Tooltip</Label>
                <Label htmlFor="error" error>Error State Label</Label>
              </div>
            </div>

            {/* Error Messages */}
            <div className="space-y-4">
              <h3 className="text-h4 text-text-secondary mb-3 select-none">Error Variants</h3>

              <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                <ErrorMessage
                  message="Inline error message"
                  mode="inline"
                />

                <div className="relative pt-8">
                  <Button variant="outline" size="sm">Hover for tooltip</Button>
                  <ErrorMessage
                    message="Tooltip error appears on hover"
                    mode="tooltip"
                    visible={false}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert('Toast would appear here')}
                >
                  Show Toast Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CARDS - All variants with images & content */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className="text-h2 text-text-primary border-b border-accent/20 pb-2 select-none">Cards</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default Card */}
            <div>
              <h3 className="text-body-sm text-text-secondary mb-2 select-none">variant="default"</h3>
              <Card variant="default">
                <Card.Image
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
                  alt="Luxury hotel room"
                />
                <Card.Content>
                  <h4 className="text-h4">Deluxe Suite</h4>
                  <p className="text-body-sm text-text-secondary">Ocean view with king bed</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star size={14} className="text-accent fill-accent" />
                    <span className="text-body-sm">4.9 (128 reviews)</span>
                  </div>
                </Card.Content>
                <Card.Footer>
                  <span className="text-accent font-semibold">$299/night</span>
                  <Button size="sm" variant="primary">Book</Button>
                </Card.Footer>
              </Card>
            </div>

            {/* Elevated Card */}
            <div>
              <h3 className="text-body-sm text-text-secondary mb-2 select-none">variant="elevated"</h3>
              <Card variant="elevated">
                <Card.Image
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                  alt="Hotel lobby"
                />
                <Card.Content>
                  <h4 className="text-h4">Executive Suite</h4>
                  <p className="text-body-sm text-text-secondary">Separate living area</p>
                  <Card.Badge>PREMIUM</Card.Badge>
                </Card.Content>
                <Card.Footer>
                  <span className="text-accent font-semibold">$499/night</span>
                  <Button size="sm" variant="primary">Book</Button>
                </Card.Footer>
              </Card>
            </div>

            {/* Glass Card */}
            <div>
              <h3 className="text-body-sm text-text-secondary mb-2 select-none">variant="glass"</h3>
              <Card variant="glass">
                <Card.Image
                  src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"
                  alt="Presidential suite"
                  overlay={false}
                />
                <Card.Content>
                  <h4 className="text-h4">Presidential Suite</h4>
                  <p className="text-body-sm text-text-secondary">Private terrace</p>
                  <Card.Badge variant="gold">VIP</Card.Badge>
                </Card.Content>
                <Card.Footer>
                  <span className="text-accent font-semibold">$999/night</span>
                  <Button size="sm" variant="primary">Book</Button>
                </Card.Footer>
              </Card>
            </div>

            {/* Interactive Card */}
            <div>
              <h3 className="text-body-sm text-text-secondary mb-2 select-none">variant="interactive" (clickable)</h3>
              <Card variant="interactive" onClick={() => alert('Card clicked!')}>
                <Card.Image
                  src="https://images.unsplash.com/photo-1590490360182-c33d577334b1?w=800"
                  alt="Pool villa"
                />
                <Card.Content>
                  <h4 className="text-h4">Pool Villa</h4>
                  <p className="text-body-sm text-text-secondary">Private pool</p>
                </Card.Content>
                <Card.Footer>
                  <span className="text-accent font-semibold">$799/night</span>
                  <Button size="sm" variant="primary">Book</Button>
                </Card.Footer>
              </Card>
            </div>

            {/* Outlined Card */}
            <div>
              <h3 className="text-body-sm text-text-secondary mb-2 select-none">variant="outlined"</h3>
              <Card variant="outlined">
                <Card.Content>
                  <h4 className="text-h4">Special Offer</h4>
                  <p className="text-body-sm text-text-secondary">Weekend getaway package</p>
                  <p className="text-body-sm text-text-secondary mt-2">Includes breakfast & spa</p>
                </Card.Content>
                <Card.Footer>
                  <span className="text-accent font-semibold">$199/night</span>
                  <Button size="sm" variant="outline">Learn More</Button>
                </Card.Footer>
              </Card>
            </div>

            {/* No Image Card */}
            <div>
              <h3 className="text-body-sm text-text-secondary mb-2 select-none">No image variant</h3>
              <Card variant="default">
                <Card.Content>
                  <h4 className="text-h4">Last Minute Deal</h4>
                  <p className="text-body-sm text-text-secondary">Save 30% on select rooms</p>
                  <Card.Badge variant="outline">LIMITED</Card.Badge>
                </Card.Content>
                <Card.Footer>
                  <span className="text-accent font-semibold">From $139</span>
                  <Button size="sm" variant="primary">View</Button>
                </Card.Footer>
              </Card>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* DIVIDER - All variants */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className="text-h2 text-text-primary border-b border-accent/20 pb-2 select-none">Divider</h2>

          <div className="space-y-8">
            <div className="select-none">
              <h3 className="text-h4 text-text-secondary mb-3 select-none">Horizontal</h3>
              <Divider />
            </div>

            <div className="select-none">
              <h3 className="text-h4 text-text-secondary mb-3 select-none">With Text</h3>
              <Divider variant="with-text">OR</Divider>
            </div>

            <div className="select-none">
              <h3 className="text-h4 text-text-secondary mb-3 select-none">Gold</h3>
              <Divider color="gold" />
            </div>

            <div className="select-none">
              <h3 className="text-h4 text-text-secondary mb-3 select-none">Dashed</h3>
              <Divider variant="dashed" />
            </div>

            <div className="flex h-20 gap-4">
              <div className="flex-1">
                <h3 className="text-h4 text-text-secondary mb-3 select-none">Vertical</h3>
                <div className="flex h-full gap-4">
                  <div className="select-none">Left</div>
                  <Divider variant="vertical" />
                  <div className="select-none">Right</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* DROPDOWN */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className="text-h2 text-text-primary border-b border-accent/20 pb-2 select-none">Dropdown</h2>

          <div className="flex flex-wrap gap-8">
            {/* Click Trigger */}
            <div>
              <h3 className="text-h4 text-text-secondary mb-3 select-none">Click Trigger</h3>
              <Dropdown
                trigger={<Button variant="primary">Open Menu</Button>}
              >
                <Dropdown.Header>My Account</Dropdown.Header>
                <Dropdown.Item>Profile</Dropdown.Item>
                <Dropdown.Item>Settings</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item destructive>Logout</Dropdown.Item>
              </Dropdown>
            </div>

            {/* Hover Trigger */}
            <div>
              <h3 className="text-h4 text-text-secondary mb-3 select-none">Hover Trigger</h3>
              <Dropdown
                variant="hover"
                trigger={<Button variant="outline">Hover Me</Button>}
              >
                <Dropdown.Item>View Details</Dropdown.Item>
                <Dropdown.Item>Edit</Dropdown.Item>
                <Dropdown.Item>Share</Dropdown.Item>
              </Dropdown>
            </div>

            {/* Context Menu */}
            <div>
              <h3 className="text-h4 text-text-secondary mb-3 select-none">Right-Click Area</h3>
              <Dropdown
                variant="context"
                trigger={
                  <div className="h-24 w-48 bg-secondary/30 rounded-lg flex items-center justify-center border-2 border-dashed border-accent/30 text-text-secondary text-sm cursor-context-menu">
                    Right click here
                  </div>
                }
              >
                <Dropdown.Item>Cut</Dropdown.Item>
                <Dropdown.Item>Copy</Dropdown.Item>
                <Dropdown.Item>Paste</Dropdown.Item>
              </Dropdown>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SELECT */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className="text-h2 text-text-primary border-b border-accent/20 pb-2 select-none">Select</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Single Select */}
            <div>
              <h3 className="text-h4 text-text-secondary mb-3 select-none">Single Select</h3>
              <Select
                label="Room Type"
                placeholder="Choose a room"
                options={[
                  { value: 'standard', label: 'Standard Room' },
                  { value: 'deluxe', label: 'Deluxe Suite' },
                  { value: 'president', label: 'Presidential Suite' },
                ]}
                value={selectValue}
                onChange={setSelectValue}
              />
            </div>

            {/* Multi Select */}
            <div>
              <h3 className="text-h4 text-text-secondary mb-3 select-none">Multi Select (Chips)</h3>
              <Select
                label="Amenities"
                multiple
                placeholder="Select amenities"
                options={[
                  { value: 'wifi', label: 'Free Wi-Fi' },
                  { value: 'breakfast', label: 'Breakfast' },
                  { value: 'pool', label: 'Pool Access' },
                  { value: 'gym', label: 'Gym' },
                  { value: 'spa', label: 'Spa' },
                ]}
                value={multiSelectValue}
                onChange={setMultiSelectValue}
              />
            </div>

            {/* Searchable */}
            <div>
              <h3 className="text-h4 text-text-secondary mb-3 select-none">Searchable & Loading</h3>
              <Select
                label="Guest Name"
                searchable
                loading
                placeholder="Search guest..."
                options={[
                  { value: 'john', label: 'John Doe' },
                  { value: 'jane', label: 'Jane Smith' },
                  { value: 'robert', label: 'Robert Brown' },
                ]}
                value={selectValue}
                onChange={setSelectValue}
                helperText="Simulating async loading state"
              />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CHECKBOX */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className="text-h2 text-text-primary border-b border-accent/20 pb-2 select-none">Checkbox</h2>

          <div className="flex flex-col gap-6">
            <div className="flex gap-8">
              <div>
                <h3 className="text-h4 text-text-secondary mb-3 select-none">Default</h3>
                <Checkbox
                  label="Accept Terms"
                  checked={checkboxState.basic}
                  onChange={(c) => setCheckboxState({ ...checkboxState, basic: c })}
                />
              </div>

              <div>
                <h3 className="text-h4 text-text-secondary mb-3 select-none">Rounded</h3>
                <Checkbox
                  variant="rounded"
                  label="Rounded Style"
                  checked={checkboxState.rounded}
                  onChange={(c) => setCheckboxState({ ...checkboxState, rounded: c })}
                />
              </div>

              <div>
                <h3 className="text-h4 text-text-secondary mb-3 select-none">Indeterminate</h3>
                <Checkbox
                  label="Select All"
                  indeterminate={checkboxState.indeterminate}
                  checked={true}
                  onChange={() => setCheckboxState({ ...checkboxState, indeterminate: !checkboxState.indeterminate })}
                />
              </div>
            </div>

            <div>
              <h3 className="text-h4 text-text-secondary mb-3 select-none">Card Variant</h3>
              <div className="max-w-md">
                <Checkbox
                  variant="card"
                  label="Add Airport Pickup"
                  helperText="Private chauffeur will wait at arrivals"
                  checked={checkboxState.card}
                  onChange={(c) => setCheckboxState({ ...checkboxState, card: c })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* RADIO */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className="text-h2 text-text-primary border-b border-accent/20 pb-2 select-none">Radio</h2>

          <Radio.Group
            value={radioValue}
            onChange={setRadioValue}
            className="space-y-4"
          >
            <div className="flex gap-8">
              <Radio value="king" label="King Bed" />
              <Radio value="twin" label="Twin Beds" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Radio
                variant="card"
                value="standard"
                label="Standard Rate"
                helperText="Non-refundable"
              />
              <Radio
                variant="card"
                value="flexible"
                label="Flexible Rate"
                helperText="Free cancellation up to 24h"
              />
            </div>
          </Radio.Group>
        </section>

        {/* ============================================ */}
        {/* TOGGLE */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className="text-h2 text-text-primary border-b border-accent/20 pb-2 select-none">Toggle</h2>

          <div className="flex flex-wrap items-end gap-12">
            <div>
              <h3 className="text-h4 text-text-secondary mb-3 select-none">Default</h3>
              <Toggle
                label="Notifications"
                checked={toggleState.basic}
                onChange={(c) => setToggleState({ ...toggleState, basic: c })}
              />
            </div>

            <div>
              <h3 className="text-h4 text-text-secondary mb-3 select-none">With Icons</h3>
              <Toggle
                variant="with-icon"
                size="lg"
                label="Dark Mode"
                checked={toggleState.icon}
                onChange={(c) => setToggleState({ ...toggleState, icon: c })}
              />
            </div>

            <div>
              <h3 className="text-h4 text-text-secondary mb-3 select-none">With Text</h3>
              <Toggle
                variant="with-text"
                size="md"
                label="Power Saving"
                checked={toggleState.text}
                onChange={(c) => setToggleState({ ...toggleState, text: c })}
              />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* DRAWER - Demo */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className="text-h2 text-text-primary border-b border-accent/20 pb-2 select-none">Drawer</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['left', 'right', 'top', 'bottom'].map((pos) => (
              <Button
                key={pos}
                variant="outline"
                onClick={() => {
                  setDrawerPosition(pos);
                  setDrawerOpen(true);
                }}
              >
                Open {pos} Drawer
              </Button>
            ))}
          </div>
        </section>

        {/* ============================================ */}
        {/* MODAL - Interactive Demo */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className="text-h2 text-text-primary border-b border-accent/20 pb-2 select-none">Modal</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="primary"
              onClick={() => {
                setModalVariant('center');
                setModalOpen(true);
              }}
            >
              Center Modal
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setModalVariant('top');
                setModalOpen(true);
              }}
            >
              Top Modal
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setModalVariant('bottom');
                setModalOpen(true);
              }}
            >
              Bottom Modal
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setModalVariant('fullscreen');
                setModalOpen(true);
              }}
            >
              Fullscreen Modal
            </Button>
          </div>
        </section>

        {/* ============================================ */}
        {/* MODAL COMPONENT */}
        {/* ============================================ */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          variant={modalVariant}
          size="md"
        >
          <Modal.Header title={`${modalVariant.charAt(0).toUpperCase() + modalVariant.slice(1)} Modal`} />
          <Modal.Body>
            <div className="space-y-4">
              <p className="text-body">This is a beautiful modal component with:</p>
              <ul className="list-disc list-inside space-y-2 text-body-sm text-text-secondary">
                <li>Gold gradient header</li>
                <li>Smooth animations</li>
                <li>Focus trap (try Tab)</li>
                <li>Escape key closes</li>
                <li>Click outside to close</li>
              </ul>
              <p className="text-body-sm text-text-secondary mt-4">
                Current variant: <span className="text-accent font-medium">{modalVariant}</span>
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ============================================ */}
        {/* DRAWER COMPONENT */}
        {/* ============================================ */}
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          position={drawerPosition}
          size="md"
        >
          <div className="space-y-4">
            <h3 className="text-h4 select-none">Drawer Content</h3>
            <p>This is a sample drawer with smooth animations.</p>
            <p>Position: <span className="text-accent">{drawerPosition}</span></p>
            <Divider />
            <p className="text-body-sm text-text-secondary">
              The drawer slides in from the {drawerPosition} with a glass morph overlay.
            </p>
            <Button variant="primary" onClick={() => setDrawerOpen(false)} className="mt-4">
              Close Drawer
            </Button>
          </div>
        </Drawer>
      </div>
    </div>
  );
}

export default ComponentShowcase;