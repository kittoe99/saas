"use client";

import { useMemo, useState } from "react";

type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

type Step = 1 | 2 | 3 | 4;

const TOTAL_STEPS: Step = 4;

type PlanOption = {
  id: string;
  name: string;
  price: string;
  description?: string;
  recommended?: boolean;
};

const PLANS: PlanOption[] = [
  { id: "small", name: "Small Businesses", price: "$59/mo", description: "Great for local and solo businesses", recommended: true },
  { id: "ecom_large", name: "Ecommerce / Large Businesses", price: "$99/mo", description: "Online store + growing operations" },
  { id: "startup", name: "Large Businesses/Startups", price: "$169/mo", description: "Advanced needs and faster support" },
];

type BillingInfo = {
  fullName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
};

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function getPlanPrice(planId: string): number {
  switch (planId) {
    case "small":
      return 59;
    case "ecom_large":
      return 99;
    case "startup":
      return 169;
    default:
      return 0;
  }
}

function StepSummary({
  personal,
  planId,
  addonAiPhone,
}: {
  personal: PersonalInfo;
  planId: string;
  addonAiPhone: boolean;
}) {
  const plan = PLANS.find((p) => p.id === planId)!;
  const planPrice = getPlanPrice(planId);
  const addonPrice = addonAiPhone ? 29 : 0;
  const total = planPrice + addonPrice;

  return (
    <div>
      <h2 className="text-lg font-medium tracking-tight">Review & Summary</h2>
      <p className="mt-1 text-sm text-neutral-600">Confirm your details before checkout.</p>

      {/* Summary */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-xl border border-neutral-200 p-4">
          <div className="text-sm font-medium text-neutral-700">Order summary</div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-start justify-between">
              <dt className="text-neutral-600">Plan</dt>
              <dd className="text-neutral-900 font-medium">{plan.name} — {plan.price}</dd>
            </div>
            {addonAiPhone && (
              <div className="flex items-start justify-between">
                <dt className="text-neutral-600">AI Phone Answering Service</dt>
                <dd className="text-neutral-900 font-medium">$29/mo</dd>
              </div>
            )}
            <div className="flex items-start justify-between border-t border-neutral-200 pt-2 mt-2">
              <dt className="text-neutral-700">Total due monthly</dt>
              <dd className="text-neutral-900 font-semibold">${total}/mo</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50">
          <div className="text-sm font-medium text-neutral-700">Billing details</div>
          <div className="mt-3 text-sm text-neutral-700">
            <div>{personal.firstName} {personal.lastName}</div>
            <div className="text-neutral-600">{personal.email}</div>
            {personal.phone && <div className="text-neutral-600">{personal.phone}</div>}
          </div>
          <div className="mt-4 text-xs text-neutral-500">
            This is a mock payment for demo purposes only.
          </div>
        </div>
      </div>

    </div>
  );
}

function StepCheckout({
  personal,
  planId,
  addonAiPhone,
  onPay,
  loading,
  paid,
  error,
  billing,
  onBillingChange,
}: {
  personal: PersonalInfo;
  planId: string;
  addonAiPhone: boolean;
  onPay: () => void | Promise<void>;
  loading: boolean;
  paid: boolean;
  error: string | null;
  billing: BillingInfo;
  onBillingChange: <K extends keyof BillingInfo>(key: K, value: BillingInfo[K]) => void;
}) {
  const plan = PLANS.find((p) => p.id === planId)!;
  const planPrice = getPlanPrice(planId);
  const addonPrice = addonAiPhone ? 29 : 0;
  const total = planPrice + addonPrice;
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showCard, setShowCard] = useState<boolean>(false);

  const canContinueBilling = Boolean(
    billing.fullName && billing.address1 && billing.postalCode
  );
  const canPay = canContinueBilling; // same minimal requirements for mock

  return (
    <div>
      <h2 className="text-lg font-medium tracking-tight">Checkout</h2>
      <p className="mt-1 text-sm text-neutral-600">Mock checkout only. No card will be charged.</p>

      <div className="mt-5 space-y-4">
        {/* Order summary (collapsible) */}
        <div className="rounded-xl border border-neutral-200">
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50"
          >
            <div className="text-sm text-neutral-700">
              <span className="font-medium">Order total:</span> ${total}/mo
            </div>
            <span className="text-xs text-neutral-600 underline">{showDetails ? "Hide details" : "View details"}</span>
          </button>
          {showDetails && (
            <div className="px-4 pb-4">
              <dl className="space-y-2 text-sm">
                <div className="flex items-start justify-between">
                  <dt className="text-neutral-600">Plan</dt>
                  <dd className="text-neutral-900 font-medium">{plan.name} — {plan.price}</dd>
                </div>
                {addonAiPhone && (
                  <div className="flex items-start justify-between">
                    <dt className="text-neutral-600">AI Phone Answering Service</dt>
                    <dd className="text-neutral-900 font-medium">$29/mo</dd>
                  </div>
                )}
                <div className="flex items-start justify-between border-t border-neutral-200 pt-2 mt-2">
                  <dt className="text-neutral-700">Total due monthly</dt>
                  <dd className="text-neutral-900 font-semibold">${total}/mo</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Billing form (editable) */}
        <div className="rounded-xl border border-neutral-200 p-4 bg-white">
          <div className="text-sm font-medium text-neutral-700">Billing information</div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <Field label="Full name" required>
              <Input
                type="text"
                placeholder="Name on invoice"
                value={billing.fullName || ""}
                onChange={(e) => onBillingChange("fullName", e.target.value)}
                autoComplete="name"
              />
            </Field>
            {/* Billing email removed per request */}
            <Field label="Street address" required>
              <Input
                type="text"
                placeholder="123 Main St"
                value={billing.address1 || ""}
                onChange={(e) => onBillingChange("address1", e.target.value)}
                autoComplete="address-line1"
              />
            </Field>
            <Field label="Address line 2 (optional)">
              <Input
                type="text"
                placeholder="Apt, suite, etc."
                value={billing.address2 || ""}
                onChange={(e) => onBillingChange("address2", e.target.value)}
                autoComplete="address-line2"
              />
            </Field>
            <Field label="Zip code" required>
              <Input
                type="text"
                placeholder="ZIP / Postal code"
                value={billing.postalCode || ""}
                onChange={(e) => onBillingChange("postalCode", e.target.value)}
                autoComplete="postal-code"
              />
            </Field>
            <div className="mt-1 text-xs text-neutral-500">Use a different billing name if needed — it won't change your personal info.</div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowCard(true)}
                disabled={!canContinueBilling}
                className={classNames(
                  "w-full sm:w-auto px-4 py-2 rounded-md text-white text-sm",
                  !canContinueBilling ? "bg-[#93b7f1] cursor-not-allowed" : "bg-[#1a73e8] hover:opacity-95"
                )}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card details */}
      {showCard && (
      <div className="mt-5 rounded-xl border border-neutral-200 p-4">
        <div className="text-sm font-medium text-neutral-700">Payment method (mock)</div>
        {paid ? (
          <div className="mt-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm p-3">
            Payment successful. Your subscription is activated (mock).
          </div>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Card number">
                <Input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  defaultValue="4242 4242 4242 4242"
                  readOnly
                />
              </Field>
              <Field label="Name on card">
                <Input
                  type="text"
                  placeholder="Name on card"
                  defaultValue="JANE DOE"
                  readOnly
                />
              </Field>
              <Field label="Expiration">
                <Input type="text" placeholder="MM/YY" defaultValue="12/34" readOnly />
              </Field>
              <Field label="CVC">
                <Input type="text" placeholder="CVC" defaultValue="123" readOnly />
              </Field>
            </div>
            {error && (
              <div className="mt-3 text-sm text-red-600">{error}</div>
            )}
            <div className="mt-4">
              <button
                type="button"
                onClick={onPay}
                disabled={loading || !canPay}
                className={classNames(
                  "w-full sm:w-auto px-4 py-2 rounded-md text-white text-sm",
                  loading || !canPay ? "bg-[#93b7f1] cursor-not-allowed" : "bg-[#1a73e8] hover:opacity-95"
                )}
              >
                {loading ? "Processing..." : `Pay $${total}/mo (Mock)`}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="11" width="18" height="10" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                SSL Secured
              </div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <path d="M2 10h20"/>
                </svg>
                PCI DSS (mock)
              </div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 22s8-4 8-10V6l-8-4-8 4v6c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                Privacy First
              </div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                99.9% Uptime
              </div>
            </div>
          </>
        )}
      </div>
      )}
    </div>
  );
}

