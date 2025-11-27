"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Users, UserCheck, UserX, Plus, Trash2, ArrowLeft, RefreshCw } from "lucide-react";

interface Cliente {
  cliente_id: number;
  cliente_nombre: string;
  cliente_email: string;
  plan_nombre?: string;
  fecha_asignacion?: string;
  estado?: string;
  asignacion_id?: number;
  fecha_inscripcion?: string;
}

interface Entrenador {
  entrenador_id: number;
  entrenador_nombre: string;
  entrenador_email: string;
  total_clientes: number;
  clientes_asignados: Cliente[];
}

interface AsignacionesData {
  entrenadores: Entrenador[];
  clientes_sin_asignar: Cliente[];
  total_entrenadores: number;
  total_clientes_sin_asignar: number;
}

export default function AsignacionesEntrenadorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AsignacionesData | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast()
  const [selectedEntrenador, setSelectedEntrenador] = useState<string>("");
  const [selectedCliente, setSelectedCliente] = useState<string>("");
  const [notas, setNotas] = useState("");
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [trainerQuery, setTrainerQuery] = useState<string>("");
  const [assignedQuery, setAssignedQuery] = useState<string>("");
  const [unassignedQuery, setUnassignedQuery] = useState<string>("");

  // Verificar permisos de administrador
  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  const fetchAsignaciones = async () => {
    try {
      setLoading(true);
  const response = await fetch(`/api/asignaciones-entrenador`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener asignaciones");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error:", error);
      toast({ title: 'Error al cargar asignaciones', description: String(error), type: 'error' })
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarCliente = async (clienteId: number) => {
    if (!selectedEntrenador) {
      toast({ title: 'Falta información', description: 'Debe seleccionar un entrenador en la columna izquierda', type: 'error' })
      return;
    }

    try {
      setAssigningLoading(true);
      const response = await fetch(`/api/asignar-entrenador`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_entrenador: parseInt(selectedEntrenador),
          id_cliente: clienteId,
          notas: notas,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Error al asignar entrenador");
      }

      const result = await response.json();
      toast({ title: 'Asignación creada', description: result.message, type: 'success' })

      // Limpiar notas si se desea (no obligatorio)
      // setNotas("");

      // Refrescar datos
      await fetchAsignaciones();
    } catch (error) {
      console.error("Error:", error);
      toast({ title: 'Error al asignar', description: String(error instanceof Error ? error.message : "Error al asignar entrenador"), type: 'error' })
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleAsignar = async () => {
    if (!selectedEntrenador || !selectedCliente) {
      toast({ title: 'Falta información', description: 'Debe seleccionar un entrenador y un cliente', type: 'error' })
      return;
    }

    try {
      setAssigningLoading(true);
  const response = await fetch(`/api/asignar-entrenador`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_entrenador: parseInt(selectedEntrenador),
          id_cliente: parseInt(selectedCliente),
          notas: notas,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Error al asignar entrenador");
      }

      const result = await response.json();
      toast({ title: 'Asignación creada', description: result.message, type: 'success' })
      
      // Limpiar formulario
      setSelectedEntrenador("");
      setSelectedCliente("");
      setNotas("");
      
      // Refrescar datos
      await fetchAsignaciones();
    } catch (error) {
      console.error("Error:", error);
      toast({ title: 'Error al asignar', description: String(error instanceof Error ? error.message : "Error al asignar entrenador"), type: 'error' })
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleDesasignar = async (asignacionId: number) => {
    // Mostrar toast con acciones para confirmar/cancelar
    toast({
      title: 'Confirmar desasignación',
      description: '¿Deseas quitar este cliente del entrenador?',
      type: 'info',
      actions: [
        {
          label: 'Cancelar',
          onClick: () => {
            /* no-op; el toast se cerrará automáticamente */
          }
        },
        {
          label: 'Desasignar',
          onClick: async () => {
            try {
              const response = await fetch(`/api/desasignar-entrenador/${asignacionId}`, {
                method: "DELETE",
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Error al desasignar entrenador");
              }

              const result = await response.json();
              toast({ title: 'Desasignado', description: result.message, type: 'success' })
              await fetchAsignaciones();
            } catch (error) {
              console.error("Error:", error);
              toast({ title: 'Error al desasignar', description: String(error instanceof Error ? error.message : "Error al desasignar entrenador"), type: 'error' })
            }
          }
        }
      ]
    })
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAsignaciones();
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Users className="h-8 w-8" />
                  Gestión de Asignaciones Entrenador-Cliente
                </h1>
                <p className="text-white/90 mt-2">
                  Asigna entrenadores personales a clientes con planes que incluyen este servicio
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/admin")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <div className="text-lg text-gray-600">Cargando asignaciones...</div>
            </div>
          </div>
        ) : (
          <>
            {/* Estadísticas Generales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-700">{data?.total_entrenadores || 0}</div>
                  <div className="text-sm text-blue-600">Entrenadores Disponibles</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-700">
                    {data?.entrenadores.reduce((sum, e) => sum + e.total_clientes, 0) || 0}
                  </div>
                  <div className="text-sm text-green-600">Asignaciones Activas</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-orange-700">{data?.total_clientes_sin_asignar || 0}</div>
                  <div className="text-sm text-orange-600">Clientes Sin Asignar</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-purple-700">
                    {((data?.entrenadores.reduce((sum, e) => sum + e.total_clientes, 0) || 0) + (data?.total_clientes_sin_asignar || 0))}
                  </div>
                  <div className="text-sm text-purple-600">Total Clientes Premium</div>
                </CardContent>
              </Card>
            </div>

            {/* (Formulario anterior eliminado) */}

            {/* Tres columnas: Entrenadores | Clientes asignados al entrenador seleccionado | Clientes sin asignar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Asignaciones</h2>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-lg px-4 py-2">{data?.entrenadores.length || 0} entrenadores</Badge>
                  <Badge variant="secondary" className="text-lg px-4 py-2">{data?.total_clientes_sin_asignar || 0} sin asignar</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna 1: Entrenadores */}
                <div>
                  <div className="mb-3">
                    <div className="w-full rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-3">
                      <div className="text-lg font-bold text-blue-700">Entrenadores</div>
                      <div className="text-sm text-blue-600">Selecciona un entrenador para ver/editar sus clientes</div>
                    </div>
                  </div>
                  <Card className="h-full shadow-lg">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <input
                          value={trainerQuery}
                          onChange={(e) => setTrainerQuery(e.target.value)}
                          placeholder="Buscar entrenador..."
                          className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto overflow-x-hidden">
                        {data?.entrenadores
                          .filter((ent) => {
                            if (!trainerQuery) return true;
                            const q = trainerQuery.toLowerCase();
                            return (
                              (ent.entrenador_nombre || "").toLowerCase().includes(q) ||
                              (ent.entrenador_email || "").toLowerCase().includes(q)
                            );
                          })
                          .map((ent) => (
                            <div
                              key={ent.entrenador_id}
                              onClick={() => setSelectedEntrenador(String(ent.entrenador_id))}
                              className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-transform duration-150 ease-out ${selectedEntrenador === String(ent.entrenador_id) ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-600 text-white ring-4 ring-blue-500 shadow-xl z-10' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-sm'}`}
                            >
                              <div>
                                <div className={`font-semibold ${selectedEntrenador === String(ent.entrenador_id) ? 'text-white' : 'text-blue-700'}`}>{ent.entrenador_nombre}</div>
                                <div className={`text-xs ${selectedEntrenador === String(ent.entrenador_id) ? 'text-white/90' : 'text-blue-600'}`}>{ent.entrenador_email}</div>
                              </div>
                              <div className={`${selectedEntrenador === String(ent.entrenador_id) ? 'text-white/90' : 'text-sm text-blue-600'}`}>{ent.total_clientes} clientes</div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Columna 2: Clientes asignados al entrenador seleccionado */}
                <div>
                  <div className="mb-3">
                    <div className="w-full rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 px-4 py-3">
                      <div className="text-lg font-bold text-green-700">Clientes Asignados</div>
                      <div className="text-sm text-green-600">Muestra clientes del entrenador seleccionado</div>
                    </div>
                  </div>
                  <Card className="h-full shadow-lg">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <input
                          value={assignedQuery}
                          onChange={(e) => setAssignedQuery(e.target.value)}
                          placeholder="Buscar cliente asignado..."
                          className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200"
                        />
                      </div>
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto overflow-x-hidden p-0">
                        {!selectedEntrenador ? (
                          <div className="text-sm text-gray-500">Selecciona un entrenador en la columna izquierda.</div>
                        ) : (
                          (() => {
                            const entrenador = data?.entrenadores.find(e => String(e.entrenador_id) === selectedEntrenador);
                            if (!entrenador) return <div className="text-sm text-gray-500">Entrenador no encontrado</div>;
                            const filtered = entrenador.clientes_asignados.filter((cliente) => {
                              if (!assignedQuery) return true;
                              const q = assignedQuery.toLowerCase();
                              return (
                                (cliente.cliente_nombre || "").toLowerCase().includes(q) ||
                                (cliente.cliente_email || "").toLowerCase().includes(q) ||
                                (cliente.plan_nombre || "").toString().toLowerCase().includes(q)
                              );
                            });
                            return filtered.length > 0 ? (
                              filtered.map((cliente) => (
                                <div key={cliente.asignacion_id} className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-sm">
                                  <div className="flex-1">
                                    <div className="font-semibold text-green-700">{cliente.cliente_nombre}</div>
                                    <div className="text-xs text-green-600">{cliente.cliente_email} • Plan {cliente.plan_nombre}</div>
                                    <div className="text-xs text-green-500 mt-1">Asignado: {cliente.fecha_asignacion}</div>
                                    {cliente.estado && <div className="text-xs text-green-500">Estado: {cliente.estado}</div>}
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDesasignar(cliente.asignacion_id!)}>
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Quitar
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <UserX className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>Sin clientes asignados</p>
                              </div>
                            )
                          })()
                        )}
                      </div>
                    </CardContent>
                    <CardContent className="p-4 border-t">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Notas de la Asignación (se aplican al asignar nuevos clientes)</label>
                        <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas que se guardarán al crear una asignación" rows={3} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Columna 3: Clientes sin asignar */}
                <div>
                  <div className="mb-3">
                    <div className="w-full rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-3">
                      <div className="text-lg font-bold text-orange-700">Clientes Sin Asignar</div>
                      <div className="text-sm text-orange-600">Asigna clientes al entrenador seleccionado</div>
                    </div>
                  </div>
                  <Card className="h-full shadow-lg">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <input
                          value={unassignedQuery}
                          onChange={(e) => setUnassignedQuery(e.target.value)}
                          placeholder="Buscar cliente sin asignar..."
                          className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                        />
                      </div>
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto overflow-x-hidden p-0">
                        {data?.clientes_sin_asignar && data.clientes_sin_asignar.length > 0 ? (
                          data.clientes_sin_asignar
                            .filter((cliente) => {
                              if (!unassignedQuery) return true;
                              const q = unassignedQuery.toLowerCase();
                              return (
                                (cliente.cliente_nombre || "").toLowerCase().includes(q) ||
                                (cliente.cliente_email || "").toLowerCase().includes(q) ||
                                (cliente.plan_nombre || "").toString().toLowerCase().includes(q)
                              );
                            })
                            .map((cliente) => {
                              const cid = (cliente as any).id_cliente ?? (cliente as any).cliente_id ?? null;
                              return (
                                <div key={cid ?? cliente.cliente_email} className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-sm">
                                  <div className="flex-1">
                                    <div className="font-semibold text-orange-700">{cliente.cliente_nombre}</div>
                                    <div className="text-xs text-orange-600">{cliente.cliente_email} • Plan {cliente.plan_nombre}</div>
                                    <div className="text-xs text-orange-500 mt-1">Inscripción: {cliente.fecha_inscripcion}</div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Button size="sm" onClick={() => handleAsignarCliente(cid)} disabled={!selectedEntrenador || cid == null} className="bg-green-600 text-white">
                                      <Plus className="h-4 w-4 mr-1" />
                                      Asignar
                                    </Button>
                                  </div>
                                </div>
                              )
                            })
                        ) : (
                          <div className="text-center py-8 text-gray-500">No hay clientes sin asignar</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}