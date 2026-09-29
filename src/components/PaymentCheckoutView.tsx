import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Lock, 
  Building2, 
  QrCode, 
  FileText, 
  Download, 
  Sparkles, 
  Check, 
  Copy,
  AlertCircle,
  Clock,
  Radio,
  ExternalLink,
  ChevronRight,
  Wallet,
  Smartphone
} from 'lucide-react';
import { SubscriptionPlan, BillingCycle } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface PaymentCheckoutViewProps {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  onPaymentSuccess: (plan: SubscriptionPlan, billingCycle: BillingCycle, transactionDetails: TransactionReceipt) => void;
  onCancel: () => void;
  onGoToDashboard?: () => void;
}

export interface TransactionReceipt {
  txnId: string;
  orderId: string;
  planName: string;
  amount: number;
  billingCycle: BillingCycle;
  paymentMethod: string;
  paidAt: string;
  customerName: string;
  customerEmail: string;
  companyName: string;
  gstin: string;
}

export const PaymentCheckoutView: React.FC<PaymentCheckoutViewProps> = ({
  plan,
  billingCycle,
  onPaymentSuccess,
  onCancel,
  onGoToDashboard,
}) => {
  const { themeConfig } = useTheme();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'po'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<TransactionReceipt | null>(null);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('4532 8920 4410 9021');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Harshit / Plant Operations Director');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [saveCard, setSaveCard] = useState(true);

  // UPI & Real QR Code State
  const [upiId, setUpiId] = useState(user?.email ? `${user.email.split('@')[0]}@okaxis` : 'plantops998@okaxis');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState('hdfc');

  // Corporate PO State
  const [poNumber, setPoNumber] = useState(`PO-${new Date().getFullYear()}-MM-${Math.floor(1000 + Math.random() * 9000)}`);
  const [companyGstin, setCompanyGstin] = useState('08AAACA4102B1Z4');
  const [companyName, setCompanyName] = useState('Alpha Plant Manufacturing Facility');

  // Pricing calculations
  const pricePerMonth = billingCycle === 'annual' ? plan.annualPricePerMonth : plan.monthlyPrice;
  const subtotal = billingCycle === 'annual' ? pricePerMonth * 12 : pricePerMonth;
  // 18% GST removed for monthly billing (GST = 0 on monthly billing)
  const gstRate = billingCycle === 'monthly' ? 0 : 0.18;
  const gstAmount = Math.round(subtotal * gstRate);
  const totalAmount = subtotal + gstAmount;

  // Real UPI Payment Intent Scheme (NPCI / UPI 2.0 Standard)
  const payeeVpa = 'machinemind.billing@icici';
  const payeeName = 'MachineMind Reliability Sensors';
  const transactionNote = `${plan.name} Subscription (${billingCycle === 'annual' ? 'Annual' : 'Monthly'})`;

  const upiPaymentUri = useMemo(() => {
    return `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  }, [totalAmount, plan.name, billingCycle]);

  // Generate real scannable QR code whenever amount or plan changes
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiPaymentUri, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate UPI QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiPaymentUri]);

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(payeeVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handlePayNow = () => {
    setIsProcessing(true);
    setProcessingStep('Connecting to Secure PCI-DSS Level-1 Gateway...');

    setTimeout(() => {
      setProcessingStep('Authorizing credentials with issuing bank...');
    }, 800);

    setTimeout(() => {
      setProcessingStep('Verifying 3D Secure token & plant license keys...');
    }, 1600);

    setTimeout(() => {
      setProcessingStep('Provisioning edge sensor bandwidth & machine quota...');
    }, 2200);

    setTimeout(() => {
      const now = new Date();
      const receipt: TransactionReceipt = {
        txnId: `TXN-MM-${now.getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`,
        orderId: `ORD-${Math.floor(10000000 + Math.random() * 90000000)}`,
        planName: plan.name,
        amount: totalAmount,
        billingCycle,
        paymentMethod: 
          paymentMethod === 'card' ? 'Corporate Credit Card (Visa •••• 9021)' :
          paymentMethod === 'upi' ? `UPI Intent (${upiId})` :
          paymentMethod === 'netbanking' ? `Net Banking (${selectedBank.toUpperCase()})` :
          `Enterprise Purchase Order (${poNumber})`,
        paidAt: now.toLocaleString(),
        customerName: cardHolder,
        customerEmail: user?.email || 'harshit998ops@gmail.com',
        companyName,
        gstin: companyGstin,
      };

      setIsProcessing(false);
      setPaymentSuccessReceipt(receipt);
      onPaymentSuccess(plan, billingCycle, receipt);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: [themeConfig.dotColor, '#10b981', '#38bdf8', '#fbbf24'],
      });
    }, 3000);
  };

  const handleDownloadInvoice = () => {
    if (!paymentSuccessReceipt) return;

    const invoiceData = {
      invoiceNumber: `INV-${paymentSuccessReceipt.orderId}`,
      transactionId: paymentSuccessReceipt.txnId,
      issueDate: paymentSuccessReceipt.paidAt,
      billingCycle: paymentSuccessReceipt.billingCycle.toUpperCase(),
      billedTo: {
        company: paymentSuccessReceipt.companyName,
        gstin: paymentSuccessReceipt.gstin,
        contactName: paymentSuccessReceipt.customerName,
        email: paymentSuccessReceipt.customerEmail,
        plantAddress: 'RIICO Industrial Area, Alwar, Rajasthan - 301030, India',
      },
      seller: {
        company: 'MachineMind Technologies Inc. (Industrial AI Systems)',
        pan: 'AAECM8821K',
        gstin: '08AAECM8821K1ZM',
        sacCode: '998313 (Information technology software consulting services)',
      },
      itemDescription: `MachineMind Predictive Maintenance Platform - ${paymentSuccessReceipt.planName} Plan (${paymentSuccessReceipt.billingCycle === 'annual' ? '12 Months Annual' : '1 Month'})`,
      quota: plan.machineLimit === 'Unlimited' ? 'Unlimited Plant Machinery' : `Up to ${plan.machineLimit} Industrial Assets`,
      subtotalINR: `₹${subtotal.toLocaleString('en-IN')}`,
      gstINR: billingCycle === 'monthly' ? '₹0 (0% GST / Waived)' : `₹${gstAmount.toLocaleString('en-IN')}`,
      totalPaidINR: `₹${paymentSuccessReceipt.amount.toLocaleString('en-IN')}`,
      paymentMethod: paymentSuccessReceipt.paymentMethod,
      status: 'PAID - ELECTRONIC SIGNATURE VERIFIED',
    };

    const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MachineMind-Tax-Invoice-${paymentSuccessReceipt.orderId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // SUCCESS SCREEN
  if (paymentSuccessReceipt) {
    return (
      <div className="max-w-3xl mx-auto py-6 pb-28 sm:pb-14 animate-in zoom-in-95 duration-200">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
          {/* Animated Success Ring */}
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 mx-auto flex items-center justify-center text-emerald-600 shadow-lg animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Payment Successful & Verified</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome to MachineMind {plan.name}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-1 leading-relaxed">
              Your industrial license has been activated. Edge sensors and machine telemetry are now unlocked under the <strong className="text-slate-900">{plan.name}</strong> tier.
            </p>
          </div>

          {/* Receipt Breakdown Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left text-xs font-mono max-w-xl mx-auto space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-500">
              <span>Transaction Reference</span>
              <span className="font-bold text-slate-900">{paymentSuccessReceipt.txnId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Order ID</span>
              <span className="font-bold text-slate-900">{paymentSuccessReceipt.orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Subscribed Plan</span>
              <span className="font-bold text-slate-900">{paymentSuccessReceipt.planName} ({billingCycle.toUpperCase()})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Machine Quota</span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {plan.machineLimit === 'Unlimited' ? 'Unlimited Assets' : `Up to ${plan.machineLimit} Machines`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Payment Channel</span>
              <span className="font-semibold text-slate-800">{paymentSuccessReceipt.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Billed Entity</span>
              <span className="font-semibold text-slate-800 truncate max-w-[240px]">{paymentSuccessReceipt.companyName}</span>
            </div>
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 text-sm font-sans font-bold">
              <span className="text-slate-900">Total Amount Paid</span>
              <span className="text-emerald-700 font-mono text-base">₹{paymentSuccessReceipt.amount.toLocaleString('en-IN')} INR</span>
            </div>
          </div>

          {/* Security & Confirmation note */}
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 text-xs text-sky-900 max-w-xl mx-auto flex items-center gap-2.5 text-left">
            <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
            <div>
              A verified GST tax invoice and license key certificate have been emailed to{' '}
              <strong className="font-bold text-sky-950">{paymentSuccessReceipt.customerEmail}</strong>.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleDownloadInvoice}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download Tax Invoice (JSON / Slip)</span>
            </button>

            {onGoToDashboard && (
              <button
                onClick={onGoToDashboard}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 ${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} cursor-pointer`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Go to Factory Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PAYMENT CHECKOUT FORM SCREEN
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-28 sm:pb-16 animate-in fade-in duration-200">
      {/* Top Breadcrumb / Return button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Subscription Plans</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit Encrypted Industrial Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left Column (7 Cols on PC/Tablet, 1 Col on Mobile): Payment Methods & Billing Form */}
        <div className="md:col-span-7 space-y-5">
          {/* Payment Method Selector */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Select Payment Option
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose your preferred corporate or direct payment channel.
              </p>
            </div>

            {/* 4 Payment Channel Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'card'
                    ? `${themeConfig.bgLightClass} ${themeConfig.borderClass} ${themeConfig.textClass} shadow-2xs font-bold`
                    : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'upi'
                    ? `${themeConfig.bgLightClass} ${themeConfig.borderClass} ${themeConfig.textClass} shadow-2xs font-bold`
                    : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs">UPI / QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'netbanking'
                    ? `${themeConfig.bgLightClass} ${themeConfig.borderClass} ${themeConfig.textClass} shadow-2xs font-bold`
                    : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-xs">Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('po')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'po'
                    ? `${themeConfig.bgLightClass} ${themeConfig.borderClass} ${themeConfig.textClass} shadow-2xs font-bold`
                    : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">Corporate PO</span>
              </button>
            </div>

            {/* TAB 1: CREDIT / DEBIT CARD */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Card Details:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">VISA</span>
                    <span className="font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">MasterCard</span>
                    <span className="font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">RuPay</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 0000 0000 0000"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Expires (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="08/29"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Security Code (CVV)
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Name as printed on corporate card"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Save this corporate card for recurring plant billing</span>
                </label>
              </div>
            )}

            {/* TAB 2: UPI / REAL SCANNABLE QR CODE */}
            {paymentMethod === 'upi' && (
              <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center gap-5">
                  {/* Real Scannable UPI QR Code Card */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-center shrink-0 flex flex-col items-center">
                    <div className="w-44 h-44 sm:w-48 sm:h-48 bg-white rounded-xl flex items-center justify-center relative overflow-hidden p-1 border border-slate-100">
                      {qrCodeDataUrl ? (
                        <img 
                          src={qrCodeDataUrl} 
                          alt={`Scan UPI QR Code to pay ₹${totalAmount.toLocaleString('en-IN')}`} 
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] font-mono">Generating UPI QR...</span>
                        </div>
                      )}
                    </div>
                    
                    {/* QR Caption & Live Amount */}
                    <div className="mt-2.5 space-y-1 w-full">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-900 font-mono">
                        <span>₹{totalAmount.toLocaleString('en-IN')} INR</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Scan with Any UPI App
                      </span>
                    </div>
                  </div>

                  {/* QR Details, Apps & Verification */}
                  <div className="space-y-3 text-xs flex-1 w-full">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 block text-sm">
                          Real UPI QR Code
                        </span>
                        <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-sky-600" />
                          NPCI / UPI 2.0
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Open Google Pay, PhonePe, Paytm, or BHIM on your phone and point the camera at this QR code.
                      </p>
                    </div>

                    {/* Verified Payee VPA Box with 1-Click Copy */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Official Merchant VPA:</span>
                        <span className="font-semibold text-emerald-600 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified Merchant
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <code className="font-mono font-bold text-slate-900 text-xs sm:text-sm bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 truncate">
                          {payeeVpa}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyVpa}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition shrink-0 cursor-pointer active:scale-95"
                          title="Copy UPI ID"
                        >
                          {copiedVpa ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy ID</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Supported UPI Apps */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">
                          Direct Mobile App Payment:
                        </span>
                        <span className="text-[10px] text-sky-600 font-semibold sm:hidden">
                          No camera scan needed
                        </span>
                      </div>

                      {/* Primary Mobile CTA Button */}
                      <a
                        href={upiPaymentUri}
                        className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4 text-white" />
                        <span>Tap to Pay with Google Pay / PhonePe</span>
                        <ExternalLink className="w-3.5 h-3.5 text-sky-200" />
                      </a>

                      {/* 4 App Chips Grid */}
                      <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                        {[
                          { id: 'gpay', label: 'GPay' },
                          { id: 'phonepe', label: 'PhonePe' },
                          { id: 'paytm', label: 'Paytm' },
                          { id: 'bhim', label: 'BHIM' },
                        ].map((app) => (
                          <a
                            key={app.id}
                            href={upiPaymentUri}
                            className="py-2 px-1 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-[11px] flex items-center justify-center transition shadow-2xs hover:bg-slate-50 cursor-pointer text-center active:scale-95"
                          >
                            <span>{app.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Manual VPA input for request-money flow */}
                    <div className="pt-1">
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">
                        Or enter your VPA to receive a collect request:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@okaxis"
                          className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-sky-500 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={handlePayNow}
                          className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                        >
                          Send Collect Request
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NET BANKING */}
            {paymentMethod === 'netbanking' && (
              <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                <span className="block text-xs font-bold text-slate-700">
                  Select Corporate / Commercial Bank:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'hdfc', name: 'HDFC Corporate Bank' },
                    { id: 'icici', name: 'ICICI Commercial' },
                    { id: 'sbi', name: 'State Bank of India' },
                    { id: 'axis', name: 'Axis Bank B2B' },
                    { id: 'kotak', name: 'Kotak Industrial' },
                    { id: 'citi', name: 'Citibank Commercial' },
                  ].map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBank(bank.id)}
                      className={`p-3 rounded-xl border text-left font-medium transition cursor-pointer ${
                        selectedBank === bank.id
                          ? `${themeConfig.bgLightClass} ${themeConfig.borderClass} ${themeConfig.textClass} font-bold`
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CORPORATE PURCHASE ORDER (PO) */}
            {paymentMethod === 'po' && (
              <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <strong>Net-30 Enterprise Invoicing Terms:</strong> Your plant will be activated immediately today. An official tax invoice with 30-day payment clearance will be issued to your accounts payable department.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Purchase Order (PO) Number
                    </label>
                    <input
                      type="text"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Company GSTIN / Tax ID
                    </label>
                    <input
                      type="text"
                      value={companyGstin}
                      onChange={(e) => setCompanyGstin(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Billing Entity & Plant Bay Details */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Factory Billing Entity
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Plant / Company Legal Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Billing Email (for GST receipts)
                </label>
                <input
                  type="email"
                  defaultValue={user?.email || 'harshit998ops@gmail.com'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols on PC/Tablet, 1 Col on Mobile): Order Summary & Sticky Pay CTA */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Order Summary
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {plan.name} Plan
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${themeConfig.badgeBg} ${themeConfig.textClass}`}>
                {billingCycle === 'annual' ? 'Annual (20% Off)' : 'Monthly'}
              </span>
            </div>

            {/* Plan Highlights */}
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Machine Quota</span>
                <span className="font-bold text-slate-900">
                  {plan.machineLimit === 'Unlimited' ? 'Unlimited Assets' : `Up to ${plan.machineLimit} Machines`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sensor Polling Rate</span>
                <span className="font-bold text-slate-900">{plan.specs.samplingRate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Diagnostic Engine</span>
                <span className="font-bold text-slate-900 truncate max-w-[170px] text-right">{plan.specs.anomalyModel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Hardware Warranty</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  {plan.specs.hardwareSupport}
                </span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-600">
                <span>Base Subscription</span>
                <span>₹{subtotal.toLocaleString('en-IN')} INR</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>{billingCycle === 'monthly' ? 'GST (Monthly Offer)' : '18% Industrial GST'}</span>
                <span>{billingCycle === 'monthly' ? '₹0 INR (0% GST / Waived)' : `₹${gstAmount.toLocaleString('en-IN')} INR`}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Cloud & Edge Gateway Bandwidth</span>
                <span className="text-emerald-600 font-bold">Included Free</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm font-sans font-extrabold text-slate-900">
                <span>Total Due Today</span>
                <span className="text-xl font-mono font-black text-slate-900">
                  ₹{totalAmount.toLocaleString('en-IN')} INR
                </span>
              </div>
            </div>

            {/* Pay Button / Processing */}
            <button
              disabled={isProcessing}
              onClick={handlePayNow}
              className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isProcessing
                  ? 'bg-slate-800 text-white cursor-wait'
                  : `${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} text-white hover:scale-[1.01]`
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="truncate">{processingStep}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    Pay ₹{totalAmount.toLocaleString('en-IN')} INR & Activate {plan.name}
                  </span>
                </>
              )}
            </button>

            {/* Security Guarantee Strip */}
            <div className="pt-2 text-center text-[10px] text-slate-400 space-y-1">
              <div className="flex items-center justify-center gap-2 font-medium text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>PCI-DSS Level-1 • TLS 1.3 • Instant Activation Guarantee</span>
              </div>
              <p>Cancel or upgrade anytime with prorated billing.</p>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                <span className="font-semibold text-slate-500">*Terms &amp; Conditions:</span> If any sensor is repaired by a third party, then warranty is void and is not replaceable by the company.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
