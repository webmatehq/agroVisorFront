import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { BrowserRouter, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { api, configured, supabase, list, exportEvents } from "./api";
import { Dashboard } from "./Dashboard";
import { ParcelMap } from "./Map";
import { Fumigations } from "./Fumigations";
import { Landing } from "./Landing";
import "./style.css";

import "./original-demo.css";
import "./connected-layout.css";
const client = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});
function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label>
      {label}
      <input {...props} />
    </label>
  );
}
function ErrorBox({ error }: { error: unknown }) {
  return error ? (
    <p role="alert" className="error">
      {error instanceof Error ? error.message : String(error)}
    </p>
  ) : null;
}
function Auth({ recovery = false }: { recovery?: boolean }) {
  const [mode, setMode] = useState(recovery ? "password" : "login"),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const siteUrl = (import.meta.env.VITE_SITE_URL || location.origin).replace(/\/$/, "");
  return (
    <main className="auth">
      <div className="brand">◈ SurcoVisor</div>
      <h1>Tu campo, conectado.</h1>
      <p>
        Gestiona tu finca con información real, desde cualquier lugar del
        mundo.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          setMessage("");
          const f = new FormData(e.currentTarget);
          try {
            const email = String(f.get("email") || ""),
              password = String(f.get("password") || "");
            const r =
              mode === "login"
                ? await supabase!.auth.signInWithPassword({ email, password })
                : mode === "register"
                  ? await supabase!.auth.signUp({
                      email,
                      password,
                      options: { emailRedirectTo: siteUrl },
                    })
                  : mode === "password"
                    ? await supabase!.auth.updateUser({ password })
                    : await supabase!.auth.resetPasswordForEmail(email, {
                        redirectTo: siteUrl + "/?recovery=1",
                      });
            if (r.error) throw r.error;
            setMessage(
              mode === "register"
                ? "Revisa tu correo para confirmar tu cuenta."
                : mode === "password"
                  ? "Contraseña actualizada. Puedes volver al inicio."
                  : "Revisa tu correo para continuar.",
            );
            if (mode === "password") location.assign("/");
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2>
          {mode === "login"
            ? "Bienvenido de nuevo"
            : mode === "register"
              ? "Crea tu cuenta"
              : mode === "password"
                ? "Nueva contraseña"
                : "Recuperar acceso"}
        </h2>
        {mode !== "password" && (
          <Field
            label="Correo electrónico"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        )}
        {mode !== "reset" && (
          <Field
            label="Contraseña"
            name="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            minLength={8}
            required
          />
        )}
        <ErrorBox error={error} />
        {message && <p className="auth-success" role="status">{message}</p>}
        <button disabled={busy}>
          {busy
            ? "Procesando…"
            : mode === "login"
              ? "Entrar"
              : mode === "register"
                ? "Registrarme"
                : mode === "password"
                  ? "Guardar contraseña"
                  : "Enviar enlace"}
        </button>
        <div className="toolbar">
          <button
            type="button"
            className="ghost"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setMessage(""); }}
          >
            {mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}
          </button>
          {mode !== "reset" && <button
            type="button"
            className="ghost"
            onClick={() => { setMode("reset"); setError(""); setMessage(""); }}
          >
            Olvidé mi contraseña
          </button>}
        </div>
      </form>
      <a className="return-home" href="/">← Volver a la página principal</a>
    </main>
  );
}
function WorkspaceGate() {
  const [session, setSession] = useState<Session | null>(null),
    [loading, setLoading] = useState(true),
    [recovery, setRecovery] = useState(
      new URLSearchParams(location.search).has("recovery"),
    );
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (event === "SIGNED_OUT") client.clear();
    });
    return () => data.subscription.unsubscribe();
  }, []);
  if (!configured)
    return (
      <main className="auth">
        <h1>SurcoVisor</h1>
        <h2>Conecta tu proyecto para comenzar</h2>
        <p>
          Falta configurar Supabase. Copia .env.example a .env y establece
          VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY y VITE_API_URL. Reinicia la
          web después.
        </p>
        <p>
          Las fincas y los indicadores aparecerán cuando conectes los servicios
          e introduzcas tus datos.
        </p>
      </main>
    );
  if (loading) return <p className="loading">Cargando sesión…</p>;
  return !session || recovery ? (
    <Auth recovery={recovery} />
  ) : (
    <Workspace email={session.user.email || ""} />
  );
}
function NavGlyph({ to }: { to: string }) {
  const paths: Record<string, React.ReactNode> = {
    "/admin": (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    "/fincas": (
      <>
        <path d="M3 5.5 8 3l5 2.5L18 3l3 1.5v14L16 21l-5-2.5L6 21l-3-1.5z" />
        <path d="M8 3v15.5M13 5.5v13M18 3v15.5" />
      </>
    ),
    "/campanas": (
      <>
        <path d="M12 21a9 9 0 1 0-9-9" />
        <path d="M3 12h9V3" />
      </>
    ),
    "/cuaderno": (
      <>
        <rect x="5" y="3" width="15" height="18" rx="2" />
        <path d="M8 3v-1M12 3v-1M16 3v-1M8 8h9M8 12h9M8 16h5" />
      </>
    ),
    "/clima": (
      <>
        <path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8.5 4.5 4.5 0 0 0 7 18Z" />
      </>
    ),
    "/ndvi": (
      <>
        <path d="M20 4C11 4 5 8 5 15c0 2 1 3 2 4 7-1 11-6 13-15Z" />
        <path d="M5 19c2-4 5-7 10-9" />
      </>
    ),
    "/fumigaciones": (
      <>
        <path d="M12 3v18M3 12h18" />
        <circle cx="12" cy="12" r="8" />
      </>
    ),
  };
  return (
    <span className="nav-icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths[to] || <circle cx="12" cy="12" r="8" />}
      </svg>
    </span>
  );
}
function ModuleHub() {
  const modules = [
    { to: "/admin", title: "Índices", text: "Consulta los índices y observaciones disponibles de tus parcelas.", icon: "/ndvi" },
    { to: "/cuaderno", title: "Notebook", text: "Registra cualquier actividad, observación o labor realizada en el campo.", icon: "/cuaderno" },
    { to: "/gestion", title: "Fincas y parcelas", text: "Crea y administra tus fincas y parcelas.", icon: "/fincas" },
    { to: "/servicios/solicitar", title: "Servicios", text: "Consulta tus parcelas, solicita fumigaciones y revisa el historial de servicios.", icon: "/fumigaciones" },
  ];
  return <section className="module-hub">
    <div className="module-heading"><p className="eyebrow">CENTRO DE CONTROL</p><h1>Aplicaciones</h1><p className="subtitle">Accede a todos los módulos y herramientas de tu explotación desde aquí.</p></div>
    <div className="module-grid">{modules.map((module) => <article className="module-card" key={module.to}>
      <div className="module-icon"><NavGlyph to={module.icon} /></div><h2>{module.title}</h2><p>{module.text}</p><NavLink className="button" to={module.to}>Abrir módulo <span aria-hidden="true">→</span></NavLink>
    </article>)}</div>
  </section>;
}
function Workspace({ email }: { email: string }) {
  const location = useLocation();
  const q = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => api("/me") });
  const [org, setOrg] = useState(""),
    [farm, setFarm] = useState(""),
    [parcel, setParcel] = useState(""),
    [creatingFarm, setCreatingFarm] = useState(false);
  const orgs = list(me.data?.organizations);
  useEffect(() => {
    if (!org && orgs[0]) setOrg(orgs[0].id);
  }, [org, orgs]);
  const farms = useQuery({
    queryKey: ["farms", org],
    queryFn: () => api("/farms?organization_id=" + org + "&limit=100"),
    enabled: !!org,
  });
  const parcels = useQuery({
    queryKey: ["parcels", farm],
    queryFn: () => api("/parcels?farm_id=" + farm + "&limit=100"),
    enabled: !!farm,
  });
  useEffect(() => {
    if (!farm && list(farms.data)[0]) setFarm(list(farms.data)[0].id);
  }, [farm, farms.data]);
  useEffect(() => {
    if (org && !farms.isPending && !list(farms.data).length) setCreatingFarm(true);
  }, [org, farms.isPending, farms.data]);
  useEffect(() => {
    if (!parcel && list(parcels.data)[0]) setParcel(list(parcels.data)[0].id);
  }, [parcel, parcels.data]);
  const f = list(farms.data).find((x) => x.id === farm),
    p = list(parcels.data).find((x) => x.id === parcel);
  const refresh = () => q.invalidateQueries();
  const role = list(me.data?.memberships).find((x) => x.organization_id === org)?.role;
  const writable = role === "owner" || role === "editor";
  const isApps = location.pathname === "/apps";
  const isServices = location.pathname.startsWith("/servicios");
  const isManagement = location.pathname.startsWith("/gestion");
  const isNotebook = location.pathname.startsWith("/cuaderno");
  const navLinks: [string, string][] = isServices
    ? [["/servicios/solicitar", "Solicitar"], ["/servicios/historial", "Historial"]]
    : isManagement
      ? [["/gestion", "Fincas y parcelas"]]
      : isNotebook
        ? [["/cuaderno", "Registrar actividad"]]
        : [["/admin", "Vista general"], ["/clima", "Meteorología"], ["/ndvi", "Desarrollo"]];
  if (isApps) return (
    <div className="module-shell">
      <header className="module-topbar">
        <div className="brand"><span className="brand-mark">S<span>↗</span></span><span>surcovisor<small>EL CAMPO, EN PERSPECTIVA</small></span></div>
        <div className="top-right"><span className="user-label"><span className="user-avatar">{email.charAt(0).toUpperCase()}</span><span>{email}</span></span><span className="today">{new Date().toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" })}</span><button className="logout-button" onClick={() => supabase!.auth.signOut()} title={`Cerrar sesión de ${email}`}>Cerrar sesión</button></div>
      </header>
      <main className="workspace module-workspace"><ModuleHub /></main>
      <footer>SurcoVisor · USD · hectáreas · Información meteorológica modelada y observaciones satelitales sujetas a disponibilidad.</footer>
    </div>
  );
  return (
    <>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">S<span>↗</span></span>
          <span>surcovisor<small>EL CAMPO, EN PERSPECTIVA</small></span>
        </div>
        <div className="workspace-label">{isServices ? "SERVICIOS" : isManagement ? "GESTIÓN" : isNotebook ? "NOTEBOOK" : "ÍNDICES"}</div>
        <nav>
          {!isApps && <NavLink className="nav-item module-back" to="/apps"><span className="nav-icon" aria-hidden="true">←</span><span>Módulos</span></NavLink>}
          {navLinks.map(([to, label]) => (
            <NavLink className={({isActive}) => "nav-item" + (isActive ? " active" : "")} end={to === "/admin"} key={to} to={to}>
              <NavGlyph to={to === "/gestion" ? "/fincas" : to.startsWith("/servicios") ? "/fumigaciones" : to} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="app-shell">
        <header className="topbar"><div className="context">
          <label>
            FINCA
            <select
              value={farm}
              onChange={(e) => {
                setFarm(e.target.value);
                setParcel("");
              }}
            >
              <option value="">Selecciona una finca</option>
              {list(farms.data).map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <span className="divider" />
          <label>
            PARCELA
            <select value={parcel} onChange={(e) => setParcel(e.target.value)}>
              <option value="">Selecciona una parcela</option>
              {list(parcels.data).map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          </div><div className="top-right"><span className="demo-tag">MI EXPLOTACIÓN</span><span className="today">{new Date().toLocaleDateString("es-EC",{day:"numeric",month:"short",year:"numeric"})}</span><button className="logout-button" onClick={() => supabase!.auth.signOut()} title={`Cerrar sesión de ${email}`}>Cerrar sesión</button></div></header>
        <main className="workspace">
        <ErrorBox error={me.error || farms.error || parcels.error} />
        {me.isPending ? (
          <p>Cargando organizaciones…</p>
        ) : !org ? (
          <section className="card">
            <h2>Preparando tu explotación</h2>
            <p>Estamos configurando el espacio para tus fincas y parcelas. Vuelve a intentarlo en unos segundos.</p>
            <button className="button" onClick={() => me.refetch()}>Volver a intentar</button>
          </section>
        ) : (
          <Routes>
            <Route
              path="/admin"
              element={
                <Dashboard
                  farm={f}
                  parcel={p}
                  farms={farms.data}
                  parcels={parcels.data}
                  p={p}
                />
              }
            />
            <Route
              path="/gestion"
              element={
                <>
                  <section className="card">
                    <h2>{creatingFarm || !farm ? "Nueva finca" : "Finca seleccionada"}</h2>
                    <p>{creatingFarm || !farm ? "Registra una finca para comenzar a crear sus parcelas." : "Edita el nombre de la finca seleccionada."}</p>
                    {writable && (
                      <SaveForm
                        key={(creatingFarm || !farm ? "new" : farm) + f?.name}
                        submitLabel={creatingFarm || !farm ? "Crear finca" : "Guardar cambios"}
                        secondaryAction={farm ? <button type="button" className="ghost" onClick={() => setCreatingFarm(!creatingFarm)}>{creatingFarm ? "Cancelar" : "Crear nueva finca"}</button> : undefined}
                        onSave={async (b) => {
                          const create = creatingFarm || !farm;
                          const r = await api("/farms" + (!create ? "/" + farm : ""), create ? "POST" : "PATCH", {
                            ...b,
                            ...(create ? { organization_id: org } : {}),
                          });
                          setFarm(r.id);
                          setParcel("");
                          setCreatingFarm(false);
                          await refresh();
                        }}
                      >
                        <Field label="Nombre de finca" name="name" defaultValue={creatingFarm || !farm ? "" : f?.name || ""} required />
                      </SaveForm>
                    )}
                  </section>
                  {farm && (
                    <ParcelEditor
                      org={org}
                      farm={farm}
                      parcel={p}
                      writable={writable}
                      saved={async (id) => {
                        setParcel(id);
                        await refresh();
                      }}
                    />
                  )}
                </>
              }
            />
            <Route
              path="/campanas"
              element={
                <Records
                  kind="seasons"
                  org={org}
                  parcel={parcel}
                  writable={writable}
                />
              }
            />
            <Route
              path="/cuaderno"
              element={
                <Records
                  kind="events"
                  org={org}
                  parcel={parcel}
                  writable={writable}
                />
              }
            />
            <Route path="/clima" element={<Weather parcel={parcel} />} />
            <Route
              path="/ndvi"
              element={
                <Ndvi
                  parcel={parcel}
                  geometry={p?.geometry_geojson}
                  latitude={p?.latitude}
                  writable={writable}
                />
              }
            />
            <Route
              path="/servicios/*"
              element={
                <Fumigations
                  organizationId={org}
                  farmId={farm}
                  farmName={f?.name}
                  parcelId={parcel}
                  parcelName={p?.name}
                  geometry={p?.geometry_geojson}
                  writable={writable}
                />
              }
            />
            <Route path="*" element={<p>Página no encontrada.</p>} />
          </Routes>
        )}
        </main>
        <footer>
          SurcoVisor · USD · hectáreas · Información meteorológica
          modelada y observaciones satelitales sujetas a disponibilidad.
        </footer>
      </div>
    </>
  );
}
function SaveForm({
  children,
  secondaryAction,
  submitLabel = "Guardar",
  onSave,
}: {
  children: React.ReactNode;
  secondaryAction?: React.ReactNode;
  submitLabel?: string;
  onSave: (data: Record<string, any>) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [ok, setOk] = useState(false);
  return (
    <form
      className="form-grid"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setOk(false);
        try {
          await onSave(Object.fromEntries(new FormData(e.currentTarget)));
          setOk(true);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {children}
      <div className="form-actions">
        <button disabled={busy}>{busy ? "Guardando…" : submitLabel}</button>
        {secondaryAction}
      </div>
      {ok && <p className="form-success" role="status">Guardado correctamente.</p>}
      <ErrorBox error={error} />
    </form>
  );
}
function ParcelEditor({
  org,
  farm,
  parcel,
  writable,
  saved,
}: {
  org: string;
  farm: string;
  parcel: any;
  writable: boolean;
  saved: (id: string) => Promise<void>;
}) {
  const [geometry, setGeometry] = useState<any>(null),
    [edit, setEdit] = useState(false),
    [showExisting, setShowExisting] = useState(true);
  useEffect(() => {
    setEdit(Boolean(parcel));
    setGeometry(null);
    setShowExisting(true);
  }, [parcel?.id, farm]);
  const selectedGeometry = showExisting ? (geometry || parcel?.geometry_geojson) : geometry;
  const coordinates = edit && !geometry && showExisting && parcel?.latitude != null && parcel?.longitude != null ? parcel : null;
  return (
    <section className="card">
      <h2>{edit ? "Parcela seleccionada" : "Nueva parcela"}</h2>
      <p>{edit ? "Edita los datos y el contorno de la parcela seleccionada." : "Dibuja el contorno de una nueva parcela. La superficie se calcula en el servidor."}</p>
      {writable && parcel && (
        <button
          className="ghost"
          onClick={() => {
            setEdit(!edit);
            setGeometry(!edit ? parcel.geometry_geojson : null);
            setShowExisting(!edit);
          }}
        >
          {edit ? "Crear nueva parcela" : "Editar parcela seleccionada"}
        </button>
      )}
      <ParcelMap
        geometry={selectedGeometry}
        onChange={writable ? setGeometry : undefined}
        onDrawingStart={() => setShowExisting(false)}
      />
      {coordinates && (
        <div className="parcel-coordinate-cards" aria-label="Centroide de la parcela guardada">
          <div><span>Latitud del centroide</span><strong>{Number(coordinates.latitude).toFixed(6)}</strong></div>
          <div><span>Longitud del centroide</span><strong>{Number(coordinates.longitude).toFixed(6)}</strong></div>
        </div>
      )}
      {edit && !geometry && parcel?.area_ha != null && (
        <p>Superficie de la parcela guardada: <strong>{Number(parcel.area_ha).toLocaleString("es-EC", { maximumFractionDigits: 2 })} ha</strong> ({Math.round(Number(parcel.area_ha) * 10000).toLocaleString("es-EC")} m²).</p>
      )}
      {geometry && <p>Las coordenadas del centroide se calcularán al guardar el contorno.</p>}
      {writable && (
        <SaveForm
          key={String(edit) + parcel?.id}
          submitLabel={edit ? "Guardar cambios" : "Crear parcela"}
          onSave={async (b) => {
            const contour = geometry || (edit && showExisting ? parcel?.geometry_geojson : null);
            if (!contour) throw Error("Dibuja el contorno antes de guardar.");
            const r = await api(
              "/parcels" + (edit ? "/" + parcel.id : ""),
              edit ? "PATCH" : "POST",
              {
                ...b,
                ...(!edit ? { organization_id: org, farm_id: farm } : {}),
                geometry: contour,
              },
            );
            await saved(r.id);
            setGeometry(null);
            setShowExisting(true);
            setEdit(true);
          }}
        >
          <Field
            label={edit ? "Nombre de parcela" : "Nombre de nueva parcela"}
            name="name"
            defaultValue={edit ? parcel?.name : ""}
            required
          />
        </SaveForm>
      )}
    </section>
  );
}
const laborTypes = [
  ["irrigation", "Riego"],
  ["fertilization", "Fertilización"],
  ["treatment", "Fumigación / tratamiento"],
  ["inspection", "Inspección"],
  ["harvest", "Cosecha"],
  ["note", "Nota"],
] as const;
function Records({
  kind,
  org,
  parcel,
  writable,
}: {
  kind: "events" | "seasons";
  org: string;
  parcel: string;
  writable: boolean;
}) {
  const q = useQueryClient(),
    [page, setPage] = useState(1),
    [filter, setFilter] = useState(""),
    [edit, setEdit] = useState<any>(null),
    [formOpen, setFormOpen] = useState(false),
    dialogRef = useRef<HTMLDialogElement>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (formOpen && !dialog.open) dialog.showModal();
    if (!formOpen && dialog.open) dialog.close();
  }, [formOpen]);
  useEffect(() => {
    setPage(1);
    setEdit(null);
  }, [parcel, kind, filter]);
  const rows = useQuery({
    queryKey: [kind, parcel, page, filter],
    queryFn: () =>
      api(
        `/${kind}?parcel_id=${parcel}&page=${page}&limit=20${filter ? "&type=" + filter : ""}`,
      ),
    enabled: !!parcel,
  });
  const seasons = useQuery({
    queryKey: ["season-options", parcel],
    queryFn: () => api("/seasons?parcel_id=" + parcel + "&limit=100"),
    enabled: !!parcel && kind === "events",
  });
  if (!parcel)
    return (
      <section className="card">
        Selecciona o crea una parcela para continuar.
      </section>
    );
  return (
    <div
      className={
        kind === "events" ? "records-page notebook-page" : "records-page"
      }
    >
      {kind === "events" && (
        <div className="records-hero">
          <div>
            <span className="eyebrow">CUADERNO DE CAMPO</span>
            <h1>Lo que haces, queda registrado.</h1>
            <p>Labores y observaciones de tu lote, en un mismo cuaderno.</p>
          </div>
          <button
            onClick={() => {
              setEdit(null);
              setFormOpen(true);
            }}
          >
            + Registrar labor
          </button>
        </div>
      )}
      <section className="card records-card">
        <div className="records-card-head">
          <h2>
            {kind === "events" ? (
              <>
                Registros de {"Lote " + (parcel ? "seleccionado" : "")}{" "}
                <span className="count-badge">{list(rows.data).length}</span>
              </>
            ) : (
              "Campañas de cultivo"
            )}
          </h2>
          {kind === "events" && (
            <button
              className="ghost export-button"
              onClick={() =>
                exportEvents(parcel, org).catch((e) => setError(e.message))
              }
            >
              ↓ Exportar CSV
            </button>
          )}
        </div>
        {kind === "events" && (
          <div className="toolbar records-toolbar">
            <label>
              Tipo de labor
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">Todas</option>
                {laborTypes.map(([value, label]) => (
                  <option key={value + label} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <span className="storage-note">
              Guardado en el backend de tu organización
            </span>
          </div>
        )}
        {writable && formOpen && (
          <dialog ref={dialogRef} className="entry-dialog" onCancel={() => setFormOpen(false)}>
            <div className="dialog-top">
              <div>
                <p className="eyebrow">CUADERNO DE CAMPO</p>
                <h2>{edit ? "Editar registro" : "Registrar una labor"}</h2>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setFormOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="dialog-form-body">
              {kind === "events" && (
                <p className="dialog-context">
                  Lote seleccionado · Parcela activa
                </p>
              )}
              <SaveForm
                key={edit?.id || "new"}
                secondaryAction={
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => edit ? setEdit(null) : setFormOpen(false)}
                  >
                    {edit ? "Cancelar edición" : "Cancelar"}
                  </button>
                }
                onSave={async (b) => {
                  const body: any = { ...b };
                  for (const key of Object.keys(body))
                    if (body[key] === "") delete body[key];
                  if (kind === "events" && body.cost_usd !== undefined)
                    body.cost_usd = Number(body.cost_usd);
                  if (kind === "events" && body.dose !== undefined)
                    body.dose = Number(body.dose);
                  await api(
                    "/" + kind + (edit ? "/" + edit.id : ""),
                    edit ? "PATCH" : "POST",
                    {
                      ...body,
                      ...(!edit
                        ? { organization_id: org, parcel_id: parcel }
                        : {}),
                    },
                  );
                  setEdit(null);
                  setFormOpen(false);
                  await q.invalidateQueries({ queryKey: [kind] });
                  await q.invalidateQueries({ queryKey: ["season-options"] });
                }}
              >
                {kind === "seasons" ? (
                  <>
                    <Field
                      label="Cultivo"
                      name="crop"
                      defaultValue={edit?.crop}
                      required
                    />
                    <Field
                      label="Variedad"
                      name="variety"
                      defaultValue={edit?.variety}
                    />
                    <Field
                      label="Fecha de inicio"
                      type="date"
                      name="start_date"
                      defaultValue={edit?.start_date}
                      required
                    />
                    <Field
                      label="Fecha final"
                      type="date"
                      name="end_date"
                      defaultValue={edit?.end_date}
                    />
                    <label>
                      Estado
                      <select
                        name="status"
                        defaultValue={edit?.status || "active"}
                      >
                        <option value="active">Activa</option>
                        <option value="completed">Completada</option>
                        <option value="planned">Planificada</option>
                      </select>
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      Tipo de labor
                      <select name="type" defaultValue={edit?.type}>
                        {laborTypes.map(([value, label]) => (
                          <option key={value + label} value={value}>{label}</option>
                        ))}
                      </select>
                    </label>
                    <Field
                      label="Fecha"
                      type="date"
                      name="event_date"
                      defaultValue={edit?.event_date}
                      required
                    />
                    <label className="dialog-wide-field">
                      Observación
                      <textarea
                        name="notes"
                        defaultValue={edit?.notes}
                        placeholder="¿Qué has hecho u observado en el lote?"
                        required
                      />
                    </label>
                    <Field
                      label="Producto (opcional)"
                      name="product"
                      defaultValue={edit?.product}
                      placeholder="Ej. Agua"
                    />
                    <Field
                      label="Dosis (opcional)"
                      name="dose"
                      type="number"
                      min="0"
                      step="any"
                      defaultValue={edit?.dose}
                      placeholder="Ej. 20"
                    />
                    <Field label="Unidad (opcional)" name="unit" defaultValue={edit?.unit} placeholder="Ej. mm" />
                    <Field
                      label="Coste total (USD)"
                      type="number"
                      min="0"
                      step="0.01"
                      name="cost_usd"
                      defaultValue={edit?.cost_usd || 0}
                    />
                  </>
                )}
              </SaveForm>
            </div>
          </dialog>
        )}
        <ErrorBox error={rows.error || error} />
        {kind === "events" && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Labor</th>
                  <th>Observación</th>
                  <th>Producto / dosis</th>
                  <th>Coste (USD)</th>
                </tr>
              </thead>
              <tbody>
                {list(rows.data).map((x) => (
                  <tr key={x.id}>
                    <td>{x.event_date}</td>
                    <td>
                      <span className="tag">{laborTypes.find(([value]) => value === x.type)?.[1] || x.type}</span>
                    </td>
                    <td className="description">{x.notes || "—"}</td>
                    <td>
                      {x.product || "—"}
                      <br />
                      <span className="meta">
                        {x.dose != null ? `${x.dose} ${x.unit || ""}` : ""}
                      </span>
                    </td>
                    <td>
                      {x.cost_usd != null ? Number(x.cost_usd).toFixed(2) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.isPending && !list(rows.data).length && (
              <div className="empty">
                No hay registros de este tipo. Añade una labor para comenzar.
              </div>
            )}
          </div>
        )}
        {rows.isPending ? (
          <p>Cargando…</p>
        ) : kind === "events" ? null : !list(rows.data).length ? (
          <p className="empty">Todavía no hay registros.</p>
        ) : (
          list(rows.data).map((x) => (
            <article className="record" key={x.id}>
              <div>
                <h3>{x.crop || x.type}</h3>
                <p>
                  {x.start_date || x.event_date}{" "}
                  {x.end_date && " → " + x.end_date} ·{" "}
                  {x.variety || x.notes || x.status}
                </p>
                {x.cost_usd != null && (
                  <span>{Number(x.cost_usd).toFixed(2)} USD</span>
                )}
              </div>
              {writable && (
                <button className="ghost" onClick={() => setEdit(x)}>
                  Editar
                </button>
              )}
            </article>
          ))
        )}
        <div className="toolbar">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Anterior
          </button>
          <span>Página {page}</span>
          <button
            disabled={list(rows.data).length < 20}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </div>
      </section>
    </div>
  );
}
function Photos({ event, writable }: { event: string; writable: boolean }) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const q = useQueryClient();
  const photos = useQuery({
    queryKey: ["photos", event],
    queryFn: () => api(`/events/${event}/attachments`),
    enabled: open,
  });
  return (
    <details className="photos" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>Fotos privadas</summary>
      <div className="gallery">
        {list(photos.data).map(
          (x) =>
            x.url && (
              <a href={x.url} key={x.id} target="_blank" rel="noreferrer">
                <img src={x.url} alt="Foto de la labor" loading="lazy" />
              </a>
            ),
        )}
      </div>
      <ErrorBox error={error || photos.error} />
      {writable && (
        <label className="upload">
          {busy ? "Subiendo…" : "Añadir foto (máx. 10 MB)"}
          <input
            type="file"
            disabled={busy}
            accept="image/jpeg,image/png,image/webp"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError("");
              setBusy(true);
              try {
                if (
                  file.size > 10 * 1024 * 1024 ||
                  !["image/jpeg", "image/png", "image/webp"].includes(file.type)
                )
                  throw Error("Usa JPEG, PNG o WebP de hasta 10 MB");
                const r = await api(`/events/${event}/attachments`, "POST", {
                  mime_type: file.type,
                  size_bytes: file.size,
                });
                const upload = await fetch(r.upload_url, {
                  method: "PUT",
                  headers: { "Content-Type": file.type },
                  body: file,
                });
                if (!upload.ok) throw Error("La carga no se completó");
                await api(
                  `/events/${event}/attachments/${r.attachment.id}/complete`,
                  "POST",
                  {},
                );
                await q.invalidateQueries({ queryKey: ["photos", event] });
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
                e.target.value = "";
              }
            }}
          />
        </label>
      )}
    </details>
  );
}
function Weather({ parcel }: { parcel: string }) {
  const [period, setPeriod] = useState(0);
  const r = useQuery({
    queryKey: ["weather", parcel, period],
    queryFn: () => api(`/parcels/${parcel}/weather?past_days=${period}`),
    enabled: !!parcel,
  });
  if (!parcel) return <section className="card">Selecciona una parcela.</section>;
  const snapshot = r.data?.data,
    data = snapshot?.payload,
    daily = data?.daily;
  return (
    <section className="card">
      <h2>Meteorología de tu parcela</h2>
      <p>
        Previsión modelada de Open-Meteo. No representa una estación de medición
        en la parcela; utiliza una celda cercana al centroide.
      </p>
      <label>Período
        <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
          <option value={0}>Pronóstico de 7 días</option>
          <option value={15}>Últimos 15 días</option>
          <option value={30}>Últimos 30 días</option>
        </select>
      </label>
      <ErrorBox error={r.error} />
      {r.isPending ? (
        <p>Consultando previsión…</p>
      ) : (
        <>
          <p>
            Estado:{" "}
            {r.data?.status === "fresh"
              ? "actualizado"
              : r.data?.status === "stale"
                ? "datos anteriores; el proveedor no respondió"
                : "no disponible"}{" "}
            ·{" "}
            {snapshot?.fetched_at &&
              new Date(snapshot.fetched_at).toLocaleString("es-EC")}
          </p>
          {period === 0 && data?.current && (
            <div className="stats">
              <div>
                <strong>{data.current.temperature_2m ?? "—"} °C</strong>
                <small>Temperatura</small>
              </div>
              <div>
                <strong>{data.current.relative_humidity_2m ?? "—"} %</strong>
                <small>Humedad relativa</small>
              </div>
              <div>
                <strong>{data.current.precipitation ?? "—"} mm</strong>
                <small>Precipitación</small>
              </div>
            </div>
          )}
          {daily?.time && data?.current?.time && (
            <>
            <p>{period ? "Estimaciones históricas modeladas; no son mediciones de una estación." : "Pronóstico diario modelado."}{snapshot?.timezone && ` Zona horaria: ${snapshot.timezone}.`}</p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Día</th>
                    <th>Mínima</th>
                    <th>Máxima</th>
                    <th>Lluvia</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.time.map((d: string, i: number) => ({d, i})).filter(({d}: {d: string}) => period ? d < data.current.time.slice(0, 10) : d >= data.current.time.slice(0, 10)).map(({d, i}: {d: string, i: number}) => (
                    <tr key={d}>
                      <td>{d}</td>
                      <td>{daily.temperature_2m_min?.[i] ?? "—"} °C</td>
                      <td>{daily.temperature_2m_max?.[i] ?? "—"} °C</td>
                      <td>{daily.precipitation_sum?.[i] ?? "—"} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
          <button className="ghost" onClick={() => r.refetch()}>
            Volver a consultar
          </button>
        </>
      )}
    </section>
  );
}
function Ndvi({
  parcel,
  geometry,
  latitude,
  writable,
}: {
  parcel: string;
  geometry: any;
  latitude?: number | null;
  writable: boolean;
}) {
  const q = useQueryClient(),
    [jobId, setJobId] = useState(""),
    [error, setError] = useState(""),
    [selected, setSelected] = useState(""),
    [compareId, setCompareId] = useState(""),
    [fromDate, setFromDate] = useState(""),
    [toDate, setToDate] = useState(""),
    [showAll, setShowAll] = useState(false);
  const r = useQuery({
    queryKey: ["ndvi", parcel],
    queryFn: () => api(`/parcels/${parcel}/ndvi`),
    enabled: !!parcel,
  });
  const job = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => api("/jobs/" + jobId),
    enabled: !!jobId,
    refetchInterval: (query) =>
      ["completed", "failed", "obsolete"].includes(query.state.data?.status) ? false : 5000,
  });
  useEffect(() => {
    setSelected("");
    setCompareId("");
    setFromDate("");
    setToDate("");
    setJobId("");
    setShowAll(false);
  }, [parcel]);
  useEffect(() => {
    if (job.data?.status === "completed") {
      q.invalidateQueries({ queryKey: ["ndvi", parcel] });
      q.invalidateQueries({ queryKey: ["dashboard-ndvi", parcel] });
    }
  }, [job.data?.status, parcel, q]);
  if (!parcel)
    return <section className="card">Selecciona una parcela.</section>;
  const observations = list(r.data),
    visibleObservations = showAll ? observations : observations.slice(0, 4),
    observation =
      visibleObservations.find((x) => x.id === selected) || visibleObservations[0],
    comparison = observations.find((x) => x.id === compareId);
  return (
    <section className="card">
      <h2>Salud vegetal · NDVI</h2>
      <p>
        Sentinel-2 L2A · El índice describe vigor vegetal; no es un diagnóstico
        agronómico. Nubes y sombras pueden impedir observaciones válidas.
      </p>
      <details className="satellite-guide">
        <summary>Cómo interpretar las imágenes y los índices</summary>
        <p>Sentinel-2 forma parte del programa europeo Copernicus. Sus imágenes permiten seguir cambios en la vegetación; la disponibilidad depende del paso del satélite y de las nubes. Los píxeles pueden mezclar distintos elementos del terreno y no sustituyen una visita a la parcela.</p>
        <p><strong>NDVI</strong> = (infrarrojo cercano − rojo) / (infrarrojo cercano + rojo). Sentinel-2 usa B08 y B04. Es útil para observar diferencias de vigor, pero puede saturarse en vegetación densa y no identifica la causa de una anomalía.</p>
        <p>Otros índices de referencia, todavía sin cálculo por parcela en esta pantalla:</p>
        <ul>
          <li><strong>EVI:</strong> utiliza azul, rojo e infrarrojo cercano; ayuda a estudiar vegetación densa y requiere reflectancias correctamente escaladas.</li>
          <li><strong>NDMI:</strong> usa infrarrojo cercano e infrarrojo de onda corta; refleja cambios relacionados con el agua de la vegetación, no mide directamente la humedad del suelo.</li>
          <li><strong>SAVI:</strong> utiliza rojo e infrarrojo cercano e incorpora un ajuste para reducir la influencia del suelo; ese ajuste depende del contexto.</li>
          <li><strong>NDRE:</strong> usa el borde rojo y el infrarrojo cercano para explorar variaciones relacionadas con la vegetación; no diagnostica carencias por sí solo.</li>
        </ul>
        <p>Los valores dependen del cultivo, su etapa, el suelo y la fecha. Si aparece una diferencia, úsala para orientar una inspección en campo.</p>
      </details>
      <ErrorBox error={r.error || job.error || error} />
      {r.data?.configured === false && (
        <p className="notice">
          La integración satelital aún no está configurada en el servidor. Se
          necesitan credenciales de Copernicus Data Space.
        </p>
      )}
      {writable && (
        <div className="ndvi-request">
        <details>
          <summary>Consultar otro período</summary>
          <p>Deja ambas fechas vacías para actualizar el período reciente. Puedes consultar un intervalo de hasta 366 días.</p>
          <div className="ndvi-request-dates">
            <label>Desde<input type="date" value={fromDate} max={toDate || new Date().toISOString().slice(0,10)} onChange={(e) => setFromDate(e.target.value)} /></label>
            <label>Hasta<input type="date" value={toDate} min={fromDate || undefined} max={new Date().toISOString().slice(0,10)} onChange={(e) => setToDate(e.target.value)} /></label>
          </div>
        </details>
        <button
          disabled={
            r.data?.configured === false ||
            (!!jobId && !["completed", "failed", "obsolete"].includes(job.data?.status))
          }
          onClick={async () => {
            setError("");
            try {
              if (Boolean(fromDate) !== Boolean(toDate)) throw Error("Selecciona tanto la fecha inicial como la final.");
              if (fromDate && (fromDate > toDate || Date.parse(toDate) - Date.parse(fromDate) > 366 * 86400000)) throw Error("Selecciona un período válido de hasta 366 días.");
              const j = await api(
                `/parcels/${parcel}/ndvi/refresh`,
                "POST",
                fromDate ? { from_date: fromDate, to_date: toDate } : {},
              );
              setJobId(j.id);
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Actualizar observaciones
        </button>
        </div>
      )}
      {job.data && (
        <p role="status">
          Procesamiento: {({queued: "en espera", processing: "en curso", completed: "completado", failed: "no se pudo completar", obsolete: "contorno modificado; solicita una nueva actualización"} as Record<string, string>)[job.data.status] || job.data.status}
          {job.data.last_error && " · " + job.data.last_error}
        </p>
      )}
      {job.data?.status === "queued" && job.data?.created_at && Date.now() - Date.parse(job.data.created_at) > 120000 && (
        <p className="notice" role="status">La solicitud sigue en espera. Si no avanza, es necesario revisar que el proceso satelital esté activo.</p>
      )}
      {r.isPending ? (
        <p>Cargando observaciones…</p>
      ) : !observations.length ? (
        <p className="empty">
          No hay observaciones disponibles. Solicita el procesamiento de la
          parcela.
        </p>
      ) : (
        <>
          <label>
            Ventana de observación
            <select
              value={observation?.id || ""}
              onChange={(e) => setSelected(e.target.value)}
            >
              {visibleObservations.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.from_date} — {x.to_date} · {({valid: "píxeles disponibles válidos", low_coverage: "pocos píxeles válidos", no_data: "sin datos"} as Record<string, string>)[x.quality] || x.quality}
                </option>
              ))}
            </select>
          </label>
          {observations.length > 4 && <button type="button" className="ghost ndvi-history-toggle" onClick={() => { setShowAll(!showAll); setSelected(""); }}>{showAll ? "Mostrar las cuatro más recientes" : "Ver todas las fechas disponibles"}</button>}
          <div className="stats">
            <div>
              <strong>
                {observation?.ndvi_mean == null
                  ? "—"
                  : Number(observation.ndvi_mean).toFixed(3)}
              </strong>
              <small>NDVI medio</small>
            </div>
            <div>
              <strong>
                {(Number(observation?.valid_fraction || 0) * 100).toFixed(0)} %
              </strong>
              <small>Píxeles válidos entre los disponibles</small>
            </div>
            <div>
              <strong>{({valid: "Válida", low_coverage: "Limitada", no_data: "Sin datos"} as Record<string, string>)[observation?.quality] || "—"}</strong>
              <small>Calidad técnica</small>
            </div>
          </div>
          <p>NDVI mínimo: {observation?.ndvi_min == null ? "—" : Number(observation.ndvi_min).toFixed(3)} · máximo: {observation?.ndvi_max == null ? "—" : Number(observation.ndvi_max).toFixed(3)} · desviación estándar: {observation?.ndvi_stddev == null ? "no disponible" : Number(observation.ndvi_stddev).toFixed(3)}.</p>
          <p>Mediana NDVI: {observation?.ndvi_median == null ? "no disponible" : Number(observation.ndvi_median).toFixed(3)}.</p>
          {Array.isArray(observation?.ndvi_histogram) && observation.ndvi_histogram.length > 0 && <div className="ndvi-histogram">
            <h3>Distribución de píxeles válidos</h3>
            <p>Porcentaje de píxeles válidos en cada intervalo; no representa un diagnóstico. La superficie es una aproximación basada en la cuadrícula de cálculo: los píxeles del borde pueden hacer que difiera de la superficie de la parcela.</p>
            {observation.ndvi_histogram.map((bin: any, index: number) => {
              const total = observation.ndvi_histogram.reduce((sum: number, item: any) => sum + (Number(item.count) || 0), 0);
              const percentage = total ? Number(bin.count || 0) / total * 100 : 0;
              const cellAreaHa = latitude == null ? null : Math.pow(111320 * 0.0001, 2) * Math.cos(Number(latitude) * Math.PI / 180) / 10000;
              return <div className="ndvi-histogram-row" key={index}><span>{Number(bin.low).toFixed(1)} a {Math.min(1, Number(bin.high)).toFixed(1)}</span><div className="ndvi-histogram-track"><div style={{width: `${percentage}%`}} /></div><span>{Number(bin.count || 0)} · {percentage.toFixed(1)} %{cellAreaHa != null && <> · ≈{(Number(bin.count || 0) * cellAreaHa).toFixed(2)} ha</>}</span></div>;
            })}
          </div>}
          {observations.length > 1 && <div className="ndvi-comparison">
            <label>Comparar con otra fecha
              <select value={compareId} onChange={(e) => setCompareId(e.target.value)}>
                <option value="">Selecciona una fecha</option>
                {observations.filter((x) => x.id !== observation?.id).map((x) => <option key={x.id} value={x.id}>{x.from_date} — {x.to_date}</option>)}
              </select>
            </label>
            {comparison && (comparison.id === observation?.id ? <p className="notice">Selecciona dos fechas distintas.</p> : observation?.ndvi_mean == null || comparison.ndvi_mean == null || Number(observation.valid_fraction) < 0.7 || Number(comparison.valid_fraction) < 0.7 ? <p className="notice">No se muestra la diferencia: una de las fechas no tiene datos o tiene menos del 70 % de píxeles válidos entre los disponibles.</p> : <p>Diferencia del NDVI medio ({observation.from_date} frente a {comparison.from_date}): <strong>{(Number(observation.ndvi_mean) - Number(comparison.ndvi_mean)).toFixed(3)}</strong>. Compárala con cautela: las zonas sin datos pueden variar entre fechas y el índice no es un diagnóstico.</p>)}
          </div>}
          <div
            className="chart"
            aria-label="Seleccionar una fecha del histórico NDVI"
          >
            <span>NDVI</span>
            {[...visibleObservations].reverse().filter((x) => x.ndvi_mean != null).map((x) => (
              <button
                key={x.id}
                title={`${x.from_date}: ${x.ndvi_mean ?? "sin datos"} (${x.quality})`}
                aria-label={`${x.from_date}: NDVI ${Number(x.ndvi_mean).toFixed(3)}`}
                aria-pressed={observation?.id === x.id}
                onClick={() => setSelected(x.id)}
                style={{
                  height: `${Math.max(4, (Number(x.ndvi_mean) + 1) * 65)}px`,
                  opacity: x.quality === "valid" ? 1 : 0.5,
                }}
              >
                <span>{x.from_date?.slice(5)}</span>
              </button>
            ))}
          </div>
          <p>
            La proporción de píxeles válidos solo considera las zonas con datos de origen; no demuestra que toda la parcela esté cubierta. Las ventanas pueden incluir mosaicos de varias adquisiciones.
          </p>
        </>
      )}
      <ParcelMap
        geometry={geometry}
        overlay={
          observation?.ndvi_raster_url && observation.bounds
            ? {
                url: observation.ndvi_raster_url,
                bounds: [
                  [observation.bounds[1], observation.bounds[0]],
                  [observation.bounds[3], observation.bounds[2]],
                ],
              }
            : undefined
        }
      />
      {observation?.ndvi_raster_url && observation.bounds && <div className="ndvi-legend" aria-label="Leyenda del mapa NDVI"><strong>Escala NDVI</strong><div className="ndvi-legend-gradient"/><div className="ndvi-legend-labels"><span>≤ −0,2</span><span>0,3</span><span>≥ 0,8</span></div><p>Valores relativos de vegetación: los colores muestran variaciones, no identifican la causa. Las zonas transparentes no tienen píxeles válidos.</p></div>}
      {observation && !observation.ndvi_raster_url && (
        <p>
          Mapa raster no disponible para esta observación; se muestra el
          contorno de la parcela.
        </p>
      )}
    </section>
  );
}
function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const recovery = new URLSearchParams(window.location.search).has("recovery");
  return location.pathname === "/" && !recovery
    ? <Landing onLogin={() => navigate("/apps")} />
    : <WorkspaceGate />;
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
