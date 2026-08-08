"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Activity, AlertCircle, ArrowUpRight, Blocks, CalendarClock, CalendarDays,
  CheckCircle2, CircleDollarSign, ClipboardList,
  Droplets, Gauge, Home, Leaf, LoaderCircle, Menu, Package, Plus, RefreshCw,
  Search, ShoppingCart, Sprout, Tractor, Users, Warehouse, Wrench, X,
  ShieldCheck, LogOut, UserPlus, History, Trash2, BarChart3, BrainCircuit,
  CalendarCheck2, ChevronLeft, ChevronRight, Clock3, Download, FileText,
  LandPlot, ListChecks, MoreHorizontal, TrendingUp, UserCheck, UserX,
  UserRound, WalletCards, Wifi, WifiOff
} from "lucide-react";
const SUPABASE_URL = "https://itlngocavjyrjgeblsmq.supabase.co";
const SUPABASE_KEY = "sb_publishable_sV6zuknGzOavoAdqW2o1MQ_6GzpVKxE";
function isPasswordRecoveryUrl() {
  if (typeof window === "undefined") return false;
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return query.get("recovery") === "1" ||
    query.get("type") === "recovery" ||
    hash.get("type") === "recovery";
}
const INITIAL_PASSWORD_RECOVERY = isPasswordRecoveryUrl();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { detectSessionInUrl: true, flowType: "implicit" }
});

const NAV = [
  ["dashboard", "Dashboard", Home],
  ["planner", "Smart Planner", BrainCircuit],
  ["blocks", "Farm Blocks", Blocks],
  ["fields", "Fields", Tractor],
  ["nursery", "Nursery", Sprout],
  ["crops", "Crop Cycles", Leaf],
  ["activities", "Field Activities", Wrench],
  ["calendar", "Work Calendar", CalendarDays],
  ["workers", "Workers", Users],
  ["attendance", "Attendance", CalendarCheck2],
  ["workforce", "Workforce & Jobs", ClipboardList],
  ["payroll", "Payroll", CircleDollarSign],
  ["irrigation", "Irrigation", Droplets],
  ["sprays", "Spray Records", Gauge],
  ["inventory", "Inventory", Warehouse],
  ["harvests", "Harvest & Sales", ShoppingCart],
  ["equipment", "Equipment", Wrench],
  ["expenses", "Financials", CircleDollarSign],
  ["reports", "Field Timeline", ClipboardList],
  ["profile", "Profile", UserRound],
  ["users", "Users & Access", ShieldCheck]
];

const ROLE_LABELS = {
  owner: "Owner / Admin", manager: "Farm Manager", storekeeper: "Storekeeper",
  supervisor: "Field Supervisor", viewer: "Viewer"
};
const WRITE_ROLES = new Set(["owner", "manager", "storekeeper", "supervisor"]);

const emptyBlock = { name: "", area: "" };
const emptyField = { name: "", area: "", blockId: "", status: "active" };
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
  field_id: "", field_ids: [], crop_cycle_id: "", activity_type: "irrigation",
  operation_name: "Irrigation", operation_group_id: "",
  scheduled_date: new Date().toISOString().slice(0,10),
  completed_date: "", status: "planned", worker_id: "",
  input_name: "", inventory_item_id: "", quantity: "", unit: "",
  labour_cost: "", input_cost: "", notes: "",
  active_ingredient: "", target_problem: "", dose: "", weather: "",
  equipment_id: "", phi_days: "", rei_hours: ""
};

const emptyWorker = {
  full_name: "", phone: "", role: "general worker",
  employee_number: "", id_number: "", email: "", hire_date: "",
  employment_type: "casual", wage_type: "daily", daily_rate: "",
  hourly_rate: "", monthly_salary: "", piece_rate: "", piece_unit: "",
  normal_hours_per_day: "8", emergency_contact_name: "",
  emergency_contact_phone: "", payment_method: "M-Pesa",
  payment_account: "", status: "active", notes: ""
};

const emptyCrew = {
  name: "", supervisor_id: "", worker_ids: [], status: "active", notes: ""
};

const emptyAssignment = {
  title: "", work_date: new Date().toISOString().slice(0,10), due_date: "",
  description: "", status: "planned", crew_id: "", field_ids: [], worker_ids: [],
  unit_name: "", planned_units: "", regular_hours: "8", overtime_hours: "0",
  completed_units: "", overtime_multiplier: "1.5", approval_notes: ""
};

const emptyAdjustment = {
  worker_id: "", period_month: new Date().toISOString().slice(0,7),
  adjustment_date: new Date().toISOString().slice(0,10),
  adjustment_type: "bonus", amount: "", description: ""
};

const emptyPayment = {
  worker_id: "", payment_date: new Date().toISOString().slice(0,10),
  amount: "", method: "M-Pesa", reference: "", notes: ""
};

const emptyIrrigation = {
  field_id: "", crop_cycle_id: "", irrigation_date: new Date().toISOString().slice(0,10),
  water_source: "River", system_type: "Travelling reel", equipment_id: "",
  start_time: "", end_time: "", duration_hours: "", pressure_bar: "",
  water_volume_m3: "", fuel_litres: "", cost: "", notes: ""
};

