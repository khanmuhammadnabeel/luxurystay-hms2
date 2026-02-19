import { useState } from "react";
import { useTheme, useLocalization } from "../../contexts";
import { cn } from "../../lib/utils";
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
  const { t, isRTL } = useLocalization();
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
          <h1 className={cn("text-h1 text-text-primary select-none cursor-default", isRTL ? "text-right" : "text-left")}>
            {t('showcase.libTitle')}
          </h1>
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
          <h2 className={cn("text-h2 text-text-primary border-b border-accent/20 pb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>
            {t('showcase.buttons')}
          </h2>

          {/* Variants */}
          <div className={isRTL ? "text-right" : "text-left"}>
            <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('showcase.variants')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="primary">{t('ui.primary')}</Button>
              <Button variant="secondary">{t('ui.secondary')}</Button>
              <Button variant="outline">{t('ui.outline')}</Button>
              <Button variant="ghost">{t('ui.ghost')}</Button>
            </div>
          </div>

          {/* Sizes */}
          <div className={isRTL ? "text-right" : "text-left"}>
            <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('showcase.sizes')}</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary" size="sm">{t('ui.small')}</Button>
              <Button variant="primary" size="md">{t('ui.medium')}</Button>
              <Button variant="primary" size="lg">{t('ui.large')}</Button>
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
          <div className={isRTL ? "text-right" : "text-left"}>
            <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('showcase.withIcons')}</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" leftIcon={<Mail size={16} />}>{t('ui.leftIcon')}</Button>
              <Button variant="primary" rightIcon={<Search size={16} />}>{t('ui.rightIcon')}</Button>

              {/* Star button with toggle */}
              <Button
                variant="outline"
                onClick={() => setStarActive(!starActive)}
                style={{ color: starActive ? '#FFD700' : 'inherit' }}
                leftIcon={<Star size={16} fill={starActive ? '#FFD700' : 'none'} />}
              >
                {t('ui.favorite')}
              </Button>
            </div>
          </div>

          {/* States */}
          <div className={isRTL ? "text-right" : "text-left"}>
            <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('showcase.states')}</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" loading>{t('ui.loading')}</Button>
              <Button variant="primary" disabled>{t('ui.disabled')}</Button>
              <Button variant="outline" disabled>{t('ui.disabled')}</Button>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* INPUTS - All variants with labels & errors */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className={cn("text-h2 text-text-primary border-b border-accent/20 pb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>
            {t('showcase.inputs')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1 */}
            <div className="space-y-6">
              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('ui.basicInput')}</h3>
                <Input
                  label="Default Input"
                  placeholder="Enter text..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>

              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('ui.withIcons')}</h3>
                <Input
                  label="Username"
                  leftIcon={<User size={16} />}
                  placeholder="johndoe"
                />
              </div>

              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('ui.password')}</h3>
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
              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('ui.withError')}</h3>
                <Input
                  label="Email"
                  error="Please enter a valid email"
                  placeholder="test@example.com"
                  leftIcon={<Mail size={16} />}
                />
              </div>

              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('ui.charCounter')}</h3>
                <Input
                  label={t('showcase.bio')}
                  maxLength={50}
                  placeholder={t('showcase.bioPlaceholder')}
                />
              </div>

              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('ui.filled')}</h3>
                <Input
                  label={t('common.search')}
                  variant="filled"
                  leftIcon={<Search size={16} />}
                  placeholder={t('nav.search')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* LABELS & ERROR MESSAGES */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className={cn("text-h2 text-text-primary border-b border-accent/20 pb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>
            {t('showcase.labels')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Labels */}
            <div className="space-y-4">
              <h3 className={cn("text-h4 text-text-secondary mb-3 select-none cursor-default", isRTL ? "text-right" : "text-left")}>{t('ui.variants')}</h3>

              <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                <Label htmlFor="basic">Basic Label</Label>
                <Label htmlFor="required" required>Required Label</Label>
                <Label htmlFor="tooltip" tooltip="Additional information">With Tooltip</Label>
                <Label htmlFor="error" error>Error State Label</Label>
              </div>
            </div>

            {/* Error Messages */}
            <div className="space-y-4">
              <h3 className={cn("text-h4 text-text-secondary mb-3 select-none cursor-default", isRTL ? "text-right" : "text-left")}>{t('ui.variants')}</h3>

              <div className={cn("space-y-4 p-4 bg-secondary/30 rounded-lg", isRTL ? "text-right" : "text-left")}>
                <ErrorMessage
                  message={t('ui.inlineError')}
                  mode="inline"
                />

                <div className="relative pt-8">
                  <Button variant="outline" size="sm">{t('ui.hoverTooltip')}</Button>
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
                  {t('ui.showToast')}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CARDS - All variants with images & content */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className={cn("text-h2 text-text-primary border-b border-accent/20 pb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>
            {t('showcase.cards')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default Card */}
            <div>
              <h3 className={cn("text-body-sm text-text-secondary mb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>variant="default"</h3>
              <Card variant="default">
                <Card.Image
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
                  alt="Luxury hotel room"
                />
                <Card.Content className={isRTL ? "text-right" : "text-left"}>
                  <h4 className="text-h4">{t('rooms.deluxe')}</h4>
                  <p className="text-body-sm text-text-secondary">Ocean view with king bed</p>
                  <div className={cn("flex items-center gap-2 mt-2", isRTL && "flex-row-reverse")}>
                    <Star size={14} className="text-accent fill-accent" />
                    <span className="text-body-sm">4.9 (128 {t('ui.reviews')})</span>
                  </div>
                </Card.Content>
                <Card.Footer className={isRTL ? "flex-row-reverse" : ""}>
                  <span className="text-accent font-semibold">$299/{t('ui.night')}</span>
                  <Button size="sm" variant="primary">{t('ui.book')}</Button>
                </Card.Footer>
              </Card>
            </div>

            {/* Elevated Card */}
            <div>
              <h3 className={cn("text-body-sm text-text-secondary mb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>variant="elevated"</h3>
              <Card variant="elevated">
                <Card.Image
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                  alt="Hotel lobby"
                />
                <Card.Content className={isRTL ? "text-right" : "text-left"}>
                  <h4 className="text-h4">{t('rooms.executive')}</h4>
                  <p className="text-body-sm text-text-secondary">Separate living area</p>
                  <Card.Badge>PREMIUM</Card.Badge>
                </Card.Content>
                <Card.Footer className={isRTL ? "flex-row-reverse" : ""}>
                  <span className="text-accent font-semibold">$499/{t('ui.night')}</span>
                  <Button size="sm" variant="primary">{t('ui.book')}</Button>
                </Card.Footer>
              </Card>
            </div>

            {/* Glass Card */}
            <div>
              <h3 className={cn("text-body-sm text-text-secondary mb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>variant="glass"</h3>
              <Card variant="glass">
                <Card.Image
                  src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"
                  alt="Presidential suite"
                  overlay={false}
                />
                <Card.Content className={isRTL ? "text-right" : "text-left"}>
                  <h4 className="text-h4">{t('rooms.presidential')}</h4>
                  <p className="text-body-sm text-text-secondary">Private terrace</p>
                  <Card.Badge variant="gold">VIP</Card.Badge>
                </Card.Content>
                <Card.Footer className={isRTL ? "flex-row-reverse" : ""}>
                  <span className="text-accent font-semibold">$999/{t('ui.night')}</span>
                  <Button size="sm" variant="primary">{t('ui.book')}</Button>
                </Card.Footer>
              </Card>
            </div>

            {/* Interactive Card */}
            <div>
              <h3 className={cn("text-body-sm text-text-secondary mb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>variant="interactive" (clickable)</h3>
              <Card variant="interactive" onClick={() => alert('Card clicked!')}>
                <Card.Image
                  src="https://images.unsplash.com/photo-1590490360182-c33d577334b1?w=800"
                  alt="Pool villa"
                />
                <Card.Content className={isRTL ? "text-right" : "text-left"}>
                  <h4 className="text-h4">{t('rooms.pool')}</h4>
                  <p className="text-body-sm text-text-secondary">Private pool</p>
                </Card.Content>
                <Card.Footer className={isRTL ? "flex-row-reverse" : ""}>
                  <span className="text-accent font-semibold">$799/{t('ui.night')}</span>
                  <Button size="sm" variant="primary">{t('ui.book')}</Button>
                </Card.Footer>
              </Card>
            </div>

            {/* Outlined Card */}
            <div>
              <h3 className={cn("text-body-sm text-text-secondary mb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>variant="outlined"</h3>
              <Card variant="outlined">
                <Card.Content className={isRTL ? "text-right" : "text-left"}>
                  <h4 className="text-h4">{t('showcase.specialOffer')}</h4>
                  <p className="text-body-sm text-text-secondary">{t('showcase.getawayPackage')}</p>
                  <p className="text-body-sm text-text-secondary mt-2">{t('showcase.includesBreakfast')}</p>
                </Card.Content>
                <Card.Footer className={isRTL ? "flex-row-reverse" : ""}>
                  <span className="text-accent font-semibold">$199/{t('ui.night')}</span>
                  <Button size="sm" variant="outline">{t('showcase.learnMore')}</Button>
                </Card.Footer>
              </Card>
            </div>

            {/* No Image Card */}
            <div>
              <h3 className={cn("text-body-sm text-text-secondary mb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>{t('showcase.noImageVariant')}</h3>
              <Card variant="default">
                <Card.Content className={isRTL ? "text-right" : "text-left"}>
                  <h4 className="text-h4">{t('showcase.lastMinute')}</h4>
                  <p className="text-body-sm text-text-secondary">{t('showcase.save30')}</p>
                  <Card.Badge variant="outline">{t('showcase.limited')}</Card.Badge>
                </Card.Content>
                <Card.Footer className={isRTL ? "flex-row-reverse" : ""}>
                  <span className="text-accent font-semibold">{t('showcase.fromPrice')}</span>
                  <Button size="sm" variant="primary">{t('showcase.view')}</Button>
                </Card.Footer>
              </Card>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className={cn("text-h2 text-text-primary border-b border-accent/20 pb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>
            {t('showcase.dividers')}
          </h2>

          <div className="space-y-8">
            <div className={cn("select-none cursor-default", isRTL ? "text-right" : "text-left")}>
              <h3 className="text-h4 text-text-secondary mb-3">{t('ui.horizontal')}</h3>
              <Divider />
            </div>

            <div className={cn("select-none cursor-default", isRTL ? "text-right" : "text-left")}>
              <h3 className="text-h4 text-text-secondary mb-3">{t('ui.withText')}</h3>
              <Divider variant="with-text">{t('showcase.or')}</Divider>
            </div>

            <div className={cn("select-none cursor-default", isRTL ? "text-right" : "text-left")}>
              <h3 className="text-h4 text-text-secondary mb-3">{t('ui.gold')}</h3>
              <Divider color="gold" />
            </div>

            <div className={cn("select-none cursor-default", isRTL ? "text-right" : "text-left")}>
              <h3 className="text-h4 text-text-secondary mb-3">{t('ui.dashed')}</h3>
              <Divider variant="dashed" />
            </div>

            <div className="flex h-20 gap-4">
              <div className={cn("flex-1", isRTL ? "text-right" : "text-left")}>
                <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('ui.vertical')}</h3>
                <div className={cn("flex h-full gap-4", isRTL && "flex-row-reverse")}>
                  <div className="select-none">{t('showcase.left')}</div>
                  <Divider variant="vertical" />
                  <div className="select-none">{t('showcase.right')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className={cn("text-h2 text-text-primary border-b border-accent/20 pb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>
            {t('showcase.dropdowns')}
          </h2>

          <div className={cn("flex flex-wrap gap-8", isRTL && "flex-row-reverse")}>
            {/* Click Trigger */}
            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('showcase.clickTrigger')}</h3>
              <Dropdown
                trigger={<Button variant="primary">{t('showcase.openMenu')}</Button>}
              >
                <Dropdown.Header>{t('showcase.myAccount')}</Dropdown.Header>
                <Dropdown.Item>{t('showcase.profile')}</Dropdown.Item>
                <Dropdown.Item>{t('showcase.settings')}</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item destructive>{t('showcase.logout')}</Dropdown.Item>
              </Dropdown>
            </div>

            {/* Hover Trigger */}
            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('showcase.hoverTrigger')}</h3>
              <Dropdown
                variant="hover"
                trigger={<Button variant="outline">{t('showcase.hoverMe')}</Button>}
              >
                <Dropdown.Item>{t('showcase.viewDetails')}</Dropdown.Item>
                <Dropdown.Item>{t('showcase.edit')}</Dropdown.Item>
                <Dropdown.Item>{t('showcase.share')}</Dropdown.Item>
              </Dropdown>
            </div>

            {/* Context Menu */}
            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('ui.rightClick')}</h3>
              <Dropdown
                variant="context"
                trigger={
                  <div className="h-24 w-48 bg-secondary/30 rounded-lg flex items-center justify-center border-2 border-dashed border-accent/30 text-text-secondary text-sm cursor-context-menu">
                    {t('showcase.rightClickHere')}
                  </div>
                }
              >
                <Dropdown.Item>{t('showcase.cut')}</Dropdown.Item>
                <Dropdown.Item>{t('showcase.copy')}</Dropdown.Item>
                <Dropdown.Item>{t('showcase.paste')}</Dropdown.Item>
              </Dropdown>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className={cn("text-h2 text-text-primary border-b border-accent/20 pb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>
            Select
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Single Select */}
            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('showcase.singleSelect')}</h3>
              <Select
                label={t('booking.roomType')}
                placeholder={t('showcase.chooseRoom')}
                options={[
                  { value: 'standard', label: t('rooms.standard') },
                  { value: 'deluxe', label: t('rooms.deluxe') },
                  { value: 'president', label: t('rooms.presidential') },
                ]}
                value={selectValue}
                onChange={setSelectValue}
              />
            </div>

            {/* Multi Select */}
            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('showcase.amenities')}</h3>
              <Select
                label={t('showcase.amenities')}
                multiple
                placeholder={t('showcase.selectAmenities')}
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
            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('showcase.searchableLoading')}</h3>
              <Select
                label={t('booking.guest')}
                searchable
                loading
                placeholder={t('showcase.searchGuest')}
                options={[
                  { value: 'john', label: 'John Doe' },
                  { value: 'jane', label: 'Jane Smith' },
                  { value: 'robert', label: 'Robert Brown' },
                ]}
                value={selectValue}
                onChange={setSelectValue}
                helperText={t('showcase.simulatingAsync')}
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className={cn("text-h2 text-text-primary border-b border-accent/20 pb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>
            Checkbox
          </h2>

          <div className="flex flex-col gap-6">
            <div className={cn("flex gap-8", isRTL && "flex-row-reverse")}>
              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">Default</h3>
                <Checkbox
                  label={t('showcase.acceptTerms')}
                  checked={checkboxState.basic}
                  onChange={(c) => setCheckboxState({ ...checkboxState, basic: c })}
                />
              </div>

              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('showcase.roundedStyle')}</h3>
                <Checkbox
                  variant="rounded"
                  label={t('showcase.roundedStyle')}
                  checked={checkboxState.rounded}
                  onChange={(c) => setCheckboxState({ ...checkboxState, rounded: c })}
                />
              </div>

              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('showcase.selectAll')}</h3>
                <Checkbox
                  label={t('showcase.selectAll')}
                  indeterminate={checkboxState.indeterminate}
                  checked={true}
                  onChange={() => setCheckboxState({ ...checkboxState, indeterminate: !checkboxState.indeterminate })}
                />
              </div>
            </div>

            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">Card Variant</h3>
              <div className="max-w-md">
                <Checkbox
                  variant="card"
                  label={t('showcase.addAirportPickup')}
                  helperText={t('showcase.chauffeurWait')}
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
          <h2 className={cn("text-h2 text-text-primary border-b border-accent/20 pb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>
            Radio
          </h2>

          <Radio.Group
            value={radioValue}
            onChange={setRadioValue}
            className="space-y-4"
          >
            <div className={cn("flex gap-8", isRTL && "flex-row-reverse")}>
              <Radio value="king" label={t('showcase.kingBed')} />
              <Radio value="twin" label={t('showcase.twinBeds')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Radio
                variant="card"
                value="standard"
                label={t('showcase.standardRate')}
                helperText={t('showcase.nonRefundable')}
              />
              <Radio
                variant="card"
                value="flexible"
                label={t('showcase.flexibleRate')}
                helperText={t('showcase.freeCancellation')}
              />
            </div>
          </Radio.Group>
        </section>

        <section className="space-y-6">
          <h2 className={cn("text-h2 text-text-primary border-b border-accent/20 pb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>
            {t('showcase.toggle')}
          </h2>

          <div className={cn("flex flex-wrap items-end gap-12", isRTL && "flex-row-reverse")}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">Default</h3>
              <Toggle
                label="Notifications"
                checked={toggleState.basic}
                onChange={(c) => setToggleState({ ...toggleState, basic: c })}
              />
            </div>

            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">{t('showcase.withIcons')}</h3>
              <Toggle
                variant="with-icon"
                size="lg"
                label="Dark Mode"
                checked={toggleState.icon}
                onChange={(c) => setToggleState({ ...toggleState, icon: c })}
              />
            </div>

            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-h4 text-text-secondary mb-3 select-none cursor-default">With Text</h3>
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
          <h2 className={cn("text-h2 text-text-primary border-b border-accent/20 pb-2 select-none cursor-default", isRTL ? "text-right" : "text-left")}>
            Modal
          </h2>

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
          <Modal.Body className={isRTL ? "text-right" : "text-left"}>
            <div className="space-y-4">
              <p className="text-body">This is a beautiful modal component with:</p>
              <ul className={cn("list-disc space-y-2 text-body-sm text-text-secondary", isRTL ? "list-inside pl-0 pr-5" : "list-inside")}>
                <li>Gold gradient header</li>
                <li>Smooth animations</li>
                <li>Focus trap (try Tab)</li>
                <li>Escape key closes</li>
                <li>Click outside to close</li>
              </ul>
            </div>
          </Modal.Body>
          <Modal.Footer className={isRTL ? "flex-row-reverse" : ""}>
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
          position={isRTL && (drawerPosition === 'left' || drawerPosition === 'right') ? (drawerPosition === 'left' ? 'right' : 'left') : drawerPosition}
          size="md"
        >
          <div className={cn("space-y-4", isRTL ? "text-right" : "text-left")}>
            <h3 className="text-h4 select-none">Drawer Content</h3>
            <p>This is a sample drawer with smooth animations.</p>
            <Divider />
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