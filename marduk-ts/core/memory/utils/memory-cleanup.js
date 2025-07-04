export async function cleanupMemory(items, capacity) {
    if (items.size <= capacity)
        return;
    const itemsArray = Array.from(items.entries());
    itemsArray.sort((a, b) => {
        const aAccessed = a[1].metadata?.lastAccessed || 0;
        const bAccessed = b[1].metadata?.lastAccessed || 0;
        return aAccessed - bAccessed;
    });
    // Remove oldest 10% of items
    const removeCount = Math.floor(items.size * 0.1);
    itemsArray.slice(0, removeCount).forEach(([id]) => items.delete(id));
}
export function calculateMemoryUsage(items) {
    return Array.from(items.values()).reduce((total, item) => {
        return total + JSON.stringify(item).length;
    }, 0);
}
//# sourceMappingURL=memory-cleanup.js.map