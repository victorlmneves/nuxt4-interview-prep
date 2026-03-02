export function useDateFormat() {
    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    function formatDateTime(dateStr: string): string {
        const date = new Date(dateStr);

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return { formatDate, formatDateTime };
}
