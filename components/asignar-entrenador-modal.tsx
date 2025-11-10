"use client";

import { useState, useEffect } from "react";
import { API_CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Users, UserCheck, UserX, Plus, Trash2 } from "lucide-react";

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

interface AsignarEntrenadorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AsignarEntrenadorModal({ isOpen, onOpenChange }: AsignarEntrenadorModalProps) {
  const [data, setData] = useState<AsignacionesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEntrenador, setSelectedEntrenador] = useState<string>("");
  const [selectedCliente, setSelectedCliente] = useState<string>("");
  const [notas, setNotas] = useState("");
  const [assigningLoading, setAssigningLoading] = useState(false);

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
    if (isOpen) {
      fetchAsignaciones();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestión de Asignaciones Entrenador-Cliente
          </DialogTitle>
          <DialogDescription>
            Asigna entrenadores a clientes con planes estándar o premium
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="text-gray-600">Cargando asignaciones...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Formulario de nueva asignación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Asignación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Seleccionar Entrenador
                    </label>
                    <Select value={selectedEntrenador} onValueChange={setSelectedEntrenador}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar entrenador..." />
                      </SelectTrigger>
                      <SelectContent>
                        {data?.entrenadores.map((entrenador) => (
                          <SelectItem 
                            key={entrenador.entrenador_id} 
                            value={entrenador.entrenador_id.toString()}
                          >
                            {entrenador.entrenador_nombre} ({entrenador.total_clientes} clientes)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Seleccionar Cliente
                    </label>
                    <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {data?.clientes_sin_asignar.map((cliente) => (
                          <SelectItem 
                            key={cliente.cliente_id} 
                            value={cliente.cliente_id.toString()}
                          >
                            {cliente.cliente_nombre} - Plan {cliente.plan_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notas (opcional)
                  </label>
                  <Textarea
                    value={notas}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotas(e.target.value)}
                    placeholder="Notas sobre la asignación..."
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleAsignar}
                  disabled={assigningLoading || !selectedEntrenador || !selectedCliente}
                  className="w-full"
                >
                  {assigningLoading ? "Asignando..." : "Asignar Entrenador"}
                </Button>
              </CardContent>
            </Card>

            {/* Lista de entrenadores y sus clientes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Entrenadores y sus Clientes Asignados</h3>
              
              {data?.entrenadores.map((entrenador) => (
                <Card key={entrenador.entrenador_id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        {entrenador.entrenador_nombre}
                      </div>
                      <Badge variant="secondary">
                        {entrenador.total_clientes} clientes
                      </Badge>
                    </CardTitle>
                    <CardDescription>{entrenador.entrenador_email}</CardDescription>
                  </CardHeader>
                  
                  {entrenador.clientes_asignados.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        {entrenador.clientes_asignados.map((cliente) => (
                          <div 
                            key={cliente.asignacion_id} 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium">{cliente.cliente_nombre}</div>
                              <div className="text-sm text-gray-600">
                                {cliente.cliente_email} • Plan {cliente.plan_nombre}
                              </div>
                              <div className="text-xs text-gray-500">
                                Asignado: {cliente.fecha_asignacion}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDesasignar(cliente.asignacion_id!)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              Desasignar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* Clientes sin asignar */}
            {data?.clientes_sin_asignar && data.clientes_sin_asignar.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserX className="h-5 w-5" />
                    Clientes sin Entrenador Asignado
                  </CardTitle>
                  <CardDescription>
                    Clientes con plan estándar o premium que necesitan un entrenador
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.clientes_sin_asignar.map((cliente) => (
                      <div key={cliente.cliente_id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <div className="font-medium">{cliente.cliente_nombre}</div>
                          <div className="text-sm text-gray-600">
                            {cliente.cliente_email} • Plan {cliente.plan_nombre}
                          </div>
                          <div className="text-xs text-gray-500">
                            Inscripción: {cliente.fecha_inscripcion} • Estado: {cliente.estado}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-orange-600">
                          Sin entrenador
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{data?.total_entrenadores || 0}</div>
                  <div className="text-sm text-gray-600">Entrenadores disponibles</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{data?.total_clientes_sin_asignar || 0}</div>
                  <div className="text-sm text-gray-600">Clientes sin asignar</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}