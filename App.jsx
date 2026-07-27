"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertCircle, Blocks, CalendarDays, CheckCircle2, CircleDollarSign, ClipboardList,
  Droplets, Gauge, Home, Leaf, LoaderCircle, Menu, Package, Plus, RefreshCw,
  Search, ShoppingCart, Sprout, Tractor, Users, Warehouse, Wrench, X,
  ShieldCheck, LogOut, UserPlus, History
} from "lucide-react";

const SUPABASE_URL = "https://itlngocavjyrjgeblsmq.supabase.co";
const SUPABASE_KEY = "sb_publishable_sV6zuknGzOavoAdqW2o1MQ_6GzpVKxE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const NAV = [
  ["dashboard", "Dashboard", Home],
  ["blocks", "Farm Blocks", Blocks],
  ["fields", "Fields", Tractor],
  ["nursery", "Nursery", Sprout],
  ["crops", "Crop Cycles", Leaf],
  ["activities", "Field Activities", Wrench],
  ["calendar", "Work Calendar", CalendarDays],
  ["workers", "Workers", Users],
  ["irrigation", "Irrigation", Droplets],
  ["sprays", "Spray Records", Gauge],
  ["inventory", "Inventory", Warehouse],
  ["harvests", "Harvest & Sales", ShoppingCart],
  ["equipment", "Equipment", Wrench],
  ["expenses", "Financials", CircleDollarSign],
  ["reports", "Field Timeline", ClipboardList],
  ["users", "Users & Access", ShieldCheck]
];

const ROLE_LABELS = {
  owner: "Owner / Admin", manager: "Farm Manager", storekeeper: "Storekeeper",
  supervisor: "Field Supervisor", viewer: "Viewer"
};
const WRITE_ROLES = new Set(["owner", "manager", "storekeeper", "supervisor"]);

const emptyBlock = { name: "", area: "" };
const emptyField = { name: "", area: "", blockId: "", status: "available" };
const emptyBatch = {
  crop_name: "", variety: "", sowing_date: new Date().toISOString().slice(0,10),
  trays: "", cells_per_tray: "128", seeds_sown: "", germinated: "",
  losses: "0", expected_transplant_date: "", status: "sown", notes: ""
};
const emptyCycle = {
  field_id: "", crop_name: "", variety: "", source_batch_id: "",
  planting_date: new Date().toISOString().slice(0,10),
  expected_harvest_date: "", status: "planned", area_acres: "", notes: ""
};

const emptyActivity = {
  field_id: "", crop_cycle_id: "", activity_type: "irrigation",
  scheduled_date: new Date().toISOString().slice(0,10),
  completed_date: "", status: "planned", worker_id: "",
  input_name: "", quantity: "", unit: "", labour_cost: "", input_cost: "", notes: ""
};

const emptyWorker = {
  full_name: "", phone: "", role: "general worker",
  daily_rate: "", status: "active"
};

const emptyIrrigation = {
  field_id: "", crop_cycle_id: "", irrigation_date: new Date().toISOString().slice(0,10),
  water_source: "River", system_type: "Travelling reel", equipment_id: "",
  start_time: "", end_time: "", duration_hours: "", pressure_bar: "",
  water_volume_m3: "", fuel_litres: "", cost: "", notes: ""
};

const emptySpray = {
  field_id: "", crop_cycle_id: "", spray_date: new Date().toISOString().slice(0,10),
  product_name: "", active_ingredient: "", target_problem: "", dose: "", unit: "ml/L",
  quantity_used: "", phi_days: "", rei_hours: "", weather: "", worker_id: "",
  cost: "", notes: ""
};

const emptyInventory = {
  item_name: "", category: "Fertilizer", unit: "kg", quantity_on_hand: "",
  reorder_level: "", unit_cost: "", supplier: "", notes: ""
};

const emptyHarvest = {
  field_id: "", crop_cycle_id: "", harvest_date: new Date().toISOString().slice(0,10),
  grade: "A", quantity: "", unit: "kg", waste_quantity: "", buyer: "",
  price_per_unit: "", notes: ""
};

const emptyEquipment = {
  name: "", category: "Pump", model: "", serial_number: "", status: "active",
  service_interval_hours: "", current_hours: "", last_service_date: "",
  next_service_date: "", notes: ""
};

