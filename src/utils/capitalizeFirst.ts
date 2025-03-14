export function capitalizeFirst(text: string) {
    return text
        ?.split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}