import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle, Blocks, CheckCircle2, CircleDollarSign, ClipboardList, Droplets, Gauge, Home,
  Leaf, LoaderCircle, Menu, Package, Plus, RefreshCw, Sprout, Tractor, X
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://itlngocavjyrjgeblsmq.supabase.co",
  "sb_publishable_sV6zuknGzOavoAdqW2o1MQ_6GzpVKxE"
);



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

const initialForm = { name: "", area: "", blockId: "", status: "available" };

function friendlyError(error) {
  const message = error?.message || String(error);
  if (message.includes("row-level security")) {
    return "Supabase blocked this operation through Row Level Security. Run the included database-policy.sql script.";
  }
  if (message.includes("Failed to fetch")) {
    return "The browser could not reach Supabase. Check internet access and the environment variables.";
  }
  return message;
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [farm, setFarm] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [fields, setFields] = useState([]);
  const [status, setStatus] = useState({ type: "loading", message: "Connecting to Supabase…" });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setStatus({ type: "loading", message: "Loading farm records…" });
    try {
      const { data: farms, error: farmsError } = await supabase
        .from("farms")
        .select("id,name,location,total_area_acres,created_at")
        .order("created_at", { ascending: true })
        .limit(1);
      if (farmsError) throw farmsError;

      let activeFarm = farms?.[0] || null;
      if (!activeFarm) {
        const { data, error } = await supabase
          .from("farms")
          .insert({ name: "My Farm" })
          .select()
          .single();
        if (error) throw error;
        activeFarm = data;
      }
      setFarm(activeFarm);

      const [{ data: blockRows, error: blockError }, { data: fieldRows, error: fieldError }] =
        await Promise.all([
          supabase.from("farm_blocks")
            .select("id,farm_id,name,area_acres,description,created_at")
            .eq("farm_id", activeFarm.id)
            .order("name"),
          supabase.from("fields")
            .select("id,farm_block_id,name,area_acres,soil_type,irrigation_method,status,created_at")
            .order("name")
        ]);
      if (blockError) throw blockError;
      if (fieldError) throw fieldError;

      const farmBlockIds = new Set((blockRows || []).map((b) => b.id));
      setBlocks(blockRows || []);
      setFields((fieldRows || []).filter((f) => farmBlockIds.has(f.farm_block_id)));
      setStatus({ type: "success", message: "Connected to Supabase. Live farm data loaded." });
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const stats = useMemo(() => {
    const totalArea = fields.reduce((sum, field) => sum + Number(field.area_acres || 0), 0);
    const activeFields = fields.filter((field) =>
      ["growing", "active", "planted"].includes(String(field.status || "").toLowerCase())
    ).length;
    return { totalArea, activeFields };
  }, [fields]);

  const openBlock = () => {
    setForm(initialForm);
    setModal("block");
  };

  const openField = () => {
    setForm({ ...initialForm, blockId: blocks[0]?.id || "" });
    setModal("field");
  };

  async function saveBlock(event) {
    event.preventDefault();
    if (!farm || !form.name.trim() || !Number(form.area)) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("farm_blocks").insert({
        farm_id: farm.id,
        name: form.name.trim(),
        area_acres: Number(form.area)
      });
      if (error) throw error;
      setModal(null);
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setSaving(false);
    }
  }

  async function saveField(event) {
    event.preventDefault();
    if (!form.blockId || !form.name.trim() || !Number(form.area)) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("fields").insert({
        farm_block_id: form.blockId,
        name: form.name.trim(),
        area_acres: Number(form.area),
        status: form.status
      });
      if (error) throw error;
      setModal(null);
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: friendlyError(error) });
    } finally {
      setSaving(false);
    }
  }

  const blockName = (id) => blocks.find((block) => block.id === id)?.name || "Unknown block";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sprout size={25} /></div>
          <div><strong>Farm Manager</strong><span>Commercial farm operations</span></div>
          <button className="mobile-close" onClick={() => setMobileNav(false)}><X /></button>
        </div>
        <nav>
          {NAV.map(([id, label, Icon]) => (
            <button key={id} className={page === id ? "active" : ""}
              onClick={() => { setPage(id); setMobileNav(false); }}>
              <Icon size={19} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <Gauge size={16} />
          <span>Farm Manager V3</span>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)}><Menu /></button>
          <div>
            <span className="eyebrow">{farm?.name || "MY FARM"}</span>
            <h1>{NAV.find(([id]) => id === page)?.[1]}</h1>
          </div>
          <button className="refresh-button" onClick={loadData} title="Refresh data">
            <RefreshCw size={18} />
          </button>
        </header>

        <StatusBanner status={status.type} message={status.message} />

        {page === "dashboard" && (
          <>
            <section className="hero">
              <div><h2>Good afternoon, farmer.</h2><p>Live production information from your farm database.</p></div>
              <div className="button-row">
                <button className="button secondary" onClick={openBlock}><Plus size={17}/> Add block</button>
                <button className="button primary" onClick={openField} disabled={!blocks.length}><Plus size={17}/> Add field</button>
              </div>
            </section>

            <section className="stats-grid">
              <Stat label="Farm blocks" value={blocks.length} detail="Production management areas" />
              <Stat label="Fields" value={fields.length} detail={`${stats.totalArea.toFixed(1)} acres mapped`} />
              <Stat label="Active fields" value={stats.activeFields} detail="Currently in production" />
              <Stat label="Nursery batches" value="0" detail="Nursery module ready" />
            </section>

            <section className="split-grid">
              <Card title="Farm blocks" subtitle="Your production areas" action="Add" onAction={openBlock}>
                {blocks.length ? blocks.map((block) => (
                  <Record key={block.id} icon={Blocks} title={block.name}
                    subtitle={`${fields.filter((f) => f.farm_block_id === block.id).length} fields · ${Number(block.area_acres || 0)} acres`}
                    badge="Active" />
                )) : <Empty text="No farm blocks yet." />}
              </Card>
              <Card title="Fields" subtitle="Individual production units" action="Add" onAction={openField}>
                {fields.length ? fields.map((field) => (
                  <Record key={field.id} icon={Tractor} title={field.name}
                    subtitle={`${blockName(field.farm_block_id)} · ${Number(field.area_acres || 0)} acres`}
                    badge={field.status || "Available"} />
                )) : <Empty text="Create a block, then add your first field." />}
              </Card>
            </section>

            <Card title="Production lifecycle" subtitle="Seed to market traceability">
              <div className="lifecycle">
                {["Seed lot", "Propagation", "Seedlings", "Crop cycle", "Harvest", "Sales"].map((step, index) => (
                  <div className="life-step" key={step}><span>{index + 1}</span><b>{step}</b></div>
                ))}
              </div>
            </Card>
          </>
        )}

        {page === "blocks" && (
          <DataPage title="Farm blocks" description="Group fields by location, irrigation zone or management area."
            button="Add farm block" onAdd={openBlock}>
            <div className="data-table">
              <div className="table-row table-head"><span>Name</span><span>Area</span><span>Fields</span><span>Status</span></div>
              {blocks.map((block) => (
                <div className="table-row" key={block.id}>
                  <strong>{block.name}</strong>
                  <span>{Number(block.area_acres || 0)} acres</span>
                  <span>{fields.filter((f) => f.farm_block_id === block.id).length}</span>
                  <span className="pill">Active</span>
                </div>
              ))}
              {!blocks.length && <Empty text="No farm blocks found." />}
            </div>
          </DataPage>
        )}

        {page === "fields" && (
          <DataPage title="Fields" description="Manage individual crop production units."
            button="Add field" onAdd={openField} disabled={!blocks.length}>
            <div className="data-table">
              <div className="table-row table-head"><span>Name</span><span>Block</span><span>Area</span><span>Status</span></div>
              {fields.map((field) => (
                <div className="table-row" key={field.id}>
                  <strong>{field.name}</strong>
                  <span>{blockName(field.farm_block_id)}</span>
                  <span>{Number(field.area_acres || 0)} acres</span>
                  <span className="pill">{field.status || "Available"}</span>
                </div>
              ))}
              {!fields.length && <Empty text="No fields found." />}
            </div>
          </DataPage>
        )}

        {["nursery","crops","irrigation","inventory","expenses","reports"].includes(page) && (
          <ComingSoon page={page} />
        )}
      </main>

      {mobileNav && <div className="sidebar-backdrop" onClick={() => setMobileNav(false)} />}

      {modal === "block" && (
        <Modal title="Add farm block" onClose={() => setModal(null)}>
          <form onSubmit={saveBlock} className="form">
            <Field label="Block name"><input required value={form.name} placeholder="Example: Block C"
              onChange={(e) => setForm({ ...form, name: e.target.value })}/></Field>
            <Field label="Area in acres"><input required type="number" min="0.01" step="0.01" value={form.area}
              placeholder="2.5" onChange={(e) => setForm({ ...form, area: e.target.value })}/></Field>
            <FormActions saving={saving} onCancel={() => setModal(null)} text="Save block" />
          </form>
        </Modal>
      )}

      {modal === "field" && (
        <Modal title="Add field" onClose={() => setModal(null)}>
          <form onSubmit={saveField} className="form">
            <Field label="Field name"><input required value={form.name} placeholder="Example: Field C1"
              onChange={(e) => setForm({ ...form, name: e.target.value })}/></Field>
            <Field label="Farm block"><select required value={form.blockId}
              onChange={(e) => setForm({ ...form, blockId: e.target.value })}>
              {blocks.map((block) => <option value={block.id} key={block.id}>{block.name}</option>)}
            </select></Field>
            <Field label="Area in acres"><input required type="number" min="0.01" step="0.01" value={form.area}
              placeholder="1.0" onChange={(e) => setForm({ ...form, area: e.target.value })}/></Field>
            <Field label="Status"><select value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="available">Available</option>
              <option value="growing">Growing</option>
              <option value="fallow">Fallow</option>
            </select></Field>
            <FormActions saving={saving} onCancel={() => setModal(null)} text="Save field" />
          </form>
        </Modal>
      )}
    </div>
  );
}

