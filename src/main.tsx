import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { HashRouter, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
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
  return (
    <main className="auth">
      <div className="brand">◈ SurcoVisor</div>
      <h1>Tu campo, conectado.</h1>
      <p>
        Gestiona tu finca con información real, desde cualquier lugar de
        Ecuador.
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
                      options: { emailRedirectTo: location.origin },
                    })
                  : mode === "password"
                    ? await supabase!.auth.updateUser({ password })
                    : await supabase!.auth.resetPasswordForEmail(email, {
                        redirectTo: location.origin + "/?recovery=1",
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
        {message && <p role="status">{message}</p>}
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
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => setMode("reset")}
          >
            Olvidé mi contraseña
          </button>
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
function Workspace({ email }: { email: string }) {
  const q = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => api("/me") });
  const [org, setOrg] = useState(""),
    [farm, setFarm] = useState(""),
    [parcel, setParcel] = useState("");
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
    if (!parcel && list(parcels.data)[0]) setParcel(list(parcels.data)[0].id);
  }, [parcel, parcels.data]);
  const f = list(farms.data).find((x) => x.id === farm),
    p = list(parcels.data).find((x) => x.id === parcel);
  const refresh = () => q.invalidateQueries();
  const role = list(me.data?.memberships).find((x) => x.organization_id === org)?.role;
  const writable = role === "owner" || role === "editor";
  return (
    <>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">S<span>↗</span></span>
          <span>surcovisor<small>EL CAMPO, EN PERSPECTIVA</small></span>
        </div>
        <div className="workspace-label">MI EXPLOTACIÓN</div>
        <nav>
          {[
            ["/admin", "Vista general"],
            ["/fincas", "Fincas y parcelas"],
            ["/campanas", "Campañas"],
            ["/cuaderno", "Cuaderno de campo"],
            ["/clima", "Meteorología"],
            ["/ndvi", "Desarrollo"],
            ["/fumigaciones", "Fumigaciones"],
          ].map(([to, label]) => (
            <NavLink className={({isActive}) => "nav-item" + (isActive ? " active" : "")} end={to === "/admin"} key={to} to={to}>
              <NavGlyph to={to} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <NavLink to="/" className="return-home sidebar-home">← Ver página principal</NavLink>
        <div className="sidebar-bottom"><div className="campaign"><span className="tiny">MI ORGANIZACIÓN</span><label className="organization-picker"><span className="sr-only">Organización</span><select value={org} onChange={e=>{setOrg(e.target.value);setFarm("");setParcel("")}}><option value="">Selecciona</option>{orgs.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><span>Crecer empieza por observar.</span></div>
        <div className="account">
          {email}
          <button className="ghost" onClick={() => supabase!.auth.signOut()}>
            Cerrar sesión
          </button>
        </div>
        </div>
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
          </div><div className="top-right"><span className="demo-tag">MI EXPLOTACIÓN</span><span className="today">{new Date().toLocaleDateString("es-EC",{day:"numeric",month:"short",year:"numeric"})}</span></div></header>
        <main className="workspace">
        <ErrorBox error={me.error || farms.error || parcels.error} />
        {me.isPending ? (
          <p>Cargando organizaciones…</p>
        ) : !org ? (
          <section className="card">
            <h2>Empecemos por tu explotación</h2>
            <p>Crea tu organización y después registra tu primera finca.</p>
            <SaveForm
              onSave={async (b) => {
                const r = await api("/organizations", "POST", b);
                setOrg(r.id);
                await refresh();
              }}
            >
              <Field label="Nombre de organización" name="name" required />
            </SaveForm>
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
              path="/fincas"
              element={
                <>
                  <section className="card">
                    <h2>Fincas</h2>
                    {writable && (
                      <SaveForm
                        onSave={async (b) => {
                          const r = await api("/farms", "POST", {
                            ...b,
                            organization_id: org,
                            latitude: Number(b.latitude),
                            longitude: Number(b.longitude),
                          });
                          setFarm(r.id);
                          setParcel("");
                          await refresh();
                        }}
                      >
                        <Field label="Nombre de finca" name="name" required />
                        <Field
                          label="Latitud"
                          name="latitude"
                          type="number"
                          step="any"
                          min="-90"
                          max="90"
                          required
                        />
                        <Field
                          label="Longitud"
                          name="longitude"
                          type="number"
                          step="any"
                          min="-180"
                          max="180"
                          required
                        />
                        <label>
                          Zona horaria
                          <select name="timezone">
                            <option>America/Guayaquil</option>
                            <option>Pacific/Galapagos</option>
                          </select>
                        </label>
                      </SaveForm>
                    )}
                    {f && (
                      <p>
                        {f.name} · {f.latitude}, {f.longitude} · {f.timezone}
                      </p>
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
            <Route path="/clima" element={<Weather farm={farm} />} />
            <Route
              path="/ndvi"
              element={
                <Ndvi
                  parcel={parcel}
                  geometry={p?.geometry_geojson}
                  writable={writable}
                />
              }
            />
            <Route
              path="/fumigaciones"
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
          SurcoVisor · Ecuador · USD · hectáreas · Información meteorológica
          modelada y observaciones satelitales sujetas a disponibilidad.
        </footer>
      </div>
    </>
  );
}
function SaveForm({
  children,
  onSave,
}: {
  children: React.ReactNode;
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
        <button disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
        {ok && <span role="status">Guardado correctamente</span>}
        <ErrorBox error={error} />
      </div>
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
    [edit, setEdit] = useState(false);
  useEffect(() => {
    setEdit(false);
    setGeometry(null);
  }, [parcel?.id, farm]);
  return (
    <section className="card">
      <h2>Parcelas</h2>
      <p>
        Dibuja el contorno o importa un archivo GeoJSON. La superficie se
        calcula en el servidor.
      </p>
      {writable && parcel && (
        <button
          className="ghost"
          onClick={() => {
            setEdit(!edit);
            setGeometry(!edit ? parcel.geometry_geojson : null);
          }}
        >
          {edit ? "Crear nueva parcela" : "Editar parcela seleccionada"}
        </button>
      )}
      <ParcelMap
        geometry={geometry || parcel?.geometry_geojson}
        onChange={writable ? setGeometry : undefined}
      />
      {writable && (
        <SaveForm
          key={String(edit) + parcel?.id}
          onSave={async (b) => {
            if (!geometry)
              throw Error("Dibuja o importa el contorno antes de guardar");
            const r = await api(
              "/parcels" + (edit ? "/" + parcel.id : ""),
              edit ? "PATCH" : "POST",
              {
                ...b,
                ...(!edit ? { organization_id: org, farm_id: farm } : {}),
                geometry,
              },
            );
            await saved(r.id);
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
                {[
                  "riego",
                  "fertilizacion",
                  "tratamiento",
                  "inspeccion",
                  "cosecha",
                  "nota",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <span className="storage-note">
              Guardado en el backend de tu organización
            </span>
          </div>
        )}
        {writable && formOpen && (
          <dialog ref={dialogRef} className="entry-dialog">
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
                onSave={async (b) => {
                  const body: any = { ...b };
                  for (const key of Object.keys(body))
                    if (body[key] === "") delete body[key];
                  if (kind === "events" && body.cost_usd !== undefined)
                    body.cost_usd = Number(body.cost_usd);
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
                        {[
                          "riego",
                          "fertilizacion",
                          "tratamiento",
                          "inspeccion",
                          "cosecha",
                          "nota",
                        ].map((x) => (
                          <option key={x}>{x}</option>
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
                      label="Dosis y unidad (opcional)"
                      name="dose"
                      defaultValue={edit?.dose}
                      placeholder="Ej. 20 mm"
                    />
                    <Field
                      label="Coste total (€)"
                      type="number"
                      min="0"
                      step="0.01"
                      name="cost_usd"
                      defaultValue={edit?.cost_usd || 0}
                    />
                  </>
                )}
              </SaveForm>
              {edit && (
                <button className="ghost" onClick={() => setEdit(null)}>
                  Cancelar edición
                </button>
              )}
              {!edit && (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setFormOpen(false)}
                >
                  Cancelar
                </button>
              )}
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
                  <th>Coste (€)</th>
                </tr>
              </thead>
              <tbody>
                {list(rows.data).map((x) => (
                  <tr key={x.id}>
                    <td>{x.event_date}</td>
                    <td>
                      <span className="tag">{x.type}</span>
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
function Weather({ farm }: { farm: string }) {
  const r = useQuery({
    queryKey: ["weather", farm],
    queryFn: () => api(`/farms/${farm}/weather`),
    enabled: !!farm,
  });
  if (!farm) return <section className="card">Selecciona una finca.</section>;
  const snapshot = r.data?.data,
    data = snapshot?.payload,
    daily = data?.daily;
  return (
    <section className="card">
      <h2>Meteorología de tu finca</h2>
      <p>
        Previsión modelada de Open-Meteo. No representa una estación de medición
        en la finca.
      </p>
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
          {data?.current && (
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
          {daily?.time && (
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
                  {daily.time.map((d: string, i: number) => (
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
  writable,
}: {
  parcel: string;
  geometry: any;
  writable: boolean;
}) {
  const q = useQueryClient(),
    [jobId, setJobId] = useState(""),
    [error, setError] = useState(""),
    [selected, setSelected] = useState("");
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
      ["completed", "failed"].includes(query.state.data?.status) ? false : 5000,
  });
  useEffect(() => {
    setSelected("");
    setJobId("");
  }, [parcel]);
  useEffect(() => {
    if (job.data?.status === "completed")
      q.invalidateQueries({ queryKey: ["ndvi", parcel] });
  }, [job.data?.status, parcel, q]);
  if (!parcel)
    return <section className="card">Selecciona una parcela.</section>;
  const observations = list(r.data),
    observation =
      observations.find((x) => x.id === selected) || observations[0];
  return (
    <section className="card">
      <h2>Salud vegetal · NDVI</h2>
      <p>
        Sentinel-2 L2A · El índice describe vigor vegetal; no es un diagnóstico
        agronómico. Nubes y sombras pueden impedir observaciones válidas.
      </p>
      <ErrorBox error={r.error || job.error || error} />
      {r.data?.configured === false && (
        <p className="notice">
          La integración satelital aún no está configurada en el servidor. Se
          necesitan credenciales de Copernicus Data Space.
        </p>
      )}
      {writable && (
        <button
          disabled={
            r.data?.configured === false ||
            (!!jobId && !["completed", "failed"].includes(job.data?.status))
          }
          onClick={async () => {
            setError("");
            try {
              const j = await api(
                `/parcels/${parcel}/ndvi/refresh`,
                "POST",
                {},
              );
              setJobId(j.id);
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Actualizar últimos 90 días
        </button>
      )}
      {job.data && (
        <p role="status">
          Procesamiento: {job.data.status}
          {job.data.last_error && " · " + job.data.last_error}
        </p>
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
              {observations.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.from_date} — {x.to_date} · {x.quality}
                </option>
              ))}
            </select>
          </label>
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
              <small>Cobertura válida</small>
            </div>
            <div>
              <strong>{observation?.quality}</strong>
              <small>Calidad técnica</small>
            </div>
          </div>
          <div
            className="chart"
            role="img"
            aria-label="Histórico NDVI; altura proporcional al índice"
          >
            <span>NDVI</span>
            {[...observations].reverse().map((x) => (
              <button
                key={x.id}
                title={`${x.from_date}: ${x.ndvi_mean ?? "sin datos"} (${x.quality})`}
                onClick={() => setSelected(x.id)}
                style={{
                  height: `${Math.max(4, (Number(x.ndvi_mean) + 1) * 65)}px`,
                  opacity: x.quality === "good" ? 1 : 0.5,
                }}
              >
                <span>{x.from_date?.slice(5)}</span>
              </button>
            ))}
          </div>
          <p>
            Solo comparar observaciones con cobertura válida ≥70 %. Las ventanas
            pueden incluir mosaicos de varias adquisiciones.
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
    ? <Landing onLogin={() => navigate("/admin")} />
    : <WorkspaceGate />;
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
