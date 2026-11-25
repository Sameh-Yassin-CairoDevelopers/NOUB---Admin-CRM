import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Box,
  Sun,
  Cable,
  Activity,
  Search,
  Server,
  HardDrive,
  Shield,
  PhoneCall,
  Camera,
  Edit3,
  Plus,
  Check,
  X,
  Fan,
  Thermometer,
  Zap,
  Lock,
} from 'lucide-react';
import {
  MESHAWIR_RACK_META,
  NETWORK_VPN_WAVE_SPEC,
  VLAN_DEFINITIONS,
  type RackDevice,
  type RackPort,
} from '../data/meshawirMasterData';
import {
  addRackDeviceItem,
  loadRackDevices,
  loadRackPorts,
  saveRackPortUpdate,
} from '../lib/dataService';

const getVlanColorHex = (vlanId: number): string => {
  if (vlanId >= 90 && vlanId <= 92) return '#f59e0b';
  const found = VLAN_DEFINITIONS.find((v) => v.id === vlanId);
  return found ? found.colorHex : '#64748b';
};

export const InteractiveRackView: React.FC = () => {
  const [devices, setDevices] = useState<RackDevice[]>([]);
  const [ports, setPorts] = useState<RackPort[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive viewport controls
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Graphic toggles
  const [is3D, setIs3D] = useState(false);
  const [glassDoor, setGlassDoor] = useState(false);
  const [rackLight, setRackLight] = useState(true);
  const [showPatchCables, setShowPatchCables] = useState(true);
  const [ledBlink, setLedBlink] = useState(true);

  // Filters & selection
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVlanFilter, setActiveVlanFilter] = useState<string>('all');
  const [selectedPort, setSelectedPort] = useState<RackPort | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<RackDevice | null>(null);

  // Edit port & add device state
  const [editingPort, setEditingPort] = useState<RackPort | null>(null);
  const [addingDevice, setAddingDevice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newDev, setNewDev] = useState({
    name: '',
    arabic_name: '',
    model: '',
    manufacturer: '',
    u_position_start: 16,
    u_height: 1,
    device_category: 'server' as RackDevice['device_category'],
    ip_management: '192.168.10.',
    power_watts: 120,
    notes: '',
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([loadRackDevices(), loadRackPorts()]).then(([devs, prts]) => {
      if (!mounted) return;
      setDevices(devs);
      setPorts(prts);
      // Default selection: Gi1/0/7 HP LaserJet Pro M404n
      const defaultPort =
        prts.find((p) => p.id === 'c3850-p7') ||
        prts.find((p) => p.port_number === 7) ||
        prts[0] ||
        null;
      setSelectedPort(defaultPort);
      setSelectedDevice(devs.find((d) => d.id === 'cisco-switch-48') || devs[0] || null);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, select')) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  };

  const handleMouseUp = () => setDragging(false);

  const matchesFilter = (port: RackPort): boolean => {
    if (activeVlanFilter !== 'all') {
      if (activeVlanFilter === '90-92') {
        if (port.vlan_id < 90 || port.vlan_id > 92) return false;
      } else if (String(port.vlan_id) !== activeVlanFilter) {
        return false;
      }
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      port.label.toLowerCase().includes(q) ||
      port.connected_device.toLowerCase().includes(q) ||
      port.user_endpoint.toLowerCase().includes(q) ||
      port.ip_address.toLowerCase().includes(q) ||
      port.vlan_name.toLowerCase().includes(q)
    );
  };

  const ciscoPorts = useMemo(
    () =>
      ports
        .filter((p) => p.device_id === 'cisco-switch-48')
        .sort((a, b) => a.port_number - b.port_number),
    [ports]
  );

  const er8411Ports = useMemo(
    () =>
      ports
        .filter((p) => p.device_id === 'tplink-er8411-fw')
        .sort((a, b) => a.port_number - b.port_number),
    [ports]
  );

  const pbxPorts = useMemo(
    () =>
      ports
        .filter((p) => p.device_id === 'grandstream-pbx-604a')
        .sort((a, b) => a.port_number - b.port_number),
    [ports]
  );

  const customExtraDevices = useMemo(() => {
    const coreIds = new Set([
      'patch-panel-1',
      'cisco-switch-48',
      'patch-panel-2',
      'dell-r640',
      'rack-spacer-empty',
      'nvr-16-ch',
      'grandstream-pbx-604a',
      'tplink-er8411-fw',
    ]);
    return devices.filter((d) => !coreIds.has(d.id));
  }, [devices]);

  const stats = useMemo(() => {
    const activePorts = ciscoPorts.filter((p) => p.status === 'active').length;
    const totalPower = devices.reduce((s, d) => s + Number(d.power_watts || 0), 0);
    return {
      totalPorts: ciscoPorts.length,
      activePorts,
      freePorts: ciscoPorts.filter((p) => p.status === 'free').length,
      totalPower,
      avgTemp: 28.4,
    };
  }, [ciscoPorts, devices]);

  const selectPortItem = (port: RackPort) => {
    setSelectedPort(port);
    const parent = devices.find((d) => d.id === port.device_id) || null;
    if (parent) setSelectedDevice(parent);
    setEditingPort(null);
  };

  const selectDeviceOnly = (deviceId: string) => {
    const dev = devices.find((d) => d.id === deviceId) || null;
    setSelectedDevice(dev);
    const devFirstPort = ports.find((p) => p.device_id === deviceId) || null;
    if (devFirstPort) setSelectedPort(devFirstPort);
    setEditingPort(null);
  };

  const handleSavePortEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPort) return;
    setSaving(true);
    try {
      const updated = await saveRackPortUpdate(editingPort);
      setPorts(updated);
      setSelectedPort(editingPort);
      setEditingPort(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDev.name.trim()) return;
    setSaving(true);
    try {
      const created: RackDevice = {
        id: `custom-dev-${Date.now()}`,
        rack_id: MESHAWIR_RACK_META.id,
        name: newDev.name.trim(),
        arabic_name: newDev.arabic_name.trim() || newDev.name.trim(),
        model: newDev.model.trim() || 'Rackmount 1U',
        manufacturer: newDev.manufacturer.trim() || 'Mashawir IT',
        u_position_start: Number(newDev.u_position_start) || 16,
        u_height: Number(newDev.u_height) || 1,
        device_category: newDev.device_category,
        serial_number: `MSH-${Math.floor(1000 + Math.random() * 9000)}`,
        ip_management: newDev.ip_management,
        mac_address: '00:1A:2B:3C:4D:5E',
        power_watts: Number(newDev.power_watts) || 80,
        operating_temp_c: 26,
        status: 'online',
        notes: newDev.notes,
      };
      const updated = await addRackDeviceItem(created);
      setDevices(updated);
      setSelectedDevice(created);
      setAddingDevice(false);
      setNewDev({
        name: '',
        arabic_name: '',
        model: '',
        manufacturer: '',
        u_position_start: 15,
        u_height: 1,
        device_category: 'server',
        ip_management: '192.168.10.',
        power_watts: 120,
        notes: '',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-10 text-center text-slate-300 text-sm">
        جاري تحميل مخطط كابينة راك Perla 27U والمنافذ الـ 48...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dark Control & Telemetry Header */}
      <div className="bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Server className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                {MESHAWIR_RACK_META.name}
              </h2>
              <span className="text-[11px] font-mono text-cyan-300 border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 rounded">
                1000mm × 19&quot; · 27U
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {MESHAWIR_RACK_META.location} — {MESHAWIR_RACK_META.lock_status}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">منافذ نشطة:</span>
              <span className="font-mono font-bold text-emerald-400">
                {stats.activePorts}/{stats.totalPorts}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">القدرة:</span>
              <span className="font-mono font-bold text-amber-300">{stats.totalPower}W</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono font-bold text-cyan-300">{stats.avgTemp}°C</span>
            </div>
            <button
              type="button"
              onClick={() => setAddingDevice(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة جهاز للراك</span>
            </button>
          </div>
        </div>

        {/* Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md text-slate-200 cursor-pointer"
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-300 px-1.5 min-w-[46px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md text-slate-200 cursor-pointer"
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-200 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة الضبط</span>
            </button>

            <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={() => setIs3D((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                is3D
                  ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>{is3D ? 'منظور 3D' : 'مسطح 2D'}</span>
            </button>

            <button
              type="button"
              onClick={() => setGlassDoor((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                glassDoor
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>الباب الزجاجي</span>
            </button>

            <button
              type="button"
              onClick={() => setRackLight((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                rackLight
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>إضاءة الراك</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPatchCables((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                showPatchCables
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Cable className="w-3.5 h-3.5" />
              <span>كابلات الباتش</span>
            </button>

            <button
              type="button"
              onClick={() => setLedBlink((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                ledBlink
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>نبض LED</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بمنفذ، IP، أو جهاز (مثال M404n)..."
              className="w-full pr-8 pl-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* VLAN Legend Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setActiveVlanFilter('all')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer whitespace-nowrap ${
              activeVlanFilter === 'all'
                ? 'bg-white text-slate-950 border-white'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            كل الشبكات (48 منفذ + الراوتر والسنترال)
          </button>
          {VLAN_DEFINITIONS.map((v) => (
            <button
              key={v.groupKey}
              type="button"
              onClick={() =>
                setActiveVlanFilter((prev) => (prev === v.groupKey ? 'all' : v.groupKey))
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer whitespace-nowrap transition-opacity ${
                activeVlanFilter === v.groupKey ? 'ring-1 ring-white' : 'opacity-85 hover:opacity-100'
              } ${v.badgeClass}`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: v.colorHex }}
              />
              <span>{v.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ER8411 Network Policy, Static Public IP, WireGuard VPN + Grandstream Wave Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="border-r-2 border-emerald-600 pr-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-slate-900">Static Public IP (WAN1)</span>
            <span className="font-semibold text-emerald-700">{NETWORK_VPN_WAVE_SPEC.staticIpStatus}</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {NETWORK_VPN_WAVE_SPEC.staticPublicIpDecision}
          </p>
        </div>

        <div className="border-r-2 border-amber-500 pr-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-slate-900">WireGuard VPN + Grandstream Wave</span>
            <span className="font-semibold text-amber-700">{NETWORK_VPN_WAVE_SPEC.remoteWorkStatus}</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            دعم <strong className="font-mono tabular-nums text-slate-900">25–30</strong> مستخدماً عن بُعد على <span className="font-mono text-slate-800">ER8411</span> بعزل صارم لنفق <span className="font-mono text-slate-800">VLAN 30 (192.168.30.1)</span> دون فتح SIP/RTP للإنترنت العام.
          </p>
        </div>

        <div className="border-r-2 border-slate-400 pr-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-slate-900">تنبيه الجرد والأمان (R730 / ISO)</span>
            <span className="font-semibold text-slate-600">يحتاج تحققاً</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            الشركة غير حاصلة على <span className="font-mono text-slate-800">ISO 27001</span> حتى الآن (هدف مستقبلي). وسجل <span className="font-mono text-slate-800">Dell R730 + 20 CALs</span> مرجع تاريخي منفصل عن R640 وZ440 الفعليين بالراك.
          </p>
        </div>
      </div>

      {/* Main Split View: Graphic Interactive 27U Rack + Port Inspector Drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT: Interactive 27U Graphic Rack Cabinet */}
        <div
          className="xl:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative select-none"
          style={{ minHeight: '780px', cursor: dragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Ambient Rack Light */}
          {rackLight && (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-56 opacity-35"
              style={{
                background:
                  'radial-gradient(ellipse at top, rgba(56, 189, 248, 0.35), transparent 70%)',
              }}
            />
          )}

          <div
            className="p-4 sm:p-6 transition-transform duration-150 origin-top"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) ${
                is3D ? 'perspective(1200px) rotateY(-4deg) rotateX(1deg)' : ''
              }`,
            }}
          >
            {/* Steel Enclosure Frame */}
            <div className="max-w-3xl mx-auto rounded-xl border-4 border-slate-700 bg-slate-900 shadow-2xl overflow-hidden relative">
              {/* Top Roof Fan Bar */}
              <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white tracking-wider">PERLA 27U</span>
                  <span className="text-slate-400">1000mm Deep · Room 5.74×1.96m</span>
                </div>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4].map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 text-cyan-300 font-mono">
                      <Fan className={`w-3.5 h-3.5 ${ledBlink ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                      F{f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rack Inner Body with Optional Patch Cables SVG Overlay */}
              <div className="p-3 space-y-2 relative">
                {showPatchCables && (
                  <svg
                    className="pointer-events-none absolute inset-0 w-full h-full z-10 opacity-45"
                    viewBox="0 0 800 720"
                    preserveAspectRatio="none"
                  >
                    {/* PP1 to Cisco upper bank */}
                    <path d="M 140 38 C 120 70, 120 90, 145 112" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
                    <path d="M 210 38 C 195 72, 195 92, 215 112" stroke="#f97316" strokeWidth="2.5" fill="none" />
                    <path d="M 320 38 C 305 72, 305 92, 325 112" stroke="#6366f1" strokeWidth="2.5" fill="none" />
                    {/* Cisco to PP2 */}
                    <path d="M 480 148 C 495 170, 495 190, 480 212" stroke="#a855f7" strokeWidth="2.5" fill="none" />
                    <path d="M 600 148 C 618 170, 618 190, 600 212" stroke="#06b6d4" strokeWidth="2.5" fill="none" />
                    {/* ER8411 Trunk to Cisco */}
                    <path d="M 730 595 C 778 460, 778 260, 725 135" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 3" fill="none" />
                    {/* Grandstream LAN to Cisco */}
                    <path d="M 695 515 C 745 390, 745 240, 680 142" stroke="#22c55e" strokeWidth="2.5" fill="none" />
                  </svg>
                )}

                {/* U27: Patch Panel 1 */}
                <div
                  onClick={() => selectDeviceOnly('patch-panel-1')}
                  className={`rounded-lg border p-2.5 bg-slate-950/90 cursor-pointer transition-colors ${
                    selectedDevice?.id === 'patch-panel-1' ? 'border-cyan-400' : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-mono font-bold text-slate-300">U27 · PATCH PANEL #1 (24-PORT CAT6)</span>
                    <span className="text-slate-400">المكاتب 1–7 · الكول سنتر · PP1-07 طابعة M404n</span>
                  </div>
                  <div className="grid grid-cols-12 sm:grid-cols-24 gap-1">
                    {Array.from({ length: 24 }, (_, idx) => {
                      const pNum = idx + 1;
                      const linked = ciscoPorts.find((p) => p.port_number === pNum);
                      const isPrinter = pNum === 7;
                      const active = linked?.status === 'active';
                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (linked) selectPortItem(linked);
                          }}
                          title={`PP1-${String(pNum).padStart(2, '0')} → ${linked?.connected_device || ''}`}
                          className={`h-5 rounded-[3px] border text-[9px] font-mono flex items-center justify-center cursor-pointer ${
                            selectedPort?.port_number === pNum && selectedPort.device_id === 'cisco-switch-48'
                              ? 'ring-2 ring-white border-white bg-amber-500 text-slate-950 font-bold'
                              : isPrinter
                                ? 'bg-orange-500/30 border-orange-400 text-orange-200 font-bold'
                                : active
                                  ? 'bg-slate-800 border-blue-500/60 text-blue-300'
                                  : 'bg-slate-900 border-slate-700 text-slate-500'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* U26: Cisco Catalyst 3850-48P PoE+ */}
                <div
                  onClick={() => selectDeviceOnly('cisco-switch-48')}
                  className={`rounded-lg border p-3 bg-gradient-to-b from-slate-800 to-slate-900 cursor-pointer transition-colors ${
                    selectedDevice?.id === 'cisco-switch-48' ? 'border-cyan-400' : 'border-slate-600'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300">U26</span>
                      <span className="text-xs font-bold text-white">Cisco Catalyst 3850-48P PoE+</span>
                      <span className="text-[10px] font-mono text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700">
                        192.168.10.2
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <span className={`w-2 h-2 rounded-full bg-emerald-400 ${ledBlink ? 'animate-pulse' : ''}`} />
                        PSU1 715W
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <span className={`w-2 h-2 rounded-full bg-emerald-400 ${ledBlink ? 'animate-pulse' : ''}`} />
                        PSU2 715W
                      </span>
                    </div>
                  </div>

                  {/* 48 Copper Ports (24 top row odd + 24 bottom row even or 1-24 / 25-48) + 4 SFP+ */}
                  <div className="flex flex-col lg:flex-row gap-2.5 items-stretch">
                    <div className="flex-1 space-y-1.5 bg-slate-950/90 p-2 rounded border border-slate-700">
                      {/* Row 1: Ports 1..24 */}
                      <div className="grid grid-cols-12 sm:grid-cols-24 gap-1">
                        {ciscoPorts.slice(0, 24).map((port) => {
                          const visible = matchesFilter(port);
                          const isSelected = selectedPort?.id === port.id;
                          const color = getVlanColorHex(port.vlan_id);
                          return (
                            <button
                              key={port.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectPortItem(port);
                              }}
                              title={`${port.label} — ${port.connected_device} (${port.ip_address})`}
                              className={`relative h-7 rounded-[3px] border flex flex-col items-center justify-center text-[9px] font-mono transition-all cursor-pointer ${
                                isSelected
                                  ? 'ring-2 ring-white border-white scale-110 z-20 bg-slate-800'
                                  : visible
                                    ? 'bg-slate-900 border-slate-700 hover:border-slate-400'
                                    : 'opacity-20 bg-slate-950 border-slate-800'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mb-0.5 ${
                                  port.status === 'active' && ledBlink ? 'animate-pulse' : ''
                                }`}
                                style={{
                                  backgroundColor:
                                    port.status === 'active'
                                      ? color
                                      : port.status === 'standby'
                                        ? '#f59e0b'
                                        : '#334155',
                                }}
                              />
                              <span className="text-slate-200 leading-none">{port.port_number}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Row 2: Ports 25..48 */}
                      <div className="grid grid-cols-12 sm:grid-cols-24 gap-1">
                        {ciscoPorts.slice(24, 48).map((port) => {
                          const visible = matchesFilter(port);
                          const isSelected = selectedPort?.id === port.id;
                          const color = getVlanColorHex(port.vlan_id);
                          return (
                            <button
                              key={port.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectPortItem(port);
                              }}
                              title={`${port.label} — ${port.connected_device} (${port.ip_address})`}
                              className={`relative h-7 rounded-[3px] border flex flex-col items-center justify-center text-[9px] font-mono transition-all cursor-pointer ${
                                isSelected
                                  ? 'ring-2 ring-white border-white scale-110 z-20 bg-slate-800'
                                  : visible
                                    ? 'bg-slate-900 border-slate-700 hover:border-slate-400'
                                    : 'opacity-20 bg-slate-950 border-slate-800'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mb-0.5 ${
                                  port.status === 'active' && ledBlink ? 'animate-pulse' : ''
                                }`}
                                style={{
                                  backgroundColor:
                                    port.status === 'active'
                                      ? color
                                      : port.status === 'standby'
                                        ? '#f59e0b'
                                        : '#334155',
                                }}
                              />
                              <span className="text-slate-200 leading-none">{port.port_number}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4x 10G SFP+ Module */}
                    <div className="bg-slate-950/90 p-2 rounded border border-slate-700 flex lg:flex-col justify-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-mono text-slate-400 text-center">4× 10G SFP+</span>
                      <div className="grid grid-cols-4 lg:grid-cols-2 gap-1">
                        {[1, 2, 3, 4].map((sfp) => (
                          <div
                            key={sfp}
                            className={`w-7 h-5 rounded border flex items-center justify-center text-[9px] font-mono ${
                              sfp === 1
                                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                                : 'border-slate-700 bg-slate-900 text-slate-500'
                            }`}
                            title={sfp === 1 ? '10G Trunk ↔ TP-Link ER8411' : `SFP+ #${sfp}`}
                          >
                            S{sfp}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* U25: Patch Panel 2 */}
                <div
                  onClick={() => selectDeviceOnly('patch-panel-2')}
                  className={`rounded-lg border p-2.5 bg-slate-950/90 cursor-pointer transition-colors ${
                    selectedDevice?.id === 'patch-panel-2' ? 'border-cyan-400' : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-mono font-bold text-slate-300">U25 · PATCH PANEL #2 (24-PORT CAT6)</span>
                    <span className="text-slate-400">16 كاميرا Hikvision · ZKTeco البصمة · UniFi Wi-Fi · السيرفرات</span>
                  </div>
                  <div className="grid grid-cols-12 sm:grid-cols-24 gap-1">
                    {Array.from({ length: 24 }, (_, idx) => {
                      const swPortNum = 17 + idx; // maps 1..24 on PP2 to switch ports 17..40
                      const linked = ciscoPorts.find((p) => p.port_number === swPortNum);
                      const isCam = linked?.vlan_id === 20;
                      const isServer = linked?.vlan_id === 50;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (linked) selectPortItem(linked);
                          }}
                          title={`PP2-${String(idx + 1).padStart(2, '0')} → ${linked?.connected_device || ''}`}
                          className={`h-5 rounded-[3px] border text-[9px] font-mono flex items-center justify-center cursor-pointer ${
                            isCam
                              ? 'bg-purple-500/20 border-purple-500/60 text-purple-200'
                              : isServer
                                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200'
                                : 'bg-slate-900 border-slate-700 text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* U24: Dell PowerEdge R640 + HP Z440 */}
                <div
                  onClick={() => selectDeviceOnly('dell-r640')}
                  className={`rounded-lg border p-3 bg-slate-900 cursor-pointer transition-colors ${
                    selectedDevice?.id === 'dell-r640' ? 'border-cyan-400' : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300">U24</span>
                      <HardDrive className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white">
                        Dell PowerEdge R640 Platinum + HP Z440 #1 (Proxmox VE)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const p29 = ciscoPorts.find((p) => p.port_number === 29);
                          if (p29) selectPortItem(p29);
                        }}
                        className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/50 text-red-200 cursor-pointer"
                      >
                        iDRAC9 .10.9
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const p25 = ciscoPorts.find((p) => p.port_number === 25);
                          if (p25) selectPortItem(p25);
                        }}
                        className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 cursor-pointer"
                      >
                        4× LACP .10.10
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const p30 = ciscoPorts.find((p) => p.port_number === 30);
                          if (p30) selectPortItem(p30);
                        }}
                        className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 cursor-pointer"
                      >
                        Proxmox Z440 .10.20
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {Array.from({ length: 8 }, (_, bay) => (
                      <div
                        key={bay}
                        className="h-7 bg-slate-950 border border-slate-700 rounded px-1.5 flex items-center justify-between text-[9px] font-mono text-slate-300"
                      >
                        <span>BAY {bay + 1}</span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            bay < 5 ? 'bg-emerald-400' : 'bg-cyan-400'
                          } ${ledBlink ? 'animate-pulse' : ''}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* U23–U21: Explicit 3U Airflow Bay */}
                <div
                  onClick={() => selectDeviceOnly('rack-spacer-empty')}
                  className={`rounded-lg border border-dashed px-4 py-5 bg-slate-950/60 cursor-pointer transition-colors ${
                    selectedDevice?.id === 'rack-spacer-empty'
                      ? 'border-cyan-400'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono font-bold text-slate-300">U23 – U21 (3U AIRFLOW BAY)</span>
                    <span>فراغ عزل حراري وتهوية سحب الهواء بين السيرفرات ومنظومة المراقبة والسنترال</span>
                  </div>
                </div>

                {/* U20: Hikvision 16ch 4K NVR */}
                <div
                  onClick={() => selectDeviceOnly('nvr-16-ch')}
                  className={`rounded-lg border p-3 bg-slate-900 cursor-pointer transition-colors ${
                    selectedDevice?.id === 'nvr-16-ch' ? 'border-purple-400' : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-300">U20</span>
                      <Camera className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">
                        Hikvision 16-Channel 4K NVR (4TB WD Purple)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 border border-purple-500/40 px-2 py-0.5 rounded">
                        VLAN 20 · 192.168.20.100
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300">16/16 CAM 5MP (4 Audio)</span>
                    </div>
                  </div>
                </div>

                {/* U19: Grandstream UCM6304A ("604A") IP PBX */}
                <div
                  onClick={() => selectDeviceOnly('grandstream-pbx-604a')}
                  className={`rounded-lg border p-3 bg-slate-900 cursor-pointer transition-colors ${
                    selectedDevice?.id === 'grandstream-pbx-604a'
                      ? 'border-emerald-400'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-300">U19</span>
                      <PhoneCall className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">
                        Grandstream UCM6304A (&quot;604A&quot;) IP PBX [شغال فعلياً]
                      </span>
                    </div>
                    {/* Glowing Mini LCD */}
                    <div className="px-2.5 py-1 rounded bg-sky-950 border border-sky-500/50 text-[10px] font-mono text-sky-200">
                      LCD: 192.168.30.1 | FXO-1: LINE2 UP | EXT 100-116
                    </div>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {pbxPorts.map((port) => {
                      const isSelected = selectedPort?.id === port.id;
                      const visible = matchesFilter(port);
                      return (
                        <button
                          key={port.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectPortItem(port);
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-mono border cursor-pointer transition-all ${
                            isSelected
                              ? 'ring-2 ring-white bg-emerald-600 text-white border-white font-bold'
                              : visible
                                ? port.status === 'active'
                                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/25'
                                  : 'bg-slate-950 border-slate-700 text-slate-400'
                                : 'opacity-25 bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          {port.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* U18: TP-Link ER8411 Enterprise Router & Firewall */}
                <div
                  onClick={() => selectDeviceOnly('tplink-er8411-fw')}
                  className={`rounded-lg border p-3 bg-slate-900 cursor-pointer transition-colors ${
                    selectedDevice?.id === 'tplink-er8411-fw'
                      ? 'border-amber-400'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-300">U18</span>
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">
                        TP-Link ER8411 Enterprise Router &amp; Firewall [شغال فعلياً]
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                      192.168.10.1 · OPNsense مساند على Z440
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {er8411Ports.map((port) => {
                      const isSelected = selectedPort?.id === port.id;
                      const visible = matchesFilter(port);
                      return (
                        <button
                          key={port.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectPortItem(port);
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono border cursor-pointer transition-all ${
                            isSelected
                              ? 'ring-2 ring-white bg-amber-500 text-slate-950 border-white font-bold'
                              : visible
                                ? port.status === 'active'
                                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 hover:bg-amber-500/30'
                                  : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                                : 'opacity-25 bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          {port.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom / Added Rack Devices */}
                {customExtraDevices.map((dev) => (
                  <div
                    key={dev.id}
                    onClick={() => selectDeviceOnly(dev.id)}
                    className={`rounded-lg border p-2.5 bg-slate-900 cursor-pointer flex items-center justify-between ${
                      selectedDevice?.id === dev.id ? 'border-cyan-400' : 'border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300">
                        U{dev.u_position_start}
                      </span>
                      <span className="text-xs font-bold text-white">{dev.arabic_name}</span>
                      <span className="text-[11px] font-mono text-slate-400">{dev.model}</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-300">{dev.ip_management}</span>
                  </div>
                ))}

                {/* Bottom PDU + UPS */}
                <div className="rounded-lg border border-slate-700 bg-slate-950 p-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-400">U02–U01</span>
                    <span className="text-slate-200 font-semibold">
                      وحدة PDU سيرفرية 8 منافذ (موردة) + UPS 1500VA (قيد التوريد)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 8 }, (_, idx) => (
                      <span
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-sm border ${
                          idx < 6
                            ? 'bg-emerald-500/40 border-emerald-400'
                            : 'bg-slate-800 border-slate-600'
                        }`}
                        title={`PDU Outlet #${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Glass Door Tint Overlay */}
              {glassDoor && (
                <div
                  className="pointer-events-none absolute inset-0 z-30 border-4 border-sky-400/20"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(186,230,253,0.08) 0%, rgba(15,23,42,0.18) 50%, rgba(186,230,253,0.06) 100%)',
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Live Port & Device Inspector Drawer */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4 sticky top-4">
          {selectedPort && !editingPort && (
            <>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[11px] font-mono font-bold text-blue-700">
                    PORT INSPECTOR · {selectedPort.label}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedPort.connected_device}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedPort.user_endpoint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPort({ ...selectedPort })}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل المنفذ</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">الحالة</span>
                  <span
                    className={`font-bold ${
                      selectedPort.status === 'active'
                        ? 'text-emerald-700'
                        : selectedPort.status === 'standby'
                          ? 'text-amber-700'
                          : 'text-slate-600'
                    }`}
                  >
                    {selectedPort.status === 'active'
                      ? 'نشط ومتصل'
                      : selectedPort.status === 'standby'
                        ? 'احتياطي / جاهز'
                        : 'متاح فارغ'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">الشبكة VLAN</span>
                  <span className="font-bold text-slate-900">{selectedPort.vlan_name}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">عنوان IP</span>
                  <span className="font-mono font-bold text-slate-900" dir="ltr">
                    {selectedPort.ip_address || '—'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">عنوان MAC</span>
                  <span className="font-mono font-semibold text-slate-700" dir="ltr">
                    {selectedPort.mac_address || '—'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">السرعة والربط</span>
                  <span className="font-mono font-semibold text-slate-800" dir="ltr">
                    {selectedPort.speed_duplex}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">الباتش بانل / PoE</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedPort.patch_panel_cross_port
                      ? `PP #${selectedPort.patch_panel_cross_port}`
                      : 'مباشر'}{' '}
                    · {selectedPort.poe_watts}W
                  </span>
                </div>
              </div>

              {selectedPort.notes && (
                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">ملاحظات هندسية:</span>
                  {selectedPort.notes}
                </div>
              )}
            </>
          )}

          {/* Inline Edit Port Form */}
          {editingPort && (
            <form onSubmit={handleSavePortEdit} className="space-y-3 pb-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  تعديل منفذ {editingPort.label}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingPort(null)}
                  className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الجهاز المتصل</label>
                <input
                  type="text"
                  required
                  value={editingPort.connected_device}
                  onChange={(e) =>
                    setEditingPort({ ...editingPort, connected_device: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الحالة</label>
                  <select
                    value={editingPort.status}
                    onChange={(e) =>
                      setEditingPort({
                        ...editingPort,
                        status: e.target.value as RackPort['status'],
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="active">نشط (active)</option>
                    <option value="standby">احتياطي (standby)</option>
                    <option value="free">متاح (free)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">IP Address</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingPort.ip_address}
                    onChange={(e) => setEditingPort({ ...editingPort, ip_address: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg text-left"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الموقع / المستخدم</label>
                <input
                  type="text"
                  value={editingPort.user_endpoint}
                  onChange={(e) => setEditingPort({ ...editingPort, user_endpoint: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ملاحظات</label>
                <input
                  type="text"
                  value={editingPort.notes}
                  onChange={(e) => setEditingPort({ ...editingPort, notes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#1E3A5F] hover:bg-[#162d4a] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ تعديلات المنفذ'}</span>
              </button>
            </form>
          )}

          {/* Selected Rack Device Card */}
          {selectedDevice && (
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  DEVICE · U{selectedDevice.u_position_start} ({selectedDevice.u_height}U)
                </span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">
                  {selectedDevice.power_watts}W · {selectedDevice.operating_temp_c}°C
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{selectedDevice.arabic_name}</h4>
              <p className="text-xs font-mono text-slate-600" dir="ltr">
                {selectedDevice.model} · IP: {selectedDevice.ip_management}
              </p>
              {selectedDevice.notes && (
                <p className="text-xs text-slate-600 leading-relaxed">{selectedDevice.notes}</p>
              )}
            </div>
          )}

          {/* Quick Jump Shortcuts */}
          <div className="pt-3 border-t border-slate-200">
            <p className="text-[11px] font-semibold text-slate-500 mb-2">وصول سريع للمنافذ المحورية:</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'c3850-p7', label: 'Gi1/0/7 طابعة M404n' },
                { id: 'er8411-p1', label: 'ER8411 WAN1 ADSL' },
                { id: 'er8411-p2', label: 'ER8411 WAN2 VF 5G' },
                { id: 'gs604a-p3', label: '604A FXO-1 خط 2' },
                { id: 'c3850-p25', label: 'Gi1/0/25 سيرفر R640' },
                { id: 'c3850-p17', label: 'Gi1/0/17 NVR 4K' },
              ].map((s) => {
                const target = ports.find((p) => p.id === s.id);
                if (!target) return null;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectPortItem(target)}
                    className={`px-2 py-1 rounded text-[11px] font-medium border cursor-pointer ${
                      selectedPort?.id === s.id
                        ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Device Modal */}
      {addingDevice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleCreateDevice}
            className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">إضافة جهاز جديد لكابينة Perla 27U</h3>
              <button
                type="button"
                onClick={() => setAddingDevice(false)}
                className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">اسم الجهاز (عربي)</label>
              <input
                type="text"
                required
                value={newDev.arabic_name}
                onChange={(e) => setNewDev({ ...newDev, arabic_name: e.target.value, name: e.target.value })}
                placeholder="مثال: وحدة UPS 1500VA أو سيرفر تخزين NAS"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الموديل</label>
                <input
                  type="text"
                  dir="ltr"
                  value={newDev.model}
                  onChange={(e) => setNewDev({ ...newDev, model: e.target.value })}
                  placeholder="APC Smart-UPS 1500"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-left"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">موقع الـ U (من 3 إلى 17)</label>
                <input
                  type="number"
                  min={1}
                  max={27}
                  value={newDev.u_position_start}
                  onChange={(e) => setNewDev({ ...newDev, u_position_start: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">IP الإدارة</label>
                <input
                  type="text"
                  dir="ltr"
                  value={newDev.ip_management}
                  onChange={(e) => setNewDev({ ...newDev, ip_management: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg text-left"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">القدرة (Watts)</label>
                <input
                  type="number"
                  value={newDev.power_watts}
                  onChange={(e) => setNewDev({ ...newDev, power_watts: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ملاحظات</label>
              <input
                type="text"
                value={newDev.notes}
                onChange={(e) => setNewDev({ ...newDev, notes: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddingDevice(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 bg-[#1E3A5F] hover:bg-[#162d4a] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                {saving ? 'جاري الإضافة...' : 'إضافة وحفظ في الراك'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
