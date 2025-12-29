# QR Code Inventory Management System

## Overview

This system replaces handwritten tags with QR code-based inventory management, following industry best practices for gold shop inventory tracking.

## Features

### 1. QR Code Generation
- **Automatic Generation**: QR codes are automatically generated when inventory items are created or updated
- **Comprehensive Data**: QR codes contain all item information:
  - Item ID, Name, Type
  - Metal Type (Gold/Silver)
  - Weight, Purity
  - Price per Gram
  - Quantity, Total Value
  - Creation Date

### 2. QR Code Label Printing
- **Industry Standard Format**: Labels are formatted for 3" x 2" tags (standard gold shop tag size)
- **Print-Ready**: One-click print functionality generates printable labels
- **Information Display**: Labels show:
  - QR Code (scannable)
  - Item name and type
  - Metal type and purity
  - Weight and quantity
  - Item ID

### 3. Mobile QR Code Scanning
- **Camera-Based Scanning**: Uses device camera to scan QR codes
- **Real-Time Feedback**: Instant feedback when items are scanned
- **Quantity Tracking**: Automatically tracks scanned quantities vs expected quantities
- **Discrepancy Detection**: Highlights items with quantity mismatches
- **Mobile-Optimized**: Designed for mobile devices with responsive UI

### 4. Physical Inventory Counting
- **Session Management**: Track scanning sessions
- **Real-Time Summary**: View scanned items, expected items, and discrepancies
- **Report Generation**: Generate comprehensive inventory reports
- **Export Functionality**: Export reports to CSV format

### 5. Inventory Reports
- **Historical Reports**: View all past physical inventory reports
- **Detailed Analysis**: See item-by-item comparison
- **Discrepancy Tracking**: Identify overages and shortages
- **Export Capability**: Download reports for record-keeping

## Workflow

### Step 1: Create Inventory Items
1. Go to **Inventory** tab
2. Click **Add Item**
3. Fill in all item details (name, type, metal type, weight, purity, price, quantity)
4. Click **Save Item**
5. QR code is automatically generated

### Step 2: Print QR Code Labels
1. In the inventory list, find the item
2. Click the **Printer** icon button
3. Print dialog opens with formatted label
4. Print and attach to physical item (replacing handwritten tag)

### Step 3: Physical Inventory Counting
1. Go to **QR Scanner** tab
2. Click **Start Scanning**
3. Allow camera permissions
4. Point camera at QR codes on items
5. System automatically:
   - Recognizes the item
   - Increments scanned quantity
   - Compares with expected quantity
   - Shows discrepancy if any

### Step 4: Generate Report
1. After scanning all items, go to **Physical Count** tab
2. Review current scan session summary
3. Optionally enter a report name
4. Click **Generate Report**
5. Report is saved and can be exported

## Navigation

### Desktop/Tablet
- **QR Scanner**: Available in top navigation bar
- **Physical Count**: Available in top navigation bar

### Mobile
- **QR Scanner**: Available in top navigation bar (scrollable)
- **Physical Count**: Available in top navigation bar (scrollable)
- **Quick Access**: From Inventory page, use "Scan QR" and "Physical Count" buttons

## Technical Details

### QR Code Format
QR codes contain JSON data with all item information, ensuring:
- **Offline Compatibility**: Works without internet connection
- **Data Integrity**: All information is embedded in the code
- **Error Correction**: QR codes use M-level error correction

### Storage
- **Local Storage**: All data stored locally in browser
- **Persistent Sessions**: Scan sessions persist until report is generated
- **Report History**: All reports are saved for historical reference

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 11.3+)
- **Mobile Browsers**: Full support with camera access

## Industry Best Practices

1. **Standard Tag Size**: 3" x 2" labels compatible with standard gold shop tag printers
2. **Comprehensive Information**: All handwritten tag information included in QR code
3. **Mobile-First Design**: Optimized for mobile scanning workflows
4. **Discrepancy Tracking**: Automatic comparison of physical vs system counts
5. **Audit Trail**: Complete history of physical inventory counts
6. **Export Capability**: CSV export for external record-keeping

## Benefits

1. **Eliminates Manual Counting**: No more handwritten tags or manual counting
2. **Reduces Errors**: Automated tracking reduces human error
3. **Faster Counting**: Scan items quickly with mobile device
4. **Real-Time Tracking**: See discrepancies immediately
5. **Historical Records**: Maintain complete audit trail
6. **Professional**: Modern, industry-standard approach

## Troubleshooting

### Camera Not Working
- Ensure camera permissions are granted
- Try refreshing the page
- Check browser compatibility

### QR Code Not Scanning
- Ensure good lighting
- Hold camera steady
- Check QR code is not damaged or obscured

### Print Issues
- Ensure popups are allowed
- Check printer is connected
- Verify label size settings

## Future Enhancements

- Batch QR code printing
- Barcode support (alternative to QR codes)
- Cloud sync for multi-device access
- Advanced analytics and reporting
- Integration with accounting systems

