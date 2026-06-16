import React, { useState } from 'react';
import { FiServer, FiDatabase, FiMonitor, FiCloud, FiHardDrive, FiWifi, FiTrendingDown, FiInfo } from 'react-icons/fi';

const tiers = [
  {
    name: 'Development',
    badge: 'Dev / Testing',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    borderColor: 'border-blue-500/30',
    services: [
      { name: 'EC2 t2.micro', desc: '1 vCPU, 1 GB RAM — Backend + Frontend', monthly: 700, icon: <FiServer /> },
      { name: 'RDS db.t3.micro', desc: 'MySQL 8.0, 1 vCPU, 1 GB RAM', monthly: 1050, icon: <FiDatabase /> },
      { name: 'CloudWatch Logs', desc: '5 GB log ingestion/month', monthly: 200, icon: <FiMonitor /> },
      { name: 'S3 Backup Storage', desc: '10 GB backup files/month', monthly: 20, icon: <FiHardDrive /> },
      { name: 'Data Transfer', desc: 'Up to 15 GB outbound/month', monthly: 110, icon: <FiWifi /> },
      { name: 'Elastic IP', desc: 'Static public IP for EC2', monthly: 0, icon: <FiCloud /> },
    ],
  },
  {
    name: 'Production',
    badge: 'Recommended',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    services: [
      { name: 'EC2 t3.small', desc: '2 vCPU, 2 GB RAM — High availability', monthly: 1400, icon: <FiServer /> },
      { name: 'RDS db.t3.small', desc: 'MySQL 8.0, 2 vCPU, 2 GB RAM — Multi-AZ', monthly: 4200, icon: <FiDatabase /> },
      { name: 'CloudWatch', desc: 'Detailed monitoring + dashboards + alarms', monthly: 500, icon: <FiMonitor /> },
      { name: 'S3 Backup Storage', desc: '50 GB backup + versioning', monthly: 100, icon: <FiHardDrive /> },
      { name: 'Data Transfer', desc: 'Up to 100 GB outbound/month', monthly: 750, icon: <FiWifi /> },
      { name: 'Elastic Load Balancer', desc: 'ALB for traffic distribution', monthly: 1800, icon: <FiCloud /> },
    ],
  },
  {
    name: 'Enterprise',
    badge: 'Multi-Region',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    borderColor: 'border-purple-500/30',
    services: [
      { name: 'EC2 t3.medium × 2', desc: '2 vCPU, 4 GB RAM — Active + Standby', monthly: 5600, icon: <FiServer /> },
      { name: 'RDS db.r6g.large', desc: 'MySQL 8.0, 2 vCPU, 16 GB RAM — Multi-AZ', monthly: 12000, icon: <FiDatabase /> },
      { name: 'CloudWatch + X-Ray', desc: 'Full observability stack + tracing', monthly: 1500, icon: <FiMonitor /> },
      { name: 'S3 + Glacier', desc: '500 GB storage + cold archive', monthly: 800, icon: <FiHardDrive /> },
      { name: 'Data Transfer', desc: '500 GB multi-region outbound', monthly: 3750, icon: <FiWifi /> },
      { name: 'ALB + Route 53', desc: 'Global traffic + DNS failover', monthly: 3000, icon: <FiCloud /> },
    ],
  },
];

const optimizations = [
  { tip: 'Use EC2 Reserved Instances (1-year term) to save up to 40% on compute costs vs On-Demand pricing.' },
  { tip: 'Enable RDS automated snapshots (free up to 100% of DB storage size) instead of manual S3 backups.' },
  { tip: 'Use CloudWatch Log Groups with 30-day retention to avoid unbounded log storage costs.' },
  { tip: 'Stop EC2 instances during off-hours (nights/weekends) in development environments — saves ~60%.' },
  { tip: 'Use S3 Intelligent-Tiering for backup files to automatically move old backups to cheaper storage classes.' },
  { tip: 'Enable AWS Cost Anomaly Detection to get alerts when spending spikes unexpectedly.' },
];

