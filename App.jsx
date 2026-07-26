import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertCircle, Blocks, CheckCircle2, CircleDollarSign, ClipboardList,
  Droplets, Home, Leaf, LoaderCircle, Menu, Package, Plus, RefreshCw,
  Sprout, Tractor, X
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
  ["irrigation", "Irrigation", Droplets],
  ["inventory", "Inventory", Package],
  ["expenses", "Expenses", CircleDollarSign],
  ["reports", "Reports", ClipboardList]
];

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

function friendlyError(error) {
  const message = error?.message || String(error);
  if (message.includes("row-level security")) {
    return "Supabase blocked this action through Row Level Security. Run the V5 database-upgrade.sql script.";
  }
  if (message.includes("column") && message.includes("does not exist")) {
    return "The V5 database upgrade has not been run yet. Run database-upgrade.sql in Supabase SQL Editor.";
  }
  return message;
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [farm, setFarm] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [fields, setFields] = useState([]);
  const [batches, setBatches] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [status, setStatus] = useState({ type: "loading", message: "Connecting to Supabase…" });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

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

      setBlocks(blockRows || []);
      setFields(farmFields);
      setBatches(batchRows || []);
      setCycles((cycleRows || []).filter(c => fieldIds.has(c.field_id)));
      setStatus({ type: "success", message: "Connected to Supabase. Live V5 data loaded." });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const metrics = useMemo(() => {
    const totalArea = fields.reduce((sum, f) => sum + Number(f.area_acres || 0), 0);
    const activeFields = fields.filter(f => ["growing","active","planted"].includes(String(f.status || "").toLowerCase())).length;
    const seedlings = batches.reduce((sum, b) => sum + Math.max(0, Number(b.germinated || 0) - Number(b.losses || 0)), 0);
    const ready = batches.filter(b => String(b.status).toLowerCase() === "ready").length;
    return { totalArea, activeFields, seedlings, ready };
  }, [fields, batches]);

  const blockName = id => blocks.find(b => b.id === id)?.name || "Unknown block";
  const fieldName = id => fields.find(f => f.id === id)?.name || "Unknown field";
  const batchName = id => {
    const b = batches.find(x => x.id === id);
    return b ? `${b.crop_name}${b.variety ? " · " + b.variety : ""}` : "Direct planting";
  };

  function open(type) {
    if (type === "block") setForm(emptyBlock);
    if (type === "field") setForm({ ...emptyField, blockId: blocks[0]?.id || "" });
    if (type === "batch") setForm(emptyBatch);
    if (type === "cycle") setForm({
      ...emptyCycle,
      field_id: fields[0]?.id || "",
      source_batch_id: batches.find(b => b.status === "ready")?.id || "",
      area_acres: fields[0]?.area_acres || ""
    });
    setModal(type);
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      if (modal === "block") {
        const { error } = await supabase.from("farm_blocks").insert({
          farm_id: farm.id, name: form.name.trim(), area_acres: Number(form.area)
        });
        if (error) throw error;
      }
      if (modal === "field") {
        const { error } = await supabase.from("fields").insert({
          farm_block_id: form.blockId, name: form.name.trim(),
          area_acres: Number(form.area), status: form.status
        });
        if (error) throw error;
      }
      if (modal === "batch") {
        const calculatedSeeds = Number(form.seeds_sown || 0) ||
          (Number(form.trays || 0) * Number(form.cells_per_tray || 0));
        const batchCode = `PB-${String(form.sowing_date || "").replaceAll("-","")}-${Date.now().toString().slice(-5)}`;
        const { error } = await supabase.from("propagation_batches").insert({
          batch_code: batchCode,
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
        });
        if (error) throw error;
      }
      if (modal === "cycle") {
        const { error } = await supabase.from("crop_cycles").insert({
          field_id: form.field_id,
          crop_name: form.crop_name.trim(),
          variety: form.variety.trim() || null,
          source_batch_id: form.source_batch_id || null,
          planting_date: form.planting_date,
          expected_harvest_date: form.expected_harvest_date || null,
          status: form.status,
          area_acres: Number(form.area_acres || 0),
          notes: form.notes.trim() || null
        });
        if (error) throw error;
      }
      setModal(null);
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setSaving(false);
    }
  }

  async function updateBatchStatus(id, newStatus) {
    try {
      const { error } = await supabase.from("propagation_batches").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sprout size={25}/></div>
          <div><strong>Farm Manager</strong><span>Nursery & production</span></div>
          <button className="mobile-close" onClick={() => setMobileNav(false)}><X/></button>
        </div>
        <nav>{NAV.map(([id,label,Icon]) => (
          <button key={id} className={page===id ? "active" : ""} onClick={() => {setPage(id);setMobileNav(false)}}>
            <Icon size={19}/><span>{label}</span>
          </button>
        ))}</nav>
      </aside>

      <main>
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)}><Menu/></button>
          <div><span className="eyebrow">{farm?.name || "MY FARM"}</span><h1>{NAV.find(n => n[0]===page)?.[1]}</h1></div>
          <button className="refresh-button" onClick={loadData}><RefreshCw size={18}/></button>
        </header>

        <StatusBanner status={status.type} message={status.message}/>

        {page === "dashboard" && <>
          <section className="hero">
            <div><h2>Good afternoon, farmer.</h2><p>Track your farm from seed propagation through field production.</p></div>
            <div className="button-row">
              <button className="button secondary" onClick={() => open("batch")}><Plus size={17}/> Nursery batch</button>
              <button className="button primary" disabled={!fields.length} onClick={() => open("cycle")}><Plus size={17}/> Crop cycle</button>
            </div>
          </section>
          <section className="stats-grid">
            <Stat label="Farm blocks" value={blocks.length} detail="Management areas"/>
            <Stat label="Fields" value={fields.length} detail={`${metrics.totalArea.toFixed(1)} acres mapped`}/>
            <Stat label="Seedlings growing" value={metrics.seedlings} detail={`${batches.length} propagation batches`}/>
            <Stat label="Ready batches" value={metrics.ready} detail="Ready for transplanting"/>
          </section>
          <section className="split-grid">
            <Card title="Nursery batches" subtitle="Latest propagation activity" action="Add" onAction={() => open("batch")}>
              {batches.slice(0,5).map(b => <Record key={b.id} Icon={Sprout} title={`${b.crop_name}${b.variety ? " · "+b.variety : ""}`}
                subtitle={`${b.sowing_date || "No date"} · ${Math.max(0, Number(b.germinated||0)-Number(b.losses||0))} live seedlings`}
                badge={b.status || "sown"}/>)}
              {!batches.length && <Empty text="No propagation batches yet."/>}
            </Card>
            <Card title="Crop cycles" subtitle="Field production" action="Add" onAction={() => open("cycle")}>
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
            {blocks.map(b => <div className="table-row" key={b.id}><strong>{b.name}</strong><span>{Number(b.area_acres||0)} acres</span>
              <span>{fields.filter(f=>f.farm_block_id===b.id).length}</span><span className="pill">Active</span></div>)}
          </Table>
        </SimplePage>}

        {page === "fields" && <SimplePage title="Fields" description="Manage individual production units." button="Add field" disabled={!blocks.length} onAdd={() => open("field")}>
          <Table headers={["Name","Block","Area","Status"]}>
            {fields.map(f => <div className="table-row" key={f.id}><strong>{f.name}</strong><span>{blockName(f.farm_block_id)}</span>
              <span>{Number(f.area_acres||0)} acres</span><span className="pill">{f.status||"available"}</span></div>)}
          </Table>
        </SimplePage>}

        {page === "nursery" && <SimplePage title="Nursery & Seed Propagation" description="Track sowing, germination, seedling losses and transplant readiness."
          button="New batch" onAdd={() => open("batch")}>
          <section className="nursery-summary">
            <Mini label="Batches" value={batches.length}/><Mini label="Live seedlings" value={metrics.seedlings}/>
            <Mini label="Ready" value={metrics.ready}/><Mini label="Average germination" value={averageGermination(batches)}/>
          </section>
          <div className="batch-grid">
            {batches.map(b => {
              const live = Math.max(0, Number(b.germinated||0)-Number(b.losses||0));
              const rate = Number(b.seeds_sown||0) ? Math.round(Number(b.germinated||0)/Number(b.seeds_sown)*100) : 0;
              return <article className="batch-card" key={b.id}>
                <div className="batch-top"><div><span className="eyebrow">{b.sowing_date || "NO DATE"}</span>
                  <h3>{b.crop_name}{b.variety ? " · "+b.variety : ""}</h3></div><span className="pill">{b.status}</span></div>
                <div className="batch-metrics"><div><b>{b.trays||0}</b><span>Trays</span></div><div><b>{live}</b><span>Live seedlings</span></div>
                  <div><b>{rate}%</b><span>Germination</span></div></div>
                <p>Expected transplant: {b.expected_transplant_date || "Not set"}</p>
                <div className="batch-actions">
                  {b.status !== "ready" && <button onClick={() => updateBatchStatus(b.id,"ready")}>Mark ready</button>}
                  {b.status === "ready" && <button onClick={() => { setPage("crops"); open("cycle"); setForm(v => ({...v, source_batch_id:b.id, crop_name:b.crop_name, variety:b.variety||""})) }}>Transplant</button>}
                </div>
              </article>
            })}
            {!batches.length && <Empty text="Create your first propagation batch."/>}
          </div>
        </SimplePage>}

        {page === "crops" && <SimplePage title="Crop Cycles" description="Connect transplanted seedlings or direct planting to a specific field."
          button="New crop cycle" disabled={!fields.length} onAdd={() => open("cycle")}>
          <Table headers={["Crop","Field","Source","Status"]}>
            {cycles.map(c => <div className="table-row" key={c.id}>
              <strong>{c.crop_name}{c.variety ? " · "+c.variety : ""}</strong><span>{fieldName(c.field_id)}</span>
              <span>{batchName(c.source_batch_id)}</span><span className="pill">{c.status||"planned"}</span>
            </div>)}
          </Table>
        </SimplePage>}

        {["irrigation","inventory","expenses","reports"].includes(page) && <ComingSoon page={page}/>}
      </main>

      {mobileNav && <div className="sidebar-backdrop" onClick={() => setMobileNav(false)}/>}

      {modal && <Modal title={modalTitle(modal)} onClose={() => setModal(null)}>
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
              <Field label="Nursery source"><select value={form.source_batch_id||""} onChange={e=>{const b=batches.find(x=>x.id===e.target.value);setForm({...form,source_batch_id:e.target.value,crop_name:b?.crop_name||form.crop_name,variety:b?.variety||form.variety})}}><option value="">Direct planting</option>{batches.map(b=><option key={b.id} value={b.id}>{b.crop_name}{b.variety ? " · "+b.variety : ""}</option>)}</select></Field>
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
          <div className="form-actions"><button type="button" className="button secondary" onClick={()=>setModal(null)}>Cancel</button><button className="button primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button></div>
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
function modalTitle(type){return ({block:"Add farm block",field:"Add field",batch:"New propagation batch",cycle:"New crop cycle"})[type]}
function StatusBanner({status,message}){const Icon=status==="success"?CheckCircle2:status==="loading"?LoaderCircle:AlertCircle;return message?<div className={`status-banner ${status}`}><Icon size={18} className={status==="loading"?"spin":""}/><span>{message}</span></div>:null}
function Modal({title,children,onClose}){return <div className="overlay" onMouseDown={onClose}><section className="modal large" onMouseDown={e=>e.stopPropagation()}><header className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={20}/></button></header>{children}</section></div>}
function Stat({label,value,detail}){return <article className="stat-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>}
function Mini({label,value}){return <article className="mini"><strong>{value}</strong><span>{label}</span></article>}
function Card({title,subtitle,action,onAction,children}){return <section className="card"><header className="card-header"><div><h3>{title}</h3><p>{subtitle}</p></div>{action&&<button onClick={onAction}>{action}</button>}</header>{children}</section>}
function Record({Icon,title,subtitle,badge}){return <div className="record"><div className="record-icon"><Icon size={18}/></div><div className="record-main"><strong>{title}</strong><span>{subtitle}</span></div><span className="pill">{badge}</span></div>}
function Empty({text}){return <div className="empty">{text}</div>}
function SimplePage({title,description,button,onAdd,disabled,children}){return <><section className="hero"><div><h2>{title}</h2><p>{description}</p></div><button className="button primary" disabled={disabled} onClick={onAdd}><Plus size={17}/>{button}</button></section><section className="card">{children}</section></>}
function Table({headers,children}){return <div className="data-table"><div className="table-row table-head">{headers.map(h=><span key={h}>{h}</span>)}</div>{children}</div>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function ComingSoon({page}){const item=NAV.find(n=>n[0]===page);const Icon=item?.[2]||Leaf;return <section className="coming-soon card"><div className="coming-icon"><Icon size={30}/></div><h2>{item?.[1]}</h2><p>This module is ready for the next build phase.</p></section>}
