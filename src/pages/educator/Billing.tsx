import { motion } from "framer-motion";
import {
  CreditCard,
  Check,
  ArrowUpRight,
  Download,
  Users,
  FileText,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DataTable from "@/components/educator/DataTable";

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending";
  description: string;
}

const invoices: Invoice[] = [
  {
    id: "INV-2024-006",
    date: "Jun 01, 2024",
    amount: "₹2,999",
    status: "paid",
    description: "Growth Plan - Monthly",
  },
  {
    id: "INV-2024-005",
    date: "May 01, 2024",
    amount: "₹2,999",
    status: "paid",
    description: "Growth Plan - Monthly",
  },
  {
    id: "INV-2024-004",
    date: "Apr 01, 2024",
    amount: "₹2,999",
    status: "paid",
    description: "Growth Plan - Monthly",
  },
  {
    id: "INV-2024-003",
    date: "Mar 01, 2024",
    amount: "₹999",
    status: "paid",
    description: "Starter Plan - Monthly",
  },
];

const plans = [
  {
    name: "Starter",
    price: "₹999",
    period: "/month",
    description: "Perfect for small coaching centers",
    features: ["Up to 100 students", "5 test series", "Basic analytics", "Email support"],
    current: false,
  },
  {
    name: "Growth",
    price: "₹2,999",
    period: "/month",
    description: "For growing coaching institutes",
    features: [
      "Up to 500 students",
      "Unlimited test series",
      "Advanced analytics",
      "Priority support",
      "Custom subdomain",
      "AI-powered insights",
    ],
    current: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "₹9,999",
    period: "/month",
    description: "For large institutions",
    features: [
      "Unlimited students",
      "Unlimited everything",
      "White-label solution",
      "Dedicated account manager",
      "Custom domain",
      "API access",
      "SLA guarantee",
    ],
    current: false,
  },
];

export default function Billing() {
  const columns = [
    { key: "id", header: "Invoice" },
    { key: "date", header: "Date", className: "hidden sm:table-cell" },
    { key: "description", header: "Description", className: "hidden md:table-cell" },
    { key: "amount", header: "Amount" },
    {
      key: "status",
      header: "Status",
      render: (invoice: Invoice) => (
        <Badge
          className={
            invoice.status === "paid"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          }
        >
          {invoice.status}
        </Badge>
      ),
    },
    {
      key: "download",
      header: "",
      className: "w-10",
      render: () => (
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Download className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold">Billing & Plan</h1>
        <p className="text-muted-foreground text-sm">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <div className="gradient-bg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Badge className="bg-white/20 text-white mb-2">Current Plan</Badge>
                <h2 className="text-2xl font-bold text-white">Growth Plan</h2>
                <p className="text-white/80 text-sm">Renews on July 1, 2024</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">₹2,999</p>
                <p className="text-white/80 text-sm">per month</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Students</span>
                  <span className="text-sm font-medium">380 / 500</span>
                </div>
                <Progress value={76} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Test Series</span>
                  <span className="text-sm font-medium">24 / ∞</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Storage</span>
                  <span className="text-sm font-medium">2.4 GB / 10 GB</span>
                </div>
                <Progress value={24} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`h-full relative ${
                  plan.current ? "border-primary" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-bg text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {plan.current && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.current ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${
                        plan.popular ? "gradient-bg text-white" : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Unlimited Students", value: "Enterprise only" },
          { icon: FileText, label: "Test Series", value: "Unlimited" },
          { icon: Zap, label: "AI Features", value: "Included" },
        ].map((feature, i) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="font-medium text-sm">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Billing History</h3>
        <DataTable data={invoices} columns={columns} />
      </div>
    </div>
  );
}