function Stat({ label, value, detail }) {
  return <article className="stat-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}
function Card({ title, subtitle, action, onAction, children }) {
  return <section className="card"><header className="card-header"><div><h3>{title}</h3><p>{subtitle}</p></div>
    {action && <button onClick={onAction}>{action}</button>}</header>{children}</section>;
}
function Record({ icon: Icon, title, subtitle, badge }) {
  return <div className="record"><div className="record-icon"><Icon size={18}/></div>
    <div className="record-main"><strong>{title}</strong><span>{subtitle}</span></div><span className="pill">{badge}</span></div>;
}
function Empty({ text }) { return <div className="empty">{text}</div>; }
function DataPage({ title, description, button, onAdd, disabled, children }) {
  return <><section className="hero"><div><h2>{title}</h2><p>{description}</p></div>
    <button className="button primary" disabled={disabled} onClick={onAdd}><Plus size={17}/>{button}</button></section>
    <section className="card">{children}</section></>;
}
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }
function FormActions({ saving, onCancel, text }) {
  return <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button>
    <button className="button primary" disabled={saving}>{saving ? "Saving…" : text}</button></div>;
}
function ComingSoon({ page }) {
  const item = NAV.find(([id]) => id === page);
  const Icon = item?.[2] || Leaf;
  return <section className="coming-soon card"><div className="coming-icon"><Icon size={30}/></div>
    <h2>{item?.[1]}</h2><p>This module is included in the application structure and will be connected in the next build phase.</p></section>;
}


function Modal({ title, children, onClose }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <section className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

function StatusBanner({ status, message }) {
  if (!message) return null;
  const Icon = status === "success" ? CheckCircle2 : status === "loading" ? LoaderCircle : AlertCircle;
  return (
    <div className={`status-banner ${status}`}>
      <Icon size={18} className={status === "loading" ? "spin" : ""} />
      <span>{message}</span>
    </div>
  );
}