const Pricing = () => {
  const [selectedTier, setSelectedTier] = useState(1); // Default: Production

  const currentTier = tiers[selectedTier];
  const total = currentTier.services.reduce((sum, s) => sum + s.monthly, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-panel border border-dark-border rounded-2xl p-5 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-1">AWS Infrastructure Pricing</h3>
        <p className="text-xs text-dark-muted">
          Estimated monthly cost in <span className="text-white font-semibold">Indian Rupees (INR ₹)</span> for MachineLink cloud deployment.
          Based on AWS ap-south-1 (Mumbai) region pricing as of 2025.
        </p>
      </div>

      {/* Tier Selector */}
      <div className="grid grid-cols-3 gap-4">
        {tiers.map((tier, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedTier(idx)}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
              selectedTier === idx
                ? `${tier.borderColor} bg-dark-panel shadow-xl`
                : 'border-dark-border bg-dark-panel/50 hover:border-dark-border/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white text-base">{tier.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                {tier.badge}
              </span>
            </div>
            <span className="text-2xl font-extrabold text-white">
              ₹{tier.services.reduce((s, r) => s + r.monthly, 0).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-dark-muted block">/month est.</span>
          </button>
        ))}
      </div>

      {/* Selected Tier Breakdown */}
      <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="font-bold text-white text-base">{currentTier.name} Tier — Cost Breakdown</h4>
            <p className="text-xs text-dark-muted">AWS Mumbai (ap-south-1) region</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${currentTier.badgeColor}`}>
            {currentTier.badge}
          </span>
        </div>

        <div className="space-y-3">
          {currentTier.services.map((service, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-dark-bg border border-dark-border/80 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-dark-panel border border-dark-border text-blue-400">
                  {service.icon}
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block">{service.name}</span>
                  <span className="text-xs text-dark-muted">{service.desc}</span>
                </div>
              </div>
              <div className="text-right">
                {service.monthly === 0 ? (
                  <span className="text-sm font-bold text-emerald-400">FREE</span>
                ) : (
                  <span className="text-sm font-bold text-white">
                    ₹{service.monthly.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-dark-muted block">/month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-5 pt-5 border-t border-dark-border flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-dark-muted">Estimated Monthly Total</span>
            <p className="text-xs text-dark-muted mt-0.5">Exclusive of GST (18%). Prices may vary with usage.</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-white">₹{total.toLocaleString('en-IN')}</span>
            <span className="text-xs text-dark-muted block">+ GST = ₹{Math.round(total * 1.18).toLocaleString('en-IN')}/month</span>
          </div>
        </div>
      </div>

      {/* Service Tiers Comparison Table */}
      <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl overflow-x-auto">
        <h4 className="font-bold text-white text-base mb-4">Multi-Region Deployment Cost Comparison</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left text-xs font-bold text-dark-muted uppercase tracking-wider pb-3">Region</th>
              <th className="text-left text-xs font-bold text-dark-muted uppercase tracking-wider pb-3">Location</th>
              <th className="text-left text-xs font-bold text-dark-muted uppercase tracking-wider pb-3">Latency</th>
              <th className="text-right text-xs font-bold text-dark-muted uppercase tracking-wider pb-3">Monthly Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/50">
            {[
              { region: 'ap-south-1', location: 'Mumbai, India 🇮🇳', latency: '< 10ms', cost: '₹2,080', primary: true },
              { region: 'ap-south-2', location: 'Hyderabad, India 🇮🇳', latency: '< 15ms', cost: '₹2,150', primary: false },
              { region: 'ap-southeast-1', location: 'Singapore 🇸🇬', latency: '~90ms', cost: '₹2,400', primary: false },
              { region: 'us-east-1', location: 'Virginia, USA 🇺🇸', latency: '~200ms', cost: '₹1,750', primary: false },
            ].map((row, i) => (
              <tr key={i} className={row.primary ? 'bg-blue-500/5' : ''}>
                <td className="py-3 font-mono text-xs text-blue-400">{row.region}</td>
                <td className="py-3 text-white text-xs">
                  {row.location}
                  {row.primary && <span className="ml-2 px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded border border-blue-500/20">Recommended</span>}
                </td>
                <td className="py-3 text-dark-muted text-xs">{row.latency}</td>
                <td className="py-3 text-right font-bold text-white text-sm">{row.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Optimization Tips */}
      <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingDown className="w-5 h-5 text-emerald-400" />
          <h4 className="font-bold text-white text-base">Cost Optimization Recommendations</h4>
        </div>
        <div className="space-y-3">
          {optimizations.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-dark-bg border border-dark-border/60 rounded-xl">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                <FiInfo className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xs text-dark-muted leading-relaxed">{item.tip}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-400">
          💡 <strong>SLA Note:</strong> AWS offers 99.99% uptime SLA for RDS Multi-AZ and 99.9% for EC2. 
          RPO ≤ 5 min (RDS automated backups), RTO ≤ 30 min (instance restart). 
          Monthly downtime budget: ≤ 4.38 minutes.
        </div>
      </div>
    </div>
  );
};

export default Pricing;
