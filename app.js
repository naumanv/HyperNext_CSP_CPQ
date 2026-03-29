/* ============================================
   HyperNext CSP - Cloud Capacity Planner App
   ============================================ */

// ── State ──
const state = {
    deployment: {
        option: 'Single AZ',
        managedTier: 'Advance',
        billing: 'Yearly',
        controlplaneNodes: 3,
        managementHA: 1
    },
    oversubscription: {
        cpuRatio: 4,
        memoryRatio: 1,
        platformOverhead: 0.10,
        memoryOverhead: 0.10
    },
    compute: {
        generalPurpose: { enabled: true, cpuCores: 64, memRatio: 4, nodes: 4 },
        computeIntensive: { enabled: true, cpuCores: 64, memRatio: 2, nodes: 4 },
        extremeCompute: { enabled: false, cpuCores: 64, memRatio: 1, nodes: 0 },
        memoryIntensive: { enabled: false, cpuCores: 64, memRatio: 8, nodes: 0 },
        extremeMemory: { enabled: false, cpuCores: 64, memRatio: 16, nodes: 0 },
        gpu: {
            enabled: true, cpuCores: 64, memPerNode: 1024, nodes: 3,
            gpusPerNode: 8, gpuType: 'NVIDIA L40', gpuMemory: 48,
            sharingMode: 'vGPU', vgpuProfiles: 4, migInstances: 7,
            vgpuOversub: 1
        }
    },
    storage: {
        tier1: {
            enabled: true, cpuCores: 48, memPerNode: 512, nodes: 6,
            disksPerNode: 12, diskSize: 3840, protection: 'Replication 3x',
            overhead: 0.25, protocol: 'Block', encryption: true, oversubRatio: 2.5
        },
        tier2: {
            enabled: true, cpuCores: 48, memPerNode: 512, nodes: 6,
            disksPerNode: 12, diskSize: 3840, protection: 'EC 4+2',
            overhead: 0.25, protocol: 'Block; File', encryption: true, oversubRatio: 2.5
        },
        tier3: {
            enabled: true, cpuCores: 48, memPerNode: 512, nodes: 6,
            hddsPerNode: 6, hddSize: 18000, nvmeCacheDisks: 2,
            protection: 'EC 4+2', overhead: 0.25, protocol: 'Block, File, Object',
            encryption: true, oversubRatio: 2
        },
        tier4: {
            enabled: false, cpuCores: 48, memPerNode: 512, nodes: 6,
            hddsPerNode: 0, hddSize: 18000, protection: 'EC 9+3',
            overhead: 0.25, protocol: 'Object', encryption: true,
            oversubRatio: 2, compressionRatio: 1.5
        },
        ceph: {
            monDeployment: 'Colocated', monNodes: 0,
            rgwDeployment: 'Shared', rgwNodes: 0
        }
    },
    cephPackage: '1.5PB'
};

// ── Pricing ──
const pricing = {
    controlplane: { advQ: 1500, advY: 1275, essQ: 1000, essY: 850 },
    controlplaneAZ2: { advQ: 850, advY: 723, essQ: 500, essY: 425 },
    computeVolDiscount: [
        { min: 3, max: 7, advQ: 625, advY: 531, essQ: 475, essY: 404 },
        { min: 8, max: 15, advQ: 500, advY: 425, essQ: 380, essY: 323 },
        { min: 16, max: 39, advQ: 437, advY: 371, essQ: 332, essY: 282 },
        { min: 40, max: 79, advQ: 375, advY: 319, essQ: 285, essY: 242 },
        { min: 80, max: 9999, advQ: 313, advY: 266, essQ: 238, essY: 202 }
    ],
    cephPackages: {
        '200TB': { advQ: 1600, advY: 1360, essQ: 1150, essY: 978 },
        '1.5PB': { advQ: 3100, advY: 2635, essQ: 2200, essY: 1870 },
        '3PB': { advQ: 4960, advY: 4216, essQ: 3520, essY: 2992 },
        '6PB': { advQ: 6975, advY: 5929, essQ: 4950, essY: 4208 },
        '10PB': { advQ: 9985, advY: 8487, essQ: 7090, essY: 6027 },
        '100PB': { advQ: 39000, advY: 33150, essQ: 27690, essY: 23537 }
    },
    nrc: { singleAZ: 60000, iVolvePays: 45000, cspPays: 15000 }
};

// ── Catalog ──
const catalog = {
    iaas: [
        { name: 'ECS (Elastic Cloud Server)', status: 'Ready', included: true },
        { name: 'ECS with GPU', status: 'Ready', included: true },
        { name: 'EVS (Elastic Volume Service)', status: 'Ready', included: true },
        { name: 'OSS (Object Storage Service)', status: 'Ready', included: true },
        { name: 'EFS (Elastic File Service)', status: 'Ready', included: true },
        { name: 'VPC (Virtual Private Cloud)', status: 'Ready', included: true },
        { name: 'NAT Gateway', status: 'Ready', included: true },
        { name: 'Router', status: 'Ready', included: true },
        { name: 'EIP (Elastic IP)', status: 'Ready', included: true },
        { name: 'SLB (Server Load Balancer)', status: 'Ready', included: true },
        { name: 'ALB (Application Load Balancer)', status: 'Ready', included: true },
        { name: 'DNS', status: 'Ready', included: true },
        { name: 'Egress', status: 'Ready', included: true },
        { name: 'Direct Connect', status: 'Ready', included: true },
        { name: 'BareMetal', status: 'Ready', included: true },
        { name: 'Image Service', status: 'Ready', included: true },
        { name: 'KMS (Key Management)', status: 'Ready', included: true }
    ],
    iaasAdvanced: [
        { name: 'DR (Disaster Recovery)', status: 'Ready', included: true, note: 'Requires CEPH Storage' },
        { name: 'Backup', status: 'Ready', included: true },
        { name: 'VPN', status: 'Ready', included: false, price: 2, unit: 'per VPN/month' },
        { name: 'Cloud Firewall', status: 'Ready', included: false, price: 5, unit: 'per Firewall/month' }
    ],
    paas: [
        { name: 'Kubernetes', status: 'Ready', unit: 'Worker VM', price: 'TBD' },
        { name: 'Cloud Native Backup', status: 'Ready', unit: 'Storage (GB)', price: 'TBD' },
        { name: 'Cloud Native DR', status: 'Ready', unit: 'Protected VM', price: 'TBD' },
        { name: 'Red Hat OpenShift Container Platform', status: 'Ready', unit: '4 vCPU', price: 'TBD' },
        { name: 'Multi-Kubernetes Cluster Management', status: 'Ready', unit: 'Per Cluster', price: 'TBD' },
        { name: 'Advanced Kubernetes Cluster Security', status: 'Ready', unit: 'Per Cluster', price: 'TBD' },
        { name: 'Streaming Service', status: 'Q3', price: 'TBD' },
        { name: 'Caching Service', status: 'Q3', price: 'TBD' },
        { name: 'Messaging Service', status: 'Q3', price: 'TBD' },
        { name: 'GitOps Service', status: 'Q3', price: 'TBD' },
        { name: 'Pipeline Service', status: 'Q3', price: 'TBD' },
        { name: 'Container Registry', status: 'Q3', price: 'TBD' },
        { name: 'PostgreSQL', status: 'Q4', price: 'TBD' },
        { name: 'MariaDB', status: 'Q4', price: 'TBD' },
        { name: 'MongoDB', status: 'Q4', price: 'TBD' }
    ],
    console: [
        { name: 'Identity & Access Management with SSO', status: 'Ready' },
        { name: 'Customer Portal', status: 'Ready' },
        { name: 'Reseller Portal', status: 'Ready' },
        { name: 'Admin Portal', status: 'Ready' },
        { name: 'Customer Management', status: 'Ready' },
        { name: 'Product Management', status: 'Ready' },
        { name: 'Subscription Management', status: 'Ready' },
        { name: 'Billing System', status: 'Ready' },
        { name: 'Dunning System', status: 'Ready' },
        { name: 'Reseller Management', status: 'Ready' },
        { name: 'Payment Gateway', status: 'Ready' },
        { name: 'Quota Management', status: 'Ready' },
        { name: 'Credit Management', status: 'Ready' },
        { name: 'Digital Wallet', status: 'Ready' },
        { name: 'Dashboard', status: 'Ready' },
        { name: 'Reports', status: 'Ready' }
    ]
};

