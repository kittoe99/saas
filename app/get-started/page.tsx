"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
}: {
  personal: PersonalInfo;
  planId: string;
}) {
  const plan = PLANS.find((p) => p.id === planId)!;
  const planPrice = getPlanPrice(planId);
  const total = planPrice;

  return (
    <div>
      <h2 className="text-lg font-medium tracking-tight">Review & Summary</h2>
      <p className="mt-1 text-sm text-neutral-600">Confirm your details before checkout.</p>

      {/* Summary */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-xl border border-neutral-200 p-4 shadow-soft">
          <div className="text-sm font-medium text-neutral-700">Order summary</div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-start justify-between">
              <dt className="text-neutral-600">Plan</dt>
              <dd className="text-neutral-900 font-medium">{plan.name} — {plan.price}</dd>
            </div>
            <div className="flex items-start justify-between border-t border-neutral-200 pt-2 mt-2">
              <dt className="text-neutral-700">Total due monthly</dt>
              <dd className="text-neutral-900 font-semibold">${total}/mo</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50 shadow-soft">
          <div className="text-sm font-medium text-neutral-700">Billing details</div>
          <div className="mt-3 text-sm text-neutral-700">
            <div>{personal.firstName} {personal.lastName}</div>
            <div className="text-neutral-600">{personal.email}</div>
            {personal.phone && <div className="text-neutral-600">{personal.phone}</div>}
          </div>
          <div className="mt-4 text-xs text-neutral-500">
            You’ll complete payment securely on Stripe Checkout.
          </div>
        </div>
      </div>

    </div>
  );
}

function StepCheckout({
  personal,
  planId,
  onPay,
  loading,
  paid,
  error,
  billing,
  onBillingChange,
}: {
  personal: PersonalInfo;
  planId: string;
  onPay: () => void | Promise<void>;
  loading: boolean;
  paid: boolean;
  error: string | null;
  billing: BillingInfo;
  onBillingChange: <K extends keyof BillingInfo>(key: K, value: BillingInfo[K]) => void;
}) {
  const plan = PLANS.find((p) => p.id === planId)!;
  const planPrice = getPlanPrice(planId);
  const total = planPrice;
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showCard, setShowCard] = useState<boolean>(false);

  const canContinueBilling = Boolean(
    billing.fullName && billing.address1 && billing.postalCode
  );
  const canPay = canContinueBilling; // mock only

  return (
    <div>
      <h2 className="text-lg font-medium tracking-tight">Checkout</h2>
      <p className="mt-1 text-sm text-neutral-600">You’ll be redirected to Stripe Checkout to complete your subscription.</p>

      <div className="mt-5 space-y-4">
        {/* Order summary (collapsible) */}
        <div className="rounded-xl border border-neutral-200 shadow-soft shadow-hover">
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
                <div className="flex items-start justify-between border-t border-neutral-200 pt-2 mt-2">
                  <dt className="text-neutral-700">Total due monthly</dt>
                  <dd className="text-neutral-900 font-semibold">${total}/mo</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Billing form (editable) */}
        <form className="rounded-3xl border border-soft p-4 bg-white shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]" autoComplete="on" onSubmit={(e) => e.preventDefault()}>
          <div className="text-sm font-medium text-neutral-700">Billing information</div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <Field label="Full name" required>
              <Input
                type="text"
                placeholder="Name on invoice"
                value={billing.fullName || ""}
                onChange={(e) => onBillingChange("fullName", e.target.value)}
                autoComplete="section-billing name"
                name="name"
              />
            </Field>
            {/* Billing email removed per request */}
            <Field label="Street address" required>
              <Input
                type="text"
                placeholder="123 Main St"
                value={billing.address1 || ""}
                onChange={(e) => onBillingChange("address1", e.target.value)}
                autoComplete="section-billing address-line1"
                name="address-line1"
              />
            </Field>
            <Field label="Address line 2 (optional)">
              <Input
                type="text"
                placeholder="Apt, suite, etc."
                value={billing.address2 || ""}
                onChange={(e) => onBillingChange("address2", e.target.value)}
                autoComplete="section-billing address-line2"
                name="address-line2"
              />
            </Field>
            <Field label="Zip code" required>
              <Input
                type="text"
                placeholder="ZIP / Postal code"
                value={billing.postalCode || ""}
                onChange={(e) => onBillingChange("postalCode", e.target.value)}
                autoComplete="section-billing postal-code"
                name="postal-code"
              />
            </Field>
            <div className="mt-1 text-xs text-neutral-500">Use a different billing name if needed — it won't change your personal info.</div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowCard(true)}
                disabled={!canContinueBilling}
                className={classNames(
                  "w-full sm:w-auto px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors focus:outline-none",
                  !canContinueBilling ? "opacity-60 cursor-not-allowed" : "hover:brightness-95"
                )}
              >
                Continue
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Stripe Checkout trigger */}
      {showCard && (
      <div className="mt-5 rounded-3xl border border-soft p-4 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]">
        <div className="text-sm font-medium text-neutral-700">Checkout with Stripe</div>
        {error && (
          <div className="mt-3 text-sm text-red-600">{error}</div>
        )}
        <div className="mt-4">
          <button
            type="button"
            onClick={onPay}
            disabled={loading || !canPay}
            className={classNames(
              "w-full sm:w-auto px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors focus:outline-none",
              loading || !canPay ? "opacity-60 cursor-not-allowed" : "hover:brightness-95"
            )}
          >
            {loading ? "Redirecting..." : `Proceed to secure checkout — $${total}/mo`}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}

// Removed duplicate/broken GetStartedPage definition block above. The valid definition starts below.

    export default function GetStartedPage() {
      const router = useRouter();
      const [gateChecking, setGateChecking] = useState(true);
      const [step, setStep] = useState<Step>(1);
      const [data, setData] = useState<PersonalInfo>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
      const [selectedPlan, setSelectedPlan] = useState<string | null>("small");
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
      // Animated reveal wrapper used for progressive sections
      function StepBlock({ show, children }: { show: boolean; children: React.ReactNode }) {
        return (
          <div
            className={`transition-all duration-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}
            style={{ maxHeight: show ? undefined : 0, overflow: show ? undefined : "hidden" }}
            aria-hidden={!show}
          >
            {children}
          </div>
        );
      }

      // Refs to scroll into view when moving forward/backward
      const step1Ref = useRef<HTMLDivElement | null>(null);
      const step2Ref = useRef<HTMLDivElement | null>(null);
      const step3Ref = useRef<HTMLDivElement | null>(null);
      const step4Ref = useRef<HTMLDivElement | null>(null);

      // Auth gate: require login
      useEffect(() => {
        let active = true;
        (async () => {
          try {
            const { data } = await supabase.auth.getUser();
            const user = data?.user;
            if (!user) {
              router.push("/login?next=/get-started");
              return;
            }
          } finally {
            if (active) setGateChecking(false);
          }
        })();
        return () => { active = false; };
      }, [router]);

      // Auto-scroll disabled per design: keep position stable between steps
      useEffect(() => {
        // no-op
      }, [step]);

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

      // Hosted Stripe Checkout: create session on server and redirect to Stripe
      async function handleCheckout() {
        if (!selectedPlan) return;
        setCheckoutError(null);
        setCheckoutLoading(true);
        try {
          // Ensure user is authenticated and get user_id
          const { data: auth } = await supabase.auth.getUser();
          const user = auth?.user;
          if (!user) {
            router.push("/login?next=/get-started");
            return;
          }

          // Determine amount from plan (in cents)
          const dollars = getPlanPrice(selectedPlan);
          const amount_cents = Math.max(1, Math.floor(dollars * 100));
          const plan = PLANS.find((p) => p.id === selectedPlan)!;

          // Optionally persist onboarding submission first (kept as-is)
          try {
            const submission = { personal: data, billing, planId: selectedPlan };
            await fetch("/api/get-started", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: user.id, plan: selectedPlan, data: submission }),
            });
          } catch { /* non-fatal for payment */ }

          // Create Checkout Session (server will attach user_id/email)
          const res = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount_cents,
              name: `${plan.name} — ${plan.price}`,
              currency: "usd",
              quantity: 1,
              user_id: user.id,
              email: user.email,
              // Success/cancel default to /checkout/*; override to Get-Started if desired:
              success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${window.location.origin}/checkout/cancel`,
            }),
          });
          const j = await res.json().catch(() => null);
          if (!res.ok) throw new Error(j?.error || `Checkout failed (${res.status})`);

          const url = j?.url as string | undefined;
          if (!url) throw new Error("No Checkout session URL returned");
          window.location.href = url; // Redirect to Stripe hosted UI
        } catch (e: any) {
          setCheckoutError(e?.message || "Something went wrong while processing your payment.");
        } finally {
          setCheckoutLoading(false);
        }
      }

      function handleBillingChange<K extends keyof BillingInfo>(key: K, value: BillingInfo[K]) {
        setBilling((prev) => ({ ...prev, [key]: value }));
      }

      return (
        <div className="relative mx-auto max-w-5xl px-6 py-10" aria-busy={gateChecking}>
          {gateChecking && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-white/70 backdrop-blur-[1px]" role="status" aria-live="polite" aria-atomic="true">
              <div className="flex items-center gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2 shadow-sm">
                <svg className="h-4 w-4 animate-spin text-success-ink" viewBox="0 0 24 24" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-sm text-neutral-800">Checking account…</span>
              </div>
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-primary">Get started</h1>
          <p className="mt-1 text-sm md:text-base text-secondary">Complete a few quick steps to continue your account setup.</p>

          <div className="mt-8 grid grid-cols-12 gap-8">
            {/* Sidebar */}
            <aside className="hidden md:block md:col-span-4 md:sticky md:top-6">
              <ProgressSidebar current={step} />
            </aside>

            {/* Main content: Accordion */}
            <main className="col-span-12 md:col-span-8">
              <div className="space-y-4">
                {/* Step 1 */}
                <details
                  ref={step1Ref as any}
                  open={step === 1}
                  className={classNames(
                    "relative rounded-3xl border shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]",
                    step > 1 ? "bg-success-bg border-success" : "bg-white border-soft"
                  )}
                  onToggle={(e) => {
                    const el = e.currentTarget as HTMLDetailsElement;
                    if (el.open) setStep(1);
                  }}
                >
                  {step > 1 && (
                    <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-success-accent" />
                  )}
                  <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                        {step > 1 && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-accent text-white text-[11px]">✓</span>
                        )}
                        <span>1. Personal info</span>
                      </div>
                      {step > 1 && (
                        <div className="text-xs text-neutral-600 mt-0.5 truncate">{`${data.firstName} ${data.lastName}`.trim()} • {data.email || "—"}</div>
                      )}
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <span className={classNames(
                        "text-xs rounded-full px-2 py-0.5",
                        step > 1 ? "bg-success-bg text-success-ink" : step === 1 ? "bg-neutral-100 text-neutral-700" : "bg-neutral-100 text-neutral-500"
                      )}>{step > 1 ? "Completed" : step === 1 ? "In progress" : "Locked"}</span>
                      <svg className="chevron h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                    </div>
                  </summary>
                  <div className="accordion border-t border-neutral-200">
                    <div className="accordion-content p-4 sm:p-5 fade-slide">
                      <StepPersonalInfo data={data} onChange={handleChange} />
                      <div className="mt-4 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={!canProceedStep1}
                          className={classNames(
                            "px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors focus:outline-none",
                            !canProceedStep1 ? "opacity-60 cursor-not-allowed" : "hover:brightness-95"
                          )}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                </details>

                {/* Step 2 */}
                <details
                  ref={step2Ref as any}
                  open={step === 2}
                  className={classNames(
                    "relative rounded-3xl border shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]",
                    step > 2 ? "bg-success-bg border-success" : step >= 2 ? "bg-white border-soft" : "bg-white border-neutral-100 opacity-70"
                  )}
                  onToggle={(e) => {
                    const el = e.currentTarget as HTMLDetailsElement;
                    if (el.open && step >= 2) setStep(2);
                    if (step < 2) {
                      // prevent opening if locked
                      el.open = false;
                    }
                  }}
                >
                  {step > 2 && (
                    <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-success-accent" />
                  )}
                  <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                        {step > 2 && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-accent text-white text-[11px]">✓</span>
                        )}
                        <span>2. Package</span>
                      </div>
                      {step > 2 && (
                        <div className="text-xs text-neutral-600 mt-0.5 truncate">{PLANS.find(p=>p.id===selectedPlan!)?.name || "—"}</div>
                      )}
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <span className={classNames(
                        "text-xs rounded-full px-2 py-0.5",
                        step > 2 ? "bg-success-bg text-success-ink" : step === 2 ? "bg-neutral-100 text-neutral-700" : "bg-neutral-100 text-neutral-500"
                      )}>{step > 2 ? "Completed" : step === 2 ? "In progress" : "Locked"}</span>
                      <svg className="chevron h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                    </div>
                  </summary>
                  <div className="accordion border-t border-neutral-200">
                    <div className="accordion-content p-4 sm:p-5 fade-slide">
                      <StepPackageSelection
                        plans={PLANS}
                        selectedPlan={selectedPlan}
                        onSelect={(id) => {
                          setSelectedPlan(id);
                        }}
                      />
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="px-4 py-2 rounded-full border border-neutral-300 text-sm text-neutral-700 bg-white hover:bg-neutral-50"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={!selectedPlan}
                          className={classNames(
                            "px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors focus:outline-none",
                            !selectedPlan ? "opacity-60 cursor-not-allowed" : "hover:brightness-95"
                          )}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                </details>

                {/* Step 3 */}
                <details
                  ref={step3Ref as any}
                  open={step === 3}
                  className={classNames(
                    "relative rounded-3xl border shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]",
                    step > 3 ? "bg-success-bg border-success" : step >= 3 ? "bg-white border-soft" : "bg-white border-neutral-100 opacity-70"
                  )}
                  onToggle={(e) => {
                    const el = e.currentTarget as HTMLDetailsElement;
                    if (el.open && step >= 3) setStep(3);
                    if (step < 3) el.open = false;
                  }}
                >
                  {step > 3 && (
                    <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-success-accent" />
                  )}
                  <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                        {step > 3 && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-accent text-white text-[11px]">✓</span>
                        )}
                        <span>3. Summary</span>
                      </div>
                      {step > 3 && (
                        <div className="text-xs text-neutral-600 mt-0.5 truncate">Ready to pay</div>
                      )}
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <span className={classNames(
                        "text-xs rounded-full px-2 py-0.5",
                        step > 3 ? "bg-success-bg text-success-ink" : step === 3 ? "bg-neutral-100 text-neutral-700" : "bg-neutral-100 text-neutral-500"
                      )}>{step > 3 ? "Completed" : step === 3 ? "In progress" : "Locked"}</span>
                      <svg className="chevron h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                    </div>
                  </summary>
                  <div className="accordion border-t border-neutral-200">
                    <div className="accordion-content p-4 sm:p-5 fade-slide">
                      {selectedPlan && (
                        <StepSummary personal={data} planId={selectedPlan} />
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="px-4 py-2 rounded-full border border-neutral-300 text-sm text-neutral-700 bg-white hover:bg-neutral-50"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={!selectedPlan}
                          className={classNames(
                            "px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors",
                            !selectedPlan ? "opacity-60 cursor-not-allowed" : "hover:brightness-95"
                          )}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                </details>

                {/* Step 4 */}
                <details
                  ref={step4Ref as any}
                  open={step === 4}
                  className={classNames("rounded-3xl border bg-white shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]", step >= 4 ? "border-soft" : "border-neutral-100 opacity-70")}
                  onToggle={(e) => {
                    const el = e.currentTarget as HTMLDetailsElement;
                    if (el.open && step >= 4) setStep(4);
                    if (step < 4) el.open = false;
                  }}
                >
                  <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-neutral-800">4. Checkout</div>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <span className={classNames(
                        "text-xs rounded-full px-2 py-0.5",
                        step > 4 ? "bg-success-bg text-success-ink" : step === 4 ? "bg-neutral-100 text-neutral-700" : "bg-neutral-100 text-neutral-500"
                      )}>{step > 4 ? "Completed" : step === 4 ? "In progress" : "Locked"}</span>
                      <svg className="chev h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                    </div>
                  </summary>
                  <div className="accordion border-t border-neutral-200">
                    <div className="accordion-content p-4 sm:p-5 fade-slide">
                      {selectedPlan && (
                        <StepCheckout
                          personal={data}
                          planId={selectedPlan}
                          onPay={handleCheckout}
                          loading={checkoutLoading}
                          paid={mockPaid}
                          error={checkoutError}
                          billing={billing}
                          onBillingChange={handleBillingChange}
                        />
                      )}
                    </div>
                  </div>
                </details>
              </div>
            </main>
          </div>

          {/* Footer hint */}
          <p className="mt-4 text-xs text-neutral-500">You can safely leave this page at any time—your progress will be saved when we wire up persistence.</p>
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
        "w-full rounded-md border px-3 py-2 text-sm outline-none shadow-sm",
        "border-neutral-300 placeholder-neutral-400",
        "focus:ring-2 focus:ring-black/30 focus:border-black",
        props.className || ""
      )}
    />
  );
}