const emptySpray = {
  field_id: "", field_ids: [], crop_cycle_id: "", spray_date: new Date().toISOString().slice(0,10),
  operation_name: "Boom spray", operation_group_id: "", inventory_item_id: "", equipment_id: "",
  product_name: "", active_ingredient: "", target_problem: "", dose: "", unit: "",
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
  if (isMissingWorkforceTable(error)) {
    return "Workforce & Payroll is not active yet. Run database-v8-4-workforce-payroll.sql once in Supabase, then tap Refresh.";
  }
  if (isMissingAttendanceTable(error)) {
    return "Attendance is not active yet. Run database-v8-2-attendance.sql once in Supabase, then tap Refresh.";
  }
  if (message.includes("row-level security")) {
    return "Supabase blocked this action through Row Level Security. Run the V5 database-upgrade.sql script.";
  }
  if (message.includes("column") && message.includes("does not exist")) {
    return "The V5 database upgrade has not been run yet. Run database-upgrade.sql in Supabase SQL Editor.";
  }
  if (message.includes('crop_id') && message.includes('not-null')) {
    return "The original crop_cycles table still requires crop_id. Run the V5.2 database-upgrade.sql script.";
  }
  if (message.includes("Failed to send a request to the Edge Function") || message.includes("Function not found")) {
    return "The Administrator user service could not be reached. Confirm that the existing super-handler Supabase function is deployed, then try again.";
  }
  return message;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(INITIAL_PASSWORD_RECOVERY);
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
  const [attendance, setAttendance] = useState([]);
  const [attendanceReady, setAttendanceReady] = useState(true);
  const [attendanceDate, setAttendanceDate] = useState(() => localDateISO());
  const [attendanceMonth, setAttendanceMonth] = useState(() => localDateISO().slice(0, 7));
  const [attendanceSaving, setAttendanceSaving] = useState("");
  const [crews, setCrews] = useState([]);
  const [crewMembers, setCrewMembers] = useState([]);
  const [workAssignments, setWorkAssignments] = useState([]);
  const [assignmentFields, setAssignmentFields] = useState([]);
  const [assignmentWorkers, setAssignmentWorkers] = useState([]);
  const [payrollPeriods, setPayrollPeriods] = useState([]);
  const [payrollItems, setPayrollItems] = useState([]);
  const [payrollAdjustments, setPayrollAdjustments] = useState([]);
  const [payrollPayments, setPayrollPayments] = useState([]);
  const [workforceReady, setWorkforceReady] = useState(true);
  const [payrollReady, setPayrollReady] = useState(true);
  const [workforceTab, setWorkforceTab] = useState("assignments");
  const [payrollMonth, setPayrollMonth] = useState(() => localDateISO().slice(0, 7));
  const [assignmentResultModal, setAssignmentResultModal] = useState(null);
  const [payslipItem, setPayslipItem] = useState(null);
  const [irrigation, setIrrigation] = useState([]);
  const [sprays, setSprays] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [timelineField, setTimelineField] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [nurseryView, setNurseryView] = useState("active");
  const [status, setStatus] = useState({ type: "loading", message: "Connecting to Supabase…" });
  const [modal, setModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [completionModal, setCompletionModal] = useState(null);
  const [expandedOperation, setExpandedOperation] = useState("");
  const [userModal, setUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    full_name: "", email: "", password: "", role: "viewer"
  });
  const [userSaving, setUserSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", farm_name: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const finishPasswordRecovery = useCallback(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState({}, document.title, window.location.pathname || "/");
    }
    setPasswordRecovery(false);
  }, []);

  useEffect(() => {
    const markOnline = () => setIsOnline(true);
    const markOffline = () => setIsOnline(false);
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    return () => {
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
    };
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
      setProfileForm({
        full_name: myProfile?.full_name || session.user.user_metadata?.full_name || "",
        farm_name: activeFarm.name || "My Farm"
      });
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

      const { data: attendanceRows, error: attendanceError } = await supabase
        .from("worker_attendance").select("*").eq("farm_id", activeFarm.id)
        .order("attendance_date", { ascending: false });
      const attendanceTableMissing = isMissingAttendanceTable(attendanceError);
      if (attendanceError && !attendanceTableMissing) throw attendanceError;

      const workforceQueries = await Promise.all([
        supabase.from("work_crews").select("*").eq("farm_id", activeFarm.id).order("name"),
        supabase.from("work_crew_members").select("*").eq("farm_id", activeFarm.id),
        supabase.from("work_assignments").select("*").eq("farm_id", activeFarm.id).order("work_date", { ascending: false }),
        supabase.from("work_assignment_fields").select("*").eq("farm_id", activeFarm.id),
        supabase.from("work_assignment_workers").select("*").eq("farm_id", activeFarm.id)
      ]);
      const workforceTableMissing = workforceQueries.some(query => isMissingWorkforceTable(query.error));
      const workforceError = workforceQueries.find(query => query.error && !isMissingWorkforceTable(query.error))?.error;
      if (workforceError) throw workforceError;
      const [crewRows, crewMemberRows, assignmentRows, assignmentFieldRows, assignmentWorkerRows] = workforceQueries.map(query => query.data || []);

      let periodRows = [];
      let payrollItemRows = [];
      let adjustmentRows = [];
      let paymentRows = [];
      let payrollTableMissing = workforceTableMissing;
      if (["owner", "manager"].includes(myProfile?.role)) {
        const payrollQueries = await Promise.all([
          supabase.from("payroll_periods").select("*").eq("farm_id", activeFarm.id).order("period_month", { ascending: false }),
          supabase.from("payroll_items").select("*").eq("farm_id", activeFarm.id),
          supabase.from("payroll_adjustments").select("*").eq("farm_id", activeFarm.id).order("adjustment_date", { ascending: false }),
          supabase.from("payroll_payments").select("*").eq("farm_id", activeFarm.id).order("payment_date", { ascending: false })
        ]);
        payrollTableMissing = payrollQueries.some(query => isMissingWorkforceTable(query.error));
        const payrollError = payrollQueries.find(query => query.error && !isMissingWorkforceTable(query.error))?.error;
        if (payrollError) throw payrollError;
        [periodRows, payrollItemRows, adjustmentRows, paymentRows] = payrollQueries.map(query => query.data || []);
      }

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
      setAttendance(attendanceRows || []);
      setAttendanceReady(!attendanceTableMissing);
      setCrews(crewRows);
      setCrewMembers(crewMemberRows);
      setWorkAssignments(assignmentRows);
      setAssignmentFields(assignmentFieldRows);
      setAssignmentWorkers(assignmentWorkerRows);
      setPayrollPeriods(periodRows);
      setPayrollItems(payrollItemRows);
      setPayrollAdjustments(adjustmentRows);
      setPayrollPayments(paymentRows);
      setWorkforceReady(!workforceTableMissing);
      setPayrollReady(!payrollTableMissing);
      setIrrigation(irrigationRows);
      setSprays(sprayRows);
      setInventory(inventoryRows);
      setHarvests(harvestRows);
      setEquipment(equipmentRows);
      setTimelineField(v => v || farmFields[0]?.id || "");
      const setupMessages = [];
      if (attendanceTableMissing) setupMessages.push("run database-v8-2-attendance.sql to activate attendance");
      if (workforceTableMissing) setupMessages.push("run database-v8-4-workforce-payroll.sql to activate Workforce & Payroll");
      setStatus({
        type: setupMessages.length ? "error" : "success",
        message: setupMessages.length
          ? `Farm data loaded; ${setupMessages.join("; ")}.`
          : "Connected securely. Live V8.6 farm, workforce, payroll and finance records loaded."
      });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    }
  }, [session]);

  useEffect(() => { if (session) loadData(); }, [session, loadData]);

  const role = profile?.role || "viewer";
  const canWrite = WRITE_ROLES.has(role) && profile?.status !== "inactive";
  const canManageUsers = role === "owner";
  const canSeeFinancials = ["owner", "manager"].includes(role);
  const signedInName = firstName(profile?.full_name || session?.user?.user_metadata?.full_name || session?.user?.email);
  const greeting = greetingForHour(new Date().getHours());
  const canWriteModule = module => {
    if (!canWrite) return false;
    if (["owner","manager"].includes(role)) return true;
    if (role === "storekeeper") return ["inventory","equipment"].includes(module);
    if (role === "supervisor") return ["planner","nursery","crops","activities","calendar","workers","attendance","workforce","irrigation","sprays","harvests"].includes(module);
    return false;
  };
  const typeModule = {block:"blocks",field:"fields",batch:"nursery",cycle:"crops",activity:"activities",worker:"workers",crew:"workforce",assignment:"workforce",adjustment:"payroll",payment:"payroll",irrigation:"irrigation",spray:"sprays",inventory:"inventory",harvest:"harvests",equipment:"equipment"};
  const tableModule = {farm_blocks:"blocks",fields:"fields",propagation_batches:"nursery",crop_cycles:"crops",field_activities:"activities",workers:"workers",worker_attendance:"attendance",work_crews:"workforce",work_assignments:"workforce",payroll_adjustments:"payroll",payroll_payments:"payroll",irrigation_records:"irrigation",spray_records:"sprays",inventory_items:"inventory",harvest_records:"harvests",equipment:"equipment"};
  const today = localDateISO();
  const weekEnd = addDaysISO(today, 7);
  const activityOperations = useMemo(() => buildActivityOperations(activities, fields), [activities, fields]);
  const activeWorkers = useMemo(
    () => workers.filter(worker => String(worker.status || "active").toLowerCase() !== "inactive"),
    [workers]
  );
  const selectedAttendanceRows = useMemo(
    () => attendance.filter(row => row.attendance_date === attendanceDate),
    [attendance, attendanceDate]
  );
  const selectedAttendanceMap = useMemo(
    () => new Map(selectedAttendanceRows.map(row => [row.worker_id, row])),
    [selectedAttendanceRows]
  );
  const attendanceWorkersForDay = useMemo(() => {
    const recordedIds = new Set(selectedAttendanceRows.map(row => row.worker_id));
    return workers.filter(worker =>
      String(worker.status || "active").toLowerCase() !== "inactive" || recordedIds.has(worker.id)
    );
  }, [workers, selectedAttendanceRows]);
  const attendanceMonthData = useMemo(
    () => buildAttendanceMonthSummary({ month: attendanceMonth, workers, attendance }),
    [attendanceMonth, workers, attendance]
  );
  const attendanceMonthRows = attendanceMonthData.rows;
  const attendanceCalendarDays = useMemo(
    () => buildAttendanceCalendar(attendanceMonth),
    [attendanceMonth]
  );
  const attendanceMonthDates = attendanceMonthData.dates;
  const attendanceWorkerSummaries = useMemo(() => workers
    .map(worker => {
      const totals = attendanceMonthData.byWorker.get(worker.id) || emptyAttendanceTotals(attendanceMonthDates.length);
      const { present, absent, marked, unmarked } = totals;
      const dailyRate = Number(worker.daily_rate || 0);
      const estimatedPay = attendanceBasePay(worker, present, attendanceMonthDates.length);
      return {
        worker, present, absent, marked, unmarked, dailyRate,
        rate: marked ? Math.round(present / marked * 100) : 0,
        estimatedPay,
        payBasis: employeeWageBasis(worker)
      };
    })
    .filter(summary => summary.marked > 0 || String(summary.worker.status || "active").toLowerCase() !== "inactive"),
  [workers, attendanceMonthData, attendanceMonthDates]);
  const attendanceMonthLabourCost = useMemo(
    () => attendanceWorkerSummaries.reduce((sum, summary) => sum + summary.estimatedPay, 0),
    [attendanceWorkerSummaries]
  );
  const visibleAttendanceWorkerSummaries = useMemo(
    () => attendanceWorkerSummaries.filter(summary =>
      matchesSearch(summary.worker.full_name, summary.worker.role, summary.worker.status)
    ),
    [attendanceWorkerSummaries, searchTerm]
  );
  const attendanceSummary = useMemo(() => {
    const present = attendanceMonthRows.filter(row => row.status === "present").length;
    const absent = attendanceMonthRows.filter(row => row.status === "absent").length;
    const recorded = present + absent;
    const dayRows = selectedAttendanceRows;
    const presentToday = attendance.filter(row => row.attendance_date === today && row.status === "present").length;
    const presentOnDate = dayRows.filter(row => row.status === "present").length;
    const absentOnDate = dayRows.filter(row => row.status === "absent").length;
    const presentWorkerIds = new Set(dayRows.filter(row => row.status === "present").map(row => row.worker_id));
    const dayLabourCost = workers
      .filter(worker => presentWorkerIds.has(worker.id))
      .reduce((sum, worker) => sum + workerDailyEquivalent(worker, attendanceMonthDates.length), 0);
    return {
      present,
      absent,
      rate: recorded ? Math.round(present / recorded * 100) : 0,
      recordedDays: attendanceMonthDates.length,
      presentToday,
      presentOnDate,
      absentOnDate,
      unmarkedOnDate: Math.max(0, activeWorkers.length - dayRows.filter(row => activeWorkers.some(worker => worker.id === row.worker_id)).length),
      dayLabourCost
    };
  }, [attendance, attendanceMonthRows, attendanceMonthDates, selectedAttendanceRows, workers, activeWorkers, today]);

  const payrollPeriodMonth = `${payrollMonth}-01`;
  const currentPayrollPeriod = useMemo(
    () => payrollPeriods.find(period => period.period_month === payrollPeriodMonth) || null,
    [payrollPeriods, payrollPeriodMonth]
  );
  const workforceAllocation = useMemo(() => buildWorkforceAllocation({
    workers,
    assignments: workAssignments,
    assignmentWorkers,
    assignmentFields,
    fields,
    cycles
  }), [workers, workAssignments, assignmentWorkers, assignmentFields, fields, cycles]);
  const approvedLabourEntries = useMemo(() => buildApprovedLabourEntries({
    workers,
    assignments: workAssignments,
    assignmentWorkers,
    assignmentFields,
    fields
  }), [workers, workAssignments, assignmentWorkers, assignmentFields, fields]);
  const approvedLabourMonthEntries = useMemo(
    () => approvedLabourEntries.filter(entry => String(entry.workDate || "").startsWith(payrollMonth)),
    [approvedLabourEntries, payrollMonth]
  );
  const approvedLabourMonthTotal = useMemo(
    () => roundNumber(approvedLabourMonthEntries.reduce((sum, entry) => sum + entry.total, 0), 2),
    [approvedLabourMonthEntries]
  );
  const approvedLabourMonthByWorker = useMemo(() => {
    const summary = new Map();
    approvedLabourMonthEntries.forEach(entry => {
      if (!summary.has(entry.workerId)) summary.set(entry.workerId, { assignmentIds: new Set(), regularHours: 0, overtimeHours: 0, total: 0 });
      const row = summary.get(entry.workerId);
      row.assignmentIds.add(entry.assignmentId);
      row.regularHours += entry.regularHours;
      row.overtimeHours += entry.overtimeHours;
      row.total += entry.total;
    });
    return summary;
  }, [approvedLabourMonthEntries]);
  const activityCostLedger = useMemo(() => buildActivityCostLedger({
    activities,
    assignments: workAssignments,
    assignmentFields
  }), [activities, workAssignments, assignmentFields]);
  const payrollPreviewRows = useMemo(() => calculatePayrollPreview({
    month: payrollMonth,
    workers,
    attendance,
    assignments: workAssignments,
    assignmentWorkers,
    adjustments: payrollAdjustments
  }), [payrollMonth, workers, attendance, workAssignments, assignmentWorkers, payrollAdjustments]);
  const payrollAttendanceData = useMemo(
    () => buildAttendanceMonthSummary({ month: payrollMonth, workers, attendance }),
    [payrollMonth, workers, attendance]
  );
  const currentPayrollItems = useMemo(
    () => currentPayrollPeriod ? payrollItems.filter(item => item.payroll_period_id === currentPayrollPeriod.id) : [],
    [payrollItems, currentPayrollPeriod]
  );
  const payrollRows = useMemo(() => {
    const activePayments = payrollPayments.filter(payment =>
      payment.period_month === payrollPeriodMonth && payment.status === "approved"
    );
    const useFrozenAmounts = currentPayrollItems.length && ["approved", "closed"].includes(currentPayrollPeriod?.status);
    const sourceRows = useFrozenAmounts
      ? currentPayrollItems.map(item => ({
          worker: workers.find(worker => worker.id === item.worker_id) || { id: item.worker_id, full_name: "Former employee", role: "Worker" },
          recordedWorkDays: Number(item.recorded_work_days || 0),
          presentDays: Number(item.present_days || 0),
          absentDays: Number(item.absent_days || 0),
          regularPay: Number(item.regular_pay || 0),
          overtimePay: Number(item.overtime_pay || 0),
          bonuses: Number(item.bonus_total || 0),
          advances: Number(item.advance_total || 0),
          deductions: Number(item.deduction_total || 0),
          grossPay: Number(item.gross_pay || 0),
          netPay: Number(item.net_pay || 0),
          calculationNotes: item.calculation_notes || "Generated payroll snapshot",
          itemId: item.id
        }))
      : payrollPreviewRows;
    return sourceRows.map(row => {
      const workerPayments = activePayments.filter(payment => payment.worker_id === row.worker.id);
      const paid = workerPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const work = approvedLabourMonthByWorker.get(row.worker.id);
      const attendanceTotals = payrollAttendanceData.byWorker.get(row.worker.id) || emptyAttendanceTotals(payrollAttendanceData.dates.length);
      return {
        ...row,
        recordedWorkDays: payrollAttendanceData.dates.length,
        presentDays: attendanceTotals.present,
        absentDays: attendanceTotals.absent,
        assignmentCount: work?.assignmentIds.size || 0,
        regularHours: roundNumber(work?.regularHours || 0, 2),
        overtimeHours: roundNumber(work?.overtimeHours || 0, 2),
        payments: workerPayments,
        paid,
        balance: Math.max(0, roundNumber(row.netPay - paid, 2))
      };
    });
  }, [currentPayrollItems, currentPayrollPeriod, payrollPreviewRows, payrollPayments, payrollPeriodMonth, workers, approvedLabourMonthByWorker, payrollAttendanceData]);
  const payrollSummary = useMemo(() => payrollRows.reduce((summary, row) => ({
    gross: summary.gross + row.grossPay,
    net: summary.net + row.netPay,
    paid: summary.paid + row.paid,
    balance: summary.balance + row.balance,
    bonuses: summary.bonuses + row.bonuses,
    advances: summary.advances + row.advances,
    deductions: summary.deductions + row.deductions
  }), { gross: 0, net: 0, paid: 0, balance: 0, bonuses: 0, advances: 0, deductions: 0 }), [payrollRows]);
  const workforceMetrics = useMemo(() => ({
    activeCrews: crews.filter(crew => crew.status === "active").length,
    planned: workAssignments.filter(assignment => ["planned", "in_progress"].includes(assignment.status)).length,
    pendingApproval: workAssignments.filter(assignment => assignment.status === "completed" && assignment.approval_status === "pending").length,
    approvedThisMonth: workAssignments.filter(assignment => assignment.approval_status === "approved" && String(assignment.work_date || "").startsWith(payrollMonth)).length
  }), [crews, workAssignments, payrollMonth]);
  const workforceProductivity = useMemo(() => buildWorkforceProductivity({
    month: payrollMonth,
    workers,
    assignments: workAssignments,
    assignmentWorkers,
    assignmentFields,
    attendance
  }), [payrollMonth, workers, workAssignments, assignmentWorkers, assignmentFields, attendance]);
  const activeNurseryBatches = useMemo(
    () => batches.filter(batch => isActiveNurseryBatch(batch)),
    [batches]
  );
  const transplantedNurseryBatches = useMemo(
    () => batches.filter(batch => !isActiveNurseryBatch(batch)),
    [batches]
  );
  const fieldStatusSummary = useMemo(() => {
    const summary = {
      active: { count: 0, area: 0 },
      growing: { count: 0, area: 0 },
      fallow: { count: 0, area: 0 }
    };
    fields.forEach(field => {
      const statusKey = canonicalFieldStatus(field.status);
      summary[statusKey].count += 1;
      summary[statusKey].area += Number(field.area_acres || 0);
    });
    return summary;
  }, [fields]);

  const metrics = useMemo(() => {
    const totalArea = fields.reduce((sum, f) => sum + Number(f.area_acres || 0), 0);
    const activeFields = fields.filter(field => canonicalFieldStatus(field.status) !== "fallow").length;
    const seedlings = activeNurseryBatches.reduce((sum, batch) => sum + nurseryLiveSeedlings(batch), 0);
    const ready = activeNurseryBatches.filter(batch => String(batch.status).toLowerCase() === "ready").length;
    const dueToday = activityOperations.filter(a => a.scheduled_date === today && !["completed","cancelled"].includes(a.status)).length;
    const overdue = activityOperations.filter(a => a.scheduled_date && a.scheduled_date < today && !["completed","cancelled"].includes(a.status)).length;
    const lowStock = inventory.filter(i => Number(i.quantity_on_hand || 0) <= Number(i.reorder_level || 0)).length;
    const revenue = harvests.reduce((s,h) => s + Number(h.quantity || 0) * Number(h.price_per_unit || 0), 0);
    const fieldCosts = activityCostLedger.posted
      + irrigation.reduce((s,r) => s + Number(r.cost || 0), 0)
      + sprays.filter(r => !isActivitySprayHistory(r)).reduce((s,r) => s + Number(r.cost || 0), 0)
      + workforceAllocation.total;
    const countableTasks = activityOperations.filter(a => a.status !== "cancelled");
    const completedTasks = countableTasks.filter(a => a.status === "completed").length;
    const taskCompletion = countableTasks.length ? Math.round(completedTasks / countableTasks.length * 100) : 0;
    const upcoming7 = activityOperations.filter(a => a.scheduled_date > today && a.scheduled_date <= weekEnd && !["completed","cancelled"].includes(a.status)).length;
    const inventoryValue = inventory.reduce((s,i) => s + Number(i.quantity_on_hand || 0) * Number(i.unit_cost || 0), 0);
    const totalFuel = irrigation.reduce((s,r) => s + Number(r.fuel_litres || 0), 0);
    const irrigationHours = irrigation.reduce((s,r) => s + Number(r.duration_hours || 0), 0);
    const pressureRecords = irrigation.filter(r => Number(r.pressure_bar) > 0);
    const averagePressure = pressureRecords.length
      ? pressureRecords.reduce((s,r) => s + Number(r.pressure_bar || 0), 0) / pressureRecords.length
      : 0;
    const harvestedQuantity = harvests.reduce((s,h) => s + Number(h.quantity || 0), 0);
    return {
      totalArea, activeFields, seedlings, ready, dueToday, overdue, lowStock,
      revenue, fieldCosts, profit: revenue-fieldCosts, completedTasks, taskCompletion,
      upcoming7, inventoryValue, totalFuel, irrigationHours, averagePressure, harvestedQuantity
    };
  }, [fields, activeNurseryBatches, activityCostLedger, activityOperations, inventory, harvests, irrigation, sprays, workforceAllocation, today, weekEnd]);

  const blockName = id => blocks.find(b => b.id === id)?.name || "Unknown block";
  const fieldName = id => fields.find(f => f.id === id)?.name || "Unknown field";
  const batchName = id => {
    const b = batches.find(x => x.id === id);
    return b ? `${b.crop_name}${b.variety ? " · " + b.variety : ""}` : "Direct planting";
  };
  const workerName = id => workers.find(w => w.id === id)?.full_name || "Unassigned";
  const crewName = id => crews.find(crew => crew.id === id)?.name || "Individual team";
  const assignmentWorkerLinks = id => assignmentWorkers.filter(link => link.assignment_id === id);
  const assignmentFieldLinks = id => assignmentFields.filter(link => link.assignment_id === id);
  const assignmentWorkerLabel = id => {
    const links = assignmentWorkerLinks(id);
    if (!links.length) return "No employees";
    if (links.length === 1) return workerName(links[0].worker_id);
    return `${links.length} employees`;
  };
  const assignmentFieldLabel = id => {
    const links = assignmentFieldLinks(id);
    if (!links.length) return "No fields";
    if (links.length === 1) return fieldName(links[0].field_id);
    return `${links.length} fields`;
  };
  const cycleName = id => {
    const c = cycles.find(x => x.id === id);
    return c ? `${c.crop_name}${c.variety ? " · " + c.variety : ""}` : "No crop cycle";
  };
  const equipmentName = id => equipment.find(e => e.id === id)?.name || "Not selected";
  const money = value => Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "KES", maximumFractionDigits: 0 });
  const workerPayLabel = worker => {
    const wageType = worker.wage_type || "daily";
    if (wageType === "monthly") return `${money(worker.monthly_salary)} / month`;
    if (wageType === "hourly") return `${money(worker.hourly_rate)} / hour`;
    if (wageType === "piece") return `${money(worker.piece_rate)} / ${worker.piece_unit || "unit"}`;
    return `${money(worker.daily_rate)} / day`;
  };
  function syncReportingMonth(month, selectedDate = null) {
    if (!/^\d{4}-\d{2}$/.test(String(month || ""))) return;
    setAttendanceMonth(month);
    setPayrollMonth(month);
    setAttendanceDate(current => selectedDate || (String(current).startsWith(month) ? current : `${month}-01`));
  }
  async function saveProfile(event) {
    event.preventDefault();
    if (!canManageUsers || profileSaving || !farm) return;
    const fullName = profileForm.full_name.trim();
    const farmName = profileForm.farm_name.trim();
    if (!fullName || !farmName) {
      setStatus({ type: "error", message: "Enter both the Administrator name and farm name." });
      return;
    }
    setProfileSaving(true);
    setStatus({ type: "loading", message: "Updating your Administrator profile…" });
    try {
      const { error: authError } = await supabase.auth.updateUser({ data: { full_name: fullName } });
      if (authError) throw authError;
      const { error: profileError } = await supabase.from("farm_profiles").update({
        full_name: fullName,
        updated_at: new Date().toISOString()
      }).eq("id", session.user.id);
      if (profileError) throw profileError;
      const { error: farmError } = await supabase.from("farms").update({ name: farmName }).eq("id", farm.id);
      if (farmError) throw farmError;
      await loadData();
      setStatus({ type: "success", message: "Administrator and farm details updated." });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setProfileSaving(false);
    }
  }
  async function sendProfilePasswordReset() {
    const email = profile?.email || session.user.email;
    if (!email || profileSaving) return;
    setProfileSaving(true);
    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}?recovery=1`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setStatus({ type: "success", message: `Password reset instructions sent to ${email}.` });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setProfileSaving(false);
    }
  }
  function matchesSearch(...values) {
    const query = searchTerm.trim().toLowerCase();
    return !query || values.some(value => String(value ?? "").toLowerCase().includes(query));
  }
  const serviceDue = equipment.filter(e => {
    const dueByDate = e.next_service_date && e.next_service_date <= today;
    const interval = Number(e.service_interval_hours || 0);
    const hours = Number(e.current_hours || 0);
    return e.status === "service due" || dueByDate || (interval > 0 && hours >= interval);
  });

  const weekActivities = useMemo(() => activityOperations
    .filter(a => a.scheduled_date >= today && a.scheduled_date <= weekEnd && a.status !== "cancelled")
    .slice()
    .sort((a,b) => String(a.scheduled_date).localeCompare(String(b.scheduled_date))),
  [activityOperations, today, weekEnd]);

  const fieldPerformance = useMemo(() => fields.map(field => {
    const fieldCycles = cycles.filter(c => c.field_id === field.id);
    const fieldActivities = activities.filter(a => a.field_id === field.id);
    const fieldIrrigation = irrigation.filter(r => r.field_id === field.id);
    const fieldSprays = sprays.filter(r => r.field_id === field.id);
    const fieldHarvests = harvests.filter(h => h.field_id === field.id);
    const revenue = fieldHarvests.reduce((s,h) => s + Number(h.quantity || 0) * Number(h.price_per_unit || 0), 0);
    const costs = fieldActivities.reduce((sum, activity) => sum + Number(activityCostLedger.byActivity.get(activity.id)?.posted || 0), 0)
      + fieldIrrigation.reduce((s,r) => s + Number(r.cost || 0), 0)
      + fieldSprays.filter(r => !isActivitySprayHistory(r)).reduce((s,r) => s + Number(r.cost || 0), 0)
      + workforceAllocation.rows.filter(row => row.fieldId === field.id).reduce((sum, row) => sum + row.cost, 0);
    const yieldQuantity = fieldHarvests.reduce((s,h) => s + Number(h.quantity || 0), 0);
    const activeCycle = fieldCycles.find(c => !["completed","harvested","closed"].includes(String(c.status || "").toLowerCase()));
    const displayCycle = activeCycle || fieldCycles[0];
    return {
      id: field.id,
      name: field.name,
      crop: displayCycle ? `${displayCycle.crop_name}${displayCycle.variety ? " · " + displayCycle.variety : ""}` : "No crop recorded",
      active: Boolean(activeCycle),
      area: Number(field.area_acres || 0),
      yieldQuantity,
      revenue,
      costs,
      profit: revenue - costs
    };
  }).sort((a,b) => b.profit - a.profit),
  [fields, cycles, activities, irrigation, sprays, harvests, workforceAllocation, activityCostLedger]);
  const dashboardFieldRows = useMemo(
    () => fieldPerformance.slice().sort((a, b) => Number(b.active) - Number(a.active) || b.area - a.area).slice(0, 6),
    [fieldPerformance]
  );

  const smartItems = useMemo(() => {
    const items = [];
    activityOperations.forEach(operation => {
      if (!operation.scheduled_date || ["completed","cancelled"].includes(operation.status)) return;
      if (operation.scheduled_date > weekEnd) return;
      const overdue = operation.scheduled_date < today;
      const dueToday = operation.scheduled_date === today;
      items.push({
        id: `activity-${operation.key}`,
        priority: overdue ? "urgent" : dueToday ? "high" : "normal",
        date: operation.scheduled_date,
        title: `${operation.title} · ${operation.items.length === 1 ? fieldName(operation.items[0].field_id) : `${operation.items.length} fields`}`,
        detail: overdue ? `${daysBetween(operation.scheduled_date, today)} day(s) overdue` : dueToday ? "Due today" : `Scheduled ${formatShortDate(operation.scheduled_date)}`,
        page: "calendar"
      });
    });
    workAssignments.forEach(assignment => {
      if (!assignment.work_date || ["completed", "cancelled"].includes(assignment.status)) return;
      if (assignment.work_date > weekEnd) return;
      const overdue = assignment.work_date < today;
      items.push({
        id: `workforce-${assignment.id}`,
        priority: overdue ? "urgent" : assignment.work_date === today ? "high" : "normal",
        date: assignment.work_date,
        title: `Workforce · ${assignment.title}`,
        detail: `${assignmentFieldLabel(assignment.id)} · ${assignmentWorkerLabel(assignment.id)}`,
        page: "workforce"
      });
    });
    batches.forEach(batch => {
      if (!batch.expected_transplant_date || batch.status === "transplanted" || batch.expected_transplant_date > weekEnd) return;
      const overdue = batch.expected_transplant_date < today;
      items.push({
        id: `batch-${batch.id}`,
        priority: overdue ? "urgent" : batch.expected_transplant_date === today ? "high" : "normal",
        date: batch.expected_transplant_date,
        title: `Transplant ${batch.crop_name}${batch.variety ? " · " + batch.variety : ""}`,
        detail: overdue ? "Expected transplant date has passed" : `Expected ${formatShortDate(batch.expected_transplant_date)}`,
        page: "nursery"
      });
    });
    const harvestHorizon = addDaysISO(today, 14);
    cycles.forEach(cycle => {
      if (!cycle.expected_harvest_date || ["completed","harvested","closed"].includes(String(cycle.status || "").toLowerCase()) || cycle.expected_harvest_date > harvestHorizon) return;
      const overdue = cycle.expected_harvest_date < today;
      items.push({
        id: `harvest-${cycle.id}`,
        priority: overdue ? "high" : "normal",
        date: cycle.expected_harvest_date,
        title: `Harvest window · ${cycle.crop_name}`,
        detail: `${fieldName(cycle.field_id)} · ${overdue ? "expected date passed" : formatShortDate(cycle.expected_harvest_date)}`,
        page: "crops"
      });
    });
    inventory.forEach(item => {
      const stock = Number(item.quantity_on_hand || 0);
      const reorder = Number(item.reorder_level || 0);
      if (stock > reorder) return;
      const suggested = Math.max(0, reorder * 2 - stock);
      items.push({
        id: `stock-${item.id}`,
        priority: stock <= 0 ? "urgent" : "high",
        date: "",
        title: `Restock ${item.item_name}`,
        detail: `${stock} ${item.unit || "units"} remaining${suggested ? ` · suggested order ${suggested}` : ""}`,
        page: "inventory"
      });
    });
    serviceDue.forEach(item => items.push({
      id: `service-${item.id}`,
      priority: "urgent",
      date: item.next_service_date || "",
      title: `Service ${item.name}`,
      detail: item.next_service_date ? `Due ${formatShortDate(item.next_service_date)}` : `${item.current_hours || 0} operating hours recorded`,
      page: "equipment"
    }));
    const order = { urgent: 0, high: 1, normal: 2 };
    return items.sort((a,b) => order[a.priority] - order[b.priority] || String(a.date || "9999").localeCompare(String(b.date || "9999")));
  }, [activityOperations, workAssignments, assignmentFields, assignmentWorkers, workers, batches, cycles, inventory, serviceDue, today, weekEnd, fields]);

  function openSmartItem(item) {
    setSearchTerm("");
    setPage(item.page);
  }

  function printReport() {
    window.setTimeout(() => window.print(), 120);
  }

  function downloadFieldReport() {
    if (!canSeeFinancials) return;
    const rows = [
      ["Field", "Crop", "Area acres", "Harvest quantity", "Revenue KES", "Recorded costs KES", "Estimated profit KES"],
      ...fieldPerformance.map(row => [
        row.name, row.crop, row.area, row.yieldQuantity,
        row.revenue.toFixed(2), row.costs.toFixed(2), row.profit.toFixed(2)
      ])
    ];
    const csv = rows.map(row => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `farm-manager-v8-6-field-report-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function downloadAttendanceSummary() {
    if (!canSeeFinancials) return;
    const rows = [
      ["Month", "Employee", "Role", "Status", "Present days", "Absent days", "Unmarked days", "Attendance rate %", "Wage basis", "Estimated attendance pay KES"],
      ...attendanceWorkerSummaries.map(summary => [
        attendanceMonth,
        summary.worker.full_name,
        summary.worker.role || "Worker",
        summary.worker.status || "active",
        summary.present,
        summary.absent,
        summary.unmarked,
        summary.rate,
        summary.payBasis,
        summary.estimatedPay.toFixed(2)
      ])
    ];
    const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `farm-manager-v8-6-attendance-${attendanceMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function open(type) {
    if (!canWriteModule(typeModule[type])) return setStatus({type:"error",message:"Your role cannot add records in this section."});
    if (["crew", "assignment"].includes(type) && !workforceReady) return setStatus({type:"error",message:"Run database-v8-4-workforce-payroll.sql once before adding workforce records."});
    if (["adjustment", "payment"].includes(type) && !payrollReady) return setStatus({type:"error",message:"Run database-v8-4-workforce-payroll.sql once before using payroll."});
    setEditingId(null);
    if (type === "block") setForm(emptyBlock);
    if (type === "field") setForm({ ...emptyField, blockId: blocks[0]?.id || "" });
    if (type === "batch") setForm(emptyBatch);
    if (type === "cycle") setForm({
      ...emptyCycle,
      field_id: fields[0]?.id || "",
      source_batch_id: activeNurseryBatches.find(b => b.status === "ready")?.id || "",
      area_acres: fields[0]?.area_acres || ""
    });
    if (type === "activity") setForm({
      ...emptyActivity,
      field_id: fields[0]?.id || "",
      field_ids: fields[0]?.id ? [fields[0].id] : [],
      crop_cycle_id: cycles.find(c => c.field_id === fields[0]?.id)?.id || "",
      worker_id: workers[0]?.id || "",
      operation_group_id: generateOperationId()
    });
    if (type === "worker") setForm(emptyWorker);
    if (type === "crew") setForm({ ...emptyCrew, supervisor_id: activeWorkers[0]?.id || "" });
    if (type === "assignment") setForm({
      ...emptyAssignment,
      field_ids: fields[0]?.id ? [fields[0].id] : [],
      worker_ids: activeWorkers[0]?.id ? [activeWorkers[0].id] : []
    });
    if (type === "adjustment") setForm({
      ...emptyAdjustment,
      worker_id: activeWorkers[0]?.id || "",
      period_month: payrollMonth
    });
    if (type === "payment") {
      const firstOutstanding = payrollRows.find(row => row.balance > 0);
      setForm({
        ...emptyPayment,
        worker_id: firstOutstanding?.worker.id || activeWorkers[0]?.id || "",
        amount: firstOutstanding?.balance ? String(firstOutstanding.balance) : ""
      });
    }
    if (type === "irrigation") setForm({ ...emptyIrrigation, field_id: fields[0]?.id || "", crop_cycle_id: cycles.find(c => c.field_id === fields[0]?.id)?.id || "", equipment_id: equipment[0]?.id || "" });
    if (type === "spray") setForm({
      ...emptySpray,
      field_id: fields[0]?.id || "",
      field_ids: fields[0]?.id ? [fields[0].id] : [],
      crop_cycle_id: cycles.find(c => c.field_id === fields[0]?.id)?.id || "",
      worker_id: workers[0]?.id || "",
      operation_group_id: generateOperationId()
    });
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
      blockId: item.farm_block_id || "", status: canonicalFieldStatus(item.status)
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
    if (type === "activity") {
      const { userNotes, meta } = unpackRecordNotes(item.notes);
      setForm({
      field_id: item.field_id || "", crop_cycle_id: item.crop_cycle_id || "",
      field_ids: item.field_id ? [item.field_id] : [],
      activity_type: item.activity_type || "irrigation",
      operation_name: meta?.operationName || capitalize(item.activity_type || "activity"),
      operation_group_id: meta?.groupId || "",
      scheduled_date: item.scheduled_date || "", completed_date: item.completed_date || "",
      status: item.status || "planned", worker_id: item.worker_id || "",
      input_name: item.input_name || "", quantity: item.quantity || "",
      unit: item.unit || "", labour_cost: item.labour_cost || "",
      input_cost: item.input_cost || "", notes: userNotes,
      inventory_item_id: meta?.inventoryItemId || "",
      active_ingredient: meta?.activeIngredient || "",
      target_problem: meta?.targetProblem || "",
      dose: meta?.dose || "", weather: meta?.weather || "",
      equipment_id: meta?.equipmentId || "",
      phi_days: meta?.phiDays || "", rei_hours: meta?.reiHours || "",
      _record_meta: meta || null
    });
    }
    if (type === "worker") setForm({
      ...emptyWorker,
      full_name: item.full_name || "", phone: item.phone || "",
      role: item.role || "", employee_number: item.employee_number || "",
      id_number: item.id_number || "", email: item.email || "",
      hire_date: item.hire_date || "", employment_type: item.employment_type || "casual",
      wage_type: item.wage_type || "daily", daily_rate: item.daily_rate || "",
      hourly_rate: item.hourly_rate || "", monthly_salary: item.monthly_salary || "",
      piece_rate: item.piece_rate || "", piece_unit: item.piece_unit || "",
      normal_hours_per_day: item.normal_hours_per_day || "8",
      emergency_contact_name: item.emergency_contact_name || "",
      emergency_contact_phone: item.emergency_contact_phone || "",
      payment_method: item.payment_method || "M-Pesa",
      payment_account: item.payment_account || "", status: item.status || "active",
      notes: item.notes || ""
    });
    if (type === "crew") setForm({
      ...emptyCrew,
      name: item.name || "", supervisor_id: item.supervisor_id || "",
      worker_ids: crewMembers.filter(member => member.crew_id === item.id && member.status === "active").map(member => member.worker_id),
      status: item.status || "active", notes: item.notes || ""
    });
    if (type === "assignment") {
      const workerLinks = assignmentWorkers.filter(link => link.assignment_id === item.id);
      setForm({
        ...emptyAssignment,
        title: item.title || "", work_date: item.work_date || today,
        due_date: item.due_date || "", description: item.description || "",
        status: item.status || "planned", crew_id: item.crew_id || "",
        field_ids: assignmentFields.filter(link => link.assignment_id === item.id).map(link => link.field_id),
        worker_ids: workerLinks.map(link => link.worker_id),
        unit_name: item.unit_name || "", planned_units: item.planned_units || "",
        regular_hours: workerLinks[0]?.regular_hours || "",
        overtime_hours: workerLinks[0]?.overtime_hours || "",
        completed_units: workerLinks[0]?.completed_units || "",
        overtime_multiplier: item.overtime_multiplier || "1.5",
        approval_notes: item.approval_notes || ""
      });
    }
    if (type === "irrigation") setForm({ ...emptyIrrigation, ...item });
    if (type === "spray") {
      const { userNotes, meta } = unpackRecordNotes(item.notes);
      setForm({
        ...emptySpray, ...item, field_ids: item.field_id ? [item.field_id] : [],
        operation_name: meta?.operationName || "Spray application",
        operation_group_id: meta?.groupId || "",
        inventory_item_id: meta?.inventoryItemId || "",
        equipment_id: meta?.equipmentId || "",
        notes: userNotes, _record_meta: meta || null
      });
    }
    if (type === "inventory") {
      const { userNotes, ledger } = unpackInventoryNotes(item.notes);
      setForm({ ...emptyInventory, ...item, notes: userNotes, _inventory_ledger: ledger });
    }
    if (type === "harvest") setForm({ ...emptyHarvest, ...item });
    if (type === "equipment") setForm({ ...emptyEquipment, ...item });
    setModal(type);
  }

  function activeCycleIdForField(fieldId) {
    const fieldCycles = cycles.filter(c => c.field_id === fieldId);
    return (fieldCycles.find(c => !["completed","harvested","closed"].includes(String(c.status || "").toLowerCase())) || fieldCycles[0])?.id || null;
  }

  function operationMetaFromForm(kind, fieldIds) {
    return {
      v: 1,
      kind,
      groupId: form.operation_group_id || generateOperationId(),
      operationName: form.operation_name?.trim() || (form.activity_type === "spraying" ? "Boom spray" : capitalize(form.activity_type || "Farm operation")),
      fieldIds,
      totalArea: roundNumber(fieldIds.reduce((sum,id) => sum + Number(fields.find(f => f.id === id)?.area_acres || 0), 0), 3),
      allocation: "field-area",
      inventoryItemId: form.inventory_item_id || null,
      equipmentId: form.equipment_id || null,
      activeIngredient: form.active_ingredient?.trim() || null,
      targetProblem: form.target_problem?.trim() || null,
      dose: form.dose?.trim() || null,
      weather: form.weather?.trim() || null,
      phiDays: Number(form.phi_days || 0),
      reiHours: Number(form.rei_hours || 0)
    };
  }

  function mergeEditedRecordMeta(kind) {
    if (!form._record_meta && kind !== "multi-field-operation") return null;
    const baseMeta = form._record_meta || {
      v: 1,
      kind,
      groupId: form.operation_group_id || `single-${editingId}`,
      fieldIds: form.field_id ? [form.field_id] : [],
      allocation: "field-area"
    };
    return {
      ...baseMeta,
      kind: baseMeta.kind || kind,
      operationName: form.operation_name?.trim() || baseMeta.operationName,
      inventoryItemId: form.inventory_item_id || null,
      equipmentId: form.equipment_id || null,
      activeIngredient: form.active_ingredient?.trim() || null,
      targetProblem: form.target_problem?.trim() || null,
      dose: form.dose?.trim() || null,
      weather: form.weather?.trim() || null,
      phiDays: Number(form.phi_days || 0),
      reiHours: Number(form.rei_hours || 0)
    };
  }

  async function deductInventoryOnce(inventoryItemId, quantity, deductionKey) {
    const amount = roundNumber(Number(quantity || 0), 4);
    if (!inventoryItemId || amount <= 0) return;
    if (!canWriteModule("inventory")) {
      throw new Error("This operation is linked to inventory. An Owner/Admin or Farm Manager must complete it so stock is deducted correctly.");
    }
    const item = inventory.find(i => i.id === inventoryItemId);
    if (!item) throw new Error("The inventory item linked to this operation no longer exists.");
    const { userNotes, ledger } = unpackInventoryNotes(item.notes);
    if (ledger.some(entry => entry.key === deductionKey)) return;
    const available = Number(item.quantity_on_hand || 0);
    if (available < amount) {
      throw new Error(`Not enough ${item.item_name} in stock. Available: ${available} ${item.unit || "units"}; required: ${amount}.`);
    }
    const nextLedger = [...ledger, { key: deductionKey, quantity: amount, date: localDateISO() }];
    const nextQuantity = roundNumber(available - amount, 4);
    const { data, error } = await supabase.from("inventory_items")
      .update({
        quantity_on_hand: nextQuantity,
        notes: packInventoryNotes(userNotes, nextLedger)
      })
      .eq("id", inventoryItemId)
      .eq("quantity_on_hand", item.quantity_on_hand)
      .select("id");
    if (error) throw error;
    if (!data?.length) throw new Error("Inventory changed while this operation was being completed. Reload and try again.");
  }

  async function ensureActivitySprayHistory(activityRows, completedDate) {
    const sprayingRows = activityRows.filter(a => a.activity_type === "spraying");
    if (!sprayingRows.length) return;
    const existingSourceIds = new Set(sprays.map(row => unpackRecordNotes(row.notes).meta?.sourceActivityId).filter(Boolean));
    const payloads = sprayingRows.filter(activity => !existingSourceIds.has(activity.id)).map(activity => {
      const { userNotes, meta = {} } = unpackRecordNotes(activity.notes);
      return {
        farm_id: farm.id,
        field_id: activity.field_id,
        crop_cycle_id: activity.crop_cycle_id || null,
        spray_date: completedDate,
        product_name: activity.input_name || meta.operationName || "Spray application",
        active_ingredient: meta.activeIngredient || null,
        target_problem: meta.targetProblem || null,
        dose: meta.dose || null,
        unit: activity.unit || null,
        quantity_used: Number(activity.quantity || 0),
        phi_days: Number(meta.phiDays || 0),
        rei_hours: Number(meta.reiHours || 0),
        weather: meta.weather || null,
        worker_id: activity.worker_id || null,
        cost: Number(activity.labour_cost || 0) + Number(activity.input_cost || 0),
        notes: packRecordNotes(userNotes, {
          v: 1,
          kind: "activity-spray-history",
          sourceActivityId: activity.id,
          groupId: meta.groupId || null,
          operationName: meta.operationName || "Spray application",
          inventoryItemId: meta.inventoryItemId || null,
          equipmentId: meta.equipmentId || null
        })
      };
    });
    if (!payloads.length) return;
    const { error } = await supabase.from("spray_records").insert(payloads);
    if (error) throw error;
  }

  async function completeActivityRows(activityRows) {
    const pendingRows = activityRows.filter(row => !["completed","cancelled"].includes(row.status));
    if (!pendingRows.length) return;
    const ids = pendingRows.map(row => row.id).sort();
    const inventoryGroups = new Map();
    pendingRows.forEach(row => {
      const meta = unpackRecordNotes(row.notes).meta || {};
      if (!meta.inventoryItemId) return;
      if (!inventoryGroups.has(meta.inventoryItemId)) inventoryGroups.set(meta.inventoryItemId, { groupId: meta.groupId || "single", rows: [] });
      inventoryGroups.get(meta.inventoryItemId).rows.push(row);
    });
    for (const [inventoryItemId, group] of inventoryGroups) {
      const groupIds = group.rows.map(row => row.id).sort();
      const quantity = group.rows.reduce((sum,row) => sum + Number(row.quantity || 0), 0);
      await deductInventoryOnce(inventoryItemId, quantity, `activity:${group.groupId}:${groupIds.join(",")}`);
    }
    const completedDate = localDateISO();
    await ensureActivitySprayHistory(pendingRows, completedDate);
    const { error } = await supabase.from("field_activities").update({
      status: "completed",
      completed_date: completedDate
    }).in("id", ids);
    if (error) throw error;
  }

  function openActivityCompletion(operation) {
    const pendingRows = operation.items.filter(row => !["completed","cancelled"].includes(row.status));
    if (!pendingRows.length) return;
    setCompletionModal({
      operation,
      selectedIds: pendingRows.map(row => row.id)
    });
  }

  async function completeSelectedActivities(event) {
    event.preventDefault();
    const selectedIds = completionModal?.selectedIds || [];
    if (!selectedIds.length) {
      setStatus({ type: "error", message: "Select at least one completed field." });
      return;
    }
    setSaving(true);
    try {
      const selectedRows = completionModal.operation.items.filter(row => selectedIds.includes(row.id));
      await completeActivityRows(selectedRows);
      setCompletionModal(null);
      setStatus({ type: "success", message: `${selectedRows.length} field${selectedRows.length === 1 ? "" : "s"} completed. Skipped fields remain pending.` });
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function deleteActivityOperation(operation) {
    if (!canWriteModule("activities")) return;
    const label = operation.items.length === 1 ? operation.title : `${operation.title} across ${operation.items.length} fields`;
    const confirmed = window.confirm(`Delete ${label}? Completed spray history and inventory deductions will not be reversed.`);
    if (!confirmed) return;
    try {
      const { error } = await supabase.from("field_activities").delete().in("id", operation.items.map(row => row.id));
      if (error) throw error;
      setExpandedOperation("");
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    }
  }

  function openAssignmentResults(assignment) {
    const rows = assignmentWorkers.filter(link => link.assignment_id === assignment.id).map(link => ({
      id: link.id,
      worker_id: link.worker_id,
      regular_hours: String(link.regular_hours || workers.find(worker => worker.id === link.worker_id)?.normal_hours_per_day || 0),
      overtime_hours: String(link.overtime_hours || 0),
      completed_units: String(link.completed_units || 0),
      notes: link.notes || ""
    }));
    setAssignmentResultModal({ assignment, rows });
  }

  async function saveAssignmentResults(event) {
    event.preventDefault();
    if (!canWriteModule("workforce") || !assignmentResultModal?.rows.length) return;
    setSaving(true);
    try {
      const payloads = assignmentResultModal.rows.map(row => ({
        id: row.id,
        farm_id: farm.id,
        assignment_id: assignmentResultModal.assignment.id,
        worker_id: row.worker_id,
        regular_hours: Number(row.regular_hours || 0),
        overtime_hours: Number(row.overtime_hours || 0),
        completed_units: Number(row.completed_units || 0),
        notes: row.notes?.trim() || null
      }));
      const { error: resultError } = await supabase.from("work_assignment_workers")
        .upsert(payloads, { onConflict: "assignment_id,worker_id" });
      if (resultError) throw resultError;
      const { error: assignmentError } = await supabase.from("work_assignments").update({
        status: "completed",
        approval_status: "pending",
        approved_by: null,
        approved_at: null
      }).eq("id", assignmentResultModal.assignment.id);
      if (assignmentError) throw assignmentError;
      setAssignmentResultModal(null);
      await loadData();
      setStatus({ type: "success", message: "Work results saved and sent for supervisor approval." });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setSaving(false);
    }
  }

  async function reviewAssignment(assignment, decision) {
    if (!canWriteModule("workforce") || saving) return;
    if (decision === "approved" && assignment.status !== "completed") {
      setStatus({ type: "error", message: "Record the completed hours or units before approving this job." });
      return;
    }
    const resultLinks = assignmentWorkers.filter(link => link.assignment_id === assignment.id);
    const missingResults = resultLinks.filter(link => {
      const worker = workers.find(item => item.id === link.worker_id);
      return (worker?.wage_type || "daily") === "piece"
        ? Number(link.completed_units || 0) <= 0
        : Number(link.regular_hours || 0) + Number(link.overtime_hours || 0) <= 0;
    });
    if (decision === "approved" && missingResults.length) {
      setStatus({ type: "error", message: `Enter actual ${missingResults.length === 1 ? "hours or units" : "hours or units"} for ${missingResults.map(link => workerName(link.worker_id)).join(", ")} before approval.` });
      return;
    }
    const assignedWorkerIds = resultLinks.map(link => link.worker_id);
    const attendanceMap = new Map(attendance.filter(row => row.attendance_date === assignment.work_date).map(row => [row.worker_id, row.status]));
    const excludedNames = assignedWorkerIds.filter(id => attendanceMap.get(id) !== "present").map(workerName);
    if (decision === "approved" && excludedNames.length) {
      const proceed = window.confirm(`${excludedNames.join(", ")} ${excludedNames.length === 1 ? "is" : "are"} absent or unmarked on ${formatLongDate(assignment.work_date)}. Approved hours will still be payable; correct the attendance register for an accurate audit trail. Approve anyway?`);
      if (!proceed) return;
    }
    const reviewNote = decision === "rejected"
      ? window.prompt("Reason for rejecting this completed job:", assignment.approval_notes || "")
      : assignment.approval_notes || null;
    if (decision === "rejected" && reviewNote === null) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("work_assignments").update({
        approval_status: decision,
        approved_by: session.user.id,
        approved_at: new Date().toISOString(),
        approval_notes: reviewNote || null
      }).eq("id", assignment.id);
      if (error) throw error;
      await loadData();
      setStatus({ type: "success", message: `${assignment.title} ${decision}. ${decision === "approved" ? "Each employee's approved hours are now accrued once in payroll, field costing and finance." : "It is excluded from payroll until corrected."}` });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setSaving(false);
    }
  }

  async function deleteWorkforceRecord(table, id, label) {
    if (!canWriteModule("workforce")) return;
    if (!window.confirm(`Delete ${label}? Linked assignment or crew records will also be removed where applicable.`)) return;
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    }
  }

  async function persistPayrollItems(periodId) {
    const itemPayloads = payrollPreviewRows.map(row => ({
      farm_id: farm.id,
      payroll_period_id: periodId,
      worker_id: row.worker.id,
      recorded_work_days: row.recordedWorkDays,
      present_days: row.presentDays,
      absent_days: row.absentDays,
      regular_pay: roundNumber(row.regularPay, 2),
      overtime_pay: roundNumber(row.overtimePay, 2),
      bonus_total: roundNumber(row.bonuses, 2),
      advance_total: roundNumber(row.advances, 2),
      deduction_total: roundNumber(row.deductions, 2),
      gross_pay: roundNumber(row.grossPay, 2),
      net_pay: roundNumber(row.netPay, 2),
      calculation_notes: row.calculationNotes
    }));
    if (!itemPayloads.length) throw new Error("There are no employee earnings or adjustments to save for this payroll month.");
    const { error: itemsError } = await supabase.from("payroll_items")
      .upsert(itemPayloads, { onConflict: "payroll_period_id,worker_id" });
    if (itemsError) throw itemsError;
    const previewWorkerIds = new Set(itemPayloads.map(item => item.worker_id));
    const staleItemIds = payrollItems
      .filter(item => item.payroll_period_id === periodId && !previewWorkerIds.has(item.worker_id))
      .map(item => item.id);
    if (staleItemIds.length) {
      const { error: staleError } = await supabase.from("payroll_items").delete().in("id", staleItemIds);
      if (staleError) throw staleError;
    }
    return itemPayloads;
  }

  async function generatePayroll() {
    if (!canSeeFinancials || !payrollReady || saving) return;
    if (currentPayrollPeriod && currentPayrollPeriod.status !== "draft") {
      setStatus({ type: "error", message: "Reopen this payroll period before recalculating it." });
      return;
    }
    if (!payrollPreviewRows.length) {
      setStatus({ type: "error", message: "There are no employee earnings or adjustments to generate for this month." });
      return;
    }
    setSaving(true);
    try {
      const { data: period, error: periodError } = await supabase.from("payroll_periods").upsert({
        farm_id: farm.id,
        period_month: payrollPeriodMonth,
        status: "draft"
      }, { onConflict: "farm_id,period_month" }).select().single();
      if (periodError) throw periodError;
      const itemPayloads = await persistPayrollItems(period.id);
      await loadData();
      setStatus({ type: "success", message: `${formatAttendanceMonth(payrollMonth)} payroll generated as a draft for ${itemPayloads.length} employees.` });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setSaving(false);
    }
  }

  async function changePayrollStatus(nextStatus) {
    if (!canSeeFinancials || !currentPayrollPeriod || saving) return;
    if (nextStatus === "approved" && !currentPayrollItems.length) {
      setStatus({ type: "error", message: "Generate the draft payroll before approving it." });
      return;
    }
    if (nextStatus === "approved" && workforceMetrics.pendingApproval > 0) {
      const proceed = window.confirm(`${workforceMetrics.pendingApproval} completed job(s) still await approval and are excluded from payroll. Approve this payroll anyway?`);
      if (!proceed) return;
    }
    if (nextStatus === "closed" && payrollSummary.balance > 0.01) {
      setStatus({ type: "error", message: `This period still has ${money(payrollSummary.balance)} outstanding. Record the remaining payments before closing it.` });
      return;
    }
    setSaving(true);
    try {
      if (nextStatus === "approved") await persistPayrollItems(currentPayrollPeriod.id);
      const payload = { status: nextStatus };
      if (nextStatus === "approved") {
        payload.approved_by = session.user.id;
        payload.approved_at = new Date().toISOString();
      }
      if (nextStatus === "closed") payload.closed_at = new Date().toISOString();
      if (nextStatus === "draft") {
        payload.approved_by = null;
        payload.approved_at = null;
        payload.closed_at = null;
      }
      const { error } = await supabase.from("payroll_periods").update(payload).eq("id", currentPayrollPeriod.id);
      if (error) throw error;
      await loadData();
      setStatus({ type: "success", message: `${formatAttendanceMonth(payrollMonth)} payroll marked ${nextStatus}.` });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setSaving(false);
    }
  }

  async function voidPayrollRecord(table, record, label) {
    if (!canSeeFinancials || saving) return;
    if (table === "payroll_adjustments") {
      const period = payrollPeriods.find(item => item.period_month === record.period_month);
      if (period && period.status !== "draft") {
        setStatus({ type: "error", message: `Reopen the ${formatAttendanceMonth(String(record.period_month).slice(0, 7))} payroll before changing its adjustments.` });
        return;
      }
    }
    if (!window.confirm(`Void ${label}? The audit trail will retain this change.`)) return;
    setSaving(true);
    try {
      const { error } = await supabase.from(table).update({ status: "void" }).eq("id", record.id);
      if (error) throw error;
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setSaving(false);
    }
  }

  function downloadPayrollSummary() {
    const rows = [
      ["Month", "Employee number", "Employee", "Wage type", "Approved jobs", "Regular hours", "Overtime hours", "Present", "Absent", "Regular pay KES", "Overtime KES", "Bonuses KES", "Advances KES", "Deductions KES", "Net pay KES", "Paid KES", "Balance KES"],
      ...payrollRows.map(row => [
        payrollMonth,
        row.worker.employee_number || "",
        row.worker.full_name,
        row.worker.wage_type || "daily",
        row.assignmentCount,
        row.regularHours.toFixed(2),
        row.overtimeHours.toFixed(2),
        row.presentDays,
        row.absentDays,
        row.regularPay.toFixed(2),
        row.overtimePay.toFixed(2),
        row.bonuses.toFixed(2),
        row.advances.toFixed(2),
        row.deductions.toFixed(2),
        row.netPay.toFixed(2),
        row.paid.toFixed(2),
        row.balance.toFixed(2)
      ])
    ];
    downloadCSV(rows, `farm-manager-v8-6-payroll-${payrollMonth}.csv`);
  }

  function downloadFieldLabourSummary() {
    const rows = [
      ["Field", "Crop cycle", "Approved jobs", "Employees", "Regular hours", "Overtime hours", "Completed units", "Allocated labour KES"],
      ...workforceAllocation.rows.map(row => [row.fieldName, row.cropName, row.assignmentCount, row.workerCount, row.regularHours.toFixed(2), row.overtimeHours.toFixed(2), row.completedUnits.toFixed(2), row.cost.toFixed(2)])
    ];
    downloadCSV(rows, `farm-manager-v8-6-field-labour-${today}.csv`);
  }

  async function markWorkerAttendance(workerId, nextStatus) {
    if (!canWriteModule("attendance")) {
      setStatus({ type: "error", message: "Your role cannot change attendance records." });
      return;
    }
    if (!attendanceReady) {
      setStatus({ type: "error", message: "Run database-v8-2-attendance.sql in Supabase before recording attendance." });
      return;
    }
    const worker = workers.find(item => item.id === workerId);
    if (!worker) return;
    setAttendanceSaving(workerId);
    try {
      const payload = {
        farm_id: farm.id,
        worker_id: workerId,
        attendance_date: attendanceDate,
        status: nextStatus
      };
      const { data, error } = await supabase.from("worker_attendance")
        .upsert(payload, { onConflict: "farm_id,worker_id,attendance_date" })
        .select().single();
      if (error) throw error;
      setAttendance(current => [
        data,
        ...current.filter(row => !(row.worker_id === workerId && row.attendance_date === attendanceDate))
      ]);
      setStatus({ type: "success", message: `${worker.full_name} marked ${nextStatus} for ${formatLongDate(attendanceDate)}.` });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setAttendanceSaving("");
    }
  }

  async function clearWorkerAttendance(workerId) {
    if (!canWriteModule("attendance")) return;
    const existing = selectedAttendanceMap.get(workerId);
    if (!existing) return;
    setAttendanceSaving(workerId);
    try {
      const { error } = await supabase.from("worker_attendance").delete().eq("id", existing.id);
      if (error) throw error;
      setAttendance(current => current.filter(row => row.id !== existing.id));
      setStatus({ type: "success", message: "Attendance mark cleared." });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setAttendanceSaving("");
    }
  }

  async function markAllAttendance(nextStatus) {
    if (!canWriteModule("attendance")) {
      setStatus({ type: "error", message: "Your role cannot change attendance records." });
      return;
    }
    if (!attendanceReady) {
      setStatus({ type: "error", message: "Run database-v8-2-attendance.sql in Supabase before recording attendance." });
      return;
    }
    if (!activeWorkers.length) {
      setStatus({ type: "error", message: "Add at least one active worker before recording attendance." });
      return;
    }
    setAttendanceSaving("all");
    try {
      const workerIds = new Set(activeWorkers.map(worker => worker.id));
      const payloads = activeWorkers.map(worker => ({
        farm_id: farm.id,
        worker_id: worker.id,
        attendance_date: attendanceDate,
        status: nextStatus
      }));
      const { data, error } = await supabase.from("worker_attendance")
        .upsert(payloads, { onConflict: "farm_id,worker_id,attendance_date" })
        .select();
      if (error) throw error;
      setAttendance(current => [
        ...(data || []),
        ...current.filter(row => !(row.attendance_date === attendanceDate && workerIds.has(row.worker_id)))
      ]);
      setStatus({ type: "success", message: `${activeWorkers.length} active workers marked ${nextStatus} for ${formatLongDate(attendanceDate)}.` });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setAttendanceSaving("");
    }
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
          area_acres: Number(form.area), status: canonicalFieldStatus(form.status)
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
        const nextFieldStatus = fieldStatusForCycle(form.status);
        if (nextFieldStatus && ["owner", "manager"].includes(role)) {
          const { error: fieldStatusError } = await supabase.from("fields")
            .update({ status: nextFieldStatus })
            .eq("id", form.field_id);
          if (fieldStatusError) throw fieldStatusError;
        }
        if (!editingId && form.source_batch_id) {
          const { error: batchUpdateError } = await supabase
            .from("propagation_batches")
            .update({ status: "transplanted" })
            .eq("id", form.source_batch_id);
          if (batchUpdateError) throw batchUpdateError;
        }
      }
      if (modal === "activity") {
        if (editingId) {
          const existing = activities.find(row => row.id === editingId);
          const wantsCompletion = form.status === "completed" && existing?.status !== "completed";
          const meta = mergeEditedRecordMeta("multi-field-operation");
          const payload = {
            farm_id: farm.id,
            field_id: form.field_id,
            crop_cycle_id: form.crop_cycle_id || null,
            activity_type: form.activity_type,
            scheduled_date: form.scheduled_date,
            completed_date: form.status === "completed" && !wantsCompletion ? (form.completed_date || existing?.completed_date || today) : null,
            status: wantsCompletion ? (existing?.status || "planned") : form.status,
            worker_id: form.worker_id || null,
            input_name: form.input_name?.trim() || null,
            quantity: form.quantity ? Number(form.quantity) : null,
            unit: form.unit?.trim() || null,
            labour_cost: Number(form.labour_cost || 0),
            input_cost: Number(form.input_cost || 0),
            notes: packRecordNotes(form.notes, meta)
          };
          const { data, error } = await supabase.from("field_activities").update(payload).eq("id", editingId).select().single();
          if (error) throw error;
          if (wantsCompletion) await completeActivityRows([data]);
        } else {
          const selectedIds = [...new Set(form.field_ids || [])].filter(id => fields.some(field => field.id === id));
          if (!selectedIds.length) throw new Error("Select at least one field for this operation.");
          if (form.activity_type === "spraying" && !form.input_name?.trim()) throw new Error("Enter the spray product.");
          const selectedFields = selectedIds.map(id => fields.find(field => field.id === id)).filter(Boolean);
          const inventoryItem = inventory.find(item => item.id === form.inventory_item_id);
          const totalQuantity = Number(form.quantity || 0);
          const totalLabourCost = Number(form.labour_cost || 0);
          const totalInputCost = Number(form.input_cost || 0) || (inventoryItem ? totalQuantity * Number(inventoryItem.unit_cost || 0) : 0);
          const quantityShares = allocateByFieldArea(totalQuantity, selectedFields, 4);
          const labourShares = allocateByFieldArea(totalLabourCost, selectedFields, 2);
          const inputCostShares = allocateByFieldArea(totalInputCost, selectedFields, 2);
          const meta = operationMetaFromForm("multi-field-operation", selectedIds);
          const wantsCompletion = form.status === "completed";
          if (wantsCompletion && meta.inventoryItemId) {
            if (!canWriteModule("inventory")) throw new Error("An Owner/Admin or Farm Manager must complete an inventory-linked operation.");
            if (!inventoryItem) throw new Error("The selected inventory item no longer exists.");
            if (Number(inventoryItem.quantity_on_hand || 0) < totalQuantity) {
              throw new Error(`Not enough ${inventoryItem.item_name} in stock. Available: ${inventoryItem.quantity_on_hand || 0} ${inventoryItem.unit || "units"}; required: ${totalQuantity}.`);
            }
          }
          const existingRows = activities.filter(row => unpackRecordNotes(row.notes).meta?.groupId === meta.groupId);
          const existingFieldIds = new Set(existingRows.map(row => row.field_id));
          const payloads = selectedFields.filter(field => !existingFieldIds.has(field.id)).map(field => ({
            farm_id: farm.id,
            field_id: field.id,
            crop_cycle_id: activeCycleIdForField(field.id),
            activity_type: form.activity_type,
            scheduled_date: form.scheduled_date,
            completed_date: null,
            status: wantsCompletion ? "planned" : form.status,
            worker_id: form.worker_id || null,
            input_name: inventoryItem?.item_name || form.input_name?.trim() || null,
            quantity: totalQuantity ? quantityShares[field.id] : null,
            unit: inventoryItem?.unit || form.unit?.trim() || null,
            labour_cost: labourShares[field.id],
            input_cost: inputCostShares[field.id],
            notes: packRecordNotes(form.notes, meta)
          }));
          let insertedRows = [];
          if (payloads.length) {
            const { data, error } = await supabase.from("field_activities").insert(payloads).select();
            if (error) throw error;
            insertedRows = data || [];
          }
          if (wantsCompletion) await completeActivityRows([...existingRows, ...insertedRows]);
        }
      }
      if (modal === "worker") {
        const payload = {
          farm_id: farm.id,
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
          role: form.role.trim() || null,
          employee_number: form.employee_number?.trim() || null,
          id_number: form.id_number?.trim() || null,
          email: form.email?.trim() || null,
          hire_date: form.hire_date || null,
          employment_type: form.employment_type || "casual",
          wage_type: form.wage_type || "daily",
          daily_rate: Number(form.daily_rate || 0),
          hourly_rate: Number(form.hourly_rate || 0),
          monthly_salary: Number(form.monthly_salary || 0),
          piece_rate: Number(form.piece_rate || 0),
          piece_unit: form.piece_unit?.trim() || null,
          normal_hours_per_day: Number(form.normal_hours_per_day || 8),
          emergency_contact_name: form.emergency_contact_name?.trim() || null,
          emergency_contact_phone: form.emergency_contact_phone?.trim() || null,
          payment_method: form.payment_method || "M-Pesa",
          payment_account: form.payment_account?.trim() || null,
          status: form.status,
          notes: form.notes?.trim() || null
        };
        const { error } = editingId
          ? await supabase.from("workers").update(payload).eq("id", editingId)
          : await supabase.from("workers").insert(payload);
        if (error) throw error;
      }
      if (modal === "crew") {
        const payload = {
          farm_id: farm.id,
          name: form.name.trim(),
          supervisor_id: form.supervisor_id || null,
          status: form.status || "active",
          notes: form.notes?.trim() || null
        };
        const { data: crew, error } = editingId
          ? await supabase.from("work_crews").update(payload).eq("id", editingId).select().single()
          : await supabase.from("work_crews").insert(payload).select().single();
        if (error) throw error;
        if (editingId) {
          const { error: removeError } = await supabase.from("work_crew_members").delete().eq("crew_id", crew.id);
          if (removeError) throw removeError;
        }
        const memberIds = [...new Set(form.worker_ids || [])].filter(id => workers.some(worker => worker.id === id));
        if (memberIds.length) {
          const { error: memberError } = await supabase.from("work_crew_members").insert(memberIds.map(workerId => ({
            farm_id: farm.id,
            crew_id: crew.id,
            worker_id: workerId,
            status: "active"
          })));
          if (memberError) throw memberError;
        }
      }
      if (modal === "assignment") {
        const selectedFieldIds = [...new Set(form.field_ids || [])].filter(id => fields.some(field => field.id === id));
        const selectedWorkerIds = [...new Set(form.worker_ids || [])].filter(id => workers.some(worker => worker.id === id));
        if (!selectedFieldIds.length) throw new Error("Select at least one field for this job.");
        if (!selectedWorkerIds.length) throw new Error("Assign at least one employee or crew member.");
        const payload = {
          farm_id: farm.id,
          title: form.title.trim(),
          work_date: form.work_date,
          due_date: form.due_date || null,
          description: form.description?.trim() || null,
          status: form.status || "planned",
          crew_id: form.crew_id || null,
          unit_name: form.unit_name?.trim() || null,
          planned_units: Number(form.planned_units || 0),
          overtime_multiplier: Number(form.overtime_multiplier || 1.5),
          approval_status: "pending",
          approved_by: null,
          approved_at: null,
          approval_notes: form.approval_notes?.trim() || null
        };
        const { data: assignment, error } = editingId
          ? await supabase.from("work_assignments").update(payload).eq("id", editingId).select().single()
          : await supabase.from("work_assignments").insert(payload).select().single();
        if (error) throw error;
        if (editingId) {
          const [{ error: fieldRemoveError }, { error: workerRemoveError }] = await Promise.all([
            supabase.from("work_assignment_fields").delete().eq("assignment_id", assignment.id),
            supabase.from("work_assignment_workers").delete().eq("assignment_id", assignment.id)
          ]);
          if (fieldRemoveError || workerRemoveError) throw fieldRemoveError || workerRemoveError;
        }
        const selectedFields = selectedFieldIds.map(id => fields.find(field => field.id === id)).filter(Boolean);
        const areaShares = allocateByFieldArea(100, selectedFields, 4);
        const { error: fieldLinkError } = await supabase.from("work_assignment_fields").insert(selectedFields.map(field => ({
          farm_id: farm.id,
          assignment_id: assignment.id,
          field_id: field.id,
          crop_cycle_id: activeCycleIdForField(field.id),
          allocation_percent: areaShares[field.id]
        })));
        if (fieldLinkError) throw fieldLinkError;
        const { error: workerLinkError } = await supabase.from("work_assignment_workers").insert(selectedWorkerIds.map(workerId => ({
          farm_id: farm.id,
          assignment_id: assignment.id,
          worker_id: workerId,
          regular_hours: Number(form.regular_hours || 0),
          overtime_hours: Number(form.overtime_hours || 0),
          completed_units: Number(form.completed_units || 0)
        })));
        if (workerLinkError) throw workerLinkError;
      }
      if (modal === "adjustment") {
        const periodMonth = `${form.period_month || payrollMonth}-01`;
        const targetPeriod = payrollPeriods.find(period => period.period_month === periodMonth);
        if (targetPeriod && targetPeriod.status !== "draft") {
          throw new Error(`Reopen the ${formatAttendanceMonth(periodMonth.slice(0, 7))} payroll before changing bonuses, advances or deductions.`);
        }
        const { error } = await supabase.from("payroll_adjustments").insert({
          farm_id: farm.id,
          worker_id: form.worker_id,
          period_month: periodMonth,
          adjustment_date: form.adjustment_date || today,
          adjustment_type: form.adjustment_type,
          amount: Number(form.amount || 0),
          description: form.description.trim(),
          status: "approved",
          approved_by: session.user.id,
          approved_at: new Date().toISOString()
        });
        if (error) throw error;
      }
      if (modal === "payment") {
        if (!currentPayrollPeriod || currentPayrollPeriod.status === "draft") throw new Error("Approve this payroll period before recording payments.");
        const payrollRow = payrollRows.find(row => row.worker.id === form.worker_id);
        const amount = Number(form.amount || 0);
        if (!payrollRow || payrollRow.balance <= 0) throw new Error("This employee has no outstanding balance for the selected month.");
        if (amount <= 0 || amount > payrollRow.balance + 0.01) throw new Error(`Enter a payment up to the outstanding balance of ${money(payrollRow.balance)}.`);
        const { error } = await supabase.from("payroll_payments").insert({
          farm_id: farm.id,
          payroll_period_id: currentPayrollPeriod.id,
          worker_id: form.worker_id,
          period_month: payrollPeriodMonth,
          payment_date: form.payment_date || today,
          amount,
          method: form.method || "M-Pesa",
          reference: form.reference?.trim() || null,
          notes: form.notes?.trim() || null,
          status: "approved",
          approved_by: session.user.id,
          approved_at: new Date().toISOString()
        });
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
        if (editingId) {
          const meta = mergeEditedRecordMeta("multi-field-spray");
          const payload = { farm_id:farm.id, field_id:form.field_id, crop_cycle_id:form.crop_cycle_id||activeCycleIdForField(form.field_id),
            spray_date:form.spray_date, product_name:form.product_name.trim(), active_ingredient:form.active_ingredient?.trim()||null,
            target_problem:form.target_problem?.trim()||null, dose:form.dose?.trim()||null, unit:form.unit?.trim()||null,
            quantity_used:Number(form.quantity_used||0), phi_days:Number(form.phi_days||0), rei_hours:Number(form.rei_hours||0),
            weather:form.weather?.trim()||null, worker_id:form.worker_id||null, cost:Number(form.cost||0),
            notes:packRecordNotes(form.notes, meta) };
          const {error}=await supabase.from("spray_records").update(payload).eq("id",editingId);
          if(error) throw error;
        } else {
          const selectedIds = [...new Set(form.field_ids || [])].filter(id => fields.some(field => field.id === id));
          if (!selectedIds.length) throw new Error("Select at least one field for this spray operation.");
          const selectedFields = selectedIds.map(id => fields.find(field => field.id === id)).filter(Boolean);
          const inventoryItem = inventory.find(item => item.id === form.inventory_item_id);
          const totalQuantity = Number(form.quantity_used || 0);
          const totalCost = Number(form.cost || 0) || (inventoryItem ? totalQuantity * Number(inventoryItem.unit_cost || 0) : 0);
          const quantityShares = allocateByFieldArea(totalQuantity, selectedFields, 4);
          const costShares = allocateByFieldArea(totalCost, selectedFields, 2);
          const meta = operationMetaFromForm("multi-field-spray", selectedIds);
          await deductInventoryOnce(meta.inventoryItemId, totalQuantity, `spray:${meta.groupId}`);
          const existingFieldIds = new Set(sprays.filter(row => unpackRecordNotes(row.notes).meta?.groupId === meta.groupId).map(row => row.field_id));
          const payloads = selectedFields.filter(field => !existingFieldIds.has(field.id)).map(field => ({
            farm_id:farm.id,
            field_id:field.id,
            crop_cycle_id:activeCycleIdForField(field.id),
            spray_date:form.spray_date,
            product_name:inventoryItem?.item_name || form.product_name.trim(),
            active_ingredient:form.active_ingredient?.trim()||null,
            target_problem:form.target_problem?.trim()||null,
            dose:form.dose?.trim()||null,
            unit:inventoryItem?.unit || form.unit?.trim()||null,
            quantity_used:quantityShares[field.id],
            phi_days:Number(form.phi_days||0),
            rei_hours:Number(form.rei_hours||0),
            weather:form.weather?.trim()||null,
            worker_id:form.worker_id||null,
            cost:costShares[field.id],
            notes:packRecordNotes(form.notes, meta)
          }));
          if (payloads.length) {
            const {error}=await supabase.from("spray_records").insert(payloads);
            if(error) throw error;
          }
        }
      }
      if (modal === "inventory") {
        const payload = { farm_id:farm.id, item_name:form.item_name.trim(), category:form.category, unit:form.unit,
          quantity_on_hand:Number(form.quantity_on_hand||0), reorder_level:Number(form.reorder_level||0),
          unit_cost:Number(form.unit_cost||0), supplier:form.supplier?.trim()||null,
          notes:packInventoryNotes(form.notes, form._inventory_ledger || []) };
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
      if (["activity","spray"].includes(modal)) {
        try { await loadData(); } catch { /* keep the original operation error */ }
      }
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
      status: "planted",
      area_acres: fields.find(f => f.id === availableField)?.area_acres || ""
    });
    setModal("cycle");
  }

  async function invokeAdminUsers(body) {
    const { data, error } = await supabase.functions.invoke("super-handler", { body });
    if (error) {
      let message = error.message;
      try {
        const details = await error.context?.json();
        message = details?.error || details?.message || message;
      } catch {
        // Keep the original Functions error when no JSON body is available.
      }
      throw new Error(message);
    }
    if (!data?.ok) throw new Error(data?.error || "The user action could not be completed.");
    return data;
  }

  async function createFarmUser(event) {
    event.preventDefault();
    if (!canManageUsers || userSaving) return;
    setUserSaving(true);
    setStatus({ type: "loading", message: "Creating the new farm user…" });
    try {
      await invokeAdminUsers({ action: "create", ...userForm });
      setUserModal(false);
      setUserForm({ full_name: "", email: "", password: "", role: "viewer" });
      await loadData();
      setStatus({ type: "success", message: `${userForm.full_name.trim()} can now sign in.` });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setUserSaving(false);
    }
  }

  async function updateUser(userId, patch) {
    if (!canManageUsers || userSaving) return;
    setUserSaving(true);
    try {
      await invokeAdminUsers({ action: "update", user_id: userId, ...patch });
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setUserSaving(false);
    }
  }

  async function deleteFarmUser(user) {
    if (!canManageUsers || userSaving || user.id === session.user.id) return;
    const label = user.full_name || user.email || "this user";
    const confirmed = window.confirm(
      `Delete ${label}'s account?\n\nThey will lose sign-in access. Existing farm records will remain.`
    );
    if (!confirmed) return;
    setUserSaving(true);
    setStatus({ type: "loading", message: `Deleting ${label}'s account…` });
    try {
      await invokeAdminUsers({ action: "delete", user_id: user.id });
      await loadData();
      setStatus({ type: "success", message: `${label}'s account was deleted.` });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setUserSaving(false);
    }
  }

  if (authLoading) return <div className="auth-screen"><LoaderCircle className="spin"/><p>Opening Farm Manager…</p></div>;
  if (passwordRecovery) return <PasswordRecoveryScreen sessionReady={Boolean(session)} onComplete={finishPasswordRecovery} />;
  if (!session) return <AuthScreen />;

  const visibleNav = NAV.filter(([id]) =>
    (id !== "users" || canManageUsers) &&
    (!["expenses", "payroll"].includes(id) || canSeeFinancials)
  );
  const completionOperation = completionModal?.operation || null;
  const completionPendingRows = completionOperation?.items.filter(row => !["completed","cancelled"].includes(row.status)) || [];
  const completionSelectedRows = completionPendingRows.filter(row => completionModal?.selectedIds.includes(row.id));
  const completionMeta = completionOperation ? unpackRecordNotes(completionOperation.items[0]?.notes).meta || {} : {};
  const completionInventoryItem = inventory.find(item => item.id === completionMeta.inventoryItemId);
  const completionQuantity = completionSelectedRows.reduce((sum,row) => sum + Number(row.quantity || 0), 0);

  return (
    <div className={`app-shell ${canWriteModule(page) ? "" : "readonly"}`}>
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sprout size={25}/></div>
          <div><strong>Farm Manager</strong><span>V8.6 · Records Consistency</span></div>
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
          <button className="signed-in-profile" onClick={() => {setPage("profile");setMobileNav(false)}}><UserRound size={16}/> Profile</button>
          <button onClick={() => supabase.auth.signOut()}><LogOut size={16}/> Sign out</button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)}><Menu/></button>
          <div><span className="eyebrow">{farm?.name || "MY FARM"}</span><h1>{NAV.find(n => n[0]===page)?.[1]}</h1></div>
          <div className="topbar-actions">
            <span className={`connection-pill ${isOnline ? "online" : "offline"}`}>{isOnline ? <Wifi size={14}/> : <WifiOff size={14}/>}<span>{isOnline ? "Online" : "Offline"}</span></span>
            <span className="role-badge">{ROLE_LABELS[role] || role}</span>
            <button className="refresh-button" onClick={loadData}><RefreshCw size={18}/></button>
          </div>
        </header>

        <StatusBanner status={status.type} message={status.message}/>

        {["blocks","fields","nursery","crops","activities","workers","attendance","workforce","payroll","irrigation","sprays","inventory","harvests","equipment"].includes(page) && <div className="module-toolbar">
          <div className="search-box"><Search size={17}/><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search this section…"/>{searchTerm && <button onClick={()=>setSearchTerm("")}>Clear</button>}</div>
        </div>}

        {page === "dashboard" && <>
          <section className="dashboard-hero">
            <div className="dashboard-hero-copy">
              <span className="eyebrow">V8.6 FARM COMMAND CENTRE</span>
              <h2>{greeting}, {signedInName}.</h2>
              <p>Your fields, people, priorities and money—focused on what needs a decision today.</p>
              <div className="dashboard-hero-signals">
                <span><b>{metrics.dueToday}</b> due today</span>
                <span className={metrics.overdue ? "warning" : ""}><b>{metrics.overdue}</b> overdue</span>
                <span className={workforceMetrics.pendingApproval ? "warning" : ""}><b>{workforceMetrics.pendingApproval}</b> approvals</span>
              </div>
            </div>
            <aside className="dashboard-quick-panel">
              <header><span>Quick record</span><small>Keep today up to date</small></header>
              <div>
                <button disabled={!fields.length || !canWriteModule("activities")} onClick={() => open("activity")}><Wrench size={17}/><span>Field activity</span><Plus size={15}/></button>
                <button disabled={!workforceReady || !fields.length || !activeWorkers.length || !canWriteModule("workforce")} onClick={() => open("assignment")}><Users size={17}/><span>Assign job</span><Plus size={15}/></button>
                <button disabled={!fields.length || !canWriteModule("irrigation")} onClick={() => open("irrigation")}><Droplets size={17}/><span>Irrigation</span><Plus size={15}/></button>
                <button disabled={!fields.length || !canWriteModule("harvests")} onClick={() => open("harvest")}><ShoppingCart size={17}/><span>Harvest</span><Plus size={15}/></button>
              </div>
            </aside>
          </section>

          <section className="dashboard-kpi-grid">
            <DashboardKpi Icon={LandPlot} label="Production fields" value={`${metrics.activeFields} active`} detail={`${fields.length} fields · ${metrics.totalArea.toFixed(1)} acres`} onClick={() => setPage("fields")}/>
            <DashboardKpi Icon={CalendarClock} label="Today's work" value={metrics.dueToday} detail={`${metrics.overdue} overdue · ${metrics.upcoming7} next 7 days`} tone={metrics.overdue ? "red" : "blue"} onClick={() => setPage("calendar")}/>
            <DashboardKpi Icon={Users} label="Workforce today" value={`${attendanceSummary.presentToday}/${activeWorkers.length}`} detail={`${workforceMetrics.planned} jobs planned or active`} tone="blue" onClick={() => setPage("attendance")}/>
            <DashboardKpi Icon={ClipboardList} label="Pending approvals" value={workforceMetrics.pendingApproval} detail={`${workforceMetrics.approvedThisMonth} approved this month`} tone={workforceMetrics.pendingApproval ? "amber" : "green"} onClick={() => setPage("workforce")}/>
            <DashboardKpi Icon={Package} label="Stock control" value={metrics.lowStock} detail={`${inventory.length} inventory items monitored`} tone={metrics.lowStock ? "amber" : "green"} onClick={() => setPage("inventory")}/>
            {canSeeFinancials && <DashboardKpi Icon={WalletCards} label="Operating position" value={money(metrics.profit)} detail={`${money(metrics.revenue)} revenue · ${money(metrics.fieldCosts)} costs`} tone={metrics.profit < 0 ? "red" : "green"} onClick={() => setPage("expenses")}/>} 
          </section>

          <section className="dashboard-focus-grid">
            <Card title="Priority inbox" subtitle={`${smartItems.length} live action${smartItems.length === 1 ? "" : "s"} from farm records`} action="Open planner" onAction={() => setPage("planner")}>
              <div className="priority-list dashboard-priorities">
                {smartItems.slice(0,5).map(item => <PriorityItem key={item.id} item={item} onOpen={() => openSmartItem(item)}/>)}
                {!smartItems.length && <Empty text="Everything recorded is on track. New due dates and alerts will appear here automatically."/>}
              </div>
            </Card>
            <section className="card dashboard-pulse-card">
              <header className="card-header"><div><h3>Farm pulse</h3><p>Fast checks across the operation</p></div><Activity size={20}/></header>
              <div className="pulse-list">
                <PulseRow Icon={Sprout} label="Nursery" value={metrics.ready} detail={`${metrics.seedlings.toLocaleString()} live seedlings · batches ready`} tone={metrics.ready ? "attention" : "good"} onClick={() => setPage("nursery")}/>
                <PulseRow Icon={Package} label="Inventory" value={metrics.lowStock} detail="items at or below reorder level" tone={metrics.lowStock ? "attention" : "good"} onClick={() => setPage("inventory")}/>
                <PulseRow Icon={Wrench} label="Equipment" value={serviceDue.length} detail="service alerts requiring attention" tone={serviceDue.length ? "danger" : "good"} onClick={() => setPage("equipment")}/>
                <PulseRow Icon={ClipboardList} label="Work approvals" value={workforceMetrics.pendingApproval} detail="completed jobs waiting for review" tone={workforceMetrics.pendingApproval ? "danger" : "good"} onClick={() => setPage("workforce")}/>
              </div>
            </section>
          </section>

          <section className={`dashboard-bottom-grid ${canSeeFinancials ? "" : "single"}`}>
            <section className="card dashboard-fields-card">
              <header className="card-header"><div><h3>Field & crop overview</h3><p>The production position across mapped fields</p></div><button onClick={() => setPage("crops")}>Open crops</button></header>
              <div className="dashboard-field-list">
                {dashboardFieldRows.map(row => <button key={row.id} onClick={() => setPage("fields")}>
                  <span className={`field-status-dot ${row.active ? "active" : "idle"}`}/>
                  <span><strong>{row.name}</strong><small>{row.crop}</small></span>
                  <span><b>{row.area.toFixed(1)} ac</b><small>{row.yieldQuantity.toLocaleString()} harvested</small></span>
                </button>)}
                {!dashboardFieldRows.length && <Empty text="Add fields and crop cycles to build the production overview."/>}
              </div>
            </section>
            {canSeeFinancials && <section className="card dashboard-money-card">
              <header className="card-header"><div><h3>Money & labour control</h3><p>{formatAttendanceMonth(payrollMonth)} workforce position</p></div><button onClick={() => setPage("expenses")}>Open finance</button></header>
              <div className="money-score"><span className={metrics.profit < 0 ? "negative" : "positive"}><TrendingUp size={22}/></span><div><small>Estimated farm result</small><strong>{money(metrics.profit)}</strong></div></div>
              <div className="money-lines">
                <p><span>Approved labour accrued</span><b>{money(approvedLabourMonthTotal)}</b></p>
                <p><span>Payroll paid</span><b>{money(payrollSummary.paid)}</b></p>
                <p><span>Payroll outstanding</span><b>{money(payrollSummary.balance)}</b></p>
              </div>
              <div className="accounting-rule"><CheckCircle2 size={17}/><span>Payroll payment settles the approved labour balance; it is not posted as a second expense.</span></div>
            </section>}
          </section>
        </>}

        {page === "planner" && <>
          <section className="hero smart-hero">
            <div><span className="eyebrow">V8.6 SMART FARM PLANNER</span><h2>The next seven days, organized</h2><p>Priorities are generated automatically from activities, workforce assignments, transplant dates, harvest windows, stock levels and equipment service records.</p></div>
            <button className="button primary" disabled={!fields.length || !canWriteModule("activities")} onClick={() => open("activity")}><Plus size={17}/> Schedule activity</button>
          </section>
          <section className="stats-grid planner-stats">
            <Stat label="Urgent actions" value={smartItems.filter(item => item.priority === "urgent").length} detail="Needs attention first"/>
            <Stat label="Due today" value={metrics.dueToday} detail={`${metrics.overdue} already overdue`} onClick={() => setPage("calendar")}/>
            <Stat label="Next 7 days" value={metrics.upcoming7} detail="Planned field activities" onClick={() => setPage("calendar")}/>
            <Stat label="Task completion" value={`${metrics.taskCompletion}%`} detail={`${metrics.completedTasks} tasks completed`}/>
          </section>
          <section className="planner-grid">
            <Card title="Priority inbox" subtitle="Highest-impact work first">
              <div className="priority-list">
                {smartItems.map(item => <PriorityItem key={item.id} item={item} onOpen={() => openSmartItem(item)}/>)}
                {!smartItems.length && <Empty text="No urgent, due or upcoming actions found."/>}
              </div>
            </Card>
            <Card title="7-day work plan" subtitle={`${formatShortDate(today)} to ${formatShortDate(weekEnd)}`}>
              <div className="week-list">
                {weekActivities.map(operation => <ScheduleItem key={operation.key} activity={operation} field={operationFieldLabel(operation, fields)} worker={workerName(operation.worker_id)} onComplete={!["completed","cancelled"].includes(operation.status) && canWriteModule("activities") ? () => openActivityCompletion(operation) : null}/>)}
                {!weekActivities.length && <Empty text="No activities are scheduled in the next seven days."/>}
              </div>
            </Card>
          </section>
          <section className="split-grid">
            <Card title="Irrigation performance" subtitle="Summary from recorded reel and field runs">
              <div className="insight-grid">
                <Mini label="Recorded runs" value={irrigation.length}/>
                <Mini label="Operating hours" value={metrics.irrigationHours.toFixed(1)}/>
                <Mini label="Fuel used (L)" value={metrics.totalFuel.toFixed(1)}/>
                <Mini label="Average pressure" value={metrics.averagePressure ? `${metrics.averagePressure.toFixed(1)} bar` : "—"}/>
              </div>
            </Card>
            <Card title="Stock & service watch" subtitle="Automatic operational safeguards">
              <div className="insight-grid">
                <Mini label="Low-stock items" value={metrics.lowStock}/>
                <Mini label="Stock value" value={money(metrics.inventoryValue)}/>
                <Mini label="Service alerts" value={serviceDue.length}/>
                <Mini label="Equipment records" value={equipment.length}/>
              </div>
            </Card>
          </section>
        </>}

        {page === "blocks" && <SimplePage title="Farm Blocks" description="Group fields into farm management areas." button="Add block" onAdd={() => open("block")}>
          <Table headers={["Name","Area","Fields","Status"]}>
            {blocks.filter(b=>matchesSearch(b.name,b.notes)).map(b => <div className="table-row" key={b.id}><strong>{b.name}</strong><span>{Number(b.area_acres||0)} acres</span>
              <span>{fields.filter(f=>f.farm_block_id===b.id).length}</span><span className="row-actions"><span className="pill">Active</span><button className="small-action" onClick={() => edit("block", b)}>Edit</button><button className="small-action danger-action" onClick={() => deleteItem("farm_blocks", b.id, `farm block ${b.name}`)}>Delete</button></span></div>)}
          </Table>
        </SimplePage>}

        {page === "fields" && <SimplePage title="Fields" description="Separate fields that are available for work, currently growing a crop, or resting fallow." button="Add field" disabled={!blocks.length} onAdd={() => open("field")}>
          <section className="field-status-summary">
            {Object.entries(fieldStatusSummary).map(([statusKey, summary]) => <button key={statusKey} className={fieldFilter === statusKey ? `active ${statusKey}` : statusKey} onClick={() => setFieldFilter(statusKey)}>
              <span>{capitalize(statusKey)}</span><strong>{summary.count}</strong><small>{summary.area.toFixed(2)} acres</small>
            </button>)}
          </section>
          <div className="filter-tabs field-filter-tabs">
            <button className={fieldFilter === "all" ? "active" : ""} onClick={() => setFieldFilter("all")}>All fields ({fields.length})</button>
            <button className={fieldFilter === "active" ? "active" : ""} onClick={() => setFieldFilter("active")}>Active ({fieldStatusSummary.active.count})</button>
            <button className={fieldFilter === "growing" ? "active" : ""} onClick={() => setFieldFilter("growing")}>Growing ({fieldStatusSummary.growing.count})</button>
            <button className={fieldFilter === "fallow" ? "active" : ""} onClick={() => setFieldFilter("fallow")}>Fallow ({fieldStatusSummary.fallow.count})</button>
          </div>
          <Table headers={["Name","Block","Area","Status"]}>
            {fields.filter(field => (fieldFilter === "all" || canonicalFieldStatus(field.status) === fieldFilter) && matchesSearch(field.name, canonicalFieldStatus(field.status), blockName(field.farm_block_id))).map(field => <div className="table-row" key={field.id}><strong>{field.name}</strong><span>{blockName(field.farm_block_id)}</span>
              <span>{Number(field.area_acres||0)} acres</span><span className="row-actions"><span className={`pill field-pill ${canonicalFieldStatus(field.status)}`}>{canonicalFieldStatus(field.status)}</span><button className="small-action" onClick={() => edit("field", field)}>Edit</button><button className="small-action danger-action" onClick={() => deleteItem("fields", field.id, `field ${field.name}`)}>Delete</button></span></div>)}
            {!fields.some(field =>
              (fieldFilter === "all" || canonicalFieldStatus(field.status) === fieldFilter) &&
              matchesSearch(field.name, canonicalFieldStatus(field.status), blockName(field.farm_block_id))
            ) && <Empty text={fields.length ? `No ${fieldFilter === "all" ? "" : `${fieldFilter} `}fields match this view.` : "Add your first field."}/>}
          </Table>
        </SimplePage>}

        {page === "nursery" && <SimplePage title="Nursery & Seed Propagation" description="Keep seedlings still in the nursery separate from batches already transplanted."
          button="New batch" onAdd={() => open("batch")}>
          <section className="nursery-summary">
            <Mini label="Active batches" value={activeNurseryBatches.length}/><Mini label="Seedlings at nursery" value={metrics.seedlings}/>
            <Mini label="Ready" value={metrics.ready}/><Mini label="Average germination" value={averageGermination(activeNurseryBatches)}/>
          </section>
          <div className="filter-tabs nursery-tabs">
            <button className={nurseryView === "active" ? "active" : ""} onClick={() => setNurseryView("active")}>At nursery ({activeNurseryBatches.length})</button>
            <button className={nurseryView === "transplanted" ? "active" : ""} onClick={() => setNurseryView("transplanted")}>Transplanted ({transplantedNurseryBatches.length})</button>
          </div>
          <div className="batch-grid">
            {(nurseryView === "active" ? activeNurseryBatches : transplantedNurseryBatches).filter(b=>matchesSearch(b.crop_name,b.variety,b.batch_code,b.status)).map(b => {
              const live = nurseryLiveSeedlings(b);
              const rate = Number(b.seeds_sown||0) ? Math.round(Number(b.germinated||0)/Number(b.seeds_sown)*100) : 0;
              return <article className={`batch-card ${isActiveNurseryBatch(b) ? "active-batch" : "transplanted-batch"}`} key={b.id}>
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
            {!(nurseryView === "active" ? activeNurseryBatches : transplantedNurseryBatches).some(
              batch => matchesSearch(batch.crop_name,batch.variety,batch.batch_code,batch.status)
            ) && <Empty text={nurseryView === "active" ? "No seedlings are currently active in the nursery." : "No batches have been transplanted yet."}/>}
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


        {page === "activities" && <SimplePage title="Field Activities" description="Schedule one operation across one or many fields; quantity and costs are allocated by acreage."
          button="New multi-field activity" disabled={!fields.length} onAdd={() => open("activity")}>
          <Table headers={["Activity","Field","Schedule","Status"]}>
            {activityOperations.filter(operation => matchesSearch(
              operation.title, operation.status,
              operation.items.map(item => fieldName(item.field_id)).join(" "),
              operation.items.map(item => unpackRecordNotes(item.notes).userNotes).join(" ")
            )).map(operation => <Fragment key={operation.key}>
              <div className="table-row operation-row">
                <strong>{operation.title}<small>{operation.items.length} field{operation.items.length === 1 ? "" : "s"} · {operation.totalArea.toFixed(2)} acres</small></strong>
                <span>{operationFieldLabel(operation, fields)}</span>
                <span>{operation.scheduled_date || "No date"}<small>{operation.completedCount}/{operation.items.length} completed</small></span>
                <span className="activity-status"><span className="pill">{operation.status}</span>
                  <div className="row-actions">
                    {operation.items.length > 1 && <button className="operation-toggle" onClick={() => setExpandedOperation(expandedOperation === operation.key ? "" : operation.key)}>{expandedOperation === operation.key ? "Hide fields" : "View fields"}</button>}
                    {operation.items.length === 1 && <button className="small-action" onClick={() => edit("activity", operation.items[0])}>Edit</button>}
                    <button className="small-action danger-action" onClick={() => deleteActivityOperation(operation)}>Delete</button>
                    {!["completed","cancelled"].includes(operation.status) && <button className="small-action" onClick={() => openActivityCompletion(operation)}>Complete selected</button>}
                  </div>
                </span>
              </div>
              {expandedOperation === operation.key && <div className="operation-fields">
                {operation.items.map(item => <article key={item.id}>
                  <div><strong>{fieldName(item.field_id)}</strong><small>{Number(fields.find(field => field.id === item.field_id)?.area_acres || 0).toFixed(2)} acres</small></div>
                  <span>{item.quantity ? `${item.quantity} ${item.unit || ""}` : "No input quantity"}<small>{money(Number(item.labour_cost || 0) + Number(item.input_cost || 0))}</small></span>
                  <span className="pill">{item.status || "planned"}</span>
                  <button className="small-action" onClick={() => edit("activity", item)}>Edit field record</button>
                </article>)}
              </div>}
            </Fragment>)}
            {!activityOperations.length && <Empty text="No field activities yet."/>}
          </Table>
        </SimplePage>}

        {page === "calendar" && <SimplePage title="Work Calendar" description="One work-plan item per operation, even when several fields are selected." button="Schedule activity" disabled={!fields.length} onAdd={() => open("activity")}>
          <div className="calendar-list">
            {activityOperations.slice().sort((a,b)=>String(a.scheduled_date).localeCompare(String(b.scheduled_date))).map(operation => {
              const overdue = operation.scheduled_date < today && !["completed","cancelled"].includes(operation.status);
              return <article className={`calendar-item ${overdue ? "overdue" : ""}`} key={operation.key}>
                <div className="calendar-date"><strong>{operation.scheduled_date || "—"}</strong><span>{overdue ? "Overdue" : operation.status}</span></div>
                <div className="calendar-main"><h3>{operation.title}</h3><p>{operationFieldLabel(operation, fields)} · {workerName(operation.worker_id)}</p></div>
                {!["completed","cancelled"].includes(operation.status) && <button className="small-action" onClick={() => openActivityCompletion(operation)}>Complete selected</button>}
              </article>
            })}
            {!activityOperations.length && <Empty text="No scheduled work yet."/>}
          </div>
        </SimplePage>}

        {page === "workers" && <SimplePage title="Employees" description="Maintain complete employment, contact, wage and payment profiles. Employees remain records only and do not receive login accounts." button="Add employee" onAdd={() => open("worker")}>
          <Table headers={["Employee","Employment",canSeeFinancials ? "Pay basis" : "Contact","Status"]}>
            {workers.filter(w=>matchesSearch(w.full_name,w.employee_number,w.phone,w.role,w.employment_type,w.wage_type,w.status)).map(w => <div className="table-row" key={w.id}>
              <strong>{w.full_name}<small>{w.employee_number || "No employee number"} · {w.phone || "No phone"}</small></strong><span>{w.role || "Worker"}<small>{capitalize(w.employment_type || "casual")}{w.hire_date ? ` · Since ${formatShortDate(w.hire_date)}` : ""}</small></span>
              <span>{canSeeFinancials ? workerPayLabel(w) : (w.phone || "No phone")}<small>{canSeeFinancials ? `${capitalize(w.wage_type || "daily")} wage` : (w.email || "No email")}</small></span><span className="row-actions"><span className="pill">{w.status || "active"}</span><button className="small-action" onClick={() => edit("worker", w)}>Edit profile</button>{!assignmentWorkers.some(link => link.worker_id === w.id) && !payrollItems.some(item => item.worker_id === w.id) && <button className="small-action danger-action" onClick={() => deleteItem("workers", w.id, `employee ${w.full_name}`)}>Delete</button>}</span>
            </div>)}
            {!workers.length && <Empty text="No employees added yet."/>}
          </Table>
        </SimplePage>}

        {page === "attendance" && <SimplePage title="Employee Attendance" description="Mark farm workers present or absent and review attendance by calendar date." button="Add worker" onAdd={() => open("worker")}>
          {!attendanceReady && <div className="attendance-setup-note">
            <AlertCircle size={20}/>
            <div><strong>One-time database setup required</strong><p>Run database-v8-2-attendance.sql in Supabase, then tap Refresh. All other Farm Manager modules remain available.</p></div>
          </div>}
          <div className="attendance-login-note"><ShieldCheck size={18}/><span><strong>Workers do not need login accounts.</strong> These are attendance-only employee records managed by authorized farm users.</span></div>
          <section className="attendance-date-bar">
            <Field label="Attendance date"><input required type="date" value={attendanceDate} onChange={event=>{if(event.target.value) syncReportingMonth(event.target.value.slice(0,7), event.target.value)}}/></Field>
            <div className="attendance-bulk-actions">
              <button type="button" disabled={!canWriteModule("attendance")||!attendanceReady||!activeWorkers.length||Boolean(attendanceSaving)} onClick={()=>markAllAttendance("present")}><UserCheck size={16}/> Mark all present</button>
              <button type="button" disabled={!canWriteModule("attendance")||!attendanceReady||!activeWorkers.length||Boolean(attendanceSaving)} onClick={()=>markAllAttendance("absent")}><UserX size={16}/> Mark all absent</button>
            </div>
          </section>
          <section className="stats-grid attendance-day-stats">
            <Stat label="Active workers" value={activeWorkers.length} detail="Attendance-only records"/>
            <Stat label="Present" value={attendanceSummary.presentOnDate} detail={formatLongDate(attendanceDate)}/>
            <Stat label="Absent" value={attendanceSummary.absentOnDate} detail={`${attendanceSummary.unmarkedOnDate} still unmarked`}/>
            <Stat label={canSeeFinancials ? "Wage reference" : "Attendance marked"} value={canSeeFinancials ? money(attendanceSummary.dayLabourCost) : attendanceSummary.presentOnDate + attendanceSummary.absentOnDate} detail={canSeeFinancials ? "Not posted until work approval" : "Present and absent records"}/>
          </section>
          <section className="attendance-layout">
            <div className="attendance-calendar-panel">
              <header className="attendance-calendar-header">
                <button aria-label="Previous month" onClick={()=>{const month=shiftAttendanceMonth(attendanceMonth,-1);syncReportingMonth(month,`${month}-01`)}}><ChevronLeft size={18}/></button>
                <div><strong>{formatAttendanceMonth(attendanceMonth)}</strong><span>{attendanceSummary.recordedDays} recorded day{attendanceSummary.recordedDays===1?"":"s"} · {attendanceSummary.rate}% present</span></div>
                <button aria-label="Next month" onClick={()=>{const month=shiftAttendanceMonth(attendanceMonth,1);syncReportingMonth(month,`${month}-01`)}}><ChevronRight size={18}/></button>
              </header>
              <div className="attendance-weekdays">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day=><span key={day}>{day}</span>)}</div>
              <div className="attendance-calendar-grid">
                {attendanceCalendarDays.map((day,index) => {
                  if (!day) return <span className="attendance-day blank" key={`blank-${index}`}/>;
                  const rows = attendance.filter(row => row.attendance_date === day.date);
                  const presentCount = rows.filter(row => row.status === "present").length;
                  const absentCount = rows.filter(row => row.status === "absent").length;
                  return <button className={`attendance-day ${day.date===attendanceDate?"selected":""} ${day.date===today?"today":""}`} key={day.date} onClick={()=>syncReportingMonth(day.date.slice(0,7),day.date)}>
                    <strong>{day.day}</strong>
                    {rows.length ? <span><b>{presentCount}P</b><i>{absentCount}A</i></span> : <small>—</small>}
                  </button>;
                })}
              </div>
              <button className="attendance-today-button" onClick={()=>syncReportingMonth(today.slice(0,7),today)}>Go to today</button>
            </div>
            <div className="attendance-register">
              <header><div><h3>Daily register</h3><p>{formatLongDate(attendanceDate)} · changes save immediately</p></div><span>{attendanceSummary.presentOnDate}/{activeWorkers.length} present</span></header>
              <div className="attendance-worker-list">
                {attendanceWorkersForDay.filter(worker=>matchesSearch(worker.full_name,worker.role,selectedAttendanceMap.get(worker.id)?.status)).map(worker => {
                  const record = selectedAttendanceMap.get(worker.id);
                  const busy = attendanceSaving === worker.id || attendanceSaving === "all";
                  return <article className="attendance-worker" key={worker.id}>
                    <div className="worker-avatar">{worker.full_name.slice(0,1).toUpperCase()}</div>
                    <div className="attendance-worker-info"><strong>{worker.full_name}</strong><span>{worker.role || "Worker"}{worker.status === "inactive" ? " · inactive" : ""}</span></div>
                    <div className="attendance-status-buttons">
                      <button className={record?.status === "present" ? "present active" : "present"} disabled={!canWriteModule("attendance")||!attendanceReady||busy} onClick={()=>markWorkerAttendance(worker.id,"present")}><UserCheck size={15}/> Present</button>
                      <button className={record?.status === "absent" ? "absent active" : "absent"} disabled={!canWriteModule("attendance")||!attendanceReady||busy} onClick={()=>markWorkerAttendance(worker.id,"absent")}><UserX size={15}/> Absent</button>
                      {record && <button className="clear-attendance" disabled={!canWriteModule("attendance")||busy} onClick={()=>clearWorkerAttendance(worker.id)}>Clear</button>}
                    </div>
                  </article>;
                })}
                {!attendanceWorkersForDay.length && <Empty text="Add workers to start recording daily attendance."/>}
              </div>
            </div>
          </section>
          <section className="attendance-summary-panel">
            <header className="attendance-summary-header">
              <div className="attendance-summary-title">
                <span><BarChart3 size={20}/></span>
                <div><h3>Employee monthly summary</h3><p>{formatAttendanceMonth(attendanceMonth)} · {attendanceSummary.recordedDays} recorded farm day{attendanceSummary.recordedDays===1?"":"s"}{canSeeFinancials ? ` · attendance wage reference ${money(attendanceMonthLabourCost)}` : ""}</p></div>
              </div>
              {canSeeFinancials && <button className="button secondary" type="button" onClick={downloadAttendanceSummary}><Download size={16}/> Download monthly CSV</button>}
            </header>
            <div className="attendance-summary-list">
              {visibleAttendanceWorkerSummaries.map(summary => <article className="attendance-summary-worker" key={summary.worker.id}>
                <div className="attendance-summary-person">
                  <div className="worker-avatar">{summary.worker.full_name.slice(0,1).toUpperCase()}</div>
                  <div><strong>{summary.worker.full_name}</strong><span>{summary.worker.role || "Worker"}{String(summary.worker.status || "active").toLowerCase()==="inactive"?" · inactive":""}</span></div>
                </div>
                <div className="attendance-summary-metric present"><span>Present</span><strong>{summary.present}</strong><small>days</small></div>
                <div className="attendance-summary-metric absent"><span>Absent</span><strong>{summary.absent}</strong><small>days</small></div>
                <div className="attendance-summary-metric unmarked"><span>Unmarked</span><strong>{summary.unmarked}</strong><small>days</small></div>
                <div className="attendance-summary-metric rate"><span>Attendance</span><strong>{summary.rate}%</strong><small>{summary.marked} marked</small></div>
                <div className="attendance-summary-metric pay"><span>{canSeeFinancials ? "Wage reference" : "Payroll"}</span><strong>{canSeeFinancials ? money(summary.estimatedPay) : "Restricted"}</strong><small>{canSeeFinancials ? `${summary.payBasis} · not posted` : "Owner / manager only"}</small></div>
              </article>)}
              {!visibleAttendanceWorkerSummaries.length && <Empty text={attendanceWorkerSummaries.length ? "No employee summaries match this search." : "Add workers and attendance marks to generate monthly employee summaries."}/>} 
            </div>
          </section>
        </SimplePage>}


        {page === "workforce" && <>
          <section className="hero workforce-hero">
            <div><span className="eyebrow">V8.6 WORKFORCE OPERATIONS</span><h2>Crews, assignments and approvals</h2><p>Assign one job to individuals or a crew, link every field and crop, then record each employee's hours, overtime and completed units.</p></div>
            <div className="button-row">
              <button className="button secondary" disabled={!canWriteModule("workforce") || !workforceReady} onClick={() => open("crew")}><Users size={17}/> New crew</button>
              <button className="button primary" disabled={!canWriteModule("workforce") || !workforceReady || !fields.length || !activeWorkers.length} onClick={() => open("assignment")}><Plus size={17}/> Assign job</button>
            </div>
          </section>
          {!workforceReady && <div className="attendance-setup-note workforce-setup-note">
            <AlertCircle size={20}/><div><strong>One-time workforce database setup required</strong><p>Run database-v8-4-workforce-payroll.sql in Supabase, then tap Refresh. Existing farm and attendance records remain available.</p></div>
          </div>}
          <section className="stats-grid workforce-stats">
            <Stat label="Active crews" value={workforceMetrics.activeCrews} detail={`${activeWorkers.length} active employees`}/>
            <Stat label="Planned jobs" value={workforceMetrics.planned} detail="Planned or in progress"/>
            <Stat label="Awaiting approval" value={workforceMetrics.pendingApproval} detail="Completed work to review"/>
            <Stat label="Approved this month" value={workforceMetrics.approvedThisMonth} detail={formatAttendanceMonth(payrollMonth)}/>
          </section>
          <div className="filter-tabs workforce-tabs">
            <button className={workforceTab === "assignments" ? "active" : ""} onClick={() => setWorkforceTab("assignments")}>Assignments</button>
            <button className={workforceTab === "crews" ? "active" : ""} onClick={() => setWorkforceTab("crews")}>Work crews</button>
            <button className={workforceTab === "productivity" ? "active" : ""} onClick={() => setWorkforceTab("productivity")}>Productivity</button>
            <button className={workforceTab === "allocation" ? "active" : ""} onClick={() => setWorkforceTab("allocation")}>Field labour allocation</button>
          </div>

          {workforceTab === "assignments" && <section className="card workforce-panel">
            <header className="workforce-panel-header"><div><h3>Job assignments</h3><p>Completed results stay outside payroll until an authorized supervisor approves them.</p></div><span>{workAssignments.length} total</span></header>
            <div className="assignment-list">
              {workAssignments.filter(assignment => matchesSearch(
                assignment.title, assignment.status, assignment.approval_status, crewName(assignment.crew_id),
                assignmentFieldLinks(assignment.id).map(link => fieldName(link.field_id)).join(" "),
                assignmentWorkerLinks(assignment.id).map(link => workerName(link.worker_id)).join(" ")
              )).map(assignment => {
                const workerLinks = assignmentWorkerLinks(assignment.id);
                const fieldLinks = assignmentFieldLinks(assignment.id);
                const regularHours = workerLinks.reduce((sum, link) => sum + Number(link.regular_hours || 0), 0);
                const overtimeHours = workerLinks.reduce((sum, link) => sum + Number(link.overtime_hours || 0), 0);
                const completedUnits = workerLinks.reduce((sum, link) => sum + Number(link.completed_units || 0), 0);
                const assignmentCost = workerLinks.reduce((sum, link) => sum + assignmentEarningForWorker(workers.find(worker => worker.id === link.worker_id), assignment, link).total, 0);
                return <article className={`assignment-card approval-${assignment.approval_status}`} key={assignment.id}>
                  <div className="assignment-main">
                    <span className="eyebrow">{formatLongDate(assignment.work_date)}</span>
                    <h3>{assignment.title}</h3>
                    <p>{fieldLinks.length ? fieldLinks.map(link => fieldName(link.field_id)).join(", ") : "No field"} · {assignment.crew_id ? crewName(assignment.crew_id) : assignmentWorkerLabel(assignment.id)}</p>
                  </div>
                  <div className="assignment-metrics">
                    <span><b>{workerLinks.length}</b><small>Employees</small></span>
                    <span><b>{regularHours.toFixed(1)}</b><small>Regular hr</small></span>
                    <span><b>{overtimeHours.toFixed(1)}</b><small>Overtime hr</small></span>
                    <span><b>{completedUnits.toFixed(1)}</b><small>{assignment.unit_name || "Units"}</small></span>
                    {canSeeFinancials && <span className="assignment-cost"><b>{money(assignmentCost)}</b><small>Labour</small></span>}
                  </div>
                  <div className="assignment-state">
                    <span className="pill">{assignment.status}</span>
                    <span className={`approval-pill ${assignment.approval_status}`}>{assignment.approval_status}</span>
                  </div>
                  <div className="assignment-actions">
                    {assignment.approval_status !== "approved" && <button className="small-action" onClick={() => edit("assignment", assignment)}>Edit plan</button>}
                    {assignment.status !== "cancelled" && <button className="small-action" onClick={() => openAssignmentResults(assignment)}>{assignment.status === "completed" ? "Update results" : "Record results"}</button>}
                    {assignment.status === "completed" && assignment.approval_status !== "approved" && <button className="small-action approve-action" onClick={() => reviewAssignment(assignment, "approved")}><ShieldCheck size={14}/> Approve</button>}
                    {assignment.status === "completed" && assignment.approval_status !== "rejected" && <button className="small-action danger-action" onClick={() => reviewAssignment(assignment, "rejected")}>Reject</button>}
                    {assignment.approval_status !== "approved" && <button className="small-action danger-action" onClick={() => deleteWorkforceRecord("work_assignments", assignment.id, `assignment ${assignment.title}`)}>Delete</button>}
                  </div>
                  {assignment.approval_notes && <p className="assignment-note"><strong>Review note:</strong> {assignment.approval_notes}</p>}
                </article>;
              })}
              {!workAssignments.length && <Empty text="Create the first job assignment, choose the fields and assign employees or a crew."/>}
            </div>
          </section>}

          {workforceTab === "crews" && <section className="crew-grid">
            {crews.filter(crew => matchesSearch(crew.name, crew.status, workerName(crew.supervisor_id))).map(crew => {
              const members = crewMembers.filter(member => member.crew_id === crew.id && member.status === "active");
              return <article className="card crew-card" key={crew.id}>
                <header><div className="crew-icon"><Users size={20}/></div><span className="pill">{crew.status}</span></header>
                <h3>{crew.name}</h3>
                <p>Supervisor: {crew.supervisor_id ? workerName(crew.supervisor_id) : "Not assigned"}</p>
                <div className="crew-members"><strong>{members.length} members</strong><span>{members.map(member => workerName(member.worker_id)).join(", ") || "No employees selected"}</span></div>
                {crew.notes && <p>{crew.notes}</p>}
                <footer><button className="small-action" onClick={() => edit("crew", crew)}>Edit crew</button><button className="small-action danger-action" onClick={() => deleteWorkforceRecord("work_crews", crew.id, `crew ${crew.name}`)}>Delete</button></footer>
              </article>;
            })}
            {!crews.length && <section className="card"><Empty text="No work crews yet. Crews let you assign a whole team in one tap."/></section>}
          </section>}

          {workforceTab === "productivity" && <section className="card workforce-panel">
            <header className="workforce-panel-header"><div><h3>Employee productivity</h3><p>Approved completed work for {formatAttendanceMonth(payrollMonth)}.</p></div><Field label="Report month"><input type="month" value={payrollMonth} onChange={event => syncReportingMonth(event.target.value)}/></Field></header>
            <Table headers={["Employee", "Approved jobs", "Hours", "Output"]}>
              {workforceProductivity.filter(row => matchesSearch(row.worker.full_name, row.worker.role)).map(row => <div className="table-row" key={row.worker.id}>
                <strong>{row.worker.full_name}<small>{row.worker.role || "Worker"}</small></strong>
                <span>{row.assignments}<small>{row.fields} field links</small></span>
                <span>{row.regularHours.toFixed(1)} regular<small>{row.overtimeHours.toFixed(1)} overtime</small></span>
                <span>{row.completedUnits.toFixed(1)} units<small>{row.attendanceRate}% attendance</small></span>
              </div>)}
              {!workforceProductivity.length && <Empty text="Approve completed assignments to generate productivity results."/>}
            </Table>
          </section>}

          {workforceTab === "allocation" && <section className="card workforce-panel">
            <header className="workforce-panel-header"><div><h3>Labour automatically allocated to fields and crops</h3><p>Approved assignment earnings are distributed using each linked field's acreage share.</p></div>{canSeeFinancials && <button className="button secondary" onClick={downloadFieldLabourSummary}><Download size={16}/> Download CSV</button>}</header>
            <Table headers={["Field / crop", "Jobs / employees", "Work output", canSeeFinancials ? "Allocated labour" : "Status"]}>
              {workforceAllocation.rows.filter(row => matchesSearch(row.fieldName, row.cropName)).map(row => <div className="table-row" key={`${row.fieldId}-${row.cropCycleId || "none"}`}>
                <strong>{row.fieldName}<small>{row.cropName}</small></strong>
                <span>{row.assignmentCount} jobs<small>{row.workerCount} employees</small></span>
                <span>{row.regularHours.toFixed(1)} hr<small>{row.completedUnits.toFixed(1)} completed units</small></span>
                <span>{canSeeFinancials ? money(row.cost) : "Approved"}<small>{row.overtimeHours.toFixed(1)} overtime hr</small></span>
              </div>)}
              {!workforceAllocation.rows.length && <Empty text="Approved assignments linked to fields will appear here automatically."/>}
            </Table>
          </section>}
        </>}

        {page === "payroll" && canSeeFinancials && <>
          <section className="hero payroll-hero">
            <div><span className="eyebrow">V8.6 APPROVED-WORK PAYROLL</span><h2>Payroll, balances and payslips</h2><p>Attendance and Payroll now share the same selected month and live attendance totals. Approved work still determines earnings.</p></div>
            <div className="payroll-month-control"><Field label="Payroll month"><input type="month" value={payrollMonth} onChange={event => syncReportingMonth(event.target.value)}/></Field><span className={`payroll-period-status ${currentPayrollPeriod?.status || "preview"}`}>{currentPayrollPeriod?.status || "live preview"}</span></div>
          </section>
          {!payrollReady && <div className="attendance-setup-note workforce-setup-note"><AlertCircle size={20}/><div><strong>Payroll database setup required</strong><p>Run database-v8-4-workforce-payroll.sql once, then tap Refresh.</p></div></div>}
          <section className="stats-grid payroll-stats">
            <Stat label="Gross payroll" value={money(payrollSummary.gross)} detail={`${money(payrollSummary.bonuses)} bonuses included`}/>
            <Stat label="Net payroll" value={money(payrollSummary.net)} detail={`${money(payrollSummary.advances)} advances · ${money(payrollSummary.deductions)} deductions`}/>
            <Stat label="Paid" value={money(payrollSummary.paid)} detail="Approved payment history"/>
            <Stat label="Outstanding" value={money(payrollSummary.balance)} detail="Employee balances remaining"/>
          </section>
          <section className="card payroll-control-card">
            <div><strong>{["approved","closed"].includes(currentPayrollPeriod?.status) ? "Approved payroll snapshot" : currentPayrollItems.length ? "Live draft with saved snapshot" : "Live payroll preview"}</strong><p>{["approved","closed"].includes(currentPayrollPeriod?.status) ? "Pay amounts are frozen, while the attendance column remains synchronized with the Attendance register." : "Bonuses, advances and attendance changes appear immediately; approval saves the latest values."}</p></div>
            <div className="payroll-actions">
              {(!currentPayrollPeriod || currentPayrollPeriod.status === "draft") && <button className="button secondary" disabled={!payrollReady || saving} onClick={generatePayroll}><RefreshCw size={16}/> {currentPayrollItems.length ? "Refresh draft" : "Generate draft"}</button>}
              {currentPayrollPeriod?.status === "draft" && <button className="button primary" disabled={saving || !currentPayrollItems.length} onClick={() => changePayrollStatus("approved")}><ShieldCheck size={16}/> Approve payroll</button>}
              {currentPayrollPeriod?.status === "approved" && <button className="button secondary" disabled={saving || payrollPayments.some(payment => payment.payroll_period_id === currentPayrollPeriod.id && payment.status === "approved")} onClick={() => changePayrollStatus("draft")}>Reopen draft</button>}
              {currentPayrollPeriod?.status === "approved" && <button className="button primary" disabled={saving || payrollSummary.balance > 0.01} onClick={() => changePayrollStatus("closed")}>Close paid period</button>}
              <button className="button secondary" disabled={!payrollReady || ["approved","closed"].includes(currentPayrollPeriod?.status)} onClick={() => open("adjustment")}><Plus size={16}/> Bonus / advance</button>
              <button className="button primary" disabled={!payrollReady || currentPayrollPeriod?.status !== "approved" || payrollSummary.balance <= 0} onClick={() => open("payment")}><CircleDollarSign size={16}/> Record payment</button>
              <button className="button secondary" disabled={!payrollRows.length} onClick={downloadPayrollSummary}><Download size={16}/> Payroll CSV</button>
            </div>
          </section>
          <section className="card payroll-register">
            <header className="workforce-panel-header"><div><h3>Employee payroll register</h3><p>{formatAttendanceMonth(payrollMonth)} · live attendance totals · {["approved","closed"].includes(currentPayrollPeriod?.status) ? "approved pay values" : "live pay values"}</p></div></header>
            <div className="payroll-list">
              {payrollRows.filter(row => matchesSearch(row.worker.full_name, row.worker.employee_number, row.worker.wage_type)).map(row => <article className="payroll-worker" key={row.worker.id}>
                <div className="payroll-person"><div className="worker-avatar">{row.worker.full_name.slice(0,1).toUpperCase()}</div><div><strong>{row.worker.full_name}</strong><span>{row.worker.employee_number || "No employee number"} · {capitalize(row.worker.wage_type || "daily")}</span></div></div>
                <div><span>Attendance</span><strong>{row.presentDays}P / {row.absentDays}A</strong><small>{row.assignmentCount} approved job{row.assignmentCount===1?"":"s"}</small></div>
                <div><span>Approved work</span><strong>{money(row.regularPay + row.overtimePay)}</strong><small>{row.regularHours.toFixed(1)} regular + {row.overtimeHours.toFixed(1)} OT hr</small></div>
                <div><span>Adjustments</span><strong>{money(row.bonuses - row.advances - row.deductions)}</strong><small>Bonus {money(row.bonuses)} · Advance {money(row.advances)} · Deduction {money(row.deductions)}</small></div>
                <div><span>Net pay</span><strong>{money(row.netPay)}</strong><small>Paid {money(row.paid)}</small></div>
                <div className="payroll-balance"><span>Balance</span><strong>{money(row.balance)}</strong><small>{row.balance <= 0 ? "Fully paid" : row.paid > 0 ? "Partly paid" : "Unpaid"}</small></div>
                <div className="payroll-worker-actions"><button className="small-action" disabled={!currentPayrollItems.length} onClick={() => setPayslipItem(row)}><FileText size={14}/> Payslip</button>{currentPayrollPeriod?.status === "approved" && row.balance > 0 && <button className="small-action approve-action" onClick={() => {setEditingId(null);setForm({...emptyPayment,worker_id:row.worker.id,amount:String(row.balance),method:row.worker.payment_method || "M-Pesa"});setModal("payment")}}>Pay</button>}</div>
              </article>)}
              {!payrollRows.length && <Empty text="Record attendance or approved hourly/piece-rate work to calculate payroll."/>}
            </div>
          </section>
          <section className="split-grid payroll-history-grid">
            <Card title="Bonuses, advances & deductions" subtitle={formatAttendanceMonth(payrollMonth)}>
              <div className="payroll-history-list">
                {payrollAdjustments.filter(item => item.period_month === payrollPeriodMonth && item.status !== "void").map(item => <article key={item.id}><div><strong>{workerName(item.worker_id)}</strong><span>{capitalize(item.adjustment_type)} · {item.description}</span></div><strong>{money(item.amount)}</strong><button className="small-action danger-action" disabled={["approved","closed"].includes(currentPayrollPeriod?.status)} onClick={() => voidPayrollRecord("payroll_adjustments", item, `${item.adjustment_type} for ${workerName(item.worker_id)}`)}>Void</button></article>)}
                {!payrollAdjustments.some(item => item.period_month === payrollPeriodMonth && item.status !== "void") && <Empty text="No payroll adjustments for this month."/>}
              </div>
            </Card>
            <Card title="Payment history" subtitle="Every partial and full payment">
              <div className="payroll-history-list">
                {payrollPayments.filter(item => item.period_month === payrollPeriodMonth && item.status !== "void").map(item => <article key={item.id}><div><strong>{workerName(item.worker_id)}</strong><span>{formatLongDate(item.payment_date)} · {item.method}{item.reference ? ` · ${item.reference}` : ""}</span></div><strong>{money(item.amount)}</strong><button className="small-action danger-action" disabled={currentPayrollPeriod?.status === "closed"} onClick={() => voidPayrollRecord("payroll_payments", item, `payment to ${workerName(item.worker_id)}`)}>Void</button></article>)}
                {!payrollPayments.some(item => item.period_month === payrollPeriodMonth && item.status !== "void") && <Empty text="No payments recorded for this month."/>}
              </div>
            </Card>
          </section>
        </>}


        {page === "irrigation" && <SimplePage title="Irrigation Management" description="Track water, pressure, duration, fuel and equipment by field." button="Add irrigation" disabled={!fields.length} onAdd={() => open("irrigation")}>
          <Table headers={["Date / Field","System","Water & pressure","Actions"]}>
            {irrigation.filter(r=>matchesSearch(r.irrigation_date,r.system_type,r.water_source,fieldName(r.field_id),equipmentName(r.equipment_id))).map(r=><div className="table-row" key={r.id}><strong>{r.irrigation_date}<small>{fieldName(r.field_id)}</small></strong><span>{r.system_type}<small>{equipmentName(r.equipment_id)}</small></span><span>{r.duration_hours||0} hr · {r.pressure_bar||0} bar<small>{r.water_source}</small></span><span className="row-actions"><button className="small-action" onClick={()=>edit("irrigation",r)}>Edit</button><button className="small-action danger-action" onClick={()=>deleteItem("irrigation_records",r.id,"irrigation record")}>Delete</button></span></div>)}
            {!irrigation.length&&<Empty text="No irrigation records yet."/>}
          </Table>
        </SimplePage>}

        {page === "sprays" && <SimplePage title="Spray Records" description="Record one spray across several fields while keeping an individual traceable history for every field." button="Add multi-field spray" disabled={!fields.length} onAdd={() => open("spray")}>
          <Table headers={["Date / Field","Product","Safety","Actions"]}>
            {sprays.filter(r=>matchesSearch(r.spray_date,r.product_name,r.active_ingredient,r.target_problem,fieldName(r.field_id))).map(r => {
              const meta = unpackRecordNotes(r.notes).meta || {};
              return <div className="table-row" key={r.id}><strong>{r.spray_date}<small>{fieldName(r.field_id)}{meta.groupId ? " · Multi-field" : ""}</small></strong><span>{r.product_name}<small>{r.target_problem||r.active_ingredient||"—"}{meta.equipmentId ? ` · ${equipmentName(meta.equipmentId)}` : ""}</small></span><span>PHI {r.phi_days||0} days<small>REI {r.rei_hours||0} hours · {r.quantity_used||0} {r.unit||""}</small></span><span className="row-actions"><button className="small-action" onClick={()=>edit("spray",r)}>Edit</button><button className="small-action danger-action" onClick={()=>deleteItem("spray_records",r.id,"spray record")}>Delete</button></span></div>;
            })}
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

        {page === "expenses" && <SimplePage title="Financial Dashboard" description="Accrual-based operating costs, cash settlements, sales and estimated profit without duplicated labour.">
          <div className="finance-grid"><Stat label="Revenue" value={money(metrics.revenue)} detail="Harvest sales"/><Stat label="Operating costs" value={money(metrics.fieldCosts)} detail="Posted once when the cost is earned"/><Stat label="Estimated profit" value={money(metrics.profit)} detail="Revenue minus recorded costs"/></div>
          <div className="finance-accounting-note"><ShieldCheck size={20}/><div><strong>One labour expense, one later payment</strong><p>Approved employee hours create the labour expense and payroll balance. Paying that balance is a cash settlement only—not another expense.</p></div></div>
          <Table headers={["Source","Records","Posted expense","Accounting treatment"]}>
            <div className="table-row"><strong>Field activity inputs</strong><span>{activities.length}</span><span>{money(activityCostLedger.inputs)}</span><span>Fertilizer, chemicals and other inputs</span></div>
            <div className="table-row"><strong>Unmatched activity labour estimates</strong><span>{activities.filter(activity=>Number(activityCostLedger.byActivity.get(activity.id)?.manualLabour||0)>0).length}</span><span>{money(activityCostLedger.manualLabour)}</span><span>Posted only where no employee job is approved for the same field and date</span></div>
            <div className="table-row"><strong>Approved employee work</strong><span>{workAssignments.filter(item=>item.status==="completed"&&item.approval_status==="approved").length}</span><span>{money(workforceAllocation.total)}</span><span>Employee hours or units accrued once</span></div>
            <div className="table-row excluded-cost"><strong>Activity labour estimates replaced</strong><span>{activities.filter(activity=>activityCostLedger.byActivity.get(activity.id)?.replacedByApprovedJob).length}</span><span>{money(0)}</span><span>{money(activityCostLedger.replacedLabour)} excluded to prevent double counting</span></div>
            <div className="table-row settlement-row"><strong>Payroll payments</strong><span>{payrollPayments.filter(payment=>payment.status==="approved").length}</span><span>{money(0)}</span><span>{money(payrollPayments.filter(payment=>payment.status==="approved").reduce((sum,payment)=>sum+Number(payment.amount||0),0))} paid as liability settlement</span></div>
            <div className="table-row"><strong>Irrigation</strong><span>{irrigation.length}</span><span>{money(irrigation.reduce((s,r)=>s+Number(r.cost||0),0))}</span><span>Fuel and operation</span></div>
            <div className="table-row"><strong>Sprays</strong><span>{sprays.length}</span><span>{money(sprays.filter(r=>!isActivitySprayHistory(r)).reduce((s,r)=>s+Number(r.cost||0),0))}</span><span>Scheduled spray costs stay under activities</span></div>
            <div className="table-row revenue-row"><strong>Harvest sales</strong><span>{harvests.length}</span><span>{money(metrics.revenue)}</span><span>Gross revenue—not an expense</span></div>
          </Table>
          <section className="finance-labour-panel">
            <header className="workforce-panel-header"><div><h3>Approved labour by assignment and employee</h3><p>The exact amount posted for every employee from recorded hours or units.</p></div><Field label="Labour month"><input type="month" value={payrollMonth} onChange={event=>syncReportingMonth(event.target.value)}/></Field></header>
            <div className="finance-labour-total"><span>{approvedLabourMonthEntries.length} employee job lines</span><strong>{money(approvedLabourMonthTotal)} accrued</strong></div>
            <Table headers={["Date / assignment","Employee","Work recorded","Amount posted"]}>
              {approvedLabourMonthEntries.map(entry => <div className="table-row" key={`${entry.assignmentId}-${entry.workerId}`}>
                <strong>{formatLongDate(entry.workDate)}<small>{entry.assignmentTitle} · {entry.fieldNames.join(", ") || "No field"}</small></strong>
                <span>{entry.workerName}<small>{capitalize(entry.wageType)} wage</small></span>
                <span>{entry.regularHours.toFixed(1)} regular hr<small>{entry.overtimeHours.toFixed(1)} overtime hr{entry.completedUnits ? ` · ${entry.completedUnits.toFixed(1)} units` : ""}</small></span>
                <span className="positive-value">{money(entry.total)}<small>{money(entry.regular)} regular · {money(entry.overtime)} OT</small></span>
              </div>)}
              {!approvedLabourMonthEntries.length && <Empty text="No completed and approved employee work for this month."/>}
            </Table>
          </section>
        </SimplePage>}

        {page === "reports" && <SimplePage title="Analytics & Reports" description="Field performance, profitability and a complete production timeline."
          button="Print / Save PDF" buttonIcon={FileText} onAdd={printReport}>
          <div className="print-heading"><h2>{farm?.name || "Farm Manager"}</h2><p>V8.6 Farm Command, Approved-work Payroll & Multi-field Operations report · generated {formatLongDate(today)}</p></div>
          <div className="report-toolbar">
            <span>Reports use the live records already saved in Farm Manager.</span>
            {canSeeFinancials && <button className="button secondary" onClick={downloadFieldReport}><Download size={16}/> Download field CSV</button>}
          </div>
          <div className="finance-grid report-kpis">
            {canSeeFinancials && <Stat label="Estimated profit" value={money(metrics.profit)} detail="Revenue minus recorded costs"/>}
            <Stat label="Task completion" value={`${metrics.taskCompletion}%`} detail={`${metrics.completedTasks} completed activities`}/>
            <Stat label="Harvest recorded" value={metrics.harvestedQuantity.toLocaleString()} detail="Across all grades and units"/>
            <Stat label="Irrigation fuel" value={`${metrics.totalFuel.toFixed(1)} L`} detail={`${metrics.irrigationHours.toFixed(1)} operating hours`}/>
          </div>
          {canSeeFinancials && <section className="report-section">
            <header><div><h3>Field performance</h3><p>Revenue, recorded operating costs and estimated result by field.</p></div><BarChart3 size={21}/></header>
            <Table headers={["Field / crop","Area / harvest","Revenue / costs","Estimated result"]}>
              {fieldPerformance.map(row => <div className="table-row" key={row.id}>
                <strong>{row.name}<small>{row.crop}</small></strong>
                <span>{row.area.toFixed(1)} acres<small>{row.yieldQuantity.toLocaleString()} harvest units</small></span>
                <span>{money(row.revenue)}<small>Costs {money(row.costs)}</small></span>
                <span className={row.profit < 0 ? "negative-value" : "positive-value"}>{money(row.profit)}</span>
              </div>)}
              {!fieldPerformance.length && <Empty text="Add fields and production records to generate analytics."/>}
            </Table>
          </section>}
          <section className="report-section timeline-report">
            <header><div><h3>Field timeline</h3><p>A chronological record from planting through harvest.</p></div></header>
            <div className="timeline-filter"><Field label="Select field"><select value={timelineField} onChange={e=>setTimelineField(e.target.value)}>{fields.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></Field></div>
            <div className="timeline">
              {[
                ...cycles.filter(x=>x.field_id===timelineField).map(x=>({date:x.planting_date,title:`Crop cycle: ${x.crop_name}`,detail:`${x.variety||""} · ${x.status}`})),
                ...activities.filter(x=>x.field_id===timelineField).map(x=>({date:x.scheduled_date,title:`Activity: ${x.activity_type}`,detail:`${x.status} · ${money(activityCostLedger.byActivity.get(x.id)?.posted||0)}${activityCostLedger.byActivity.get(x.id)?.replacedByApprovedJob?" · labour from approved job":""}`})),
                ...irrigation.filter(x=>x.field_id===timelineField).map(x=>({date:x.irrigation_date,title:"Irrigation",detail:`${x.duration_hours||0} hr · ${x.pressure_bar||0} bar · ${x.system_type}`})),
                ...sprays.filter(x=>x.field_id===timelineField).map(x=>({date:x.spray_date,title:`Spray: ${x.product_name}`,detail:`PHI ${x.phi_days||0} days · ${x.target_problem||""}`})),
                ...harvests.filter(x=>x.field_id===timelineField).map(x=>({date:x.harvest_date,title:`Harvest: ${x.quantity||0} ${x.unit}`,detail:`Grade ${x.grade} · ${money(Number(x.quantity||0)*Number(x.price_per_unit||0))}`}))
              ].sort((a,b)=>String(b.date).localeCompare(String(a.date))).map((x,i)=><article className="timeline-item" key={`${x.date}-${i}`}><span>{x.date||"—"}</span><div><strong>{x.title}</strong><p>{x.detail}</p></div></article>)}
              {!timelineField&&<Empty text="Add a field to start a timeline."/>}
            </div>
          </section>
        </SimplePage>}

        {page === "profile" && <>
          <section className="hero profile-hero">
            <div><span className="eyebrow">ACCOUNT & FARM PROFILE</span><h2>Administrator details</h2><p>Review the signed-in account and keep the Administrator name and farm name current.</p></div>
            <span className="security-note"><ShieldCheck size={18}/>{ROLE_LABELS[role] || role}</span>
          </section>
          <section className="profile-layout">
            <section className="card profile-details-card">
              <header className="profile-card-header">
                <div className="profile-avatar">{(profile?.full_name || session.user.email || "A").slice(0,1).toUpperCase()}</div>
                <div><h3>{profile?.full_name || "Administrator"}</h3><p>{profile?.email || session.user.email}</p></div>
              </header>
              <form className="form profile-form" onSubmit={saveProfile}>
                <Field label="Administrator full name"><input required disabled={!canManageUsers || profileSaving} value={profileForm.full_name} onChange={event=>setProfileForm({...profileForm,full_name:event.target.value})}/></Field>
                <Field label="Sign-in email"><input readOnly value={profile?.email || session.user.email || ""}/></Field>
                <div className="form-grid">
                  <Field label="Access role"><input readOnly value={ROLE_LABELS[role] || role}/></Field>
                  <Field label="Account status"><input readOnly value={capitalize(profile?.status || "active")}/></Field>
                </div>
                <Field label="Farm name"><input required disabled={!canManageUsers || profileSaving} value={profileForm.farm_name} onChange={event=>setProfileForm({...profileForm,farm_name:event.target.value})}/></Field>
                {!canManageUsers && <p className="form-note">Only the Owner / Administrator can change the shared Administrator and farm details.</p>}
                <div className="form-actions"><button className="button primary" disabled={!canManageUsers || profileSaving}>{profileSaving ? "Saving…" : "Save profile"}</button></div>
              </form>
            </section>
            <section className="card profile-security-card">
              <div className="profile-security-icon"><ShieldCheck size={24}/></div>
              <div><span className="eyebrow">ACCOUNT SECURITY</span><h3>Change Administrator password</h3><p>Send a secure password-reset link to the current sign-in email. The link returns directly to Farm Manager.</p></div>
              <button className="button secondary" disabled={profileSaving} onClick={sendProfilePasswordReset}>Send password reset email</button>
              <div className="profile-account-note"><strong>Signed in as</strong><span>{profile?.email || session.user.email}</span></div>
            </section>
          </section>
        </>}

        {page === "users" && canManageUsers && <>
          <section className="hero"><div><h2>Users & permissions</h2><p>Add users, assign roles, suspend access or permanently remove accounts.</p></div><div className="button-row"><span className="security-note"><ShieldCheck size={18}/> Administrator controls</span><button className="button primary" onClick={() => setUserModal(true)}><UserPlus size={17}/> Add user</button></div></section>
          <section className="split-grid access-grid">
            <Card title="Farm users" subtitle="Accounts created by the Administrator">
              <div className="user-list">
                {farmUsers.map(user => <article className="user-card" key={user.id}>
                  <div className="user-avatar">{(user.full_name || user.email || "U").slice(0,1).toUpperCase()}</div>
                  <div className="user-info"><strong>{user.full_name || "Unnamed user"}{user.id === session.user.id ? " (you)" : ""}</strong><span>{user.email}</span></div>
                  <select aria-label={`Role for ${user.full_name || user.email}`} value={user.role} disabled={user.id === session.user.id || userSaving} onChange={e=>updateUser(user.id,{role:e.target.value})}>
                    {Object.entries(ROLE_LABELS).map(([value,label])=><option value={value} key={value}>{label}</option>)}
                  </select>
                  <div className="user-actions">
                    <button className={user.status === "active" ? "small-action danger-action" : "small-action"} disabled={user.id === session.user.id || userSaving} onClick={()=>updateUser(user.id,{status:user.status==="active"?"inactive":"active"})}>{user.status==="active"?"Deactivate":"Activate"}</button>
                    <button className="small-action delete-user-action" disabled={user.id === session.user.id || userSaving} onClick={()=>deleteFarmUser(user)}><Trash2 size={14}/> Delete</button>
                  </div>
                </article>)}
                {!farmUsers.length && <Empty text="No farm users found."/>}
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

      <nav className="mobile-tabbar" aria-label="Quick navigation">
        <button className={page === "dashboard" ? "active" : ""} onClick={() => setPage("dashboard")}><Home size={20}/><span>Home</span></button>
        <button className={page === "planner" ? "active" : ""} onClick={() => setPage("planner")}><BrainCircuit size={20}/><span>Planner</span></button>
        <button className={page === "calendar" ? "active" : ""} onClick={() => setPage("calendar")}><CalendarDays size={20}/><span>Calendar</span></button>
        <button className={page === "attendance" ? "active" : ""} onClick={() => setPage("attendance")}><CalendarCheck2 size={20}/><span>Attendance</span></button>
        <button onClick={() => setMobileNav(true)}><MoreHorizontal size={20}/><span>More</span></button>
      </nav>

      {mobileNav && <div className="sidebar-backdrop" onClick={() => setMobileNav(false)}/>}

      {userModal && <Modal title="Add farm user" onClose={() => !userSaving && setUserModal(false)}>
        <form className="form" onSubmit={createFarmUser}>
          <Field label="Full name"><input required autoFocus value={userForm.full_name} onChange={e=>setUserForm({...userForm,full_name:e.target.value})} placeholder="e.g. Jane Kiptoo"/></Field>
          <Field label="Email address"><input required type="email" value={userForm.email} onChange={e=>setUserForm({...userForm,email:e.target.value})} placeholder="jane@example.com"/></Field>
          <Field label="Temporary password"><input required minLength="8" type="password" value={userForm.password} onChange={e=>setUserForm({...userForm,password:e.target.value})} placeholder="At least 8 characters"/></Field>
          <Field label="Access role"><select value={userForm.role} onChange={e=>setUserForm({...userForm,role:e.target.value})}>{Object.entries(ROLE_LABELS).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></Field>
          <p className="form-note">Give this temporary password to the user privately. They can use “Forgot admin password?” on the sign-in screen to set a new one.</p>
          <div className="form-actions"><button type="button" className="button secondary" disabled={userSaving} onClick={()=>setUserModal(false)}>Cancel</button><button className="button primary" disabled={userSaving}>{userSaving?"Creating…":"Create user"}</button></div>
        </form>
      </Modal>}

      {completionModal && <Modal title={`Complete ${completionOperation.title}`} onClose={() => !saving && setCompletionModal(null)}>
        <form className="form" onSubmit={completeSelectedActivities}>
          <div className="completion-summary">
            <strong>{completionSelectedRows.length} of {completionPendingRows.length} pending fields selected</strong>
            <span>Only checked fields will be completed. Unchecked fields stay pending.</span>
          </div>
          <div className="selection-actions">
            <button type="button" onClick={() => setCompletionModal({...completionModal,selectedIds:completionPendingRows.map(row=>row.id)})}>Select all</button>
            <button type="button" onClick={() => setCompletionModal({...completionModal,selectedIds:[]})}>Clear</button>
          </div>
          <div className="completion-fields">
            {completionPendingRows.map(row => <label key={row.id}>
              <input type="checkbox" checked={completionModal.selectedIds.includes(row.id)} onChange={e=>{
                const selected=e.target.checked
                  ? [...new Set([...completionModal.selectedIds,row.id])]
                  : completionModal.selectedIds.filter(id=>id!==row.id);
                setCompletionModal({...completionModal,selectedIds:selected});
              }}/>
              <span><strong>{fieldName(row.field_id)}</strong><small>{Number(fields.find(field=>field.id===row.field_id)?.area_acres||0).toFixed(2)} acres · {row.quantity||0} {row.unit||""}</small></span>
            </label>)}
          </div>
          {completionInventoryItem && <p className="stock-deduction-note"><Warehouse size={17}/><span><strong>{completionQuantity.toFixed(2)} {completionInventoryItem.unit}</strong> will be deducted once from {completionInventoryItem.item_name}.</span></p>}
          {completionOperation.activity_type === "spraying" && <p className="form-note">Each completed field will also receive its own spray-history record with the allocated quantity, cost, PHI and REI.</p>}
          <div className="form-actions"><button type="button" className="button secondary" disabled={saving} onClick={()=>setCompletionModal(null)}>Cancel</button><button className="button primary" disabled={saving||!completionSelectedRows.length}>{saving?"Completing…":`Complete ${completionSelectedRows.length} field${completionSelectedRows.length===1?"":"s"}`}</button></div>
        </form>
      </Modal>}

      {assignmentResultModal && <Modal title={`Record results · ${assignmentResultModal.assignment.title}`} onClose={() => !saving && setAssignmentResultModal(null)}>
        <form className="form" onSubmit={saveAssignmentResults}>
          <div className="completion-summary"><strong>{formatLongDate(assignmentResultModal.assignment.work_date)} · {assignmentFieldLabel(assignmentResultModal.assignment.id)}</strong><span>Enter actual results for each employee. Saving marks the job completed and sends it for approval.</span></div>
          <div className="result-worker-list">
            {assignmentResultModal.rows.map((row, index) => {
              const worker = workers.find(item => item.id === row.worker_id);
              const attendanceStatus = attendance.find(item => item.worker_id === row.worker_id && item.attendance_date === assignmentResultModal.assignment.work_date)?.status || "unmarked";
              const earning = assignmentEarningForWorker(worker, assignmentResultModal.assignment, row);
              return <article className="result-worker" key={row.worker_id}>
                <header><div className="worker-avatar">{worker?.full_name?.slice(0,1).toUpperCase() || "?"}</div><div><strong>{worker?.full_name || "Unknown employee"}</strong><span>{canSeeFinancials ? employeeWageBasis(worker || {}) : (worker?.role || "Worker")}</span></div><span className={`approval-pill ${attendanceStatus === "present" ? "approved" : attendanceStatus === "absent" ? "rejected" : "pending"}`}>{attendanceStatus}</span></header>
                <div className="form-grid three"><Field label="Regular hours"><input type="number" min="0" step="0.25" value={row.regular_hours} onChange={event=>{const rows=[...assignmentResultModal.rows];rows[index]={...row,regular_hours:event.target.value};setAssignmentResultModal({...assignmentResultModal,rows})}}/></Field><Field label="Overtime hours"><input type="number" min="0" step="0.25" value={row.overtime_hours} onChange={event=>{const rows=[...assignmentResultModal.rows];rows[index]={...row,overtime_hours:event.target.value};setAssignmentResultModal({...assignmentResultModal,rows})}}/></Field><Field label={assignmentResultModal.assignment.unit_name ? `Completed ${assignmentResultModal.assignment.unit_name}` : "Completed units"}><input type="number" min="0" step="0.01" value={row.completed_units} onChange={event=>{const rows=[...assignmentResultModal.rows];rows[index]={...row,completed_units:event.target.value};setAssignmentResultModal({...assignmentResultModal,rows})}}/></Field></div>
                {canSeeFinancials && <div className="result-earning"><span>Amount earned when approved</span><strong>{money(earning.total)}</strong><small>{(worker?.wage_type || "daily") === "piece" ? `${row.completed_units || 0} ${worker?.piece_unit || "units"} × ${money(worker?.piece_rate || 0)}` : `${row.regular_hours || 0} regular hr + ${row.overtime_hours || 0} overtime hr`}</small></div>}
                <Field label="Employee result note"><input value={row.notes} onChange={event=>{const rows=[...assignmentResultModal.rows];rows[index]={...row,notes:event.target.value};setAssignmentResultModal({...assignmentResultModal,rows})}}/></Field>
              </article>;
            })}
          </div>
          <p className="form-note">Approved hours or units become the employee's payroll earning and the field's labour expense. Attendance is an audit cross-check and does not duplicate or erase approved work.</p>
          <div className="form-actions"><button type="button" className="button secondary" disabled={saving} onClick={()=>setAssignmentResultModal(null)}>Cancel</button><button className="button primary" disabled={saving}>{saving ? "Saving…" : "Save & submit for approval"}</button></div>
        </form>
      </Modal>}

      {payslipItem && <div className="overlay payslip-overlay" onMouseDown={() => setPayslipItem(null)}><section className="modal payslip-modal" onMouseDown={event=>event.stopPropagation()}>
        <header className="payslip-toolbar"><div><span className="eyebrow">EMPLOYEE PAYSLIP</span><h2>{formatAttendanceMonth(payrollMonth)}</h2></div><div><button className="button secondary" onClick={() => window.print()}><FileText size={16}/> Print / Save PDF</button><button className="icon-button" onClick={() => setPayslipItem(null)}><X size={19}/></button></div></header>
        <div className="payslip-brand"><div className="brand-mark"><Sprout size={24}/></div><div><strong>{farm?.name || "Farm Manager"}</strong><span>Farm Manager V8.6 Approved-work Payroll</span></div><b className={`payroll-period-status ${currentPayrollPeriod?.status || "draft"}`}>{currentPayrollPeriod?.status || "draft"}</b></div>
        <section className="payslip-employee"><div><span>Employee</span><strong>{payslipItem.worker.full_name}</strong><small>{payslipItem.worker.role || "Worker"}</small></div><div><span>Employee number</span><strong>{payslipItem.worker.employee_number || "—"}</strong><small>{capitalize(payslipItem.worker.employment_type || "casual")}</small></div><div><span>Pay basis</span><strong>{capitalize(payslipItem.worker.wage_type || "daily")}</strong><small>{employeeWageBasis(payslipItem.worker)}</small></div></section>
        <section className="payslip-lines">
          <div><span>Attendance</span><b>{payslipItem.presentDays} present · {payslipItem.absentDays} absent</b></div>
          <div><span>Approved assignment hours</span><b>{payslipItem.regularHours.toFixed(1)} regular · {payslipItem.overtimeHours.toFixed(1)} overtime</b></div>
          <div><span>Regular earnings</span><b>{money(payslipItem.regularPay)}</b></div>
          <div><span>Overtime earnings</span><b>{money(payslipItem.overtimePay)}</b></div>
          <div><span>Bonuses</span><b>{money(payslipItem.bonuses)}</b></div>
          <div className="payslip-gross"><span>Gross pay</span><b>{money(payslipItem.grossPay)}</b></div>
          <div><span>Salary advances</span><b>- {money(payslipItem.advances)}</b></div>
          <div><span>Other deductions</span><b>- {money(payslipItem.deductions)}</b></div>
          <div className="payslip-net"><span>Net pay</span><b>{money(payslipItem.netPay)}</b></div>
          <div><span>Payments received</span><b>{money(payslipItem.paid)}</b></div>
          <div className="payslip-balance"><span>Outstanding balance</span><b>{money(payslipItem.balance)}</b></div>
        </section>
        <section className="payslip-payments"><h3>Payment history</h3>{payslipItem.payments.map(payment=><div key={payment.id}><span>{formatLongDate(payment.payment_date)} · {payment.method}{payment.reference ? ` · ${payment.reference}` : ""}</span><strong>{money(payment.amount)}</strong></div>)}{!payslipItem.payments.length&&<p>No payment recorded yet.</p>}</section>
        <footer className="payslip-footer"><span>Calculation: {payslipItem.calculationNotes}</span><span>Generated {new Date().toLocaleString("en-KE")}</span></footer>
      </section></div>}

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
            <Field label="Status"><select value={canonicalFieldStatus(form.status)} onChange={e=>setForm({...form,status:e.target.value})}><option value="active">Active</option><option value="growing">Growing</option><option value="fallow">Fallow</option></select></Field>
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
              <Field label="Activity type"><select value={form.activity_type||"irrigation"} onChange={e=>setForm({...form,activity_type:e.target.value,operation_name:e.target.value==="spraying"?"Boom spray":capitalize(e.target.value)})}>
                {["land preparation","planting","transplanting","irrigation","fertilizer","spraying","weeding","scouting","harvesting","other"].map(x=><option key={x} value={x}>{x}</option>)}
              </select></Field>
              <Field label="Operation name"><input required value={form.operation_name||""} placeholder="e.g. Boom spray" onChange={e=>setForm({...form,operation_name:e.target.value})}/></Field>
            </div>
            <FieldSelection
              fields={fields}
              selectedIds={form.field_ids || (form.field_id ? [form.field_id] : [])}
              locked={Boolean(editingId)}
              onChange={fieldIds => setForm({
                ...form,
                field_ids: fieldIds,
                field_id: fieldIds[0] || "",
                crop_cycle_id: fieldIds.length === 1 ? activeCycleIdForField(fieldIds[0]) || "" : ""
              })}
            />
            {editingId && <Field label="Crop cycle"><select value={form.crop_cycle_id||""} onChange={e=>setForm({...form,crop_cycle_id:e.target.value})}><option value="">No crop cycle</option>{cycles.filter(c=>c.field_id===form.field_id).map(c=><option key={c.id} value={c.id}>{c.crop_name}{c.variety ? " · "+c.variety : ""}</option>)}</select></Field>}
            {!editingId && <p className="form-note">The active crop cycle is linked automatically for each selected field.</p>}
            <div className="form-grid">
              <Field label="Worker"><select value={form.worker_id||""} onChange={e=>setForm({...form,worker_id:e.target.value})}><option value="">Unassigned</option>{workers.map(w=><option key={w.id} value={w.id}>{w.full_name}</option>)}</select></Field>
              <Field label="Scheduled date"><input required type="date" value={form.scheduled_date||""} onChange={e=>setForm({...form,scheduled_date:e.target.value})}/></Field>
            </div>
            <div className="form-grid">
              <Field label="Status"><select value={form.status||"planned"} onChange={e=>setForm({...form,status:e.target.value})}><option value="planned">Planned</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></Field>
              {canWriteModule("inventory") && <Field label="Inventory item (optional)"><select value={form.inventory_item_id||""} onChange={e=>{
                const item=inventory.find(row=>row.id===e.target.value);
                setForm({...form,inventory_item_id:e.target.value,input_name:item?.item_name||form.input_name,unit:item?.unit||form.unit,input_cost:item&&form.quantity?String(roundNumber(Number(form.quantity)*Number(item.unit_cost||0),2)):form.input_cost});
              }}><option value="">No stock deduction</option>{inventory.map(item=><option key={item.id} value={item.id}>{item.item_name} · {item.quantity_on_hand||0} {item.unit}</option>)}</select></Field>}
            </div>
            <div className="form-grid three">
              <Field label={form.activity_type==="spraying"?"Product":"Input used"}><input required={form.activity_type==="spraying"} value={form.input_name||""} placeholder={form.activity_type==="spraying"?"Pesticide / foliar product":"NPK 17:17:17"} onChange={e=>setForm({...form,input_name:e.target.value,inventory_item_id:""})}/></Field>
              <Field label="Total quantity"><input type="number" min="0" step="0.01" value={form.quantity||""} onChange={e=>{
                const item=inventory.find(row=>row.id===form.inventory_item_id);
                setForm({...form,quantity:e.target.value,input_cost:item?String(roundNumber(Number(e.target.value||0)*Number(item.unit_cost||0),2)):form.input_cost});
              }}/></Field>
              <Field label="Unit"><input value={form.unit||""} placeholder="kg / litres" onChange={e=>setForm({...form,unit:e.target.value})}/></Field>
            </div>
            {form.activity_type === "spraying" && <>
              <div className="form-grid">
                <Field label="Active ingredient"><input value={form.active_ingredient||""} onChange={e=>setForm({...form,active_ingredient:e.target.value})}/></Field>
                <Field label="Target pest / disease"><input value={form.target_problem||""} onChange={e=>setForm({...form,target_problem:e.target.value})}/></Field>
              </div>
              <div className="form-grid">
                <Field label="Dose"><input value={form.dose||""} placeholder="e.g. 2 ml/L" onChange={e=>setForm({...form,dose:e.target.value})}/></Field>
                <Field label="Weather"><input value={form.weather||""} placeholder="Calm, dry, cloudy" onChange={e=>setForm({...form,weather:e.target.value})}/></Field>
              </div>
              <div className="form-grid three">
                <Field label="Equipment"><select value={form.equipment_id||""} onChange={e=>setForm({...form,equipment_id:e.target.value})}><option value="">Not selected</option>{equipment.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
                <Field label="PHI days"><input type="number" min="0" value={form.phi_days||""} onChange={e=>setForm({...form,phi_days:e.target.value})}/></Field>
                <Field label="REI hours"><input type="number" min="0" value={form.rei_hours||""} onChange={e=>setForm({...form,rei_hours:e.target.value})}/></Field>
              </div>
            </>}
            <div className="form-grid">
              <Field label="Labour estimate before job approval"><input type="number" min="0" step="0.01" value={form.labour_cost||""} onChange={e=>setForm({...form,labour_cost:e.target.value})}/></Field>
              <Field label="Total input cost"><input type="number" min="0" step="0.01" value={form.input_cost||""} onChange={e=>setForm({...form,input_cost:e.target.value})}/></Field>
            </div>
            <p className="form-note">If employees are assigned and their work is approved for this field and date, their calculated earnings replace this labour estimate in Finance. Input costs remain unchanged.</p>
            {!editingId && <AllocationPreview fields={fields.filter(field=>(form.field_ids||[]).includes(field.id))} quantity={form.quantity} unit={form.unit} cost={Number(form.labour_cost||0)+Number(form.input_cost||0)}/>}
            <Field label="Notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
          </>}

          {modal === "worker" && <>
            <div className="form-grid">
              <Field label="Full name"><input required value={form.full_name||""} onChange={e=>setForm({...form,full_name:e.target.value})}/></Field>
              <Field label="Employee number"><input value={form.employee_number||""} placeholder="EMP-001" onChange={e=>setForm({...form,employee_number:e.target.value})}/></Field>
            </div>
            <div className="form-grid">
              <Field label="Phone"><input value={form.phone||""} onChange={e=>setForm({...form,phone:e.target.value})}/></Field>
              <Field label="Email (optional)"><input type="email" value={form.email||""} onChange={e=>setForm({...form,email:e.target.value})}/></Field>
            </div>
            <div className="form-grid">
              <Field label="Job title / role"><input value={form.role||""} placeholder="Sprayer operator" onChange={e=>setForm({...form,role:e.target.value})}/></Field>
              <Field label="National ID"><input value={form.id_number||""} onChange={e=>setForm({...form,id_number:e.target.value})}/></Field>
            </div>
            <div className="form-grid three">
              <Field label="Hire date"><input type="date" value={form.hire_date||""} onChange={e=>setForm({...form,hire_date:e.target.value})}/></Field>
              <Field label="Employment"><select value={form.employment_type||"casual"} onChange={e=>setForm({...form,employment_type:e.target.value})}>{["permanent","casual","contract","seasonal"].map(value=><option value={value} key={value}>{capitalize(value)}</option>)}</select></Field>
              <Field label="Status"><select value={form.status||"active"} onChange={e=>setForm({...form,status:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></select></Field>
            </div>
            {canSeeFinancials && <>
              <Field label="Wage type"><select value={form.wage_type||"daily"} onChange={e=>setForm({...form,wage_type:e.target.value})}>{["daily","hourly","monthly","piece"].map(value=><option value={value} key={value}>{capitalize(value)}</option>)}</select></Field>
              {form.wage_type === "daily" && <Field label="Daily wage (KES)"><input required type="number" min="0" step="0.01" value={form.daily_rate||""} onChange={e=>setForm({...form,daily_rate:e.target.value})}/></Field>}
              {form.wage_type === "hourly" && <Field label="Hourly wage (KES)"><input required type="number" min="0" step="0.01" value={form.hourly_rate||""} onChange={e=>setForm({...form,hourly_rate:e.target.value})}/></Field>}
              {form.wage_type === "monthly" && <Field label="Monthly salary (KES)"><input required type="number" min="0" step="0.01" value={form.monthly_salary||""} onChange={e=>setForm({...form,monthly_salary:e.target.value})}/></Field>}
              {form.wage_type === "piece" && <div className="form-grid"><Field label="Piece rate (KES)"><input required type="number" min="0" step="0.01" value={form.piece_rate||""} onChange={e=>setForm({...form,piece_rate:e.target.value})}/></Field><Field label="Piece unit"><input required value={form.piece_unit||""} placeholder="crates / beds / rows" onChange={e=>setForm({...form,piece_unit:e.target.value})}/></Field></div>}
            </>}
            <Field label="Normal work hours per day"><input type="number" min="1" max="24" step="0.5" value={form.normal_hours_per_day||"8"} onChange={e=>setForm({...form,normal_hours_per_day:e.target.value})}/></Field>
            {canSeeFinancials && <div className="form-grid"><Field label="Payment method"><select value={form.payment_method||"M-Pesa"} onChange={e=>setForm({...form,payment_method:e.target.value})}>{["M-Pesa","Cash","Bank transfer","Cheque","Other"].map(value=><option key={value}>{value}</option>)}</select></Field><Field label="Payment account / phone"><input value={form.payment_account||""} onChange={e=>setForm({...form,payment_account:e.target.value})}/></Field></div>}
            <div className="form-grid"><Field label="Emergency contact"><input value={form.emergency_contact_name||""} onChange={e=>setForm({...form,emergency_contact_name:e.target.value})}/></Field><Field label="Emergency phone"><input value={form.emergency_contact_phone||""} onChange={e=>setForm({...form,emergency_contact_phone:e.target.value})}/></Field></div>
            <Field label="Employment notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
          </>}

          {modal === "crew" && <>
            <div className="form-grid"><Field label="Crew name"><input required value={form.name||""} placeholder="Boom spray crew" onChange={e=>setForm({...form,name:e.target.value})}/></Field><Field label="Status"><select value={form.status||"active"} onChange={e=>setForm({...form,status:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></select></Field></div>
            <Field label="Crew supervisor"><select value={form.supervisor_id||""} onChange={e=>setForm({...form,supervisor_id:e.target.value})}><option value="">Not assigned</option>{activeWorkers.map(worker=><option value={worker.id} key={worker.id}>{worker.full_name}</option>)}</select></Field>
            <WorkerSelection workers={activeWorkers} selectedIds={form.worker_ids||[]} showPay={canSeeFinancials} onChange={workerIds=>setForm({...form,worker_ids:workerIds})}/>
            <Field label="Crew notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
          </>}

          {modal === "assignment" && <>
            <Field label="Job title"><input required value={form.title||""} placeholder="Harvest cabbage Block A" onChange={e=>setForm({...form,title:e.target.value})}/></Field>
            <div className="form-grid three"><Field label="Work date"><input required type="date" value={form.work_date||""} onChange={e=>setForm({...form,work_date:e.target.value})}/></Field><Field label="Due date"><input type="date" value={form.due_date||""} onChange={e=>setForm({...form,due_date:e.target.value})}/></Field><Field label="Status"><select value={form.status||"planned"} onChange={e=>setForm({...form,status:e.target.value})}><option value="planned">Planned</option><option value="in_progress">In progress</option><option value="cancelled">Cancelled</option></select></Field></div>
            <Field label="Assign a crew (optional)"><select value={form.crew_id||""} onChange={e=>{
              const selectedCrewId=e.target.value;
              const memberIds=selectedCrewId?crewMembers.filter(member=>member.crew_id===selectedCrewId&&member.status==="active").map(member=>member.worker_id):form.worker_ids;
              setForm({...form,crew_id:selectedCrewId,worker_ids:memberIds});
            }}><option value="">Select employees individually</option>{crews.filter(crew=>crew.status==="active"||crew.id===form.crew_id).map(crew=><option value={crew.id} key={crew.id}>{crew.name}</option>)}</select></Field>
            <FieldSelection fields={fields} selectedIds={form.field_ids||[]} onChange={fieldIds=>setForm({...form,field_ids:fieldIds})}/>
            <WorkerSelection workers={activeWorkers} selectedIds={form.worker_ids||[]} showPay={canSeeFinancials} onChange={workerIds=>setForm({...form,worker_ids:workerIds,crew_id:""})}/>
            <div className="form-grid three"><Field label="Output unit"><input value={form.unit_name||""} placeholder="crates / beds / rows" onChange={e=>setForm({...form,unit_name:e.target.value})}/></Field><Field label="Planned team units"><input type="number" min="0" step="0.01" value={form.planned_units||""} onChange={e=>setForm({...form,planned_units:e.target.value})}/></Field><Field label="Overtime multiplier"><input type="number" min="1" step="0.1" value={form.overtime_multiplier||"1.5"} onChange={e=>setForm({...form,overtime_multiplier:e.target.value})}/></Field></div>
            <div className="form-grid three"><Field label="Initial regular hours / employee"><input type="number" min="0" step="0.25" value={form.regular_hours||""} onChange={e=>setForm({...form,regular_hours:e.target.value})}/></Field><Field label="Initial overtime / employee"><input type="number" min="0" step="0.25" value={form.overtime_hours||""} onChange={e=>setForm({...form,overtime_hours:e.target.value})}/></Field><Field label="Initial units / employee"><input type="number" min="0" step="0.01" value={form.completed_units||""} onChange={e=>setForm({...form,completed_units:e.target.value})}/></Field></div>
            <p className="form-note">After the job, use Record results to enter each employee's actual hours, overtime and units before supervisor approval.</p>
            <Field label="Job instructions"><textarea value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})}/></Field>
          </>}

          {modal === "adjustment" && <>
            <div className="form-grid"><Field label="Employee"><select required value={form.worker_id||""} onChange={e=>setForm({...form,worker_id:e.target.value})}>{workers.map(worker=><option value={worker.id} key={worker.id}>{worker.full_name}</option>)}</select></Field><Field label="Payroll month"><input required type="month" value={form.period_month||payrollMonth} onChange={e=>setForm({...form,period_month:e.target.value})}/></Field></div>
            <div className="form-grid"><Field label="Type"><select value={form.adjustment_type||"bonus"} onChange={e=>setForm({...form,adjustment_type:e.target.value})}><option value="bonus">Bonus</option><option value="advance">Salary advance</option><option value="deduction">Deduction</option></select></Field><Field label="Amount (KES)"><input required type="number" min="0.01" step="0.01" value={form.amount||""} onChange={e=>setForm({...form,amount:e.target.value})}/></Field></div>
            <Field label="Date"><input required type="date" value={form.adjustment_date||today} onChange={e=>setForm({...form,adjustment_date:e.target.value})}/></Field>
            <Field label="Reason / description"><textarea required value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})}/></Field>
            {currentPayrollPeriod?.status !== "draft" && <p className="form-note">Reopen and refresh an already approved payroll period before this adjustment can change its generated payslips.</p>}
          </>}

          {modal === "payment" && <>
            <Field label="Employee"><select required value={form.worker_id||""} onChange={e=>{
              const row=payrollRows.find(item=>item.worker.id===e.target.value);
              setForm({...form,worker_id:e.target.value,amount:row?.balance?String(row.balance):"",method:row?.worker.payment_method||form.method});
            }}>{payrollRows.filter(row=>row.balance>0).map(row=><option value={row.worker.id} key={row.worker.id}>{row.worker.full_name} · balance {money(row.balance)}</option>)}</select></Field>
            <div className="form-grid"><Field label="Payment date"><input required type="date" value={form.payment_date||today} onChange={e=>setForm({...form,payment_date:e.target.value})}/></Field><Field label="Amount (KES)"><input required type="number" min="0.01" step="0.01" value={form.amount||""} onChange={e=>setForm({...form,amount:e.target.value})}/></Field></div>
            <div className="form-grid"><Field label="Method"><select value={form.method||"M-Pesa"} onChange={e=>setForm({...form,method:e.target.value})}>{["M-Pesa","Cash","Bank transfer","Cheque","Other"].map(value=><option key={value}>{value}</option>)}</select></Field><Field label="Reference"><input value={form.reference||""} placeholder="M-Pesa code / voucher" onChange={e=>setForm({...form,reference:e.target.value})}/></Field></div>
            <Field label="Payment notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
            <p className="form-note">Enter the full balance or a smaller amount for a partial payment. Farm Manager keeps the remaining balance automatically.</p>
          </>}


          {modal === "irrigation" && <>
            <div className="form-grid"><Field label="Field"><select required value={form.field_id||""} onChange={e=>setForm({...form,field_id:e.target.value,crop_cycle_id:cycles.find(c=>c.field_id===e.target.value)?.id||""})}>{fields.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></Field><Field label="Crop cycle"><select value={form.crop_cycle_id||""} onChange={e=>setForm({...form,crop_cycle_id:e.target.value})}><option value="">No crop cycle</option>{cycles.filter(c=>c.field_id===form.field_id).map(c=><option key={c.id} value={c.id}>{cycleName(c.id)}</option>)}</select></Field></div>
            <div className="form-grid"><Field label="Date"><input required type="date" value={form.irrigation_date||""} onChange={e=>setForm({...form,irrigation_date:e.target.value})}/></Field><Field label="Water source"><input value={form.water_source||""} onChange={e=>setForm({...form,water_source:e.target.value})}/></Field></div>
            <div className="form-grid"><Field label="System"><select value={form.system_type||""} onChange={e=>setForm({...form,system_type:e.target.value})}>{["Travelling reel","Rain hose","Drip","Sprinkler","Manual"].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Equipment"><select value={form.equipment_id||""} onChange={e=>setForm({...form,equipment_id:e.target.value})}><option value="">Not selected</option>{equipment.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field></div>
            <div className="form-grid three"><Field label="Duration hours"><input type="number" step=".1" value={form.duration_hours||""} onChange={e=>setForm({...form,duration_hours:e.target.value})}/></Field><Field label="Pressure bar"><input type="number" step=".1" value={form.pressure_bar||""} onChange={e=>setForm({...form,pressure_bar:e.target.value})}/></Field><Field label="Water m³"><input type="number" step=".1" value={form.water_volume_m3||""} onChange={e=>setForm({...form,water_volume_m3:e.target.value})}/></Field></div>
            <div className="form-grid"><Field label="Fuel litres"><input type="number" step=".1" value={form.fuel_litres||""} onChange={e=>setForm({...form,fuel_litres:e.target.value})}/></Field><Field label="Cost (KES)"><input type="number" value={form.cost||""} onChange={e=>setForm({...form,cost:e.target.value})}/></Field></div><Field label="Notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
          </>}
          {modal === "spray" && <>
            <div className="form-grid"><Field label="Operation name"><input required value={form.operation_name||""} placeholder="Boom spray" onChange={e=>setForm({...form,operation_name:e.target.value})}/></Field><Field label="Date"><input required type="date" value={form.spray_date||""} onChange={e=>setForm({...form,spray_date:e.target.value})}/></Field></div>
            <FieldSelection
              fields={fields}
              selectedIds={form.field_ids || (form.field_id ? [form.field_id] : [])}
              locked={Boolean(editingId)}
              onChange={fieldIds => setForm({...form,field_ids:fieldIds,field_id:fieldIds[0]||"",crop_cycle_id:fieldIds.length===1?activeCycleIdForField(fieldIds[0])||"":""})}
            />
            {editingId && <p className="form-note">Editing this field history does not reverse or repeat an earlier stock deduction.</p>}
            {!editingId && <p className="form-note">One traceable spray record will be created for every selected field.</p>}
            {canWriteModule("inventory") && !editingId && <Field label="Inventory chemical (optional)"><select value={form.inventory_item_id||""} onChange={e=>{
              const item=inventory.find(row=>row.id===e.target.value);
              setForm({...form,inventory_item_id:e.target.value,product_name:item?.item_name||form.product_name,unit:item?.unit||form.unit,cost:item&&form.quantity_used?String(roundNumber(Number(form.quantity_used)*Number(item.unit_cost||0),2)):form.cost});
            }}><option value="">No stock deduction</option>{inventory.filter(item=>["Chemical","Fertilizer"].includes(item.category)).map(item=><option key={item.id} value={item.id}>{item.item_name} · {item.quantity_on_hand||0} {item.unit}</option>)}</select></Field>}
            <div className="form-grid"><Field label="Product"><input required value={form.product_name||""} onChange={e=>setForm({...form,product_name:e.target.value,inventory_item_id:""})}/></Field><Field label="Active ingredient"><input value={form.active_ingredient||""} onChange={e=>setForm({...form,active_ingredient:e.target.value})}/></Field></div>
            <div className="form-grid"><Field label="Target pest/disease"><input value={form.target_problem||""} onChange={e=>setForm({...form,target_problem:e.target.value})}/></Field><Field label="Dose"><input value={form.dose||""} placeholder="e.g. 2 ml/L" onChange={e=>setForm({...form,dose:e.target.value})}/></Field></div>
            <div className="form-grid three"><Field label="Total quantity used"><input type="number" min="0" step=".01" value={form.quantity_used||""} onChange={e=>{
              const item=inventory.find(row=>row.id===form.inventory_item_id);
              setForm({...form,quantity_used:e.target.value,cost:item?String(roundNumber(Number(e.target.value||0)*Number(item.unit_cost||0),2)):form.cost});
            }}/></Field><Field label="Quantity unit"><input value={form.unit||""} placeholder="L / kg" onChange={e=>setForm({...form,unit:e.target.value})}/></Field><Field label="Total cost (KES)"><input type="number" min="0" step=".01" value={form.cost||""} onChange={e=>setForm({...form,cost:e.target.value})}/></Field></div>
            <div className="form-grid three"><Field label="PHI days"><input type="number" min="0" value={form.phi_days||""} onChange={e=>setForm({...form,phi_days:e.target.value})}/></Field><Field label="REI hours"><input type="number" min="0" value={form.rei_hours||""} onChange={e=>setForm({...form,rei_hours:e.target.value})}/></Field><Field label="Equipment"><select value={form.equipment_id||""} onChange={e=>setForm({...form,equipment_id:e.target.value})}><option value="">Not selected</option>{equipment.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></Field></div>
            <div className="form-grid"><Field label="Applicator"><select value={form.worker_id||""} onChange={e=>setForm({...form,worker_id:e.target.value})}><option value="">Unassigned</option>{workers.map(w=><option key={w.id} value={w.id}>{w.full_name}</option>)}</select></Field><Field label="Weather"><input value={form.weather||""} placeholder="Calm, dry, cloudy" onChange={e=>setForm({...form,weather:e.target.value})}/></Field></div>
            {!editingId && <AllocationPreview fields={fields.filter(field=>(form.field_ids||[]).includes(field.id))} quantity={form.quantity_used} unit={form.unit} cost={form.cost}/>}
            <Field label="Notes"><textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
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

function generateOperationId() {
  if (globalThis.crypto?.randomUUID) return `op-${globalThis.crypto.randomUUID()}`;
  return `op-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
}

function roundNumber(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
}

function packRecordNotes(userNotes, meta) {
  const clean = String(userNotes || "").trim();
  if (!meta) return clean || null;
  const marker = `[[FM_RECORD:${encodeURIComponent(JSON.stringify(meta))}]]`;
  return clean ? `${clean}\n${marker}` : marker;
}

function unpackRecordNotes(notes) {
  const text = String(notes || "");
  const match = text.match(/\n?\[\[FM_RECORD:([^\]]+)\]\]\s*$/);
  if (!match) return { userNotes: text, meta: null };
  try {
    return {
      userNotes: text.slice(0, match.index).trim(),
      meta: JSON.parse(decodeURIComponent(match[1]))
    };
  } catch {
    return { userNotes: text, meta: null };
  }
}

function packInventoryNotes(userNotes, ledger) {
  const clean = String(userNotes || "").trim();
  const entries = Array.isArray(ledger) ? ledger : [];
  if (!entries.length) return clean || null;
  const marker = `[[FM_STOCK:${encodeURIComponent(JSON.stringify(entries))}]]`;
  return clean ? `${clean}\n${marker}` : marker;
}

function unpackInventoryNotes(notes) {
  const text = String(notes || "");
  const match = text.match(/\n?\[\[FM_STOCK:([^\]]+)\]\]\s*$/);
  if (!match) return { userNotes: text, ledger: [] };
  try {
    const ledger = JSON.parse(decodeURIComponent(match[1]));
    return {
      userNotes: text.slice(0, match.index).trim(),
      ledger: Array.isArray(ledger) ? ledger : []
    };
  } catch {
    return { userNotes: text, ledger: [] };
  }
}

function allocateByFieldArea(total, fieldRows, decimals = 2) {
  const fields = fieldRows || [];
  if (!fields.length) return {};
  const factor = 10 ** decimals;
  const signedUnits = Math.round(Number(total || 0) * factor);
  const sign = signedUnits < 0 ? -1 : 1;
  const totalUnits = Math.abs(signedUnits);
  const areas = fields.map(field => Math.max(0, Number(field.area_acres || 0)));
  const totalArea = areas.reduce((sum, area) => sum + area, 0);
  const rawShares = fields.map((_field,index) => totalUnits * (totalArea > 0 ? areas[index] / totalArea : 1 / fields.length));
  const units = rawShares.map(value => Math.floor(value));
  let remaining = totalUnits - units.reduce((sum,value) => sum + value, 0);
  const remainderOrder = rawShares.map((value,index) => ({ index, remainder: value - units[index] }))
    .sort((a,b) => b.remainder - a.remainder || a.index - b.index);
  for (let index = 0; index < remaining; index += 1) units[remainderOrder[index % remainderOrder.length].index] += 1;
  const result = {};
  fields.forEach((field, index) => {
    result[field.id] = sign * units[index] / factor;
  });
  return result;
}

function buildActivityOperations(activities, fields) {
  const groups = new Map();
  activities.forEach(activity => {
    const meta = unpackRecordNotes(activity.notes).meta;
    const groupId = meta?.kind === "multi-field-operation" && meta.groupId ? meta.groupId : null;
    const key = groupId ? `group:${groupId}` : `activity:${activity.id}`;
    if (!groups.has(key)) groups.set(key, { key, groupId, meta: meta || null, items: [] });
    groups.get(key).items.push(activity);
  });
  return [...groups.values()].map(group => {
    const items = group.items.slice().sort((a,b) => String(a.created_at || a.id).localeCompare(String(b.created_at || b.id)));
    const first = items[0];
    const completedCount = items.filter(item => item.status === "completed").length;
    const cancelledCount = items.filter(item => item.status === "cancelled").length;
    let status = "planned";
    if (completedCount === items.length) status = "completed";
    else if (cancelledCount === items.length) status = "cancelled";
    else if (completedCount > 0) status = "partially completed";
    else if (items.some(item => item.status === "in_progress")) status = "in progress";
    const totalArea = items.reduce((sum,item) => sum + Number(fields.find(field => field.id === item.field_id)?.area_acres || 0), 0);
    return {
      ...group,
      items,
      title: group.meta?.operationName || capitalize(first.activity_type),
      activity_type: first.activity_type,
      scheduled_date: first.scheduled_date,
      worker_id: first.worker_id,
      status,
      completedCount,
      totalArea,
      quantity: items.reduce((sum,item) => sum + Number(item.quantity || 0), 0),
      cost: items.reduce((sum,item) => sum + Number(item.labour_cost || 0) + Number(item.input_cost || 0), 0)
    };
  });
}

function operationFieldLabel(operation, fields) {
  if (operation.items.length === 1) {
    return fields.find(field => field.id === operation.items[0].field_id)?.name || "Unknown field";
  }
  return `${operation.items.length} fields · ${operation.totalArea.toFixed(2)} acres`;
}

function isActivitySprayHistory(record) {
  return unpackRecordNotes(record.notes).meta?.kind === "activity-spray-history";
}

function FieldSelection({ fields, selectedIds, onChange, locked = false }) {
  const selected = new Set(selectedIds || []);
  const totalArea = fields.filter(field => selected.has(field.id)).reduce((sum,field) => sum + Number(field.area_acres || 0), 0);
  function toggle(fieldId, checked) {
    if (locked) return;
    const next = checked ? [...selected, fieldId] : [...selected].filter(id => id !== fieldId);
    onChange(next);
  }
  return <section className="field-selector">
    <header>
      <div><strong>Select fields</strong><span>{selected.size} selected · {totalArea.toFixed(2)} acres</span></div>
      {!locked && <div className="selection-actions"><button type="button" onClick={()=>onChange(fields.map(field=>field.id))}>Select all</button><button type="button" onClick={()=>onChange([])}>Clear</button></div>}
    </header>
    <div className="field-options">
      {fields.map(field => <label key={field.id} className={selected.has(field.id) ? "selected" : ""}>
        <input type="checkbox" disabled={locked} checked={selected.has(field.id)} onChange={event=>toggle(field.id,event.target.checked)}/>
        <span><strong>{field.name}</strong><small>{Number(field.area_acres || 0).toFixed(2)} acres</small></span>
      </label>)}
    </div>
    {locked && <small className="locked-note">The field is locked while editing this saved history record.</small>}
  </section>;
}

function WorkerSelection({ workers, selectedIds, onChange, locked = false, showPay = false }) {
  const selected = new Set(selectedIds || []);
  function toggle(workerId, checked) {
    if (locked) return;
    const next = checked ? [...selected, workerId] : [...selected].filter(id => id !== workerId);
    onChange(next);
  }
  return <section className="field-selector worker-selector">
    <header>
      <div><strong>Select employees</strong><span>{selected.size} selected</span></div>
      {!locked && <div className="selection-actions"><button type="button" onClick={()=>onChange(workers.map(worker=>worker.id))}>Select all</button><button type="button" onClick={()=>onChange([])}>Clear</button></div>}
    </header>
    <div className="field-options worker-options">
      {workers.map(worker => <label key={worker.id} className={selected.has(worker.id) ? "selected" : ""}>
        <input type="checkbox" disabled={locked} checked={selected.has(worker.id)} onChange={event=>toggle(worker.id,event.target.checked)}/>
        <span><strong>{worker.full_name}</strong><small>{worker.role || "Worker"}{showPay ? ` · ${employeeWageBasis(worker)}` : ""}</small></span>
      </label>)}
    </div>
    {!workers.length && <Empty text="Add active employees before creating a crew or job assignment."/>}
  </section>;
}

function employeeWageBasis(worker) {
  const wageType = worker?.wage_type || "daily";
  const format = value => `KES ${Number(value || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;
  if (wageType === "monthly") return `${format(worker?.monthly_salary)} / month`;
  if (wageType === "hourly") return `${format(worker?.hourly_rate)} / hour`;
  if (wageType === "piece") return `${format(worker?.piece_rate)} / ${worker?.piece_unit || "unit"}`;
  return `${format(worker?.daily_rate)} / day`;
}

function workerDailyEquivalent(worker, recordedWorkDays = 26) {
  const wageType = worker?.wage_type || "daily";
  if (wageType === "monthly") return Number(worker?.monthly_salary || 0) / Math.max(1, Number(recordedWorkDays || 26));
  if (wageType === "hourly") return Number(worker?.hourly_rate || 0) * Number(worker?.normal_hours_per_day || 8);
  if (wageType === "piece") return 0;
  return Number(worker?.daily_rate || 0);
}

function attendanceBasePay(worker, presentDays, recordedWorkDays) {
  const wageType = worker?.wage_type || "daily";
  if (wageType === "monthly") {
    return roundNumber(Number(worker?.monthly_salary || 0) * Number(presentDays || 0) / Math.max(1, Number(recordedWorkDays || 0)), 2);
  }
  if (wageType === "daily") return roundNumber(Number(worker?.daily_rate || 0) * Number(presentDays || 0), 2);
  return 0;
}

function emptyAttendanceTotals(recordedDays = 0) {
  return { present: 0, absent: 0, marked: 0, unmarked: Math.max(0, Number(recordedDays || 0)) };
}

function buildAttendanceMonthSummary({ month, workers, attendance }) {
  const rows = attendance.filter(row => String(row.attendance_date || "").startsWith(month));
  const dates = [...new Set(rows.map(row => row.attendance_date).filter(Boolean))].sort();
  const byWorker = new Map();
  workers.forEach(worker => {
    const workerRows = rows.filter(row => row.worker_id === worker.id);
    const present = workerRows.filter(row => row.status === "present").length;
    const absent = workerRows.filter(row => row.status === "absent").length;
    const marked = present + absent;
    byWorker.set(worker.id, {
      present,
      absent,
      marked,
      unmarked: Math.max(0, dates.length - marked)
    });
  });
  return { rows, dates, byWorker };
}

function hourlyEquivalent(worker) {
  const explicitHourly = Number(worker?.hourly_rate || 0);
  const hours = Math.max(1, Number(worker?.normal_hours_per_day || 8));
  const wageType = worker?.wage_type || "daily";
  if (wageType === "hourly") return explicitHourly;
  if (wageType === "monthly") return Number(worker?.monthly_salary || 0) / (26 * hours);
  if (wageType === "daily") return Number(worker?.daily_rate || 0) / hours;
  return explicitHourly;
}

function assignmentEarningForWorker(worker, assignment, workerLink) {
  if (!worker || !workerLink) return { regular: 0, overtime: 0, total: 0, hourlyRate: 0 };
  const wageType = worker.wage_type || "daily";
  const hourlyRate = hourlyEquivalent(worker);
  const regular = wageType === "piece"
    ? Number(workerLink.completed_units || 0) * Number(worker.piece_rate || 0)
    : Number(workerLink.regular_hours || 0) * hourlyRate;
  const overtime = Number(workerLink.overtime_hours || 0) * hourlyRate * Number(assignment.overtime_multiplier || 1.5);
  return {
    regular: roundNumber(regular, 2),
    overtime: roundNumber(overtime, 2),
    total: roundNumber(regular + overtime, 2),
    hourlyRate: roundNumber(hourlyRate, 2)
  };
}

function buildApprovedLabourEntries({ workers, assignments, assignmentWorkers, assignmentFields, fields }) {
  const approved = assignments.filter(assignment => assignment.status === "completed" && assignment.approval_status === "approved");
  return approved.flatMap(assignment => {
    const fieldNames = assignmentFields
      .filter(link => link.assignment_id === assignment.id)
      .map(link => fields.find(field => field.id === link.field_id)?.name || "Unknown field");
    return assignmentWorkers.filter(link => link.assignment_id === assignment.id).map(link => {
      const worker = workers.find(item => item.id === link.worker_id);
      const earning = assignmentEarningForWorker(worker, assignment, link);
      return {
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        workDate: assignment.work_date,
        workerId: link.worker_id,
        workerName: worker?.full_name || "Former employee",
        wageType: worker?.wage_type || "daily",
        fieldNames,
        regularHours: Number(link.regular_hours || 0),
        overtimeHours: Number(link.overtime_hours || 0),
        completedUnits: Number(link.completed_units || 0),
        ...earning
      };
    });
  }).sort((a, b) => String(b.workDate || "").localeCompare(String(a.workDate || "")) || a.workerName.localeCompare(b.workerName));
}

function buildActivityCostLedger({ activities, assignments, assignmentFields }) {
  const coveredFieldDates = new Set();
  assignments
    .filter(assignment => assignment.status === "completed" && assignment.approval_status === "approved")
    .forEach(assignment => assignmentFields
      .filter(link => link.assignment_id === assignment.id)
      .forEach(link => coveredFieldDates.add(`${link.field_id}|${assignment.work_date}`)));
  const byActivity = new Map();
  let inputs = 0;
  let manualLabour = 0;
  let replacedLabour = 0;
  activities.forEach(activity => {
    const inputCost = Number(activity.input_cost || 0);
    const labourCost = Number(activity.labour_cost || 0);
    const dates = [activity.completed_date, activity.scheduled_date].filter(Boolean);
    const replacedByApprovedJob = dates.some(date => coveredFieldDates.has(`${activity.field_id}|${date}`));
    const postedLabour = replacedByApprovedJob ? 0 : labourCost;
    inputs += inputCost;
    manualLabour += postedLabour;
    if (replacedByApprovedJob) replacedLabour += labourCost;
    byActivity.set(activity.id, {
      inputCost,
      manualLabour: postedLabour,
      replacedLabour: replacedByApprovedJob ? labourCost : 0,
      replacedByApprovedJob,
      posted: inputCost + postedLabour
    });
  });
  return {
    byActivity,
    inputs: roundNumber(inputs, 2),
    manualLabour: roundNumber(manualLabour, 2),
    replacedLabour: roundNumber(replacedLabour, 2),
    posted: roundNumber(inputs + manualLabour, 2)
  };
}

function buildWorkforceAllocation({ workers, assignments, assignmentWorkers, assignmentFields, fields, cycles }) {
  const approved = assignments.filter(assignment => assignment.status === "completed" && assignment.approval_status === "approved");
  const groups = new Map();
  approved.forEach(assignment => {
    const workerLinks = assignmentWorkers.filter(link => link.assignment_id === assignment.id);
    let assignmentCost = 0;
    workerLinks.forEach(link => {
      const worker = workers.find(item => item.id === link.worker_id);
      assignmentCost += assignmentEarningForWorker(worker, assignment, link).total;
    });
    const fieldLinks = assignmentFields.filter(link => link.assignment_id === assignment.id);
    if (!fieldLinks.length) return;
    const percentTotal = fieldLinks.reduce((sum, link) => sum + Number(link.allocation_percent || 0), 0);
    fieldLinks.forEach(link => {
      const share = percentTotal > 0 ? Number(link.allocation_percent || 0) / percentTotal : 1 / fieldLinks.length;
      const key = `${link.field_id}|${link.crop_cycle_id || "none"}`;
      if (!groups.has(key)) groups.set(key, {
        fieldId: link.field_id,
        cropCycleId: link.crop_cycle_id || null,
        assignmentIds: new Set(),
        workerIds: new Set(),
        regularHours: 0,
        overtimeHours: 0,
        completedUnits: 0,
        cost: 0
      });
      const group = groups.get(key);
      group.assignmentIds.add(assignment.id);
      workerLinks.forEach(workerLink => group.workerIds.add(workerLink.worker_id));
      group.regularHours += workerLinks.reduce((sum, workerLink) => sum + Number(workerLink.regular_hours || 0), 0) * share;
      group.overtimeHours += workerLinks.reduce((sum, workerLink) => sum + Number(workerLink.overtime_hours || 0), 0) * share;
      group.completedUnits += workerLinks.reduce((sum, workerLink) => sum + Number(workerLink.completed_units || 0), 0) * share;
      group.cost += assignmentCost * share;
    });
  });
  const rows = [...groups.values()].map(group => {
    const field = fields.find(item => item.id === group.fieldId);
    const cycle = cycles.find(item => item.id === group.cropCycleId);
    return {
      fieldId: group.fieldId,
      cropCycleId: group.cropCycleId,
      fieldName: field?.name || "Unknown field",
      cropName: cycle ? `${cycle.crop_name}${cycle.variety ? ` · ${cycle.variety}` : ""}` : "No linked crop cycle",
      assignmentCount: group.assignmentIds.size,
      workerCount: group.workerIds.size,
      regularHours: roundNumber(group.regularHours, 2),
      overtimeHours: roundNumber(group.overtimeHours, 2),
      completedUnits: roundNumber(group.completedUnits, 2),
      cost: roundNumber(group.cost, 2)
    };
  }).sort((a, b) => b.cost - a.cost || a.fieldName.localeCompare(b.fieldName));
  return { rows, total: roundNumber(rows.reduce((sum, row) => sum + row.cost, 0), 2) };
}

function calculatePayrollPreview({ month, workers, attendance, assignments, assignmentWorkers, adjustments }) {
  const attendanceSummary = buildAttendanceMonthSummary({ month, workers, attendance });
  const approvedAssignments = assignments.filter(assignment =>
    assignment.status === "completed" && assignment.approval_status === "approved" && String(assignment.work_date || "").startsWith(month)
  );
  const monthAdjustments = adjustments.filter(item => item.period_month === `${month}-01` && item.status === "approved");
  return workers.map(worker => {
    const workerAttendance = attendanceSummary.byWorker.get(worker.id) || emptyAttendanceTotals(attendanceSummary.dates.length);
    const presentDays = workerAttendance.present;
    const absentDays = workerAttendance.absent;
    const workerAssignmentLinks = assignmentWorkers.filter(link => link.worker_id === worker.id && approvedAssignments.some(assignment => assignment.id === link.assignment_id));
    let regularPay = 0;
    let overtimePay = 0;
    workerAssignmentLinks.forEach(link => {
      const assignment = approvedAssignments.find(item => item.id === link.assignment_id);
      const earning = assignmentEarningForWorker(worker, assignment, link);
      regularPay += earning.regular;
      overtimePay += earning.overtime;
    });
    const workerAdjustments = monthAdjustments.filter(item => item.worker_id === worker.id);
    const bonuses = workerAdjustments.filter(item => item.adjustment_type === "bonus").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const advances = workerAdjustments.filter(item => item.adjustment_type === "advance").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const deductions = workerAdjustments.filter(item => item.adjustment_type === "deduction").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const grossPay = roundNumber(regularPay + overtimePay + bonuses, 2);
    const netPay = Math.max(0, roundNumber(grossPay - advances - deductions, 2));
    return {
      worker,
      recordedWorkDays: attendanceSummary.dates.length,
      presentDays,
      absentDays,
      regularPay: roundNumber(regularPay, 2),
      overtimePay: roundNumber(overtimePay, 2),
      bonuses: roundNumber(bonuses, 2),
      advances: roundNumber(advances, 2),
      deductions: roundNumber(deductions, 2),
      grossPay,
      netPay,
      calculationNotes: `${capitalize(worker.wage_type || "daily")} wage converted to assignment rate · approved hours/units only · attendance cross-checked`
    };
  }).filter(row =>
    String(row.worker.status || "active").toLowerCase() !== "inactive" ||
    row.presentDays > 0 || row.absentDays > 0 || row.grossPay > 0 || row.advances > 0 || row.deductions > 0
  );
}

function buildWorkforceProductivity({ month, workers, assignments, assignmentWorkers, assignmentFields, attendance }) {
  const approvedIds = new Set(assignments.filter(assignment =>
    assignment.status === "completed" && assignment.approval_status === "approved" && String(assignment.work_date || "").startsWith(month)
  ).map(assignment => assignment.id));
  const monthAttendance = attendance.filter(row => String(row.attendance_date || "").startsWith(month));
  return workers.map(worker => {
    const links = assignmentWorkers.filter(link => link.worker_id === worker.id && approvedIds.has(link.assignment_id));
    const assignmentIds = new Set(links.map(link => link.assignment_id));
    const attendanceRows = monthAttendance.filter(row => row.worker_id === worker.id);
    const marked = attendanceRows.length;
    const present = attendanceRows.filter(row => row.status === "present").length;
    return {
      worker,
      assignments: assignmentIds.size,
      fields: new Set(assignmentFields.filter(link => assignmentIds.has(link.assignment_id)).map(link => link.field_id)).size,
      regularHours: links.reduce((sum, link) => sum + Number(link.regular_hours || 0), 0),
      overtimeHours: links.reduce((sum, link) => sum + Number(link.overtime_hours || 0), 0),
      completedUnits: links.reduce((sum, link) => sum + Number(link.completed_units || 0), 0),
      attendanceRate: marked ? Math.round(present / marked * 100) : 0
    };
  }).filter(row => row.assignments > 0).sort((a, b) => b.completedUnits - a.completedUnits || b.regularHours - a.regularHours);
}

function AllocationPreview({ fields, quantity, unit, cost }) {
  if (!fields.length) return <p className="form-note">Select one or more fields to see the acreage allocation.</p>;
  const quantityShares = allocateByFieldArea(Number(quantity || 0), fields, 4);
  const costShares = allocateByFieldArea(Number(cost || 0), fields, 2);
  const totalArea = fields.reduce((sum,field) => sum + Number(field.area_acres || 0), 0);
  return <section className="allocation-preview">
    <header><strong>Acreage allocation</strong><span>{fields.length} field{fields.length===1?"":"s"} · {totalArea.toFixed(2)} acres</span></header>
    <div>{fields.map(field => <p key={field.id}><span>{field.name}<small>{Number(field.area_acres || 0).toFixed(2)} acres</small></span><strong>{quantityShares[field.id]} {unit || "units"}<small>KES {Number(costShares[field.id] || 0).toLocaleString()}</small></strong></p>)}</div>
  </section>;
}

function averageGermination(batches) {
  const valid = batches.filter(b => Number(b.seeds_sown) > 0);
  if (!valid.length) return "—";
  return Math.round(valid.reduce((s,b)=>s+(Number(b.germinated||0)/Number(b.seeds_sown)*100),0)/valid.length) + "%";
}
function isActiveNurseryBatch(batch) {
  return String(batch?.status || "sown").toLowerCase() !== "transplanted";
}
function nurseryLiveSeedlings(batch) {
  return Math.max(0, Number(batch?.germinated || 0) - Number(batch?.losses || 0));
}
function canonicalFieldStatus(status) {
  const value = String(status || "active").toLowerCase();
  if (["growing", "planted", "harvest_ready"].includes(value)) return "growing";
  if (["fallow", "resting", "inactive"].includes(value)) return "fallow";
  return "active";
}
function fieldStatusForCycle(status) {
  const value = String(status || "planned").toLowerCase();
  if (["planted", "growing", "harvest_ready"].includes(value)) return "growing";
  if (["completed", "harvested", "closed"].includes(value)) return "active";
  return null;
}
function isMissingAttendanceTable(error) {
  if (!error) return false;
  const message = `${error.code || ""} ${error.message || ""} ${error.details || ""}`.toLowerCase();
  return message.includes("worker_attendance") && (
    message.includes("does not exist") ||
    message.includes("could not find") ||
    message.includes("schema cache") ||
    message.includes("42p01") ||
    message.includes("pgrst205")
  );
}
function isMissingWorkforceTable(error) {
  if (!error) return false;
  const message = `${error.code || ""} ${error.message || ""} ${error.details || ""}`.toLowerCase();
  const tableNames = [
    "work_crews", "work_crew_members", "work_assignments", "work_assignment_fields",
    "work_assignment_workers", "payroll_periods", "payroll_adjustments", "payroll_items", "payroll_payments"
  ];
  return tableNames.some(name => message.includes(name)) && (
    message.includes("does not exist") ||
    message.includes("could not find") ||
    message.includes("schema cache") ||
    message.includes("42p01") ||
    message.includes("pgrst205")
  );
}
function buildAttendanceCalendar(monthValue) {
  const match = String(monthValue || "").match(/^(\d{4})-(\d{2})$/);
  if (!match) return [];
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const leadingDays = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: leadingDays }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      date: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    });
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}
function shiftAttendanceMonth(monthValue, offset) {
  const [year, month] = String(monthValue || localDateISO().slice(0, 7)).split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function formatAttendanceMonth(monthValue) {
  const [year, month] = String(monthValue || "").split("-").map(Number);
  if (!year || !month) return "Attendance calendar";
  return new Date(year, month - 1, 1).toLocaleDateString("en-KE", { month: "long", year: "numeric" });
}
function localDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function addDaysISO(iso, days) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDateISO(date);
}
function daysBetween(from, to) {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.max(0, Math.round((end - start) / 86400000));
}
function formatShortDate(iso) {
  if (!iso) return "No date";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}
function formatLongDate(iso) {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
}
function capitalize(value) {
  const text = String(value || "").replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}
function downloadCSV(rows, filename) {
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
function greetingForHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
function firstName(value) {
  const raw = String(value || "Farmer").trim();
  const name = (raw.includes("@") ? raw.split("@")[0] : raw).split(/\s+/)[0] || "Farmer";
  return name.charAt(0).toUpperCase() + name.slice(1);
}
function modalLabel(type){return ({
  block:"farm block",field:"field",batch:"propagation batch",
  cycle:"crop cycle",activity:"field activity",worker:"employee",
  crew:"work crew",assignment:"job assignment",adjustment:"payroll adjustment",payment:"payroll payment",
  irrigation:"irrigation record",spray:"spray record",inventory:"inventory item",
  harvest:"harvest record",equipment:"equipment record"
})[type]}
function StatusBanner({status,message}){const Icon=status==="success"?CheckCircle2:status==="loading"?LoaderCircle:AlertCircle;return message?<div className={`status-banner ${status}`}><Icon size={18} className={status==="loading"?"spin":""}/><span>{message}</span></div>:null}
function Modal({title,children,onClose}){return <div className="overlay" onMouseDown={onClose}><section className="modal large" onMouseDown={e=>e.stopPropagation()}><header className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={20}/></button></header>{children}</section></div>}
function Stat({label,value,detail,onClick}){return <article className={`stat-card ${onClick ? "clickable" : ""}`} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>}
function DashboardKpi({Icon,label,value,detail,tone="green",onClick}){return <button className={`dashboard-kpi ${tone}`} onClick={onClick}><span className="dashboard-kpi-icon"><Icon size={19}/></span><span className="dashboard-kpi-copy"><small>{label}</small><strong>{value}</strong><span>{detail}</span></span><ArrowUpRight size={16} className="dashboard-kpi-arrow"/></button>}
function PulseRow({Icon,label,value,detail,tone="good",onClick}){return <button className="pulse-row" onClick={onClick}><span className={`pulse-icon ${tone}`}><Icon size={17}/></span><span><strong>{label}</strong><small>{detail}</small></span><b>{value}</b><ChevronRight size={16}/></button>}
function Mini({label,value}){return <article className="mini"><strong>{value}</strong><span>{label}</span></article>}
function Card({title,subtitle,action,onAction,children}){return <section className="card"><header className="card-header"><div><h3>{title}</h3><p>{subtitle}</p></div>{action&&<button onClick={onAction}>{action}</button>}</header>{children}</section>}
function Record({Icon,title,subtitle,badge,onEdit,onDelete}){return <div className="record"><div className="record-icon"><Icon size={18}/></div><div className="record-main"><strong>{title}</strong><span>{subtitle}</span></div><span className="row-actions"><span className="pill">{badge}</span>{onEdit&&<button className="small-action" onClick={onEdit}>Edit</button>}{onDelete&&<button className="small-action danger-action" onClick={onDelete}>Delete</button>}</span></div>}
function Empty({text}){return <div className="empty">{text}</div>}
function PriorityItem({item,onOpen}){return <button className={`priority-item ${item.priority}`} onClick={onOpen}><span className="priority-icon"><ListChecks size={17}/></span><span className="priority-copy"><strong>{item.title}</strong><small>{item.detail}</small></span><span className={`priority-badge ${item.priority}`}>{item.priority}</span><ChevronRight size={17}/></button>}
function ScheduleItem({activity,field,worker,onComplete}){return <article className="schedule-item"><div className="schedule-date"><Clock3 size={15}/><strong>{formatShortDate(activity.scheduled_date)}</strong></div><div><strong>{activity.title || capitalize(activity.activity_type)}</strong><span>{field} · {worker}</span></div><span className="pill">{activity.status || "planned"}</span>{onComplete&&<button className="small-action" onClick={onComplete}>Complete fields</button>}</article>}
function SimplePage({title,description,button,buttonIcon:ButtonIcon=Plus,onAdd,disabled,children}){return <><section className="hero"><div><h2>{title}</h2><p>{description}</p></div>{button&&<button className="button primary" disabled={disabled} onClick={onAdd}><ButtonIcon size={17}/>{button}</button>}</section><section className="card">{children}</section></>}
function Table({headers,children}){return <div className="data-table"><div className="table-row table-head">{headers.map(h=><span key={h}>{h}</span>)}</div>{children}</div>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function ComingSoon({page}){const item=NAV.find(n=>n[0]===page);const Icon=item?.[2]||Leaf;return <section className="coming-soon card"><div className="coming-icon"><Icon size={30}/></div><h2>{item?.[1]}</h2><p>This module is ready for the next build phase.</p></section>}

function PasswordRecoveryScreen({onComplete,sessionReady}){
  const [form,setForm]=useState({password:"",confirmPassword:""});
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  async function savePassword(event){
    event.preventDefault();
    setMessage("");
    if(!sessionReady){setMessage("This recovery link is invalid, expired, or has already been used. Return to sign in and request a new link.");return;}
    if(form.password.length<8){setMessage("Use at least 8 characters for your new password.");return;}
    if(form.password!==form.confirmPassword){setMessage("The two passwords do not match.");return;}
    setBusy(true);
    const {error}=await supabase.auth.updateUser({password:form.password});
    if(error){
      setMessage(error.message);
      setBusy(false);
      return;
    }
    setMessage("Password changed successfully. Returning to sign in…");
    await supabase.auth.signOut();
    onComplete();
  }

  async function cancelRecovery(){
    await supabase.auth.signOut();
    onComplete();
  }

  return <main className="auth-screen"><section className="auth-card">
    <div className="auth-brand"><div className="brand-mark"><Sprout size={27}/></div><div><strong>Farm Manager</strong><span>Version 8.5 · Secure Recovery</span></div></div>
    <div><span className="eyebrow">PASSWORD RECOVERY</span><h1>Choose a new password</h1><p>Enter a new password for your Farm Manager account. Your farm records and administrator permissions will remain unchanged.</p></div>
    {!sessionReady&&<div className="auth-message auth-error">This recovery link could not be verified. It may have expired or already been used. Return to sign in and request a new recovery email.</div>}
    <form className="form" onSubmit={savePassword}>
      <Field label="New password"><input required autoFocus minLength="8" type="password" autoComplete="new-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></Field>
      <Field label="Confirm new password"><input required minLength="8" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})}/></Field>
      {message&&<div className="auth-message">{message}</div>}
      <button className="button primary auth-submit" disabled={busy||!sessionReady}>{busy?"Saving…":sessionReady?"Save new password":"Recovery link unavailable"}</button>
    </form>
    <div className="auth-links"><button type="button" onClick={cancelRecovery}>Cancel and return to sign in</button></div>
  </section></main>
}

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
    if(!form.email){setMessage("Enter your administrator email address first.");return;}
    setBusy(true);
    setMessage("");
    const recoveryUrl = new URL("/", window.location.origin);
    recoveryUrl.searchParams.set("recovery", "1");
    const {error}=await supabase.auth.resetPasswordForEmail(form.email,{redirectTo:recoveryUrl.toString()});
    setMessage(error?error.message:"Recovery link sent. Open the newest email link to choose a new password. Each link can be used only once.");
    setBusy(false);
  }
  return <main className="auth-screen"><section className="auth-card">
    <div className="auth-brand"><div className="brand-mark"><Sprout size={27}/></div><div><strong>Farm Manager</strong><span>Version 8.5 · Farm Command & Labour</span></div></div>
    <div><span className="eyebrow">{mode==="login"?"WELCOME BACK":"CREATE ACCOUNT"}</span><h1>{mode==="login"?"Sign in to your farm":"Join the farm team"}</h1><p>Use your email and password to access the records permitted for your role.</p></div>
    <form className="form" onSubmit={submit}>
      {mode==="signup"&&<Field label="Full name"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>}
      <Field label="Email"><input required type="email" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field>
      <Field label="Password"><input required minLength="6" type="password" autoComplete={mode==="login"?"current-password":"new-password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></Field>
      {message&&<div className="auth-message">{message}</div>}
      <button className="button primary auth-submit" disabled={busy}>{busy?"Please wait…":mode==="login"?"Sign in":"Create account"}</button>
    </form>
    <div className="auth-links">
      <button onClick={()=>{setMode(mode==="login"?"signup":"login");setMessage("")}}><UserPlus size={15}/>{mode==="login"?"Create an account":"Back to sign in"}</button>
      {mode==="login"&&<button type="button" disabled={busy} onClick={resetPassword}>Forgot admin password?</button>}
    </div>
  </section></main>
}
