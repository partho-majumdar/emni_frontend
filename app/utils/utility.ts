export function getAvatar(username: string): string {
  return `https://robohash.org/${username}.png?size=200x200`;
}

export function resolveImageLink(
  imageLink: string | undefined,
  id: string,
): string {
  if (imageLink && imageLink.length > 0) {
    return imageLink;
  } else {
    return getAvatar(id);
  }
}

export const minutesToHours = (minutes: number) => {
  const hours: number = Math.floor(minutes / 60);
  const remain = minutes % 60;
  if (remain > 0) {
    if (hours === 0) {
      return `${remain} minutes`;
    }
    return `${hours} hours ${remain} minutes`;
  } else {
    return `${hours} hours`;
  }
};
