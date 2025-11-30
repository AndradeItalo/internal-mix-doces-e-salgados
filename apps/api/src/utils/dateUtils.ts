/**
 * Converte uma data string para Date evitando problemas de timezone
 * Mantém a data correta ajustando para meio-dia local
 */
export function parseDateSafe(dateString: string | Date | undefined): Date | undefined {
  if (!dateString) return undefined;
  
  // Se já for Date, retorna copiando com meio-dia
  if (dateString instanceof Date) {
    return new Date(dateString.getFullYear(), dateString.getMonth(), dateString.getDate(), 12, 0, 0);
  }
  
  // Se for string, extrai componentes diretamente para evitar timezone shift
  if (typeof dateString === 'string') {
    // Formato YYYY-MM-DD
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const result = new Date(year, month - 1, day, 12, 0, 0);
      console.log(`[DEBUG] Formato YYYY-MM-DD: ${dateString} → ${result.toISOString()}`);
      return result;
    }
    
    // Formato ISO ou outros - extrai componentes da string
    const date = new Date(dateString);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return undefined;
    }
    
    // Para strings ISO, usa os componentes UTC para evitar timezone shift
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    
    const result = new Date(year, month, day, 12, 0, 0);
    console.log(`[DEBUG] Formato ISO: ${dateString} → UTC(${year}-${month+1}-${day}) → ${result.toISOString()}`);
    
    return result;
  }
  
  return undefined;
}

/**
 * Converte uma data para string ISO mantendo a data local
 */
export function formatDateToISO(date: Date): string {
  // Cria string ISO com timezone local
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T12:00:00.000Z`;
}
