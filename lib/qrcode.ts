import QRCode from 'qrcode'
import type { InventoryItem } from './storage'

/**
 * Generate QR code data string from inventory item
 * This contains all the information that would be on a handwritten tag
 */
export function generateQRCodeData(item: InventoryItem): string {
  const qrData = {
    id: item.id,
    name: item.name,
    type: item.type,
    metalType: item.metalType,
    weight: item.weight,
    purity: item.purity,
    pricePerGram: item.pricePerGram,
    quantity: item.quantity,
    totalValue: item.totalValue,
    createdAt: item.createdAt,
  }
  return JSON.stringify(qrData)
}

/**
 * Generate QR code image as data URL
 */
export async function generateQRCodeImage(data: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return qrDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

/**
 * Parse QR code data back to inventory item format
 */
export function parseQRCodeData(qrData: string): Partial<InventoryItem> | null {
  try {
    const parsed = JSON.parse(qrData)
    return parsed
  } catch (error) {
    console.error('Error parsing QR code data:', error)
    return null
  }
}

/**
 * Print QR code label (industry standard format for gold shops)
 */
export function printQRCodeLabel(item: InventoryItem, qrCodeImage: string) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to print QR code labels')
    return
  }

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>QR Code Label - ${item.name}</title>
        <style>
          @media print {
            @page {
              size: 3in 2in;
              margin: 0.1in;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 8px;
            margin: 0;
            width: 2.8in;
            height: 1.8in;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
          }
          .qr-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          }
          .qr-code {
            width: 120px;
            height: 120px;
            image-rendering: crisp-edges;
          }
          .item-info {
            text-align: center;
            font-size: 10px;
            line-height: 1.2;
          }
          .item-name {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 2px;
          }
          .item-details {
            font-size: 9px;
            color: #666;
          }
          .item-id {
            font-size: 8px;
            color: #999;
            margin-top: 2px;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <img src="${qrCodeImage}" alt="QR Code" class="qr-code" />
          <div class="item-info">
            <div class="item-name">${item.name}</div>
            <div class="item-details">
              ${item.type} | ${item.metalType === 'gold' ? 'Gold' : 'Silver'} ${item.purity}<br>
              Weight: ${item.weight}g | Qty: ${item.quantity}
            </div>
            <div class="item-id">ID: ${item.id.slice(-6)}</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.write(printContent)
  printWindow.document.close()
}