function ProgressSidebar({ current }: { current: number }) {
  const items = [
    { id: 1, label: "Personal" },
    { id: 2, label: "Package" },
    { id: 3, label: "Summary" },
    { id: 4, label: "Checkout" },
  ];
  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-neutral-200 rounded" aria-hidden />
      {/* Progress */}
      <div
        className="absolute left-2 w-[2px] bg-success-accent rounded transition-all"
        style={{ top: 0, height: `${((Math.max(1, current) - 1) / (Math.max(1, TOTAL_STEPS - 1))) * 100}%` }}
        aria-hidden
      />
      <ol className="space-y-6">
        {items.map((it) => {
          const active = it.id === current;
          const done = it.id < current;
          return (
            <li key={it.id} className="flex items-start gap-3">
              <span
                className={classNames(
                  "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px]",
                  done ? "bg-success-accent border-success text-white" : active ? "border-success text-success-ink" : "border-neutral-300 text-neutral-500"
                )}
                aria-hidden
              >
                {done ? "" : it.id}
              </span>
              <div>
                <div className={classNames("text-sm", done ? "text-neutral-700" : active ? "text-neutral-900 font-medium" : "text-neutral-600")}>{it.label}</div>
                <div className="text-xs text-neutral-500">Step {it.id} of {TOTAL_STEPS}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepPackageSelection({
  plans,
  selectedPlan,
  onSelect,
}: {
  plans: PlanOption[];
  selectedPlan: string | null;
  onSelect: (id: string) => void;
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
                "relative text-left w-full p-4 rounded-xl border bg-white transition shadow-soft shadow-hover",
                active
                  ? "border-black ring-2 ring-black/20"
                  : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              {p.recommended && (
                <span className="absolute -top-2 left-4 inline-flex items-center rounded-full bg-success-accent text-white px-2 py-0.5 text-[10px] uppercase tracking-wide shadow">
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
                  active ? "border-black" : "border-neutral-300"
                )}>
                  <span className={classNames(
                    "h-2.5 w-2.5 rounded-full",
                    active ? "bg-black" : "bg-transparent"
                  )} />
                </div>
              </div>
            </button>
          );
        })}
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
    <form autoComplete="on" onSubmit={(e) => e.preventDefault()}>
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
            name="given-name"
          />
        </Field>
        <Field label="Last name" required>
          <Input
            type="text"
            placeholder="Doe"
            value={data.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            autoComplete="family-name"
            name="family-name"
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
            name="email"
          />
        </Field>
        <Field label="Phone (optional)">
          <Input
            type="tel"
            placeholder="(555) 555-5555"
            value={data.phone || ""}
            onChange={(e) => onChange("phone", e.target.value)}
            autoComplete="tel"
            name="tel"
          />
        </Field>
      </div>

    </form>
  );
}