// ── Capacity Calculation Engine ──
function calcCompute(type) {
    const cfg = state.compute[type];
    if (!cfg || !cfg.enabled || cfg.nodes === 0) {
        return { cores: 0, threads: 0, grossVCPU: 0, overheadVCPU: 0, sellableVCPU: 0, grossMem: 0, overheadMem: 0, sellableMem: 0, nodes: 0 };
    }
    const cores = cfg.cpuCores * cfg.nodes;
    const threads = cfg.cpuCores * 2 * cfg.nodes;
    const grossVCPU = cfg.cpuCores * 2 * state.oversubscription.cpuRatio * cfg.nodes;
    const overheadVCPU = Math.round(cfg.cpuCores * 2 * state.oversubscription.cpuRatio * state.oversubscription.platformOverhead) * cfg.nodes;
    const sellableVCPU = grossVCPU - overheadVCPU;
    const memPerNode = cfg.cpuCores * 2 * state.oversubscription.cpuRatio * cfg.memRatio;
    const grossMem = memPerNode * cfg.nodes;
    const overheadMem = Math.round(memPerNode * state.oversubscription.memoryOverhead) * cfg.nodes;
    const sellableMem = grossMem - overheadMem;
    return { cores, threads, grossVCPU, overheadVCPU, sellableVCPU, grossMem, overheadMem, sellableMem, nodes: cfg.nodes, memPerNode };
}

function calcGPU() {
    const g = state.compute.gpu;
    if (!g.enabled || g.nodes === 0) {
        return { cores: 0, threads: 0, grossVCPU: 0, sellableVCPU: 0, grossMem: 0, sellableMem: 0, totalGPUs: 0, sellableSlices: 0, sellableGPUMem: 0, nodes: 0 };
    }
    const cores = g.cpuCores * g.nodes;
    const threads = g.cpuCores * 2 * g.nodes;
    const grossVCPU = g.cpuCores * 2 * state.oversubscription.cpuRatio * g.nodes;
    const overheadVCPU = Math.round(g.cpuCores * 2 * state.oversubscription.cpuRatio * state.oversubscription.platformOverhead) * g.nodes;
    const sellableVCPU = grossVCPU - overheadVCPU;
    const grossMem = g.memPerNode * g.nodes;
    const overheadMem = Math.round(g.memPerNode * state.oversubscription.memoryOverhead) * g.nodes;
    const sellableMem = grossMem - overheadMem;

    const totalGPUs = g.gpusPerNode * g.nodes;
    let slicesPerGPU;
    if (g.sharingMode === 'MIG') slicesPerGPU = g.migInstances;
    else if (g.sharingMode === 'Passthrough') slicesPerGPU = 1;
    else slicesPerGPU = g.vgpuProfiles * g.vgpuOversub;

    const sellableSlices = slicesPerGPU * g.gpusPerNode * g.nodes;
    const memPerSlice = g.gpuMemory / (g.sharingMode === 'Passthrough' ? 1 : g.sharingMode === 'MIG' ? g.migInstances : g.vgpuProfiles);
    const sellableGPUMem = sellableSlices * memPerSlice;

    return { cores, threads, grossVCPU, sellableVCPU, grossMem, sellableMem, overheadMem, totalGPUs, sellableSlices, sellableGPUMem, nodes: g.nodes, memPerSlice };
}

function calcStorage(tier) {
    const s = state.storage[tier];
    if (!s || !s.enabled) {
        return { rawTB: 0, usableTB: 0, overheadTB: 0, availableTB: 0, sellableTB: 0, nodes: 0 };
    }

    let rawTB, protFactor;
    if (tier === 'tier3') {
        rawTB = (s.hddsPerNode * s.hddSize / 1000) * s.nodes;
        protFactor = 0.67;
    } else if (tier === 'tier4') {
        rawTB = (s.hddsPerNode * s.hddSize / 1000) * s.nodes;
        protFactor = 0.75;
    } else {
        rawTB = (s.disksPerNode * s.diskSize / 1000) * s.nodes;
        protFactor = s.protection === 'Replication 3x' ? 0.333 : 0.67;
    }

    const usableTB = rawTB * protFactor;
    const overheadTB = usableTB * s.overhead;
    const availableTB = usableTB - overheadTB;
    let sellableTB = availableTB * s.oversubRatio;
    if (tier === 'tier4' && s.compressionRatio) {
        sellableTB = sellableTB * s.compressionRatio;
    }

    return { rawTB, usableTB, overheadTB, availableTB, sellableTB, nodes: s.nodes };
}

function calcTotals() {
    const computeTypes = ['generalPurpose', 'computeIntensive', 'extremeCompute', 'memoryIntensive', 'extremeMemory'];
    let totalVCPU = 0, totalMem = 0, totalNodes = 0;

    computeTypes.forEach(t => {
        const r = calcCompute(t);
        totalVCPU += r.sellableVCPU;
        totalMem += r.sellableMem;
        totalNodes += r.nodes;
    });

    const gpu = calcGPU();
    totalVCPU += gpu.sellableVCPU;
    totalMem += gpu.sellableMem;
    totalNodes += gpu.nodes;

    const storageTiers = ['tier1', 'tier2', 'tier3', 'tier4'];
    let totalStorage = 0;
    const storageResults = {};
    storageTiers.forEach(t => {
        const r = calcStorage(t);
        storageResults[t] = r;
        totalStorage += r.sellableTB;
    });

    const rawStorage = storageTiers.reduce((sum, t) => sum + storageResults[t].rawTB, 0);

    return {
        totalVCPU, totalMem, totalNodes, totalStorage, rawStorage,
        gpu, storageResults,
        totalGPUs: gpu.totalGPUs,
        totalGPUSlices: gpu.sellableSlices,
        totalGPUMem: gpu.sellableGPUMem
    };
}

function calcCost() {
    const tier = state.deployment.managedTier;
    const billing = state.deployment.billing;
    const key = (tier === 'Advance' ? 'adv' : 'ess') + (billing === 'Yearly' ? 'Y' : 'Q');

    const cpMonthly = pricing.controlplane[key];
    const az2 = state.deployment.option === 'Dual AZ' ? pricing.controlplaneAZ2[key] : 0;

    const totals = calcTotals();
    const totalComputeNodes = totals.totalNodes;

    let computeRate = 0;
    for (const band of pricing.computeVolDiscount) {
        if (totalComputeNodes >= band.min && totalComputeNodes <= band.max) {
            computeRate = band[key];
            break;
        }
    }
    const computeMonthly = totalComputeNodes * computeRate;

    const hasCeph = ['tier1', 'tier2', 'tier3', 'tier4'].some(t => state.storage[t].enabled);
    let cephMonthly = 0;
    if (hasCeph) {
        const pkg = pricing.cephPackages[state.cephPackage];
        if (pkg) cephMonthly = pkg[key];
    }

    const totalMonthly = cpMonthly + az2 + computeMonthly + cephMonthly;
    const totalAnnual = totalMonthly * 12;

    return { cpMonthly, az2, computeMonthly, computeRate, cephMonthly, totalMonthly, totalAnnual, totalComputeNodes };
}

// ── Charts ──
let charts = {};

function destroyCharts() {
    Object.values(charts).forEach(c => c.destroy());
    charts = {};
}

function createChart(id, config) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(canvas, config);
}