export default function GetStartedPage() {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<PersonalInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [selectedPlan, setSelectedPlan] = useState<string | null>("small");
  const [addonAiPhone, setAddonAiPhone] = useState<boolean>(false);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [mockPaid, setMockPaid] = useState<boolean>(false);
  const [billing, setBilling] = useState<BillingInfo>({
    fullName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });


  const canProceedStep1 = useMemo(() => {
    const emailOk = /\S+@\S+\.\S+/.test(data.email);
    const nameOk = data.firstName.trim().length > 1 && data.lastName.trim().length > 1;
    return emailOk && nameOk;
  }, [data.email, data.firstName, data.lastName]);

  function handleChange<K extends keyof PersonalInfo>(key: K, value: PersonalInfo[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function handleNext() {
    if (step === 1 && !canProceedStep1) return;
    if (step === 2 && !selectedPlan) return;
    setStep((s) => (Math.min(TOTAL_STEPS, (s + 1) as Step)) as Step);
  }

  function handleBack() {
    setStep((s) => (Math.max(1, (s - 1) as Step)) as Step);
  }

  // Mock checkout kept here for potential future integration reference.
  async function handleCheckout() {
    if (!selectedPlan) return;
    setCheckoutError(null);
    setCheckoutLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setCheckoutLoading(false);
    setMockPaid(true);
  }

  function handleBillingChange<K extends keyof BillingInfo>(key: K, value: BillingInfo[K]) {
    setBilling((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="py-10 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Get Started</h1>
          <p className="mt-2 text-neutral-600">Complete a few quick steps to continue your account setup.</p>
        </header>

        {/* Progress (segmented with breakpoints) */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <div>
              <span className="font-medium text-neutral-800">Step {step} of {TOTAL_STEPS}</span>
              <span className="ml-2">{step === 1 ? "Personal info" : step === 2 ? "Package" : step === 3 ? "Summary" : "Checkout"}</span>
            </div>
          </div>
          {/* Segments */}
          <div className="mt-3">
            <div className="grid grid-cols-4 gap-1">
              {[1,2,3,4].map((i) => (
                <div
                  key={i}
                  className={classNames(
                    "h-2 rounded", 
                    i <= step ? "bg-[#1a73e8]" : "bg-neutral-200"
                  )}
                />
              ))}
            </div>
            {/* Breakpoints */}
            <div className="mt-2 grid grid-cols-4 text-[11px] text-neutral-600">
              <div className={classNames("flex items-center gap-2", step >= 1 && "text-neutral-800")}> 
                <span className={classNames("h-2.5 w-2.5 rounded-full", step >= 1 ? "bg-[#1a73e8]" : "bg-neutral-300")} />
                <span className="hidden sm:inline">Personal</span>
              </div>
              <div className={classNames("flex items-center gap-2 justify-center", step >= 2 && "text-neutral-800")}> 
                <span className={classNames("h-2.5 w-2.5 rounded-full", step >= 2 ? "bg-[#1a73e8]" : "bg-neutral-300")} />
                <span className="hidden sm:inline">Package</span>
              </div>
              <div className={classNames("flex items-center gap-2 justify-center", step >= 3 && "text-neutral-800")}> 
                <span className={classNames("h-2.5 w-2.5 rounded-full", step >= 3 ? "bg-[#1a73e8]" : "bg-neutral-300")} />
                <span className="hidden sm:inline">Summary</span>
              </div>
              <div className={classNames("flex items-center gap-2 justify-end", step >= 4 && "text-neutral-800")}> 
                <span className={classNames("h-2.5 w-2.5 rounded-full", step >= 4 ? "bg-[#1a73e8]" : "bg-neutral-300")} />
                <span className="hidden sm:inline">Checkout</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
          {step === 1 && (
            <StepPersonalInfo data={data} onChange={handleChange} />
          )}

          {step === 2 && (
            <StepPackageSelection
              plans={PLANS}
              selectedPlan={selectedPlan}
              onSelect={(id) => {
                setSelectedPlan(id);
                // Reset add-on if not eligible
                if (id === "startup") setAddonAiPhone(false);
              }}
              addonAiPhone={addonAiPhone}
              onToggleAddon={() => setAddonAiPhone((v) => !v)}
            />
          )}

          {step === 3 && selectedPlan && (
            <StepSummary
              personal={data}
              planId={selectedPlan}
              addonAiPhone={addonAiPhone}
            />
          )}
          {step === 4 && selectedPlan && (
            <StepCheckout
              personal={data}
              planId={selectedPlan}
              addonAiPhone={addonAiPhone}
              onPay={handleCheckout}
              loading={checkoutLoading}
              paid={mockPaid}
              error={checkoutError}
              billing={billing}
              onBillingChange={handleBillingChange}
            />
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={classNames(
                "px-4 py-2 rounded-md border text-sm",
                step === 1
                  ? "border-neutral-200 text-neutral-400 bg-neutral-50 cursor-not-allowed"
                  : "border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50"
              )}
            >
              Back
            </button>
            {step !== 4 && (
              <button
                type="button"
                onClick={handleNext}
                disabled={(step === 1 && !canProceedStep1) || (step === 2 && !selectedPlan)}
                className={classNames(
                  "px-4 py-2 rounded-md text-white text-sm",
                  (step === 1 && !canProceedStep1) || (step === 2 && !selectedPlan)
                    ? "bg-[#93b7f1] cursor-not-allowed"
                    : "bg-[#1a73e8] hover:opacity-95"
                )}
              >
                {step === TOTAL_STEPS ? "Finish" : "Continue"}
              </button>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <p className="mt-4 text-xs text-neutral-500">You can safely leave this page at any time—your progress will be saved when we wire up persistence.</p>
      </div>
    </div>
  );
}

function Field({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-neutral-700">
        {label} {required && <span className="text-red-600">*</span>}
      </div>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={classNames(
        "w-full rounded-md border px-3 py-2 text-sm outline-none",
        "border-neutral-300 placeholder-neutral-400",
        "focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]",
        props.className || ""
      )}
    />
  );
}

function StepPackageSelection({
  plans,
  selectedPlan,
  onSelect,
  addonAiPhone,
  onToggleAddon,
}: {
  plans: PlanOption[];
  selectedPlan: string | null;
  onSelect: (id: string) => void;
  addonAiPhone: boolean;
  onToggleAddon: () => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-medium tracking-tight">Choose your package</h2>
      <p className="mt-1 text-sm text-neutral-600">Pick the plan that fits your needs. You can change later.</p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((p) => {
          const active = selectedPlan === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={classNames(
                "relative text-left w-full p-4 rounded-xl border bg-white transition",
                active
                  ? "border-[#1a73e8] ring-2 ring-[#1a73e8]/20"
                  : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              {p.recommended && (
                <span className="absolute -top-2 left-4 inline-flex items-center rounded-full bg-[#1a73e8] text-white px-2 py-0.5 text-[10px] uppercase tracking-wide shadow">
                  Most popular
                </span>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-neutral-500">{p.name}</div>
                  <div className="mt-1 text-xl font-semibold text-neutral-900">{p.price}</div>
                  {p.description && (
                    <div className="mt-1 text-sm text-neutral-600">{p.description}</div>
                  )}
                </div>
                <div className={classNames(
                  "ml-3 h-5 w-5 rounded-full border flex items-center justify-center",
                  active ? "border-[#1a73e8]" : "border-neutral-300"
                )}>
                  <span className={classNames(
                    "h-2.5 w-2.5 rounded-full",
                    active ? "bg-[#1a73e8]" : "bg-transparent"
                  )} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Add-ons */}
      <div className="mt-6 border-t border-neutral-200 pt-4">
        <div className="text-sm font-medium text-neutral-700">Add-ons</div>
        <label className="mt-3 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-neutral-300"
            checked={addonAiPhone}
            onChange={onToggleAddon}
            disabled={selectedPlan === "startup"}
          />
          <span className={classNames(
            "text-neutral-700",
            selectedPlan === "startup" && "text-neutral-400"
          )}>
            AI Phone Answering Service — <span className="font-medium">$29/mo</span> <span className="text-neutral-500">(150 minutes)</span>
            {selectedPlan === "startup" && (
              <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Not available for Startups</span>
            )}
          </span>
        </label>
      </div>
    </div>
  );
}

function StepPersonalInfo({
  data,
  onChange,
}: {
  data: PersonalInfo;
  onChange: <K extends keyof PersonalInfo>(key: K, value: PersonalInfo[K]) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-medium tracking-tight">Personal info</h2>
      <p className="mt-1 text-sm text-neutral-600">Tell us a bit about you so we can set up your account.</p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First name" required>
          <Input
            type="text"
            placeholder="Jane"
            value={data.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            autoComplete="given-name"
          />
        </Field>
        <Field label="Last name" required>
          <Input
            type="text"
            placeholder="Doe"
            value={data.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            autoComplete="family-name"
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email" required>
          <Input
            type="email"
            placeholder="jane@example.com"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field label="Phone (optional)">
          <Input
            type="tel"
            placeholder="(555) 555-5555"
            value={data.phone || ""}
            onChange={(e) => onChange("phone", e.target.value)}
            autoComplete="tel"
          />
        </Field>
      </div>

    </div>
  );
}
