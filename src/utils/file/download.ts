/**
 * 将 Blob/ArrayBuffer 触发浏览器下载
 */
export function downloadByData(
  data: BlobPart,
  filename: string,
  mime?: string
): void {
  const blob = new Blob([data], { type: mime || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 通过 URL 打开或下载（新窗口）
 */
export function downloadByUrl(url: string, fileName?: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  if (fileName) link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