function friendlyError(error) {
  const message = error?.message || String(error);
  if (message.includes("row-level security")) {
    return "Supabase blocked this action through Row Level Security. Run the V5 database-upgrade.sql script.";
  }
  if (message.includes("column") && message.includes("does not exist")) {
    return "The V5 database upgrade has not been run yet. Run database-upgrade.sql in Supabase SQL Editor.";
  }
  if (message.includes('crop_id') && message.includes('not-null')) {
    return "The original crop_cycles table still requires crop_id. Run the V5.2 database-upgrade.sql script.";
  }
  return message;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [farmUsers, setFarmUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [farm, setFarm] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [fields, setFields] = useState([]);
  const [batches, setBatches] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [irrigation, setIrrigation] = useState([]);
  const [sprays, setSprays] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [timelineField, setTimelineField] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("all");
  const [status, setStatus] = useState({ type: "loading", message: "Connecting to Supabase…" });
  const [modal, setModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    setStatus({ type: "loading", message: "Loading live farm records…" });
    try {
      const { data: farms, error: farmsError } = await supabase
        .from("farms").select("*").order("created_at", { ascending: true }).limit(1);
      if (farmsError) throw farmsError;

      let activeFarm = farms?.[0];
      if (!activeFarm) {
        const { data, error } = await supabase.from("farms").insert({ name: "My Farm" }).select().single();
        if (error) throw error;
        activeFarm = data;
      }
      setFarm(activeFarm);

      const [{ data: myProfile }, { data: userRows }, { data: logRows }] = await Promise.all([
        supabase.from("farm_profiles").select("*").eq("id", session.user.id).maybeSingle(),
        supabase.from("farm_profiles").select("*").order("full_name"),
        supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(150)
      ]);
      setProfile(myProfile || null);
      setFarmUsers(userRows || []);
      setAuditLogs(logRows || []);

      const { data: blockRows, error: blockError } = await supabase
        .from("farm_blocks").select("*").eq("farm_id", activeFarm.id).order("name");
      if (blockError) throw blockError;

      const { data: fieldRows, error: fieldError } = await supabase
        .from("fields").select("*").order("name");
      if (fieldError) throw fieldError;

      const blockIds = new Set((blockRows || []).map(b => b.id));
      const farmFields = (fieldRows || []).filter(f => blockIds.has(f.farm_block_id));
      const fieldIds = new Set(farmFields.map(f => f.id));

      const { data: batchRows, error: batchError } = await supabase
        .from("propagation_batches").select("*").eq("farm_id", activeFarm.id).order("sowing_date", { ascending: false });
      if (batchError) throw batchError;

      const { data: cycleRows, error: cycleError } = await supabase
        .from("crop_cycles").select("*").order("planting_date", { ascending: false });
      if (cycleError) throw cycleError;

      const { data: activityRows, error: activityError } = await supabase
        .from("field_activities").select("*").eq("farm_id", activeFarm.id)
        .order("scheduled_date", { ascending: false });
      if (activityError) throw activityError;

      const { data: workerRows, error: workerError } = await supabase
        .from("workers").select("*").eq("farm_id", activeFarm.id).order("full_name");
      if (workerError) throw workerError;

      const queries = await Promise.all([
        supabase.from("irrigation_records").select("*").eq("farm_id", activeFarm.id).order("irrigation_date", { ascending: false }),
        supabase.from("spray_records").select("*").eq("farm_id", activeFarm.id).order("spray_date", { ascending: false }),
        supabase.from("inventory_items").select("*").eq("farm_id", activeFarm.id).order("item_name"),
        supabase.from("harvest_records").select("*").eq("farm_id", activeFarm.id).order("harvest_date", { ascending: false }),
        supabase.from("equipment").select("*").eq("farm_id", activeFarm.id).order("name")
      ]);
      const firstError = queries.find(q => q.error)?.error;
      if (firstError) throw firstError;
      const [irrigationRows, sprayRows, inventoryRows, harvestRows, equipmentRows] = queries.map(q => q.data || []);

      setBlocks(blockRows || []);
      setFields(farmFields);
      setBatches(batchRows || []);
      setCycles((cycleRows || []).filter(c => fieldIds.has(c.field_id)));
      setActivities(activityRows || []);
      setWorkers(workerRows || []);
      setIrrigation(irrigationRows);
      setSprays(sprayRows);
      setInventory(inventoryRows);
      setHarvests(harvestRows);
      setEquipment(equipmentRows);
      setTimelineField(v => v || farmFields[0]?.id || "");
      setStatus({ type: "success", message: "Connected securely. Live V7.2 farm data loaded." });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    }
  }, [session]);

  useEffect(() => { if (session) loadData(); }, [session, loadData]);

  const role = profile?.role || "viewer";
  const canWrite = WRITE_ROLES.has(role) && profile?.status !== "inactive";
  const canManageUsers = role === "owner";
  const canSeeFinancials = ["owner", "manager"].includes(role);
  const canWriteModule = module => {
    if (!canWrite) return false;
    if (["owner","manager"].includes(role)) return true;
    if (role === "storekeeper") return ["inventory","equipment"].includes(module);
    if (role === "supervisor") return ["nursery","crops","activities","calendar","workers","irrigation","sprays","harvests"].includes(module);
    return false;
  };
  const typeModule = {block:"blocks",field:"fields",batch:"nursery",cycle:"crops",activity:"activities",worker:"workers",irrigation:"irrigation",spray:"sprays",inventory:"inventory",harvest:"harvests",equipment:"equipment"};
  const tableModule = {farm_blocks:"blocks",fields:"fields",propagation_batches:"nursery",crop_cycles:"crops",field_activities:"activities",workers:"workers",irrigation_records:"irrigation",spray_records:"sprays",inventory_items:"inventory",harvest_records:"harvests",equipment:"equipment"};

  const metrics = useMemo(() => {
    const totalArea = fields.reduce((sum, f) => sum + Number(f.area_acres || 0), 0);
    const activeFields = fields.filter(f => ["growing","active","planted"].includes(String(f.status || "").toLowerCase())).length;
    const seedlings = batches.reduce((sum, b) => sum + Math.max(0, Number(b.germinated || 0) - Number(b.losses || 0)), 0);
    const ready = batches.filter(b => String(b.status).toLowerCase() === "ready").length;
    const today = new Date().toISOString().slice(0,10);
    const dueToday = activities.filter(a => a.scheduled_date === today && a.status !== "completed").length;
    const overdue = activities.filter(a => a.scheduled_date && a.scheduled_date < today && a.status !== "completed").length;
    const lowStock = inventory.filter(i => Number(i.quantity_on_hand || 0) <= Number(i.reorder_level || 0)).length;
    const revenue = harvests.reduce((s,h) => s + Number(h.quantity || 0) * Number(h.price_per_unit || 0), 0);
    const fieldCosts = activities.reduce((s,a) => s + Number(a.labour_cost || 0) + Number(a.input_cost || 0), 0)
      + irrigation.reduce((s,r) => s + Number(r.cost || 0), 0)
      + sprays.reduce((s,r) => s + Number(r.cost || 0), 0);
    return { totalArea, activeFields, seedlings, ready, dueToday, overdue, lowStock, revenue, fieldCosts, profit: revenue-fieldCosts };
  }, [fields, batches, activities, inventory, harvests, irrigation, sprays]);

  const blockName = id => blocks.find(b => b.id === id)?.name || "Unknown block";
  const fieldName = id => fields.find(f => f.id === id)?.name || "Unknown field";
  const batchName = id => {
    const b = batches.find(x => x.id === id);
    return b ? `${b.crop_name}${b.variety ? " · " + b.variety : ""}` : "Direct planting";
  };
  const workerName = id => workers.find(w => w.id === id)?.full_name || "Unassigned";
  const cycleName = id => {
    const c = cycles.find(x => x.id === id);
    return c ? `${c.crop_name}${c.variety ? " · " + c.variety : ""}` : "No crop cycle";
  };
  const equipmentName = id => equipment.find(e => e.id === id)?.name || "Not selected";
  const money = value => Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "KES", maximumFractionDigits: 0 });
  const matchesSearch = (...values) => {
    const query = searchTerm.trim().toLowerCase();
    return !query || values.some(value => String(value ?? "").toLowerCase().includes(query));
  };
  const serviceDue = equipment.filter(e => {
    const today = new Date().toISOString().slice(0,10);
    const dueByDate = e.next_service_date && e.next_service_date <= today;
    const interval = Number(e.service_interval_hours || 0);
    const hours = Number(e.current_hours || 0);
    return e.status === "service due" || dueByDate || (interval > 0 && hours >= interval);
  });

  function open(type) {
    if (!canWriteModule(typeModule[type])) return setStatus({type:"error",message:"Your role cannot add records in this section."});
    setEditingId(null);
    if (type === "block") setForm(emptyBlock);
    if (type === "field") setForm({ ...emptyField, blockId: blocks[0]?.id || "" });
    if (type === "batch") setForm(emptyBatch);
    if (type === "cycle") setForm({
      ...emptyCycle,
      field_id: fields[0]?.id || "",
      source_batch_id: batches.find(b => b.status === "ready")?.id || "",
      area_acres: fields[0]?.area_acres || ""
    });
    if (type === "activity") setForm({
      ...emptyActivity,
      field_id: fields[0]?.id || "",
      crop_cycle_id: cycles.find(c => c.field_id === fields[0]?.id)?.id || "",
      worker_id: workers[0]?.id || ""
    });
    if (type === "worker") setForm(emptyWorker);
    if (type === "irrigation") setForm({ ...emptyIrrigation, field_id: fields[0]?.id || "", crop_cycle_id: cycles.find(c => c.field_id === fields[0]?.id)?.id || "", equipment_id: equipment[0]?.id || "" });
    if (type === "spray") setForm({ ...emptySpray, field_id: fields[0]?.id || "", crop_cycle_id: cycles.find(c => c.field_id === fields[0]?.id)?.id || "", worker_id: workers[0]?.id || "" });
    if (type === "inventory") setForm(emptyInventory);
    if (type === "harvest") setForm({ ...emptyHarvest, field_id: fields[0]?.id || "", crop_cycle_id: cycles.find(c => c.field_id === fields[0]?.id)?.id || "" });
    if (type === "equipment") setForm(emptyEquipment);
    setModal(type);
  }

  function edit(type, item) {
    if (!canWriteModule(typeModule[type])) return setStatus({type:"error",message:"Your role cannot edit this section."});
    setEditingId(item.id);
    if (type === "block") setForm({ name: item.name || "", area: item.area_acres || "" });
    if (type === "field") setForm({
      name: item.name || "", area: item.area_acres || "",
      blockId: item.farm_block_id || "", status: item.status || "available"
    });
    if (type === "batch") setForm({
      crop_name: item.crop_name || "", variety: item.variety || "",
      sowing_date: item.sowing_date || "", trays: item.trays || "",
      cells_per_tray: item.cells_per_tray || "", seeds_sown: item.seeds_sown || "",
      germinated: item.germinated || "", losses: item.losses || "0",
      expected_transplant_date: item.expected_transplant_date || "",
      status: item.status || "sown", notes: item.notes || ""
    });
    if (type === "cycle") setForm({
      field_id: item.field_id || "", crop_name: item.crop_name || "",
      variety: item.variety || "", source_batch_id: item.source_batch_id || "",
      planting_date: item.planting_date || "",
      expected_harvest_date: item.expected_harvest_date || "",
      status: item.status || "planned", area_acres: item.area_acres || "",
      notes: item.notes || ""
    });
    if (type === "activity") setForm({
      field_id: item.field_id || "", crop_cycle_id: item.crop_cycle_id || "",
      activity_type: item.activity_type || "irrigation",
      scheduled_date: item.scheduled_date || "", completed_date: item.completed_date || "",
      status: item.status || "planned", worker_id: item.worker_id || "",
      input_name: item.input_name || "", quantity: item.quantity || "",
      unit: item.unit || "", labour_cost: item.labour_cost || "",
      input_cost: item.input_cost || "", notes: item.notes || ""
    });
    if (type === "worker") setForm({
      full_name: item.full_name || "", phone: item.phone || "",
      role: item.role || "", daily_rate: item.daily_rate || "",
      status: item.status || "active"
    });
    if (type === "irrigation") setForm({ ...emptyIrrigation, ...item });
    if (type === "spray") setForm({ ...emptySpray, ...item });
    if (type === "inventory") setForm({ ...emptyInventory, ...item });
    if (type === "harvest") setForm({ ...emptyHarvest, ...item });
    if (type === "equipment") setForm({ ...emptyEquipment, ...item });
    setModal(type);
  }

  async function save(event) {
    event.preventDefault();
    if (!canWriteModule(typeModule[modal])) return;
    setSaving(true);
    try {
      if (modal === "block") {
        const payload = { farm_id: farm.id, name: form.name.trim(), area_acres: Number(form.area) };
        const { error } = editingId
          ? await supabase.from("farm_blocks").update(payload).eq("id", editingId)
          : await supabase.from("farm_blocks").insert(payload);
        if (error) throw error;
      }
      if (modal === "field") {
        const payload = {
          farm_block_id: form.blockId, name: form.name.trim(),
          area_acres: Number(form.area), status: form.status
        };
        const { error } = editingId
          ? await supabase.from("fields").update(payload).eq("id", editingId)
          : await supabase.from("fields").insert(payload);
        if (error) throw error;
      }
      if (modal === "batch") {
        const calculatedSeeds = Number(form.seeds_sown || 0) ||
          (Number(form.trays || 0) * Number(form.cells_per_tray || 0));
        const batchCode = `PB-${String(form.sowing_date || "").replaceAll("-","")}-${Date.now().toString().slice(-5)}`;
        const payload = {
          farm_id: farm.id,
          crop_name: form.crop_name.trim(),
          variety: form.variety.trim() || null,
          sowing_date: form.sowing_date,
          trays: Number(form.trays || 0),
          cells_per_tray: Number(form.cells_per_tray || 0),
          seeds_sown: calculatedSeeds,
          germinated: Number(form.germinated || 0),
          losses: Number(form.losses || 0),
          expected_transplant_date: form.expected_transplant_date || null,
          status: form.status,
          notes: form.notes.trim() || null
        };
        if (!editingId) payload.batch_code = batchCode;
        const { error } = editingId
          ? await supabase.from("propagation_batches").update(payload).eq("id", editingId)
          : await supabase.from("propagation_batches").insert(payload);
        if (error) throw error;
      }
      if (modal === "cycle") {
        const payload = {
          field_id: form.field_id,
          crop_name: form.crop_name.trim(),
          variety: form.variety.trim() || null,
          source_batch_id: form.source_batch_id || null,
          planting_date: form.planting_date,
          expected_harvest_date: form.expected_harvest_date || null,
          status: form.status,
          area_acres: Number(form.area_acres || 0),
          notes: form.notes.trim() || null
        };
        const { error } = editingId
          ? await supabase.from("crop_cycles").update(payload).eq("id", editingId)
          : await supabase.from("crop_cycles").insert(payload);
        if (error) throw error;
        if (!editingId && form.source_batch_id) {
          const { error: batchUpdateError } = await supabase
            .from("propagation_batches")
            .update({ status: "transplanted" })
            .eq("id", form.source_batch_id);
          if (batchUpdateError) throw batchUpdateError;
        }
      }
      if (modal === "activity") {
        const payload = {
          farm_id: farm.id,
          field_id: form.field_id,
          crop_cycle_id: form.crop_cycle_id || null,
          activity_type: form.activity_type,
          scheduled_date: form.scheduled_date,
          completed_date: form.completed_date || null,
          status: form.status,
          worker_id: form.worker_id || null,
          input_name: form.input_name.trim() || null,
          quantity: form.quantity ? Number(form.quantity) : null,
          unit: form.unit.trim() || null,
          labour_cost: Number(form.labour_cost || 0),
          input_cost: Number(form.input_cost || 0),
          notes: form.notes.trim() || null
        };
        const { error } = editingId
          ? await supabase.from("field_activities").update(payload).eq("id", editingId)
          : await supabase.from("field_activities").insert(payload);
        if (error) throw error;
      }
      if (modal === "worker") {
        const payload = {
          farm_id: farm.id,
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
          role: form.role.trim() || null,
          daily_rate: Number(form.daily_rate || 0),
          status: form.status
        };
        const { error } = editingId
          ? await supabase.from("workers").update(payload).eq("id", editingId)
          : await supabase.from("workers").insert(payload);
        if (error) throw error;
      }
      if (modal === "irrigation") {
        const payload = { farm_id:farm.id, field_id:form.field_id, crop_cycle_id:form.crop_cycle_id||null,
          irrigation_date:form.irrigation_date, water_source:form.water_source, system_type:form.system_type,
          equipment_id:form.equipment_id||null, start_time:form.start_time||null, end_time:form.end_time||null,
          duration_hours:Number(form.duration_hours||0), pressure_bar:Number(form.pressure_bar||0),
          water_volume_m3:Number(form.water_volume_m3||0), fuel_litres:Number(form.fuel_litres||0),
          cost:Number(form.cost||0), notes:form.notes?.trim()||null };
        const {error}=editingId?await supabase.from("irrigation_records").update(payload).eq("id",editingId):await supabase.from("irrigation_records").insert(payload);
        if(error) throw error;
      }
      if (modal === "spray") {
        const payload = { farm_id:farm.id, field_id:form.field_id, crop_cycle_id:form.crop_cycle_id||null,
          spray_date:form.spray_date, product_name:form.product_name.trim(), active_ingredient:form.active_ingredient?.trim()||null,
          target_problem:form.target_problem?.trim()||null, dose:form.dose?.trim()||null, unit:form.unit?.trim()||null,
          quantity_used:Number(form.quantity_used||0), phi_days:Number(form.phi_days||0), rei_hours:Number(form.rei_hours||0),
          weather:form.weather?.trim()||null, worker_id:form.worker_id||null, cost:Number(form.cost||0), notes:form.notes?.trim()||null };
        const {error}=editingId?await supabase.from("spray_records").update(payload).eq("id",editingId):await supabase.from("spray_records").insert(payload);
        if(error) throw error;
      }
      if (modal === "inventory") {
        const payload = { farm_id:farm.id, item_name:form.item_name.trim(), category:form.category, unit:form.unit,
          quantity_on_hand:Number(form.quantity_on_hand||0), reorder_level:Number(form.reorder_level||0),
          unit_cost:Number(form.unit_cost||0), supplier:form.supplier?.trim()||null, notes:form.notes?.trim()||null };
        const {error}=editingId?await supabase.from("inventory_items").update(payload).eq("id",editingId):await supabase.from("inventory_items").insert(payload);
        if(error) throw error;
      }
      if (modal === "harvest") {
        const payload = { farm_id:farm.id, field_id:form.field_id, crop_cycle_id:form.crop_cycle_id||null,
          harvest_date:form.harvest_date, grade:form.grade, quantity:Number(form.quantity||0), unit:form.unit,
          waste_quantity:Number(form.waste_quantity||0), buyer:form.buyer?.trim()||null,
          price_per_unit:Number(form.price_per_unit||0), notes:form.notes?.trim()||null };
        const {error}=editingId?await supabase.from("harvest_records").update(payload).eq("id",editingId):await supabase.from("harvest_records").insert(payload);
        if(error) throw error;
      }
      if (modal === "equipment") {
        const payload = { farm_id:farm.id, name:form.name.trim(), category:form.category, model:form.model?.trim()||null,
          serial_number:form.serial_number?.trim()||null, status:form.status,
          service_interval_hours:Number(form.service_interval_hours||0), current_hours:Number(form.current_hours||0),
          last_service_date:form.last_service_date||null, next_service_date:form.next_service_date||null, notes:form.notes?.trim()||null };
        const {error}=editingId?await supabase.from("equipment").update(payload).eq("id",editingId):await supabase.from("equipment").insert(payload);
        if(error) throw error;
      }
      setModal(null);
      setEditingId(null);
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setSaving(false);
    }
  }

  async function updateBatchStatus(id, newStatus) {
    if (!canWriteModule("nursery")) return;
    try {
      const { error } = await supabase.from("propagation_batches").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    }
  }

  async function completeActivity(id) {
    if (!canWriteModule("activities")) return;
    try {
      const { error } = await supabase.from("field_activities").update({
        status: "completed",
        completed_date: new Date().toISOString().slice(0,10)
      }).eq("id", id);
      if (error) throw error;
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    }
  }

  async function deleteItem(table, id, label) {
    if (!canWriteModule(tableModule[table])) return setStatus({type:"error",message:"Your role cannot delete records in this section."});
    const confirmed = window.confirm(`Delete ${label}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    }
  }

  async function transplantBatch(batch) {
    if (!canWriteModule("crops")) return;
    const availableField = fields[0]?.id || "";
    setPage("crops");
    setEditingId(null);
    setForm({
      ...emptyCycle,
      field_id: availableField,
      source_batch_id: batch.id,
      crop_name: batch.crop_name || "",
      variety: batch.variety || "",
      area_acres: fields.find(f => f.id === availableField)?.area_acres || ""
    });
    setModal("cycle");
  }

  async function updateUser(userId, patch) {
    if (!canManageUsers) return;
    const { error } = await supabase.from("farm_profiles").update(patch).eq("id", userId);
    if (error) setStatus({ type: "error", message: friendlyError(error) });
    else await loadData();
  }

  if (authLoading) return <div className="auth-screen"><LoaderCircle className="spin"/><p>Opening Farm Manager…</p></div>;
  if (!session) return <AuthScreen />;

  const visibleNav = NAV.filter(([id]) =>
    (id !== "users" || canManageUsers) &&
    (id !== "expenses" || canSeeFinancials)
  );

  return (
    <div className={`app-shell ${canWriteModule(page) ? "" : "readonly"}`}>
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sprout size={25}/></div>
          <div><strong>Farm Manager</strong><span>Nursery & production</span></div>
          <button className="mobile-close" onClick={() => setMobileNav(false)}><X/></button>
        </div>
        <nav>{visibleNav.map(([id,label,Icon]) => (
          <button key={id} className={page===id ? "active" : ""} onClick={() => {setPage(id);setSearchTerm("");setMobileNav(false)}}>
            <Icon size={19}/><span>{label}</span>
          </button>
        ))}</nav>
        <div className="signed-in">
          <span>{profile?.full_name || session.user.email}</span>
          <small>{ROLE_LABELS[role] || role}</small>
          <button onClick={() => supabase.auth.signOut()}><LogOut size={16}/> Sign out</button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)}><Menu/></button>
          <div><span className="eyebrow">{farm?.name || "MY FARM"}</span><h1>{NAV.find(n => n[0]===page)?.[1]}</h1></div>
          <div className="topbar-actions"><span className="role-badge">{ROLE_LABELS[role] || role}</span><button className="refresh-button" onClick={loadData}><RefreshCw size={18}/></button></div>
        </header>

        <StatusBanner status={status.type} message={status.message}/>

        {["blocks","fields","nursery","crops","activities","workers","irrigation","sprays","inventory","harvests","equipment"].includes(page) && <div className="module-toolbar">
          <div className="search-box"><Search size={17}/><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search this section…"/>{searchTerm && <button onClick={()=>setSearchTerm("")}>Clear</button>}</div>
        </div>}

        {page === "dashboard" && <>
          <section className="hero">
            <div><h2>Good afternoon, farmer.</h2><p>Track your farm from seed propagation through field production.</p></div>
            <div className="button-row">
              <button className="button secondary" disabled={!fields.length || !canWriteModule("irrigation")} onClick={() => open("irrigation")}><Plus size={17}/> Irrigation</button>
              <button className="button secondary" disabled={!fields.length || !canWriteModule("harvests")} onClick={() => open("harvest")}><Plus size={17}/> Harvest</button>
              <button className="button primary" disabled={!fields.length || !canWriteModule("activities")} onClick={() => open("activity")}><Plus size={17}/> Field activity</button>
            </div>
          </section>
          <section className="stats-grid">
            <Stat label="Farm blocks" value={blocks.length} detail="Management areas" onClick={() => setPage("blocks")}/>
            <Stat label="Fields" value={fields.length} detail={`${metrics.totalArea.toFixed(1)} acres mapped`} onClick={() => setPage("fields")}/>
            <Stat label="Activities today" value={metrics.dueToday} detail={`${metrics.overdue} overdue tasks`} onClick={() => setPage("calendar")}/>
            <Stat label="Low stock" value={metrics.lowStock} detail="Items at reorder level" onClick={() => setPage("inventory")}/>
            <Stat label="Revenue" value={money(metrics.revenue)} detail={`Profit ${money(metrics.profit)}`} onClick={() => setPage("expenses")}/>
          </section>
          <section className="alert-center">
            <button className={metrics.overdue ? "alert-tile urgent" : "alert-tile"} onClick={()=>setPage("calendar")}><AlertCircle size={18}/><span><strong>{metrics.overdue}</strong> overdue activities</span></button>
            <button className={metrics.ready ? "alert-tile attention" : "alert-tile"} onClick={()=>setPage("nursery")}><Sprout size={18}/><span><strong>{metrics.ready}</strong> batches ready</span></button>
            <button className={metrics.lowStock ? "alert-tile attention" : "alert-tile"} onClick={()=>setPage("inventory")}><Package size={18}/><span><strong>{metrics.lowStock}</strong> low-stock items</span></button>
            <button className={serviceDue.length ? "alert-tile urgent" : "alert-tile"} onClick={()=>setPage("equipment")}><Wrench size={18}/><span><strong>{serviceDue.length}</strong> service alerts</span></button>
          </section>
          <section className="split-grid">
            <Card title="Nursery batches" subtitle="Latest propagation activity" action="Open" onAction={() => setPage("nursery")}>
              {batches.slice(0,5).map(b => <Record key={b.id} Icon={Sprout} title={`${b.crop_name}${b.variety ? " · "+b.variety : ""}`}
                subtitle={`${b.sowing_date || "No date"} · ${Math.max(0, Number(b.germinated||0)-Number(b.losses||0))} live seedlings`}
                badge={b.status || "sown"}/>)}
              {!batches.length && <Empty text="No propagation batches yet."/>}
            </Card>
            <Card title="Crop cycles" subtitle="Field production" action="Open" onAction={() => setPage("crops")}>
              {cycles.slice(0,5).map(c => <Record key={c.id} Icon={Leaf} title={`${c.crop_name}${c.variety ? " · "+c.variety : ""}`}
                subtitle={`${fieldName(c.field_id)} · ${c.planting_date || "Not planted"}`} badge={c.status || "planned"}/>)}
              {!cycles.length && <Empty text="No crop cycles yet."/>}
            </Card>
          </section>
          <Card title="Production lifecycle" subtitle="Connected nursery-to-field traceability">
            <div className="lifecycle">{["Seed lot","Propagation","Seedlings","Transplant","Crop cycle","Harvest"].map((s,i) =>
              <div className="life-step" key={s}><span>{i+1}</span><b>{s}</b></div>)}</div>
          </Card>
        </>}

        {page === "blocks" && <SimplePage title="Farm Blocks" description="Group fields into farm management areas." button="Add block" onAdd={() => open("block")}>
          <Table headers={["Name","Area","Fields","Status"]}>
            {blocks.filter(b=>matchesSearch(b.name,b.notes)).map(b => <div className="table-row" key={b.id}><strong>{b.name}</strong><span>{Number(b.area_acres||0)} acres</span>
              <span>{fields.filter(f=>f.farm_block_id===b.id).length}</span><span className="row-actions"><span className="pill">Active</span><button className="small-action" onClick={() => edit("block", b)}>Edit</button><button className="small-action danger-action" onClick={() => deleteItem("farm_blocks", b.id, `farm block ${b.name}`)}>Delete</button></span></div>)}
          </Table>
        </SimplePage>}

        {page === "fields" && <SimplePage title="Fields" description="Manage individual production units." button="Add field" disabled={!blocks.length} onAdd={() => open("field")}>
          <Table headers={["Name","Block","Area","Status"]}>
            {fields.filter(f=>matchesSearch(f.name,f.status,blockName(f.farm_block_id))).map(f => <div className="table-row" key={f.id}><strong>{f.name}</strong><span>{blockName(f.farm_block_id)}</span>
              <span>{Number(f.area_acres||0)} acres</span><span className="row-actions"><span className="pill">{f.status||"available"}</span><button className="small-action" onClick={() => edit("field", f)}>Edit</button><button className="small-action danger-action" onClick={() => deleteItem("fields", f.id, `field ${f.name}`)}>Delete</button></span></div>)}
          </Table>
        </SimplePage>}

        {page === "nursery" && <SimplePage title="Nursery & Seed Propagation" description="Track sowing, germination, seedling losses and transplant readiness."
          button="New batch" onAdd={() => open("batch")}>
          <section className="nursery-summary">
            <Mini label="Batches" value={batches.length}/><Mini label="Live seedlings" value={metrics.seedlings}/>
            <Mini label="Ready" value={metrics.ready}/><Mini label="Average germination" value={averageGermination(batches)}/>
          </section>
          <div className="batch-grid">
            {batches.filter(b=>matchesSearch(b.crop_name,b.variety,b.batch_code,b.status)).map(b => {
              const live = Math.max(0, Number(b.germinated||0)-Number(b.losses||0));
              const rate = Number(b.seeds_sown||0) ? Math.round(Number(b.germinated||0)/Number(b.seeds_sown)*100) : 0;
              return <article className="batch-card" key={b.id}>
                <div className="batch-top"><div><span className="eyebrow">{b.sowing_date || "NO DATE"}</span>
                  <h3>{b.crop_name}{b.variety ? " · "+b.variety : ""}</h3></div><span className="pill">{b.status}</span></div>
                <div className="batch-metrics"><div><b>{b.trays||0}</b><span>Trays</span></div><div><b>{live}</b><span>Live seedlings</span></div>
                  <div><b>{rate}%</b><span>Germination</span></div></div>
                <p>Expected transplant: {b.expected_transplant_date || "Not set"}</p>
                <div className="batch-actions">
                  <button onClick={() => edit("batch", b)}>Edit</button>
                  <button className="danger-action" onClick={() => deleteItem("propagation_batches", b.id, `propagation batch ${b.crop_name}`)}>Delete</button>
                  {b.status !== "ready" && b.status !== "transplanted" && <button onClick={() => updateBatchStatus(b.id,"ready")}>Mark ready</button>}
                  {b.status === "ready" && <button onClick={() => transplantBatch(b)}>Transplant</button>}
                </div>
              </article>
            })}
            {!batches.length && <Empty text="Create your first propagation batch."/>}
          </div>
        </SimplePage>}

        {page === "crops" && <SimplePage title="Crop Cycles" description="Connect transplanted seedlings or direct planting to a specific field."
          button="New crop cycle" disabled={!fields.length} onAdd={() => open("cycle")}>
          <Table headers={["Crop","Field","Source","Status"]}>
            {cycles.filter(c=>matchesSearch(c.crop_name,c.variety,c.status,fieldName(c.field_id))).map(c => <div className="table-row" key={c.id}>
              <strong>{c.crop_name}{c.variety ? " · "+c.variety : ""}</strong><span>{fieldName(c.field_id)}</span>
              <span>{batchName(c.source_batch_id)}</span><span className="row-actions"><span className="pill">{c.status||"planned"}</span><button className="small-action" onClick={() => edit("cycle", c)}>Edit</button><button className="small-action danger-action" onClick={() => deleteItem("crop_cycles", c.id, `crop cycle ${c.crop_name}`)}>Delete</button></span>
            </div>)}
          </Table>
        </SimplePage>}


        {page === "activities" && <SimplePage title="Field Activities" description="Plan and record irrigation, fertilizer, spraying, weeding, scouting and harvesting."
          button="New activity" disabled={!fields.length} onAdd={() => open("activity")}>
          <Table headers={["Activity","Field","Schedule","Status"]}>
            {activities.filter(a=>matchesSearch(a.activity_type,a.status,a.notes,fieldName(a.field_id))).map(a => <div className="table-row" key={a.id}>
              <strong>{a.activity_type}</strong>
              <span>{fieldName(a.field_id)}</span>
              <span>{a.scheduled_date || "No date"}</span>
              <span className="activity-status"><span className="pill">{a.status || "planned"}</span>
                <button className="small-action" onClick={() => edit("activity", a)}>Edit</button>
                <button className="small-action danger-action" onClick={() => deleteItem("field_activities", a.id, `${a.activity_type} activity`)}>Delete</button>
                <div className="row-actions"><button className="small-action" onClick={() => edit("activity", a)}>Edit</button><button className="small-action danger-action" onClick={() => deleteItem("field_activities", a.id, `${a.activity_type} activity`)}>Delete</button>{a.status !== "completed" && <button className="small-action" onClick={() => completeActivity(a.id)}>Complete</button>}</div></span>
            </div>)}
            {!activities.length && <Empty text="No field activities yet."/>}
          </Table>
        </SimplePage>}

        {page === "calendar" && <SimplePage title="Work Calendar" description="See upcoming and overdue farm work." button="Schedule activity" disabled={!fields.length} onAdd={() => open("activity")}>
          <div className="calendar-list">
            {activities.slice().sort((a,b)=>String(a.scheduled_date).localeCompare(String(b.scheduled_date))).map(a => {
              const today = new Date().toISOString().slice(0,10);
              const overdue = a.scheduled_date < today && a.status !== "completed";
              return <article className={`calendar-item ${overdue ? "overdue" : ""}`} key={a.id}>
                <div className="calendar-date"><strong>{a.scheduled_date || "—"}</strong><span>{overdue ? "Overdue" : a.status}</span></div>
                <div className="calendar-main"><h3>{a.activity_type}</h3><p>{fieldName(a.field_id)} · {workerName(a.worker_id)}</p></div>
                {a.status !== "completed" && <button className="small-action" onClick={() => completeActivity(a.id)}>Complete</button>}
              </article>
            })}
            {!activities.length && <Empty text="No scheduled work yet."/>}
          </div>
        </SimplePage>}

        {page === "workers" && <SimplePage title="Workers" description="Maintain labour records and daily rates." button="Add worker" onAdd={() => open("worker")}>
          <Table headers={["Worker","Role","Daily rate","Status"]}>
            {workers.filter(w=>matchesSearch(w.full_name,w.phone,w.role,w.status)).map(w => <div className="table-row" key={w.id}>
              <strong>{w.full_name}</strong><span>{w.role || "Worker"}</span>
              <span>{Number(w.daily_rate || 0).toLocaleString()} </span><span className="row-actions"><span className="pill">{w.status || "active"}</span><button className="small-action" onClick={() => edit("worker", w)}>Edit</button><button className="small-action danger-action" onClick={() => deleteItem("workers", w.id, `worker ${w.full_name}`)}>Delete</button></span>
            </div>)}
            {!workers.length && <Empty text="No workers added yet."/>}
          </Table>
        </SimplePage>}


        {page === "irrigation" && <SimplePage title="Irrigation Management" description="Track water, pressure, duration, fuel and equipment by field." button="Add irrigation" disabled={!fields.length} onAdd={() => open("irrigation")}>
          <Table headers={["Date / Field","System","Water & pressure","Actions"]}>
            {irrigation.filter(r=>matchesSearch(r.irrigation_date,r.system_type,r.water_source,fieldName(r.field_id),equipmentName(r.equipment_id))).map(r=><div className="table-row" key={r.id}><strong>{r.irrigation_date}<small>{fieldName(r.field_id)}</small></strong><span>{r.system_type}<small>{equipmentName(r.equipment_id)}</small></span><span>{r.duration_hours||0} hr · {r.pressure_bar||0} bar<small>{r.water_source}</small></span><span className="row-actions"><button className="small-action" onClick={()=>edit("irrigation",r)}>Edit</button><button className="small-action danger-action" onClick={()=>deleteItem("irrigation_records",r.id,"irrigation record")}>Delete</button></span></div>)}
            {!irrigation.length&&<Empty text="No irrigation records yet."/>}
          </Table>
        </SimplePage>}

        {page === "sprays" && <SimplePage title="Spray Records" description="Maintain traceable pesticide and foliar application records." button="Add spray" disabled={!fields.length} onAdd={() => open("spray")}>
          <Table headers={["Date / Field","Product","Safety","Actions"]}>
            {sprays.filter(r=>matchesSearch(r.spray_date,r.product_name,r.active_ingredient,r.target_problem,fieldName(r.field_id))).map(r=><div className="table-row" key={r.id}><strong>{r.spray_date}<small>{fieldName(r.field_id)}</small></strong><span>{r.product_name}<small>{r.target_problem||r.active_ingredient||"—"}</small></span><span>PHI {r.phi_days||0} days<small>REI {r.rei_hours||0} hours</small></span><span className="row-actions"><button className="small-action" onClick={()=>edit("spray",r)}>Edit</button><button className="small-action danger-action" onClick={()=>deleteItem("spray_records",r.id,"spray record")}>Delete</button></span></div>)}
            {!sprays.length&&<Empty text="No spray records yet."/>}
          </Table>
        </SimplePage>}

        {page === "inventory" && <SimplePage title="Inventory" description="Track fertilizer, chemicals, seed, fuel and spare parts." button="Add item" onAdd={() => open("inventory")}>
          <div className="summary-strip"><strong>{inventory.length} items</strong><span>{metrics.lowStock} low-stock alerts</span><span>Stock value {money(inventory.reduce((s,i)=>s+Number(i.quantity_on_hand||0)*Number(i.unit_cost||0),0))}</span></div>
          <div className="filter-tabs"><button className={inventoryFilter==="all"?"active":""} onClick={()=>setInventoryFilter("all")}>All</button><button className={inventoryFilter==="low"?"active":""} onClick={()=>setInventoryFilter("low")}>Low stock</button>{["Seed","Fertilizer","Chemical","Fuel","Spare part"].map(x=><button key={x} className={inventoryFilter===x?"active":""} onClick={()=>setInventoryFilter(x)}>{x}</button>)}</div>
          <Table headers={["Item","Stock","Value","Actions"]}>
            {inventory.filter(i => (inventoryFilter==="all" || (inventoryFilter==="low" && Number(i.quantity_on_hand||0)<=Number(i.reorder_level||0)) || i.category===inventoryFilter) && matchesSearch(i.item_name,i.category,i.supplier)).map(i=><div className={`table-row ${Number(i.quantity_on_hand||0)<=Number(i.reorder_level||0)?"low-stock":""}`} key={i.id}><strong>{i.item_name}<small>{i.category}</small></strong><span>{i.quantity_on_hand||0} {i.unit}<small>Reorder at {i.reorder_level||0}</small></span><span>{money(Number(i.quantity_on_hand||0)*Number(i.unit_cost||0))}</span><span className="row-actions"><button className="small-action" onClick={()=>edit("inventory",i)}>Edit</button><button className="small-action danger-action" onClick={()=>deleteItem("inventory_items",i.id,`inventory item ${i.item_name}`)}>Delete</button></span></div>)}
            {!inventory.length&&<Empty text="No inventory items yet."/>}
          </Table>
        </SimplePage>}

        {page === "harvests" && <SimplePage title="Harvest & Sales" description="Record yield, grades, buyers, waste and revenue." button="Add harvest" disabled={!fields.length} onAdd={() => open("harvest")}>
          <div className="summary-strip"><strong>Revenue {money(metrics.revenue)}</strong><span>{harvests.reduce((s,h)=>s+Number(h.quantity||0),0).toLocaleString()} total units</span></div>
          <Table headers={["Date / Field","Harvest","Buyer","Actions"]}>
            {harvests.filter(h=>matchesSearch(h.harvest_date,h.grade,h.buyer,fieldName(h.field_id))).map(h=><div className="table-row" key={h.id}><strong>{h.harvest_date}<small>{fieldName(h.field_id)} · Grade {h.grade}</small></strong><span>{h.quantity||0} {h.unit}<small>Waste {h.waste_quantity||0}</small></span><span>{h.buyer||"No buyer"}<small>{money(Number(h.quantity||0)*Number(h.price_per_unit||0))}</small></span><span className="row-actions"><button className="small-action" onClick={()=>edit("harvest",h)}>Edit</button><button className="small-action danger-action" onClick={()=>deleteItem("harvest_records",h.id,"harvest record")}>Delete</button></span></div>)}
            {!harvests.length&&<Empty text="No harvest records yet."/>}
          </Table>
        </SimplePage>}

        {page === "equipment" && <SimplePage title="Equipment" description="Track pumps, engines, reels and service dates." button="Add equipment" onAdd={() => open("equipment")}>
          <Table headers={["Equipment","Hours","Service","Actions"]}>
            {equipment.filter(e=>matchesSearch(e.name,e.category,e.model,e.status)).map(e=><div className={`table-row ${serviceDue.some(x=>x.id===e.id)?"service-alert":""}`} key={e.id}><strong>{e.name}<small>{e.category} · {e.model||"No model"}</small></strong><span>{e.current_hours||0} hr<small>Interval {e.service_interval_hours||0} hr</small></span><span>{e.next_service_date||"Not scheduled"}<small>{serviceDue.some(x=>x.id===e.id)?"Service due":e.status}</small></span><span className="row-actions"><button className="small-action" onClick={()=>edit("equipment",e)}>Edit</button><button className="small-action danger-action" onClick={()=>deleteItem("equipment",e.id,`equipment ${e.name}`)}>Delete</button></span></div>)}
            {!equipment.length&&<Empty text="No equipment records yet."/>}
          </Table>
        </SimplePage>}

        {page === "expenses" && <SimplePage title="Financial Dashboard" description="Live operational costs, sales and estimated profit.">
          <div className="finance-grid"><Stat label="Revenue" value={money(metrics.revenue)} detail="Harvest sales"/><Stat label="Operating costs" value={money(metrics.fieldCosts)} detail="Activities, irrigation and sprays"/><Stat label="Estimated profit" value={money(metrics.profit)} detail="Revenue minus recorded costs"/></div>
          <Table headers={["Source","Records","Amount","Notes"]}>
            <div className="table-row"><strong>Field activities</strong><span>{activities.length}</span><span>{money(activities.reduce((s,a)=>s+Number(a.labour_cost||0)+Number(a.input_cost||0),0))}</span><span>Labour + inputs</span></div>
            <div className="table-row"><strong>Irrigation</strong><span>{irrigation.length}</span><span>{money(irrigation.reduce((s,r)=>s+Number(r.cost||0),0))}</span><span>Fuel and operation</span></div>
            <div className="table-row"><strong>Sprays</strong><span>{sprays.length}</span><span>{money(sprays.reduce((s,r)=>s+Number(r.cost||0),0))}</span><span>Products and labour</span></div>
            <div className="table-row"><strong>Harvest sales</strong><span>{harvests.length}</span><span>{money(metrics.revenue)}</span><span>Gross revenue</span></div>
          </Table>
        </SimplePage>}

        {page === "reports" && <SimplePage title="Field Timeline" description="A chronological field record from nursery through harvest.">
          <div className="timeline-filter"><Field label="Select field"><select value={timelineField} onChange={e=>setTimelineField(e.target.value)}>{fields.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></Field></div>
          <div className="timeline">
            {[
              ...cycles.filter(x=>x.field_id===timelineField).map(x=>({date:x.planting_date,title:`Crop cycle: ${x.crop_name}`,detail:`${x.variety||""} · ${x.status}`})),
              ...activities.filter(x=>x.field_id===timelineField).map(x=>({date:x.scheduled_date,title:`Activity: ${x.activity_type}`,detail:`${x.status} · ${money(Number(x.labour_cost||0)+Number(x.input_cost||0))}`})),
              ...irrigation.filter(x=>x.field_id===timelineField).map(x=>({date:x.irrigation_date,title:"Irrigation",detail:`${x.duration_hours||0} hr · ${x.pressure_bar||0} bar · ${x.system_type}`})),
              ...sprays.filter(x=>x.field_id===timelineField).map(x=>({date:x.spray_date,title:`Spray: ${x.product_name}`,detail:`PHI ${x.phi_days||0} days · ${x.target_problem||""}`})),
              ...harvests.filter(x=>x.field_id===timelineField).map(x=>({date:x.harvest_date,title:`Harvest: ${x.quantity||0} ${x.unit}`,detail:`Grade ${x.grade} · ${money(Number(x.quantity||0)*Number(x.price_per_unit||0))}`}))
            ].sort((a,b)=>String(b.date).localeCompare(String(a.date))).map((x,i)=><article className="timeline-item" key={`${x.date}-${i}`}><span>{x.date||"—"}</span><div><strong>{x.title}</strong><p>{x.detail}</p></div></article>)}
            {!timelineField&&<Empty text="Add a field to start a timeline."/>}
          </div>
        </SimplePage>}

        {page === "users" && canManageUsers && <>
          <section className="hero"><div><h2>Users & permissions</h2><p>Control who can view or update your farm records.</p></div><span className="security-note"><ShieldCheck size={18}/> Owner controls enabled</span></section>
          <section className="split-grid access-grid">
            <Card title="Farm users" subtitle="New sign-ups start as Viewer">
              <div className="user-list">
                {farmUsers.map(user => <article className="user-card" key={user.id}>
                  <div className="user-avatar">{(user.full_name || user.email || "U").slice(0,1).toUpperCase()}</div>
                  <div className="user-info"><strong>{user.full_name || "Unnamed user"}</strong><span>{user.email}</span></div>
                  <select aria-label={`Role for ${user.full_name || user.email}`} value={user.role} disabled={user.id === session.user.id} onChange={e=>updateUser(user.id,{role:e.target.value})}>
                    {Object.entries(ROLE_LABELS).map(([value,label])=><option value={value} key={value}>{label}</option>)}
                  </select>
                  <button className={user.status === "active" ? "small-action danger-action" : "small-action"} disabled={user.id === session.user.id} onClick={()=>updateUser(user.id,{status:user.status==="active"?"inactive":"active"})}>{user.status==="active"?"Deactivate":"Activate"}</button>
                </article>)}
              </div>
            </Card>
            <Card title="Activity log" subtitle="Latest changes across the farm">
              <div className="audit-list">
                {auditLogs.map(log => <article key={log.id}><History size={15}/><div><strong>{log.action} · {log.table_name}</strong><span>{log.actor_email || "System"} · {new Date(log.created_at).toLocaleString()}</span></div></article>)}
                {!auditLogs.length && <Empty text="No recorded changes yet."/>}
              </div>
            </Card>
          </section>
        </>}
      </main>

      {mobileNav && <div className="sidebar-backdrop" onClick={() => setMobileNav(false)}/>}

      {modal && <Modal title={`${editingId ? "Edit" : "Add"} ${modalLabel(modal)}`} onClose={() => { setModal(null); setEditingId(null); }}>
        <form className="form" onSubmit={save}>
          {modal === "block" && <>
            <Field label="Block name"><input required value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
            <Field label="Area in acres"><input required type="number" step="0.01" value={form.area||""} onChange={e=>setForm({...form,area:e.target.value})}/></Field>
          </>}
          {modal === "field" && <>
            <Field label="Field name"><input required value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
            <Field label="Farm block"><select required value={form.blockId||""} onChange={e=>setForm({...form,blockId:e.target.value})}>{blocks.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
            <Field label="Area in acres"><input required type="number" step="0.01" value={form.area||""} onChange={e=>setForm({...form,area:e.target.value})}/></Field>
            <Field label="Status"><select value={form.status||"available"} onChange={e=>setForm({...form,status:e.target.value})}><option value="available">Available</option><option value="growing">Growing</option><option value="fallow">Fallow</option></select></Field>
          </>}
          {modal === "batch" && <>
            <div className="form-grid">
              <Field label="Crop"><input required value={form.crop_name||""} placeholder="Cabbage" onChange={e=>setForm({...form,crop_name:e.target.value})}/></Field>
              <Field label="Variety"><input value={form.variety||""} placeholder="Gloria F1" onChange={e=>setForm({...form,variety:e.target.value})}/></Field>
            </div>
            <div className="form-grid">
              <Field label="Sowing date"><input required type="date" value={form.sowing_date||""} onChange={e=>setForm({...form,sowing_date:e.target.value})}/></Field>
              <Field label="Expected transplant"><input type="date" value={form.expected_transplant_date||""} onChange={e=>setForm({...form,expected_transplant_date:e.target.value})}/></Field>
            </div>
            <div className="form-grid three">
              <Field label="Trays"><input type="number" value={form.trays||""} onChange={e=>setForm({...form,trays:e.target.value})}/></Field>
              <Field label="Cells/tray"><input type="number" value={form.cells_per_tray||""} onChange={e=>setForm({...form,cells_per_tray:e.target.value})}/></Field>
              <Field label="Seeds sown"><input type="number" value={form.seeds_sown||""} placeholder="Auto" onChange={e=>setForm({...form,seeds_sown:e.target.value})}/></Field>
            </div>
            <div className="form-grid three">
              <Field label="Germinated"><input type="number" value={form.germinated||""} onChange={e=>setForm({...form,germinated:e.target.value})}/></Field>
              <Field label="Losses"><input type="number" value={form.losses||"0"} onChange={e=>setForm({...form,losses:e.target.value})}/></Field>
              <Field label="Status"><select value={form.status||"sown"} onChange={e=>setForm({...form,status:e.target.value})}><option value="sown">Sown</option><option value="germinating">Germinating</option><option value="growing">Growing</option><option value="ready">Ready</option><option value="transplanted">Transplanted</option></select></Field>
            </div>
            <Field label="Notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
          </>}
          {modal === "cycle" && <>
            <div className="form-grid">
              <Field label="Field"><select required value={form.field_id||""} onChange={e=>{const f=fields.find(x=>x.id===e.target.value);setForm({...form,field_id:e.target.value,area_acres:f?.area_acres||form.area_acres})}}>{fields.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></Field>
              <Field label="Nursery source"><select value={form.source_batch_id||""} onChange={e=>{const b=batches.find(x=>x.id===e.target.value);setForm({...form,source_batch_id:e.target.value,crop_name:b?.crop_name||form.crop_name,variety:b?.variety||form.variety})}}><option value="">Direct planting</option>{batches.filter(b => b.status === "ready" || b.id === form.source_batch_id).map(b=><option key={b.id} value={b.id}>{b.crop_name}{b.variety ? " · "+b.variety : ""}</option>)}</select></Field>
            </div>
            <div className="form-grid">
              <Field label="Crop"><input required value={form.crop_name||""} onChange={e=>setForm({...form,crop_name:e.target.value})}/></Field>
              <Field label="Variety"><input value={form.variety||""} onChange={e=>setForm({...form,variety:e.target.value})}/></Field>
            </div>
            <div className="form-grid">
              <Field label="Planting date"><input required type="date" value={form.planting_date||""} onChange={e=>setForm({...form,planting_date:e.target.value})}/></Field>
              <Field label="Expected harvest"><input type="date" value={form.expected_harvest_date||""} onChange={e=>setForm({...form,expected_harvest_date:e.target.value})}/></Field>
            </div>
            <div className="form-grid">
              <Field label="Area in acres"><input type="number" step="0.01" value={form.area_acres||""} onChange={e=>setForm({...form,area_acres:e.target.value})}/></Field>
              <Field label="Status"><select value={form.status||"planned"} onChange={e=>setForm({...form,status:e.target.value})}><option value="planned">Planned</option><option value="planted">Planted</option><option value="growing">Growing</option><option value="harvest_ready">Harvest ready</option><option value="completed">Completed</option></select></Field>
            </div>
            <Field label="Notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
          </>}

          {modal === "activity" && <>
            <div className="form-grid">
              <Field label="Field"><select required value={form.field_id||""} onChange={e=>setForm({...form,field_id:e.target.value,crop_cycle_id:cycles.find(c=>c.field_id===e.target.value)?.id||""})}>{fields.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></Field>
              <Field label="Crop cycle"><select value={form.crop_cycle_id||""} onChange={e=>setForm({...form,crop_cycle_id:e.target.value})}><option value="">No crop cycle</option>{cycles.filter(c=>c.field_id===form.field_id).map(c=><option key={c.id} value={c.id}>{c.crop_name}{c.variety ? " · "+c.variety : ""}</option>)}</select></Field>
            </div>
            <div className="form-grid">
              <Field label="Activity type"><select value={form.activity_type||"irrigation"} onChange={e=>setForm({...form,activity_type:e.target.value})}>
                {["land preparation","planting","transplanting","irrigation","fertilizer","spraying","weeding","scouting","harvesting","other"].map(x=><option key={x} value={x}>{x}</option>)}
              </select></Field>
              <Field label="Worker"><select value={form.worker_id||""} onChange={e=>setForm({...form,worker_id:e.target.value})}><option value="">Unassigned</option>{workers.map(w=><option key={w.id} value={w.id}>{w.full_name}</option>)}</select></Field>
            </div>
            <div className="form-grid">
              <Field label="Scheduled date"><input required type="date" value={form.scheduled_date||""} onChange={e=>setForm({...form,scheduled_date:e.target.value})}/></Field>
              <Field label="Status"><select value={form.status||"planned"} onChange={e=>setForm({...form,status:e.target.value})}><option value="planned">Planned</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></Field>
            </div>
            <div className="form-grid three">
              <Field label="Input used"><input value={form.input_name||""} placeholder="NPK 17:17:17" onChange={e=>setForm({...form,input_name:e.target.value})}/></Field>
              <Field label="Quantity"><input type="number" step="0.01" value={form.quantity||""} onChange={e=>setForm({...form,quantity:e.target.value})}/></Field>
              <Field label="Unit"><input value={form.unit||""} placeholder="kg / litres" onChange={e=>setForm({...form,unit:e.target.value})}/></Field>
            </div>
            <div className="form-grid">
              <Field label="Labour cost"><input type="number" step="0.01" value={form.labour_cost||""} onChange={e=>setForm({...form,labour_cost:e.target.value})}/></Field>
              <Field label="Input cost"><input type="number" step="0.01" value={form.input_cost||""} onChange={e=>setForm({...form,input_cost:e.target.value})}/></Field>
            </div>
            <Field label="Notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
          </>}

          {modal === "worker" && <>
            <Field label="Full name"><input required value={form.full_name||""} onChange={e=>setForm({...form,full_name:e.target.value})}/></Field>
            <div className="form-grid">
              <Field label="Phone"><input value={form.phone||""} onChange={e=>setForm({...form,phone:e.target.value})}/></Field>
              <Field label="Role"><input value={form.role||""} onChange={e=>setForm({...form,role:e.target.value})}/></Field>
            </div>
            <div className="form-grid">
              <Field label="Daily rate"><input type="number" step="0.01" value={form.daily_rate||""} onChange={e=>setForm({...form,daily_rate:e.target.value})}/></Field>
              <Field label="Status"><select value={form.status||"active"} onChange={e=>setForm({...form,status:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></select></Field>
            </div>
          </>}


          {modal === "irrigation" && <>
            <div className="form-grid"><Field label="Field"><select required value={form.field_id||""} onChange={e=>setForm({...form,field_id:e.target.value,crop_cycle_id:cycles.find(c=>c.field_id===e.target.value)?.id||""})}>{fields.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></Field><Field label="Crop cycle"><select value={form.crop_cycle_id||""} onChange={e=>setForm({...form,crop_cycle_id:e.target.value})}><option value="">No crop cycle</option>{cycles.filter(c=>c.field_id===form.field_id).map(c=><option key={c.id} value={c.id}>{cycleName(c.id)}</option>)}</select></Field></div>
            <div className="form-grid"><Field label="Date"><input required type="date" value={form.irrigation_date||""} onChange={e=>setForm({...form,irrigation_date:e.target.value})}/></Field><Field label="Water source"><input value={form.water_source||""} onChange={e=>setForm({...form,water_source:e.target.value})}/></Field></div>
            <div className="form-grid"><Field label="System"><select value={form.system_type||""} onChange={e=>setForm({...form,system_type:e.target.value})}>{["Travelling reel","Rain hose","Drip","Sprinkler","Manual"].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Equipment"><select value={form.equipment_id||""} onChange={e=>setForm({...form,equipment_id:e.target.value})}><option value="">Not selected</option>{equipment.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field></div>
            <div className="form-grid three"><Field label="Duration hours"><input type="number" step=".1" value={form.duration_hours||""} onChange={e=>setForm({...form,duration_hours:e.target.value})}/></Field><Field label="Pressure bar"><input type="number" step=".1" value={form.pressure_bar||""} onChange={e=>setForm({...form,pressure_bar:e.target.value})}/></Field><Field label="Water m³"><input type="number" step=".1" value={form.water_volume_m3||""} onChange={e=>setForm({...form,water_volume_m3:e.target.value})}/></Field></div>
            <div className="form-grid"><Field label="Fuel litres"><input type="number" step=".1" value={form.fuel_litres||""} onChange={e=>setForm({...form,fuel_litres:e.target.value})}/></Field><Field label="Cost (KES)"><input type="number" value={form.cost||""} onChange={e=>setForm({...form,cost:e.target.value})}/></Field></div><Field label="Notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
          </>}
          {modal === "spray" && <>
            <div className="form-grid"><Field label="Field"><select required value={form.field_id||""} onChange={e=>setForm({...form,field_id:e.target.value})}>{fields.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></Field><Field label="Date"><input required type="date" value={form.spray_date||""} onChange={e=>setForm({...form,spray_date:e.target.value})}/></Field></div>
            <div className="form-grid"><Field label="Product"><input required value={form.product_name||""} onChange={e=>setForm({...form,product_name:e.target.value})}/></Field><Field label="Active ingredient"><input value={form.active_ingredient||""} onChange={e=>setForm({...form,active_ingredient:e.target.value})}/></Field></div>
            <div className="form-grid"><Field label="Target pest/disease"><input value={form.target_problem||""} onChange={e=>setForm({...form,target_problem:e.target.value})}/></Field><Field label="Dose"><input value={form.dose||""} placeholder="e.g. 2 ml/L" onChange={e=>setForm({...form,dose:e.target.value})}/></Field></div>
            <div className="form-grid three"><Field label="Quantity used"><input type="number" step=".1" value={form.quantity_used||""} onChange={e=>setForm({...form,quantity_used:e.target.value})}/></Field><Field label="PHI days"><input type="number" value={form.phi_days||""} onChange={e=>setForm({...form,phi_days:e.target.value})}/></Field><Field label="REI hours"><input type="number" value={form.rei_hours||""} onChange={e=>setForm({...form,rei_hours:e.target.value})}/></Field></div>
            <div className="form-grid"><Field label="Applicator"><select value={form.worker_id||""} onChange={e=>setForm({...form,worker_id:e.target.value})}><option value="">Unassigned</option>{workers.map(w=><option key={w.id} value={w.id}>{w.full_name}</option>)}</select></Field><Field label="Cost (KES)"><input type="number" value={form.cost||""} onChange={e=>setForm({...form,cost:e.target.value})}/></Field></div><Field label="Weather"><input value={form.weather||""} placeholder="Calm, dry, cloudy" onChange={e=>setForm({...form,weather:e.target.value})}/></Field><Field label="Notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
          </>}
          {modal === "inventory" && <>
            <div className="form-grid"><Field label="Item name"><input required value={form.item_name||""} onChange={e=>setForm({...form,item_name:e.target.value})}/></Field><Field label="Category"><select value={form.category||""} onChange={e=>setForm({...form,category:e.target.value})}>{["Seed","Fertilizer","Chemical","Fuel","Spare part","Other"].map(x=><option key={x}>{x}</option>)}</select></Field></div>
            <div className="form-grid three"><Field label="Quantity"><input required type="number" step=".01" value={form.quantity_on_hand||""} onChange={e=>setForm({...form,quantity_on_hand:e.target.value})}/></Field><Field label="Unit"><input value={form.unit||""} onChange={e=>setForm({...form,unit:e.target.value})}/></Field><Field label="Reorder level"><input type="number" step=".01" value={form.reorder_level||""} onChange={e=>setForm({...form,reorder_level:e.target.value})}/></Field></div>
            <div className="form-grid"><Field label="Unit cost (KES)"><input type="number" step=".01" value={form.unit_cost||""} onChange={e=>setForm({...form,unit_cost:e.target.value})}/></Field><Field label="Supplier"><input value={form.supplier||""} onChange={e=>setForm({...form,supplier:e.target.value})}/></Field></div><Field label="Notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
          </>}
          {modal === "harvest" && <>
            <div className="form-grid"><Field label="Field"><select required value={form.field_id||""} onChange={e=>setForm({...form,field_id:e.target.value,crop_cycle_id:cycles.find(c=>c.field_id===e.target.value)?.id||""})}>{fields.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></Field><Field label="Crop cycle"><select value={form.crop_cycle_id||""} onChange={e=>setForm({...form,crop_cycle_id:e.target.value})}><option value="">No crop cycle</option>{cycles.filter(c=>c.field_id===form.field_id).map(c=><option key={c.id} value={c.id}>{cycleName(c.id)}</option>)}</select></Field></div>
            <div className="form-grid"><Field label="Harvest date"><input required type="date" value={form.harvest_date||""} onChange={e=>setForm({...form,harvest_date:e.target.value})}/></Field><Field label="Grade"><select value={form.grade||"A"} onChange={e=>setForm({...form,grade:e.target.value})}>{["A","B","C","Unsorted"].map(x=><option key={x}>{x}</option>)}</select></Field></div>
            <div className="form-grid three"><Field label="Quantity"><input required type="number" step=".01" value={form.quantity||""} onChange={e=>setForm({...form,quantity:e.target.value})}/></Field><Field label="Unit"><input value={form.unit||""} onChange={e=>setForm({...form,unit:e.target.value})}/></Field><Field label="Waste quantity"><input type="number" step=".01" value={form.waste_quantity||""} onChange={e=>setForm({...form,waste_quantity:e.target.value})}/></Field></div>
            <div className="form-grid"><Field label="Buyer"><input value={form.buyer||""} onChange={e=>setForm({...form,buyer:e.target.value})}/></Field><Field label="Price per unit (KES)"><input type="number" step=".01" value={form.price_per_unit||""} onChange={e=>setForm({...form,price_per_unit:e.target.value})}/></Field></div><Field label="Notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
          </>}
          {modal === "equipment" && <>
            <div className="form-grid"><Field label="Name"><input required value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})}/></Field><Field label="Category"><select value={form.category||""} onChange={e=>setForm({...form,category:e.target.value})}>{["Engine","Pump","Travelling reel","Rain hose","Tractor","Sprayer","Other"].map(x=><option key={x}>{x}</option>)}</select></Field></div>
            <div className="form-grid"><Field label="Model"><input value={form.model||""} onChange={e=>setForm({...form,model:e.target.value})}/></Field><Field label="Serial number"><input value={form.serial_number||""} onChange={e=>setForm({...form,serial_number:e.target.value})}/></Field></div>
            <div className="form-grid three"><Field label="Current hours"><input type="number" value={form.current_hours||""} onChange={e=>setForm({...form,current_hours:e.target.value})}/></Field><Field label="Service interval hours"><input type="number" value={form.service_interval_hours||""} onChange={e=>setForm({...form,service_interval_hours:e.target.value})}/></Field><Field label="Status"><select value={form.status||"active"} onChange={e=>setForm({...form,status:e.target.value})}><option>active</option><option>service due</option><option>inactive</option></select></Field></div>
            <div className="form-grid"><Field label="Last service"><input type="date" value={form.last_service_date||""} onChange={e=>setForm({...form,last_service_date:e.target.value})}/></Field><Field label="Next service"><input type="date" value={form.next_service_date||""} onChange={e=>setForm({...form,next_service_date:e.target.value})}/></Field></div><Field label="Notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
          </>}
          <div className="form-actions"><button type="button" className="button secondary" onClick={()=>{setModal(null);setEditingId(null)}}>Cancel</button><button className="button primary" disabled={saving}>{saving ? "Saving…" : (editingId ? "Update" : "Save")}</button></div>
        </form>
      </Modal>}
    </div>
  );
}

function averageGermination(batches) {
  const valid = batches.filter(b => Number(b.seeds_sown) > 0);
  if (!valid.length) return "—";
  return Math.round(valid.reduce((s,b)=>s+(Number(b.germinated||0)/Number(b.seeds_sown)*100),0)/valid.length) + "%";
}
function modalLabel(type){return ({
  block:"farm block",field:"field",batch:"propagation batch",
  cycle:"crop cycle",activity:"field activity",worker:"worker",
  irrigation:"irrigation record",spray:"spray record",inventory:"inventory item",
  harvest:"harvest record",equipment:"equipment record"
})[type]}
function StatusBanner({status,message}){const Icon=status==="success"?CheckCircle2:status==="loading"?LoaderCircle:AlertCircle;return message?<div className={`status-banner ${status}`}><Icon size={18} className={status==="loading"?"spin":""}/><span>{message}</span></div>:null}
function Modal({title,children,onClose}){return <div className="overlay" onMouseDown={onClose}><section className="modal large" onMouseDown={e=>e.stopPropagation()}><header className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={20}/></button></header>{children}</section></div>}
function Stat({label,value,detail,onClick}){return <article className={`stat-card ${onClick ? "clickable" : ""}`} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>}
function Mini({label,value}){return <article className="mini"><strong>{value}</strong><span>{label}</span></article>}
function Card({title,subtitle,action,onAction,children}){return <section className="card"><header className="card-header"><div><h3>{title}</h3><p>{subtitle}</p></div>{action&&<button onClick={onAction}>{action}</button>}</header>{children}</section>}
function Record({Icon,title,subtitle,badge,onEdit,onDelete}){return <div className="record"><div className="record-icon"><Icon size={18}/></div><div className="record-main"><strong>{title}</strong><span>{subtitle}</span></div><span className="row-actions"><span className="pill">{badge}</span>{onEdit&&<button className="small-action" onClick={onEdit}>Edit</button>}{onDelete&&<button className="small-action danger-action" onClick={onDelete}>Delete</button>}</span></div>}
function Empty({text}){return <div className="empty">{text}</div>}
function SimplePage({title,description,button,onAdd,disabled,children}){return <><section className="hero"><div><h2>{title}</h2><p>{description}</p></div><button className="button primary" disabled={disabled} onClick={onAdd}><Plus size={17}/>{button}</button></section><section className="card">{children}</section></>}
function Table({headers,children}){return <div className="data-table"><div className="table-row table-head">{headers.map(h=><span key={h}>{h}</span>)}</div>{children}</div>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function ComingSoon({page}){const item=NAV.find(n=>n[0]===page);const Icon=item?.[2]||Leaf;return <section className="coming-soon card"><div className="coming-icon"><Icon size={30}/></div><h2>{item?.[1]}</h2><p>This module is ready for the next build phase.</p></section>}

function AuthScreen(){
  const [mode,setMode]=useState("login");
  const [form,setForm]=useState({name:"",email:"",password:""});
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(e){
    e.preventDefault(); setBusy(true); setMessage("");
    const result=mode==="signup"
      ? await supabase.auth.signUp({email:form.email,password:form.password,options:{data:{full_name:form.name}}})
      : await supabase.auth.signInWithPassword({email:form.email,password:form.password});
    if(result.error) setMessage(result.error.message);
    else if(mode==="signup") setMessage("Account created. Check your email if confirmation is enabled, then sign in.");
    setBusy(false);
  }
  async function resetPassword(){
    if(!form.email){setMessage("Enter your email address first.");return;}
    const {error}=await supabase.auth.resetPasswordForEmail(form.email,{redirectTo:window.location.origin});
    setMessage(error?error.message:"Password reset link sent to your email.");
  }
  return <main className="auth-screen"><section className="auth-card">
    <div className="auth-brand"><div className="brand-mark"><Sprout size={27}/></div><div><strong>Farm Manager</strong><span>Version 7.2 · Secure access</span></div></div>
    <div><span className="eyebrow">{mode==="login"?"WELCOME BACK":"CREATE ACCOUNT"}</span><h1>{mode==="login"?"Sign in to your farm":"Join the farm team"}</h1><p>Use your email and password to access the records permitted for your role.</p></div>
    <form className="form" onSubmit={submit}>
      {mode==="signup"&&<Field label="Full name"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>}
      <Field label="Email"><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field>
      <Field label="Password"><input required minLength="6" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></Field>
      {message&&<div className="auth-message">{message}</div>}
      <button className="button primary auth-submit" disabled={busy}>{busy?"Please wait…":mode==="login"?"Sign in":"Create account"}</button>
    </form>
    <div className="auth-links">
      <button onClick={()=>{setMode(mode==="login"?"signup":"login");setMessage("")}}><UserPlus size={15}/>{mode==="login"?"Create an account":"Back to sign in"}</button>
      {mode==="login"&&<button onClick={resetPassword}>Forgot password?</button>}
    </div>
  </section></main>
}
