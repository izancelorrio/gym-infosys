-- Agregar campo color a la tabla gym_clases
ALTER TABLE gym_clases ADD COLUMN color VARCHAR(50) DEFAULT 'bg-gray-100 border-gray-300 text-gray-800';

-- Actualizar los colores para cada tipo de clase
UPDATE gym_clases SET color = 'bg-blue-100 border-blue-300 text-blue-800' WHERE nombre = 'Pilates';
UPDATE gym_clases SET color = 'bg-pink-100 border-pink-300 text-pink-800' WHERE nombre = 'Zumba';
UPDATE gym_clases SET color = 'bg-red-100 border-red-300 text-red-800' WHERE nombre = 'CrossFit';
UPDATE gym_clases SET color = 'bg-green-100 border-green-300 text-green-800' WHERE nombre = 'Spinning';
UPDATE gym_clases SET color = 'bg-purple-100 border-purple-300 text-purple-800' WHERE nombre = 'Yoga';
UPDATE gym_clases SET color = 'bg-orange-100 border-orange-300 text-orange-800' WHERE nombre = 'Aeróbicos';
UPDATE gym_clases SET color = 'bg-teal-100 border-teal-300 text-teal-800' WHERE nombre = 'Funcional';
UPDATE gym_clases SET color = 'bg-amber-100 border-amber-300 text-amber-800' WHERE nombre = 'Boxing';
UPDATE gym_clases SET color = 'bg-cyan-100 border-cyan-300 text-cyan-800' WHERE nombre = 'Aqua Aeróbicos';
UPDATE gym_clases SET color = 'bg-indigo-100 border-indigo-300 text-indigo-800' WHERE nombre = 'Body Pump';
UPDATE gym_clases SET color = 'bg-rose-100 border-rose-300 text-rose-800' WHERE nombre = 'Body Combat';
UPDATE gym_clases SET color = 'bg-emerald-100 border-emerald-300 text-emerald-800' WHERE nombre = 'Stretching';