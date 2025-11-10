"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
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
  const [selectedEntrenador, setSelectedEntrenador] = useState<string>("");
  const [selectedCliente, setSelectedCliente] = useState<string>("");
  const [notas, setNotas] = useState("");
  const [assigningLoading, setAssigningLoading] = useState(false);

  // Verificar permisos de administrador
  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  const fetchAsignaciones = async () => {
    try {
      setLoading(true);
  const response = await fetch(`${API_CONFIG.BASE_URL}/asignaciones-entrenador`, {
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
      alert("Error al cargar las asignaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleAsignar = async () => {
    if (!selectedEntrenador || !selectedCliente) {
      alert("Debe seleccionar un entrenador y un cliente");
      return;
    }

    try {
      setAssigningLoading(true);
  const response = await fetch(`${API_CONFIG.BASE_URL}/asignar-entrenador`, {
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
      alert(result.message);
      
      // Limpiar formulario
      setSelectedEntrenador("");
      setSelectedCliente("");
      setNotas("");
      
      // Refrescar datos
      await fetchAsignaciones();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Error al asignar entrenador");
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleDesasignar = async (asignacionId: number) => {
    if (!confirm("¿Está seguro de que desea desasignar este entrenador?")) {
      return;
    }

    try {
  const response = await fetch(`${API_CONFIG.BASE_URL}/desasignar-entrenador/${asignacionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Error al desasignar entrenador");
      }

      const result = await response.json();
      alert(result.message);
      
      // Refrescar datos
      await fetchAsignaciones();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Error al desasignar entrenador");
    }
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/admin")}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Panel
              </Button>
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
              onClick={fetchAsignaciones}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
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
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-orange-700">{data?.total_clientes_sin_asignar || 0}</div>
                  <div className="text-sm text-orange-600">Clientes Sin Asignar</div>
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
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-purple-700">
                    {((data?.entrenadores.reduce((sum, e) => sum + e.total_clientes, 0) || 0) + (data?.total_clientes_sin_asignar || 0))}
                  </div>
                  <div className="text-sm text-purple-600">Total Clientes Premium</div>
                </CardContent>
              </Card>
            </div>

            {/* Formulario de Nueva Asignación */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Plus className="h-6 w-6 text-green-600" />
                  Nueva Asignación Entrenador-Cliente
                </CardTitle>
                <CardDescription className="text-base">
                  Selecciona un entrenador y un cliente para crear una nueva asignación
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Seleccionar Entrenador
                    </label>
                    <Select value={selectedEntrenador} onValueChange={setSelectedEntrenador}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Elige un entrenador disponible..." />
                      </SelectTrigger>
                      <SelectContent>
                        {data?.entrenadores.map((entrenador) => (
                          <SelectItem 
                            key={entrenador.entrenador_id} 
                            value={entrenador.entrenador_id.toString()}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{entrenador.entrenador_nombre}</span>
                              <Badge variant="secondary" className="ml-2">
                                {entrenador.total_clientes} clientes
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Seleccionar Cliente
                    </label>
                    <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Elige un cliente sin asignar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {data?.clientes_sin_asignar.map((cliente) => (
                          <SelectItem 
                            key={cliente.cliente_id} 
                            value={cliente.cliente_id.toString()}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{cliente.cliente_nombre}</span>
                              <Badge variant="outline" className="ml-2">
                                {cliente.plan_nombre}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Notas de la Asignación (Opcional)
                  </label>
                  <Textarea
                    value={notas}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotas(e.target.value)}
                    placeholder="Añade notas sobre objetivos, necesidades especiales, horarios preferidos..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                <Button 
                  onClick={handleAsignar}
                  disabled={assigningLoading || !selectedEntrenador || !selectedCliente}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {assigningLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Asignando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Crear Asignación
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Entrenadores y sus Asignaciones */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Entrenadores y sus Clientes Asignados</h2>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {data?.entrenadores.length || 0} entrenadores
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data?.entrenadores.map((entrenador) => (
                  <Card key={entrenador.entrenador_id} className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <UserCheck className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xl font-bold">{entrenador.entrenador_nombre}</div>
                            <div className="text-sm text-gray-600 font-normal">{entrenador.entrenador_email}</div>
                          </div>
                        </div>
                        <Badge variant="default" className="bg-blue-100 text-blue-800 text-lg px-3 py-1">
                          {entrenador.total_clientes} clientes
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      {entrenador.clientes_asignados.length > 0 ? (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-700 mb-3">Clientes Asignados:</h4>
                          {entrenador.clientes_asignados.map((cliente) => (
                            <div 
                              key={cliente.asignacion_id} 
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{cliente.cliente_nombre}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {cliente.cliente_email} • Plan {cliente.plan_nombre}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Asignado: {cliente.fecha_asignacion}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDesasignar(cliente.asignacion_id!)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Desasignar
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <UserX className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>Sin clientes asignados</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Clientes Sin Asignar */}
            {data?.clientes_sin_asignar && data.clientes_sin_asignar.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <UserX className="h-6 w-6 text-orange-600" />
                    </div>
                    Clientes sin Entrenador Asignado
                  </CardTitle>
                  <CardDescription className="text-base">
                    Clientes con plan Premium que incluye entrenador personal pero aún no tienen uno asignado
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.clientes_sin_asignar.map((cliente) => (
                      <div key={cliente.cliente_id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-900">{cliente.cliente_nombre}</div>
                          <Badge variant="outline" className="text-orange-700 border-orange-300">
                            Sin entrenador
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {cliente.cliente_email}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="default" className="bg-orange-100 text-orange-800">
                            Plan {cliente.plan_nombre}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {cliente.fecha_inscripcion}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}