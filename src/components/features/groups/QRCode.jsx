// QRCode.jsx
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeDisplay({ value }) {
    if (!value) return null;
    return (
        <div style={{ textAlign: 'center', margin: '1em 0' }}>
            <QRCodeSVG value={value} size={180} />
            <div style={{ marginTop: 8, fontSize: 12 }}>Scan to join group</div>
        </div>
    );
}