// ── Page Renderers ──
const pages = {
    dashboard() {
        const totals = calcTotals();
        const cost = calcCost();
        const gp = calcCompute('generalPurpose');
        const ci = calcCompute('computeIntensive');
        const ec = calcCompute('extremeCompute');
        const mi = calcCompute('memoryIntensive');
        const em = calcCompute('extremeMemory');
        const gpu = totals.gpu;

        return `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg></div>
                <div class="stat-value">${totals.totalVCPU.toLocaleString()}</div>
                <div class="stat-label">Sellable vCPUs</div>
                <div class="stat-detail">${totals.totalNodes} compute nodes total</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6m-6 4h6m-6 4h4"/></svg></div>
                <div class="stat-value">${formatMemory(totals.totalMem)}</div>
                <div class="stat-label">Sellable Memory</div>
                <div class="stat-detail">${totals.totalMem.toLocaleString()} GB total</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></div>
                <div class="stat-value">${totals.totalStorage.toFixed(1)} TB</div>
                <div class="stat-label">Sellable Storage</div>
                <div class="stat-detail">${totals.rawStorage.toFixed(1)} TB raw capacity</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="6" width="22" height="12" rx="2"/><path d="M6 10h4m-4 4h2m6-4h4m-4 4h2"/></svg></div>
                <div class="stat-value">${totals.totalGPUSlices}</div>
                <div class="stat-label">GPU Slices</div>
                <div class="stat-detail">${totals.totalGPUs} physical GPUs / ${totals.totalGPUMem.toLocaleString()} GB vGPU Mem</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon cyan"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
                <div class="stat-value">$${cost.totalMonthly.toLocaleString()}</div>
                <div class="stat-label">Monthly Subscription</div>
                <div class="stat-detail">$${cost.totalAnnual.toLocaleString()} annually</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m-7-7H1m22 0h-4"/></svg></div>
                <div class="stat-value">${state.deployment.option}</div>
                <div class="stat-label">Deployment Mode</div>
                <div class="stat-detail">${state.deployment.managedTier} / ${state.deployment.billing}</div>
            </div>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Compute Capacity Breakdown</div>
                        <div class="card-subtitle">Sellable vCPU by compute type</div>
                    </div>
                </div>
                <div style="position:relative;height:240px"><canvas id="chartComputeVCPU"></canvas></div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Storage Capacity Breakdown</div>
                        <div class="card-subtitle">Sellable storage by tier (TB)</div>
                    </div>
                </div>
                <div style="position:relative;height:240px"><canvas id="chartStorage"></canvas></div>
            </div>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Memory Distribution</div>
                        <div class="card-subtitle">Sellable memory per compute type</div>
                    </div>
                </div>
                <div>
                    ${[
                        { name: 'General Purpose', val: gp.sellableMem, color: '#6366f1' },
                        { name: 'Compute Intensive', val: ci.sellableMem, color: '#3b82f6' },
                        { name: 'Extreme Compute', val: ec.sellableMem, color: '#06b6d4' },
                        { name: 'Memory Intensive', val: mi.sellableMem, color: '#10b981' },
                        { name: 'Extreme Memory', val: em.sellableMem, color: '#f59e0b' },
                        { name: 'GPU Nodes', val: gpu.sellableMem, color: '#ef4444' }
                    ].filter(i => i.val > 0).map(i => `
                        <div class="capacity-bar-group">
                            <div class="capacity-bar-label">
                                <span class="name">${i.name}</span>
                                <span class="amount">${formatMemory(i.val)} (${i.val.toLocaleString()} GB)</span>
                            </div>
                            <div class="capacity-bar">
                                <div class="capacity-bar-fill" style="width:${Math.min(100, (i.val / totals.totalMem * 100))}%; background:${i.color}"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Monthly Cost Breakdown</div>
                        <div class="card-subtitle">${state.deployment.managedTier} tier, ${state.deployment.billing} billing</div>
                    </div>
                </div>
                <div style="position:relative;height:240px"><canvas id="chartCost"></canvas></div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">Deployment Summary</div>
                    <div class="card-subtitle">Current configuration overview</div>
                </div>
            </div>
            <div class="grid-3 mb-0">
                <div>
                    <h4 style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">Infrastructure</h4>
                    ${inlineStat('Deployment', state.deployment.option)}
                    ${inlineStat('Managed Services', state.deployment.managedTier)}
                    ${inlineStat('Controlplane Nodes', state.deployment.controlplaneNodes)}
                    ${inlineStat('Management HA', state.deployment.managementHA === 2 ? 'Yes (2 nodes)' : 'No (1 node)')}
                </div>
                <div>
                    <h4 style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">Compute</h4>
                    ${inlineStat('Total Nodes', totals.totalNodes)}
                    ${inlineStat('CPU Oversub', state.oversubscription.cpuRatio + 'x')}
                    ${inlineStat('GPU Model', state.compute.gpu.enabled ? state.compute.gpu.gpuType : 'None')}
                    ${inlineStat('GPU Sharing', state.compute.gpu.enabled ? state.compute.gpu.sharingMode : 'N/A')}
                </div>
                <div>
                    <h4 style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">Storage</h4>
                    ${inlineStat('CEPH Package', state.cephPackage)}
                    ${inlineStat('High Perf SSD', state.storage.tier1.enabled ? state.storage.tier1.nodes + ' nodes' : 'Disabled')}
                    ${inlineStat('GP SSD', state.storage.tier2.enabled ? state.storage.tier2.nodes + ' nodes' : 'Disabled')}
                    ${inlineStat('HDD Tier', state.storage.tier3.enabled ? state.storage.tier3.nodes + ' nodes' : 'Disabled')}
                </div>
            </div>
        </div>`;
    },

    deployment() {
        return `
        <div class="card mb-28">
            <div class="section-header">
                <span class="section-number">1</span>
                <h2>Deployment Configuration</h2>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Deployment Option</label>
                    <select class="form-select" data-bind="deployment.option">
                        <option ${state.deployment.option === 'Single AZ' ? 'selected' : ''}>Single AZ</option>
                        <option ${state.deployment.option === 'Dual AZ' ? 'selected' : ''}>Dual AZ</option>
                    </select>
                    <div class="form-hint">Single AZ for basic, Dual AZ for production-grade with fault isolation</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Managed Services Tier</label>
                    <select class="form-select" data-bind="deployment.managedTier">
                        <option ${state.deployment.managedTier === 'Essential' ? 'selected' : ''}>Essential</option>
                        <option ${state.deployment.managedTier === 'Advance' ? 'selected' : ''}>Advance</option>
                    </select>
                    <div class="form-hint">Advance tier includes enhanced SLA and managed services</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Billing Frequency</label>
                    <select class="form-select" data-bind="deployment.billing">
                        <option ${state.deployment.billing === 'Quarterly' ? 'selected' : ''}>Quarterly</option>
                        <option ${state.deployment.billing === 'Yearly' ? 'selected' : ''}>Yearly</option>
                    </select>
                    <div class="form-hint">Yearly billing provides 15% discount</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Controlplane Nodes</label>
                    <select class="form-select" data-bind="deployment.controlplaneNodes" data-type="number">
                        <option ${state.deployment.controlplaneNodes === 3 ? 'selected' : ''}>3</option>
                        <option ${state.deployment.controlplaneNodes === 5 ? 'selected' : ''}>5</option>
                    </select>
                    <div class="form-hint">3 nodes standard, 5 for higher availability</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Management Host: HA</label>
                    <select class="form-select" data-bind="deployment.managementHA" data-type="number">
                        <option value="1" ${state.deployment.managementHA === 1 ? 'selected' : ''}>1 (No HA)</option>
                        <option value="2" ${state.deployment.managementHA === 2 ? 'selected' : ''}>2 (HA)</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="section-header">
                <span class="section-number">2</span>
                <h2>Over-Subscription Ratios</h2>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">CPU Over-Subscription Ratio</label>
                    <select class="form-select" data-bind="oversubscription.cpuRatio" data-type="number">
                        ${[1,2,3,4,6,8].map(v => `<option value="${v}" ${state.oversubscription.cpuRatio === v ? 'selected' : ''}>${v}x${v === 4 ? ' (Recommended)' : ''}</option>`).join('')}
                    </select>
                    <div class="form-hint">4x recommended for general-purpose workloads</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Memory Over-Subscription Ratio</label>
                    <select class="form-select" data-bind="oversubscription.memoryRatio" data-type="number">
                        ${[1,1.5,2].map(v => `<option value="${v}" ${state.oversubscription.memoryRatio === v ? 'selected' : ''}>${v}x${v === 1 ? ' (Recommended - No oversub)' : ''}</option>`).join('')}
                    </select>
                    <div class="form-hint">Memory is NOT over-subscribed by default — contention causes severe degradation</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Platform Overhead / Wastage</label>
                    <select class="form-select" data-bind="oversubscription.platformOverhead" data-type="number">
                        ${[0.05,0.10,0.15,0.20,0.30].map(v => `<option value="${v}" ${state.oversubscription.platformOverhead === v ? 'selected' : ''}>${(v*100)}%${v === 0.10 ? ' (Recommended)' : ''}</option>`).join('')}
                    </select>
                    <div class="form-hint">~10% for Memory, ~30% for CPU overhead</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Memory Overhead (Hypervisor Reserve)</label>
                    <select class="form-select" data-bind="oversubscription.memoryOverhead" data-type="number">
                        ${[0.05,0.10,0.15,0.20].map(v => `<option value="${v}" ${state.oversubscription.memoryOverhead === v ? 'selected' : ''}>${(v*100)}%${v === 0.10 ? ' (Recommended)' : ''}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>`;
    },

    compute() {
        const types = [
            { key: 'generalPurpose', name: 'General Purpose', ratio: '1 vCPU : 4 GB', desc: 'Balanced compute and memory for most workloads' },
            { key: 'computeIntensive', name: 'Compute Intensive', ratio: '1 vCPU : 2 GB', desc: 'High CPU-to-memory ratio for compute-heavy workloads' },
            { key: 'extremeCompute', name: 'Extreme Compute', ratio: '1 vCPU : 1 GB', desc: 'Maximum CPU density for batch processing & HPC' },
            { key: 'memoryIntensive', name: 'Memory Intensive', ratio: '1 vCPU : 8 GB', desc: 'High memory for in-memory databases & caching' },
            { key: 'extremeMemory', name: 'Extreme Memory', ratio: '1 vCPU : 16 GB', desc: 'Maximum memory for SAP HANA & large datasets' }
        ];

        return `
        <div class="card mb-28">
            <div class="section-header">
                <span class="section-number">C</span>
                <h2>Compute Node Types</h2>
            </div>
            <p class="text-muted text-sm mb-24">Enable or disable compute types and configure capacity for each. Minimum 3 nodes per AZ when enabled.</p>

            ${types.map(t => {
                const cfg = state.compute[t.key];
                const r = calcCompute(t.key);
                return `
                <div class="compute-type-card ${cfg.enabled ? 'active' : 'disabled'} mb-16" data-type="${t.key}">
                    <div class="compute-type-header" onclick="toggleComputeType('${t.key}')">
                        <h3>
                            <label class="switch" onclick="event.stopPropagation()">
                                <input type="checkbox" ${cfg.enabled ? 'checked' : ''} onchange="toggleComputeEnabled('${t.key}', this.checked)">
                                <span class="switch-slider"></span>
                            </label>
                            ${t.name}
                            <span class="compute-type-badge">${t.ratio}</span>
                        </h3>
                        <span class="text-sm text-muted">${t.desc}</span>
                    </div>
                    <div class="compute-type-body">
                        <div class="form-row-3">
                            <div class="form-group">
                                <label class="form-label">CPU Cores per Node</label>
                                <select class="form-select" data-bind="compute.${t.key}.cpuCores" data-type="number">
                                    ${[16,32,48,64,96,128].map(v => `<option value="${v}" ${cfg.cpuCores === v ? 'selected' : ''}>${v} Cores</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Memory per Node (Auto)</label>
                                <input class="form-input" value="${(cfg.cpuCores * 2 * state.oversubscription.cpuRatio * cfg.memRatio).toLocaleString()} GB" disabled>
                                <div class="form-hint">= Cores × 2 × CPU Oversub × ${cfg.memRatio} GB/vCPU</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Number of Nodes</label>
                                <input class="form-input" type="number" min="0" max="20" value="${cfg.nodes}" data-bind="compute.${t.key}.nodes" data-type="number">
                                <div class="form-hint">0 = disabled, min 3 per AZ</div>
                            </div>
                        </div>
                        <div class="compute-type-output">
                            <div class="output-row"><span class="label">Physical Cores</span><span class="value">${r.cores.toLocaleString()}</span></div>
                            <div class="output-row"><span class="label">Gross vCPU Capacity</span><span class="value">${r.grossVCPU.toLocaleString()}</span></div>
                            <div class="output-row"><span class="label">Platform Overhead (vCPU)</span><span class="value">-${r.overheadVCPU.toLocaleString()}</span></div>
                            <div class="output-row highlight"><span class="label">★ Sellable vCPU</span><span class="value">${r.sellableVCPU.toLocaleString()}</span></div>
                            <div class="output-row"><span class="label">Gross Memory</span><span class="value">${r.grossMem.toLocaleString()} GB</span></div>
                            <div class="output-row"><span class="label">Memory Overhead</span><span class="value">-${r.overheadMem.toLocaleString()} GB</span></div>
                            <div class="output-row highlight"><span class="label">★ Sellable Memory</span><span class="value">${r.sellableMem.toLocaleString()} GB (${formatMemory(r.sellableMem)})</span></div>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>

        <div class="card">
            <div class="section-header">
                <span class="section-number">G</span>
                <h2>GPU Compute Nodes</h2>
            </div>
            ${renderGPUSection()}
        </div>`;
    },

    storage() {
        const tiers = [
            { key: 'tier1', name: 'TIER 1: High Performance SSD', desc: 'NVMe/SAS SSD — Databases & transactional workloads', diskType: 'SSD' },
            { key: 'tier2', name: 'TIER 2: General Purpose SSD', desc: 'SAS SSD — General VMs & web workloads', diskType: 'SSD' },
            { key: 'tier3', name: 'TIER 3: Capacity HDD', desc: 'HDD with NVMe cache — Bulk storage', diskType: 'HDD' },
            { key: 'tier4', name: 'TIER 4: Archive (Cold Storage)', desc: 'HDD with EC 9+3 & compression — Archive/cold data', diskType: 'HDD' }
        ];

        return `
        ${tiers.map(tier => {
            const s = state.storage[tier.key];
            const r = calcStorage(tier.key);
            const isHDD = tier.diskType === 'HDD';

            return `
            <div class="storage-tier ${s.enabled ? 'active' : ''} mb-16">
                <div class="storage-tier-header" onclick="toggleStorageTier('${tier.key}')">
                    <h3>
                        <label class="switch" onclick="event.stopPropagation()">
                            <input type="checkbox" ${s.enabled ? 'checked' : ''} onchange="toggleStorageEnabled('${tier.key}', this.checked)">
                            <span class="switch-slider"></span>
                        </label>
                        ${tier.name}
                    </h3>
                    <div style="text-align:right">
                        <div class="badge ${s.enabled ? 'badge-success' : 'badge-muted'}">${s.enabled ? r.sellableTB.toFixed(1) + ' TB Sellable' : 'Disabled'}</div>
                        <div class="text-sm text-muted mt-2">${tier.desc}</div>
                    </div>
                </div>
                <div class="storage-tier-body" ${s.enabled ? '' : 'style="display:none"'}>
                    <div class="form-row-3">
                        <div class="form-group">
                            <label class="form-label">Number of Storage Nodes</label>
                            <input class="form-input" type="number" min="3" max="20" value="${s.nodes}" data-bind="storage.${tier.key}.nodes" data-type="number">
                            <div class="form-hint">Min 3 per AZ</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${isHDD ? 'HDD' : 'Data'} Disks per Node</label>
                            <input class="form-input" type="number" min="4" max="36" value="${isHDD ? s.hddsPerNode : s.disksPerNode}" data-bind="storage.${tier.key}.${isHDD ? 'hddsPerNode' : 'disksPerNode'}" data-type="number">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Disk Size (GB)</label>
                            <select class="form-select" data-bind="storage.${tier.key}.${isHDD ? 'hddSize' : 'diskSize'}" data-type="number">
                                ${isHDD
                                    ? [8000,12000,14000,18000,20000].map(v => `<option value="${v}" ${s.hddSize === v ? 'selected' : ''}>${v/1000} TB</option>`).join('')
                                    : [960,1920,3840,7680,15360].map(v => `<option value="${v}" ${s.diskSize === v ? 'selected' : ''}>${v >= 1000 ? (v/1000) + ' TB' : v + ' GB'}</option>`).join('')
                                }
                            </select>
                        </div>
                    </div>
                    <div class="form-row-3">
                        <div class="form-group">
                            <label class="form-label">Data Protection</label>
                            <select class="form-select" data-bind="storage.${tier.key}.protection">
                                ${tier.key === 'tier1'
                                    ? ['Replication 3x', 'Replication 2x', 'EC 4+2'].map(v => `<option ${s.protection === v ? 'selected' : ''}>${v}</option>`).join('')
                                    : tier.key === 'tier4'
                                    ? ['EC 9+3', 'EC 4+2'].map(v => `<option ${s.protection === v ? 'selected' : ''}>${v}</option>`).join('')
                                    : ['EC 4+2', 'Replication 3x', 'EC 8+3'].map(v => `<option ${s.protection === v ? 'selected' : ''}>${v}</option>`).join('')
                                }
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Storage Protocol</label>
                            <select class="form-select" data-bind="storage.${tier.key}.protocol">
                                ${['Block', 'File', 'Object', 'Block; File', 'Block, File, Object'].map(v => `<option ${s.protocol === v ? 'selected' : ''}>${v}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Over-Subscription Ratio</label>
                            <select class="form-select" data-bind="storage.${tier.key}.oversubRatio" data-type="number">
                                ${[1, 1.5, 2, 2.5, 3].map(v => `<option value="${v}" ${s.oversubRatio === v ? 'selected' : ''}>${v}x</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Encryption at Rest</label>
                            <select class="form-select" data-bind="storage.${tier.key}.encryption">
                                <option value="true" ${s.encryption ? 'selected' : ''}>Enabled (LUKS/dm-crypt)</option>
                                <option value="false" ${!s.encryption ? 'selected' : ''}>Disabled</option>
                            </select>
                        </div>
                        ${tier.key === 'tier4' ? `
                        <div class="form-group">
                            <label class="form-label">Compression Ratio</label>
                            <select class="form-select" data-bind="storage.${tier.key}.compressionRatio" data-type="number">
                                ${[1, 1.3, 1.5, 2].map(v => `<option value="${v}" ${s.compressionRatio === v ? 'selected' : ''}>${v}x</option>`).join('')}
                            </select>
                        </div>` : '<div></div>'}
                    </div>

                    <div class="compute-type-output">
                        <div class="output-row"><span class="label">Raw Capacity</span><span class="value">${r.rawTB.toFixed(2)} TB</span></div>
                        <div class="output-row"><span class="label">Usable after Protection</span><span class="value">${r.usableTB.toFixed(2)} TB</span></div>
                        <div class="output-row"><span class="label">Platform Overhead (${(s.overhead * 100)}%)</span><span class="value">-${r.overheadTB.toFixed(2)} TB</span></div>
                        <div class="output-row"><span class="label">Available Storage</span><span class="value">${r.availableTB.toFixed(2)} TB</span></div>
                        <div class="output-row"><span class="label">Over-Subscription (${s.oversubRatio}x)</span><span class="value">×${s.oversubRatio}</span></div>
                        ${tier.key === 'tier4' && s.compressionRatio > 1 ? `<div class="output-row"><span class="label">Compression (${s.compressionRatio}x)</span><span class="value">×${s.compressionRatio}</span></div>` : ''}
                        <div class="output-row highlight"><span class="label">★ Sellable Storage</span><span class="value">${r.sellableTB.toFixed(2)} TB</span></div>
                        <div class="output-row"><span class="label">Protocol</span><span class="value">${s.protocol}</span></div>
                        <div class="output-row"><span class="label">Encryption</span><span class="value">${s.encryption ? 'Enabled' : 'Disabled'}</span></div>
                    </div>
                </div>
            </div>`;
        }).join('')}

        <div class="card mt-24">
            <div class="section-header">
                <span class="section-number">I</span>
                <h2>CEPH Infrastructure</h2>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">CEPH MON+MGMT Deployment</label>
                    <select class="form-select" data-bind="storage.ceph.monDeployment">
                        <option ${state.storage.ceph.monDeployment === 'Colocated' ? 'selected' : ''}>Colocated</option>
                        <option ${state.storage.ceph.monDeployment === 'Dedicated' ? 'selected' : ''}>Dedicated</option>
                    </select>
                    <div class="form-hint">Colocated with OSD nodes recommended for up to 10 nodes</div>
                </div>
                <div class="form-group">
                    <label class="form-label">RGW (RADOS Gateway) Nodes</label>
                    <select class="form-select" data-bind="storage.ceph.rgwDeployment">
                        <option ${state.storage.ceph.rgwDeployment === 'Shared' ? 'selected' : ''}>Shared</option>
                        <option ${state.storage.ceph.rgwDeployment === 'Dedicated' ? 'selected' : ''}>Dedicated</option>
                    </select>
                    <div class="form-hint">Shared recommended at start</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">CEPH Package</label>
                    <select class="form-select" data-bind-special="cephPackage">
                        ${Object.keys(pricing.cephPackages).map(p => `<option ${state.cephPackage === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                    <div class="form-hint">Select based on total raw storage capacity needs</div>
                </div>
            </div>
        </div>`;
    },

    catalog() {
        return `
        <div class="tab-bar" id="catalogTabs">
            <button class="tab-btn active" data-tab="iaas">IaaS Services</button>
            <button class="tab-btn" data-tab="paas">PaaS Services</button>
            <button class="tab-btn" data-tab="console">Cloud Console</button>
        </div>

        <div id="catalogContent">
            ${renderCatalogTab('iaas')}
        </div>`;
    },

    cost() {
        const cost = calcCost();
        const totals = calcTotals();

        return `
        <div class="cost-total mb-28">
            <div class="period">Monthly Subscription (${state.deployment.managedTier} / ${state.deployment.billing})</div>
            <div class="amount">$${cost.totalMonthly.toLocaleString()}</div>
            <div class="period">$${cost.totalAnnual.toLocaleString()} per year</div>
        </div>

        <div class="grid-2 mb-28">
            <div class="card">
                <div class="card-title mb-16">Monthly Cost Breakdown</div>
                <div class="table-container">
                    <table>
                        <thead><tr><th>Component</th><th>Qty</th><th>Rate/mo</th><th>Monthly</th></tr></thead>
                        <tbody>
                            <tr><td>Control-plane (AZ1)</td><td>1</td><td>$${cost.cpMonthly.toLocaleString()}</td><td>$${cost.cpMonthly.toLocaleString()}</td></tr>
                            ${state.deployment.option === 'Dual AZ' ? `<tr><td>Control-plane (AZ2)</td><td>1</td><td>$${cost.az2.toLocaleString()}</td><td>$${cost.az2.toLocaleString()}</td></tr>` : ''}
                            <tr><td>Compute Nodes (Vol. Discount)</td><td>${cost.totalComputeNodes}</td><td>$${cost.computeRate.toLocaleString()}</td><td>$${cost.computeMonthly.toLocaleString()}</td></tr>
                            <tr><td>CEPH Storage (${state.cephPackage})</td><td>1</td><td>$${cost.cephMonthly.toLocaleString()}</td><td>$${cost.cephMonthly.toLocaleString()}</td></tr>
                            <tr style="font-weight:700;background:var(--primary-bg)"><td>Total Monthly</td><td></td><td></td><td>$${cost.totalMonthly.toLocaleString()}</td></tr>
                            <tr style="font-weight:700"><td>Total Annual</td><td></td><td></td><td>$${cost.totalAnnual.toLocaleString()}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="card-title mb-16">Deployment Investment (NRC)</div>
                <div class="table-container">
                    <table>
                        <thead><tr><th>Component</th><th>Total</th><th>iVolve Pays</th><th>CSP Pays</th></tr></thead>
                        <tbody>
                            <tr><td>Single AZ Deployment</td><td>$${pricing.nrc.singleAZ.toLocaleString()}</td><td>$${pricing.nrc.iVolvePays.toLocaleString()}</td><td>$${pricing.nrc.cspPays.toLocaleString()}</td></tr>
                            ${state.deployment.option === 'Dual AZ' ? `<tr><td>Second AZ Deployment</td><td>$${pricing.nrc.singleAZ.toLocaleString()}</td><td>$${pricing.nrc.iVolvePays.toLocaleString()}</td><td>$${pricing.nrc.cspPays.toLocaleString()}</td></tr>` : ''}
                            <tr style="font-weight:700;background:var(--primary-bg)"><td>Total NRC</td><td>$${(state.deployment.option === 'Dual AZ' ? pricing.nrc.singleAZ * 2 : pricing.nrc.singleAZ).toLocaleString()}</td><td>$${(state.deployment.option === 'Dual AZ' ? pricing.nrc.iVolvePays * 2 : pricing.nrc.iVolvePays).toLocaleString()}</td><td>$${(state.deployment.option === 'Dual AZ' ? pricing.nrc.cspPays * 2 : pricing.nrc.cspPays).toLocaleString()}</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="form-hint mt-16">Payment: 50% advance, 50% upon project sign-off</div>
            </div>
        </div>

        <div class="card">
            <div class="card-title mb-16">Compute Volume Discount Tiers</div>
            <div class="table-container">
                <table>
                    <thead><tr><th>Nodes</th><th>Adv. Quarterly</th><th>Adv. Yearly</th><th>Ess. Quarterly</th><th>Ess. Yearly</th></tr></thead>
                    <tbody>
                        ${pricing.computeVolDiscount.map(b => `
                            <tr ${cost.totalComputeNodes >= b.min && cost.totalComputeNodes <= b.max ? 'style="background:var(--primary-bg);font-weight:600"' : ''}>
                                <td>${b.min} - ${b.max > 100 ? '∞' : b.max}</td>
                                <td>$${b.advQ}</td><td>$${b.advY}</td><td>$${b.essQ}</td><td>$${b.essY}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="form-hint mt-16">Your current node count: <strong>${cost.totalComputeNodes}</strong> — rate: <strong>$${cost.computeRate}/node/month</strong></div>
        </div>`;
    },

    boq() {
        const totals = calcTotals();
        const computeTypes = [
            { key: 'generalPurpose', name: 'General Purpose' },
            { key: 'computeIntensive', name: 'Compute Intensive' },
            { key: 'extremeCompute', name: 'Extreme Compute' },
            { key: 'memoryIntensive', name: 'Memory Intensive' },
            { key: 'extremeMemory', name: 'Extreme Memory' }
        ];
        const gpu = state.compute.gpu;

        let boqRows = [];

        // Controlplane
        boqRows.push({ group: 'Controlplane & Management' });
        boqRows.push({ item: 'Controlplane Server', qty: state.deployment.controlplaneNodes, spec: 'OpenShift/OpenStack controllers', notes: 'HA cluster' });
        boqRows.push({ item: 'Management Host', qty: state.deployment.managementHA, spec: 'Deployment & management node', notes: state.deployment.managementHA === 2 ? 'HA pair' : 'Single' });

        // Compute nodes
        computeTypes.forEach(t => {
            const cfg = state.compute[t.key];
            if (cfg.enabled && cfg.nodes > 0) {
                const memPerNode = cfg.cpuCores * 2 * state.oversubscription.cpuRatio * cfg.memRatio;
                boqRows.push({ group: `${t.name} Compute Nodes` });
                boqRows.push({ item: `${t.name} Server`, qty: cfg.nodes, spec: `${cfg.cpuCores} cores, ${memPerNode.toLocaleString()} GB RAM`, notes: `1:${cfg.memRatio} ratio` });
            }
        });

        // GPU nodes
        if (gpu.enabled && gpu.nodes > 0) {
            boqRows.push({ group: 'GPU Compute Nodes' });
            boqRows.push({ item: 'GPU Compute Server', qty: gpu.nodes, spec: `${gpu.cpuCores} cores, ${gpu.memPerNode} GB RAM`, notes: '' });
            boqRows.push({ item: gpu.gpuType + ' GPU', qty: gpu.gpusPerNode * gpu.nodes, spec: `${gpu.gpuMemory} GB per GPU`, notes: `${gpu.gpusPerNode} per node, ${gpu.sharingMode}` });
        }

        // Storage
        const storageTiers = [
            { key: 'tier1', name: 'High Perf SSD (Tier 1)', diskLabel: 'NVMe/SAS SSD' },
            { key: 'tier2', name: 'GP SSD (Tier 2)', diskLabel: 'SAS SSD' },
            { key: 'tier3', name: 'HDD Capacity (Tier 3)', diskLabel: 'HDD' },
            { key: 'tier4', name: 'Archive (Tier 4)', diskLabel: 'HDD' }
        ];

        storageTiers.forEach(t => {
            const s = state.storage[t.key];
            if (s.enabled) {
                const isHDD = t.key === 'tier3' || t.key === 'tier4';
                const disks = isHDD ? s.hddsPerNode : s.disksPerNode;
                const diskSize = isHDD ? s.hddSize : s.diskSize;
                if (disks > 0) {
                    boqRows.push({ group: `${t.name} Storage Nodes` });
                    boqRows.push({ item: `${t.name} Server`, qty: s.nodes, spec: `${s.cpuCores} cores, ${s.memPerNode} GB RAM`, notes: '' });
                    boqRows.push({ item: `${t.diskLabel} Disk`, qty: disks * s.nodes, spec: `${diskSize >= 1000 ? (diskSize/1000) + ' TB' : diskSize + ' GB'} each`, notes: `${disks} per node × ${s.nodes} nodes` });
                    if (t.key === 'tier3' && s.nvmeCacheDisks) {
                        boqRows.push({ item: 'NVMe Cache Disk', qty: s.nvmeCacheDisks * s.nodes, spec: '1.9 TB NVMe', notes: `${s.nvmeCacheDisks} per node` });
                    }
                }
            }
        });

        // Networking placeholder
        boqRows.push({ group: 'Networking (Recommended)' });
        boqRows.push({ item: 'Top-of-Rack Switch (25/100G)', qty: state.deployment.option === 'Dual AZ' ? 4 : 2, spec: '25GbE/100GbE', notes: 'Leaf switches' });
        boqRows.push({ item: 'Spine Switch', qty: 2, spec: '100GbE', notes: 'Spine layer' });

        return `
        <div class="card mb-28">
            <div class="card-header">
                <div>
                    <div class="card-title">Bill of Quantities (BOQ)</div>
                    <div class="card-subtitle">Hardware requirements based on current configuration</div>
                </div>
                <button class="btn btn-primary" onclick="exportBOQ()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export BOQ
                </button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr><th>#</th><th>Item</th><th>Qty</th><th>Specification</th><th>Notes</th></tr>
                    </thead>
                    <tbody>
                        ${boqRows.map((r, i) => {
                            if (r.group) return `<tr class="boq-group-header"><td colspan="5">${r.group}</td></tr>`;
                            return `<tr><td>${i}</td><td>${r.item}</td><td style="font-weight:600">${r.qty}</td><td>${r.spec}</td><td class="text-muted">${r.notes}</td></tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card">
            <div class="card-title mb-16">Capacity Summary</div>
            <div class="grid-3 mb-0">
                <div>
                    <h4 class="text-sm text-muted mb-16">Sellable Compute</h4>
                    ${inlineStat('Total vCPUs', totals.totalVCPU.toLocaleString())}
                    ${inlineStat('Total Memory', formatMemory(totals.totalMem))}
                    ${inlineStat('GPU Slices', totals.totalGPUSlices)}
                    ${inlineStat('vGPU Memory', totals.totalGPUMem.toLocaleString() + ' GB')}
                </div>
                <div>
                    <h4 class="text-sm text-muted mb-16">Sellable Storage</h4>
                    ${inlineStat('High Perf SSD', totals.storageResults.tier1.sellableTB.toFixed(1) + ' TB')}
                    ${inlineStat('GP SSD', totals.storageResults.tier2.sellableTB.toFixed(1) + ' TB')}
                    ${inlineStat('HDD', totals.storageResults.tier3.sellableTB.toFixed(1) + ' TB')}
                    ${inlineStat('Archive', totals.storageResults.tier4.sellableTB.toFixed(1) + ' TB')}
                </div>
                <div>
                    <h4 class="text-sm text-muted mb-16">Totals</h4>
                    ${inlineStat('Total Nodes', totals.totalNodes)}
                    ${inlineStat('Total Storage', totals.totalStorage.toFixed(1) + ' TB')}
                    ${inlineStat('Raw Storage', totals.rawStorage.toFixed(1) + ' TB')}
                </div>
            </div>
        </div>`;
    }
};

// ── Helper Functions ──
function formatMemory(gb) {
    if (gb >= 1024) return (gb / 1024).toFixed(1) + ' TB';
    return gb + ' GB';
}

function inlineStat(label, value) {
    return `<div class="inline-stat"><span class="label">${label}</span><span class="value">${value}</span></div>`;
}

function renderGPUSection() {
    const g = state.compute.gpu;
    const r = calcGPU();

    return `
    <div class="flex items-center justify-between mb-24">
        <div class="flex items-center gap-12">
            <label class="switch">
                <input type="checkbox" ${g.enabled ? 'checked' : ''} onchange="toggleGPUEnabled(this.checked)">
                <span class="switch-slider"></span>
            </label>
            <span class="fw-600">Enable GPU Compute Nodes</span>
        </div>
        ${g.enabled ? `<span class="badge badge-success"><span class="badge-dot"></span> ${r.totalGPUs} GPUs / ${r.sellableSlices} Slices</span>` : '<span class="badge badge-muted">Disabled</span>'}
    </div>

    ${g.enabled ? `
    <div class="form-row-3">
        <div class="form-group">
            <label class="form-label">CPU Cores per Node</label>
            <select class="form-select" data-bind="compute.gpu.cpuCores" data-type="number">
                ${[16,32,48,64,96,128].map(v => `<option value="${v}" ${g.cpuCores === v ? 'selected' : ''}>${v} Cores</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Memory per Node (GB)</label>
            <select class="form-select" data-bind="compute.gpu.memPerNode" data-type="number">
                ${[256,512,1024,2048,4096].map(v => `<option value="${v}" ${g.memPerNode === v ? 'selected' : ''}>${v} GB</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Number of GPU Nodes</label>
            <input class="form-input" type="number" min="0" max="20" value="${g.nodes}" data-bind="compute.gpu.nodes" data-type="number">
        </div>
    </div>
    <div class="form-row-3">
        <div class="form-group">
            <label class="form-label">GPUs per Node</label>
            <select class="form-select" data-bind="compute.gpu.gpusPerNode" data-type="number">
                ${[1,2,4,8].map(v => `<option value="${v}" ${g.gpusPerNode === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">GPU Model</label>
            <select class="form-select" data-bind="compute.gpu.gpuType">
                ${['NVIDIA T4', 'NVIDIA L4', 'NVIDIA L40', 'NVIDIA L40S', 'NVIDIA A100 40GB', 'NVIDIA A100 80GB', 'NVIDIA H100', 'NVIDIA H200', 'NVIDIA B200'].map(v => `<option ${g.gpuType === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">GPU Memory (GB per GPU)</label>
            <select class="form-select" data-bind="compute.gpu.gpuMemory" data-type="number">
                ${[16,24,48,80,141,192].map(v => `<option value="${v}" ${g.gpuMemory === v ? 'selected' : ''}>${v} GB</option>`).join('')}
            </select>
            <div class="form-hint">L40=48, A100=40/80, H100=80, H200=141, B200=192</div>
        </div>
    </div>
    <div class="form-row-3">
        <div class="form-group">
            <label class="form-label">GPU Sharing Mode</label>
            <select class="form-select" data-bind="compute.gpu.sharingMode" onchange="renderPage()">
                ${['vGPU', 'MIG', 'Passthrough'].map(v => `<option ${g.sharingMode === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
            <div class="form-hint">vGPU: L40/L40S/L4/T4 | MIG: A100/H100/H200/B200 | Passthrough: 1:1</div>
        </div>
        ${g.sharingMode === 'vGPU' ? `
        <div class="form-group">
            <label class="form-label">vGPU Profiles per GPU</label>
            <select class="form-select" data-bind="compute.gpu.vgpuProfiles" data-type="number">
                ${[2,4,8,16].map(v => `<option value="${v}" ${g.vgpuProfiles === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">vGPU Over-Subscription</label>
            <select class="form-select" data-bind="compute.gpu.vgpuOversub" data-type="number">
                ${[1,2,4].map(v => `<option value="${v}" ${g.vgpuOversub === v ? 'selected' : ''}>${v}x</option>`).join('')}
            </select>
        </div>` : g.sharingMode === 'MIG' ? `
        <div class="form-group">
            <label class="form-label">MIG Instances per GPU</label>
            <select class="form-select" data-bind="compute.gpu.migInstances" data-type="number">
                ${[1,2,3,4,7].map(v => `<option value="${v}" ${g.migInstances === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
            <div class="form-hint">H100/A100/H200/B200 support up to 7</div>
        </div>
        <div></div>` : '<div></div><div></div>'}
    </div>

    <div class="compute-type-output mt-16">
        <div class="output-row"><span class="label">Physical Cores</span><span class="value">${r.cores.toLocaleString()}</span></div>
        <div class="output-row"><span class="label">★ Sellable vCPU</span><span class="value">${r.sellableVCPU.toLocaleString()}</span></div>
        <div class="output-row"><span class="label">Gross Memory</span><span class="value">${r.grossMem.toLocaleString()} GB</span></div>
        <div class="output-row"><span class="label">★ Sellable Memory</span><span class="value">${r.sellableMem.toLocaleString()} GB</span></div>
        <div class="output-row highlight"><span class="label">★ Total Physical GPUs</span><span class="value">${r.totalGPUs}</span></div>
        <div class="output-row highlight"><span class="label">★ Sellable GPU Slices</span><span class="value">${r.sellableSlices}</span></div>
        <div class="output-row highlight"><span class="label">★ Sellable vGPU Memory</span><span class="value">${r.sellableGPUMem.toLocaleString()} GB</span></div>
        ${r.memPerSlice ? `<div class="output-row"><span class="label">vGPU Memory per Slice</span><span class="value">${r.memPerSlice.toFixed(1)} GB</span></div>` : ''}
    </div>` : ''}`;
}

function renderCatalogTab(tab) {
    if (tab === 'iaas') {
        return `
        <div class="card mb-24">
            <div class="card-title mb-16">Core IaaS Services <span class="badge badge-success ml-8">Included in Base Subscription</span></div>
            <div class="catalog-grid">
                ${catalog.iaas.map(s => `
                    <div class="catalog-item">
                        <span class="name">${s.name}</span>
                        <span class="badge badge-success"><span class="badge-dot"></span> ${s.status}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="card">
            <div class="card-title mb-16">Advanced IaaS Services</div>
            <div class="catalog-grid">
                ${catalog.iaasAdvanced.map(s => `
                    <div class="catalog-item">
                        <span class="name">${s.name}</span>
                        <div>
                            <span class="badge badge-success"><span class="badge-dot"></span> ${s.status}</span>
                            ${s.price ? `<span class="badge badge-info" style="margin-left:4px">$${s.price} ${s.unit}</span>` : ''}
                            ${s.note ? `<div class="text-sm text-muted mt-2">${s.note}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    } else if (tab === 'paas') {
        return `
        <div class="card">
            <div class="card-title mb-16">Platform as a Service</div>
            <div class="table-container">
                <table>
                    <thead><tr><th>Service</th><th>Status</th><th>Unit</th><th>Price</th></tr></thead>
                    <tbody>
                        ${catalog.paas.map(s => `
                            <tr>
                                <td class="fw-600">${s.name}</td>
                                <td><span class="badge ${s.status === 'Ready' ? 'badge-success' : s.status === 'Q3' ? 'badge-warning' : 'badge-info'}"><span class="badge-dot"></span> ${s.status}</span></td>
                                <td>${s.unit || '—'}</td>
                                <td>${s.price}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
    } else {
        return `
        <div class="card">
            <div class="card-title mb-16">HyperNext Cloud Console — General Services <span class="badge badge-success ml-8">All Included</span></div>
            <div class="catalog-grid">
                ${catalog.console.map(s => `
                    <div class="catalog-item">
                        <span class="name">${s.name}</span>
                        <span class="badge badge-success"><span class="badge-dot"></span> ${s.status}</span>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }
}

// ── Navigation & Rendering ──
let currentPage = 'dashboard';

function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
    const titles = {
        dashboard: 'Dashboard',
        deployment: 'Deployment Configuration',
        compute: 'Compute Services',
        storage: 'Storage Services',
        catalog: 'Service Catalog',
        cost: 'Cost Calculator',
        boq: 'BOQ Generator'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;
    renderPage();
}

function renderPage() {
    destroyCharts();
    const area = document.getElementById('contentArea');
    area.innerHTML = pages[currentPage]();
    area.scrollTop = 0;
    bindInputs();

    // Render charts after DOM is ready
    requestAnimationFrame(() => {
        if (currentPage === 'dashboard') renderDashboardCharts();
    });
}

function renderDashboardCharts() {
    const gp = calcCompute('generalPurpose');
    const ci = calcCompute('computeIntensive');
    const ec = calcCompute('extremeCompute');
    const mi = calcCompute('memoryIntensive');
    const em = calcCompute('extremeMemory');
    const gpu = calcGPU();

    const vcpuData = [
        { label: 'General Purpose', value: gp.sellableVCPU, color: '#6366f1' },
        { label: 'Compute Intensive', value: ci.sellableVCPU, color: '#3b82f6' },
        { label: 'Extreme Compute', value: ec.sellableVCPU, color: '#06b6d4' },
        { label: 'Memory Intensive', value: mi.sellableVCPU, color: '#10b981' },
        { label: 'Extreme Memory', value: em.sellableVCPU, color: '#f59e0b' },
        { label: 'GPU Nodes', value: gpu.sellableVCPU, color: '#ef4444' }
    ].filter(d => d.value > 0);

    createChart('chartComputeVCPU', {
        type: 'doughnut',
        data: {
            labels: vcpuData.map(d => d.label),
            datasets: [{ data: vcpuData.map(d => d.value), backgroundColor: vcpuData.map(d => d.color), borderWidth: 0 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 12 } } }
            },
            cutout: '60%'
        }
    });

    const storageData = [
        { label: 'High Perf SSD', value: calcStorage('tier1').sellableTB, color: '#6366f1' },
        { label: 'GP SSD', value: calcStorage('tier2').sellableTB, color: '#3b82f6' },
        { label: 'HDD', value: calcStorage('tier3').sellableTB, color: '#10b981' },
        { label: 'Archive', value: calcStorage('tier4').sellableTB, color: '#f59e0b' }
    ].filter(d => d.value > 0);

    createChart('chartStorage', {
        type: 'bar',
        data: {
            labels: storageData.map(d => d.label),
            datasets: [{ data: storageData.map(d => d.value), backgroundColor: storageData.map(d => d.color), borderRadius: 6, barThickness: 40 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'TB' }, grid: { color: '#f1f5f9' } },
                x: { grid: { display: false } }
            }
        }
    });

    const cost = calcCost();
    const costData = [
        { label: 'Controlplane', value: cost.cpMonthly + cost.az2, color: '#6366f1' },
        { label: 'Compute', value: cost.computeMonthly, color: '#3b82f6' },
        { label: 'CEPH Storage', value: cost.cephMonthly, color: '#10b981' }
    ].filter(d => d.value > 0);

    createChart('chartCost', {
        type: 'doughnut',
        data: {
            labels: costData.map(d => d.label),
            datasets: [{ data: costData.map(d => d.value), backgroundColor: costData.map(d => d.color), borderWidth: 0 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 12 } } },
                tooltip: { callbacks: { label: ctx => `${ctx.label}: $${ctx.parsed.toLocaleString()}/mo` } }
            },
            cutout: '60%'
        }
    });
}

// ── Data Binding ──
function bindInputs() {
    document.querySelectorAll('[data-bind]').forEach(el => {
        el.addEventListener('change', () => {
            const path = el.dataset.bind.split('.');
            let val = el.value;
            if (el.dataset.type === 'number') val = parseFloat(val);
            if (el.type === 'checkbox') val = el.checked;
            if (val === 'true') val = true;
            if (val === 'false') val = false;

            let obj = state;
            for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
            obj[path[path.length - 1]] = val;
            renderPage();
        });
    });

    document.querySelectorAll('[data-bind-special]').forEach(el => {
        el.addEventListener('change', () => {
            const key = el.dataset.bindSpecial;
            state[key] = el.value;
            renderPage();
        });
    });

    // Catalog tabs
    document.querySelectorAll('#catalogTabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#catalogTabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('catalogContent').innerHTML = renderCatalogTab(btn.dataset.tab);
        });
    });
}

// ── Toggle Functions ──
function toggleComputeType(key) {
    const card = document.querySelector(`[data-type="${key}"]`);
    if (card) card.classList.toggle('active');
    const body = card.querySelector('.compute-type-body');
    body.style.display = body.style.display === 'none' ? 'block' : (body.style.display === 'block' ? 'none' : 'block');
}

function toggleComputeEnabled(key, checked) {
    state.compute[key].enabled = checked;
    if (checked && state.compute[key].nodes === 0) state.compute[key].nodes = 3;
    if (!checked) state.compute[key].nodes = 0;
    renderPage();
}

function toggleGPUEnabled(checked) {
    state.compute.gpu.enabled = checked;
    if (checked && state.compute.gpu.nodes === 0) state.compute.gpu.nodes = 3;
    if (!checked) state.compute.gpu.nodes = 0;
    renderPage();
}

function toggleStorageEnabled(key, checked) {
    state.storage[key].enabled = checked;
    renderPage();
}

function toggleStorageTier(key) {
    const tier = document.querySelector(`.storage-tier[onclick*="${key}"]`) ||
                 event.target.closest('.storage-tier');
    if (!tier) return;
    const body = tier.querySelector('.storage-tier-body');
    if (body) body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

// ── Save / Export ──
function saveState() {
    localStorage.setItem('hypernext-csp-state', JSON.stringify(state));
    showToast('Configuration saved successfully', 'success');
}

function loadState() {
    const saved = localStorage.getItem('hypernext-csp-state');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            deepMerge(state, parsed);
        } catch (e) { /* ignore */ }
    }
}

function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
}

function exportConfig() {
    const totals = calcTotals();
    const cost = calcCost();
    const data = { state, totals, cost, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HyperNext-CSP-Config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Configuration exported', 'info');
}

function exportBOQ() {
    // Generate CSV from BOQ
    const lines = ['Category,Item,Qty,Specification,Notes'];
    let currentGroup = '';
    const computeTypes = ['generalPurpose', 'computeIntensive', 'extremeCompute', 'memoryIntensive', 'extremeMemory'];

    currentGroup = 'Controlplane & Management';
    lines.push(`${currentGroup},Controlplane Server,${state.deployment.controlplaneNodes},"OpenShift/OpenStack controllers",HA cluster`);
    lines.push(`${currentGroup},Management Host,${state.deployment.managementHA},"Deployment & management node",${state.deployment.managementHA === 2 ? 'HA pair' : 'Single'}`);

    computeTypes.forEach(t => {
        const cfg = state.compute[t];
        if (cfg.enabled && cfg.nodes > 0) {
            const memPerNode = cfg.cpuCores * 2 * state.oversubscription.cpuRatio * cfg.memRatio;
            lines.push(`${t} Compute,Server,${cfg.nodes},"${cfg.cpuCores} cores, ${memPerNode} GB RAM","1:${cfg.memRatio} ratio"`);
        }
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HyperNext-BOQ-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('BOQ exported as CSV', 'success');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    loadState();

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => navigateTo(item.dataset.page));
    });

    // Mobile menu
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    // Save & Export buttons
    document.getElementById('saveBtn').addEventListener('click', saveState);
    document.getElementById('exportBtn').addEventListener('click', exportConfig);

    // Initial render
    renderPage();
});
