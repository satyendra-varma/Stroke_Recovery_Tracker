# Stroke Recovery Tracker

A mobile-responsive web application for tracking stroke recovery progress, designed for easy use by family members and caregivers.

## Features

### 🏥 Health Tracking
- **Blood Pressure Monitoring**: Track systolic/diastolic readings with automatic color-coded alerts
- **Blood Sugar Tracking**: Monitor glucose levels with warning indicators
- **Medication Checklist**: Track morning, noon, and night medication adherence
- **Daily Notes**: Record wins, progress, and concerns

### 📊 Data Visualization
- **Interactive Charts**: View trends in blood pressure and blood sugar over time
- **History Dashboard**: Review recent entries with color-coded vital ranges
- **CSV Export**: Download all health data for sharing with healthcare providers

### 🎯 Motivational Features
- **Wedding Countdown**: Displays days remaining until March 14th, 2026
- **Progress Tracking**: Visual representation of recovery journey

### 🚨 Emergency Features
- **Quick Call Button**: One-tap emergency dialing for KIMS Hospital
- **Color-Coded Alerts**: Immediate visual feedback for abnormal readings

### 📱 Mobile-Optimized
- **Responsive Design**: Works seamlessly on smartphones and tablets
- **Large Touch Targets**: Easy tapping for users with limited mobility
- **High Contrast**: Medical-themed design for accessibility

## Technology Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome
- **Storage**: LocalStorage for offline data persistence
- **Deployment**: GitHub Pages

## Getting Started

### Local Development
1. Clone this repository
2. Open `index.html` in your web browser
3. No additional setup required - works offline!

### Deployment to GitHub Pages
1. Push this repository to GitHub
2. Go to Settings → Pages
3. Select source as "Deploy from a branch"
4. Choose main branch and save
5. Your site will be available at `https://username.github.io/repository-name`

## Data Storage

The app uses browser localStorage to store health data locally. All data remains private on the device. For backup or sharing:

1. Use the "Export CSV" feature to download all data
2. The CSV file can be shared with healthcare providers
3. Data persists even when browser is closed

## Vital Ranges & Color Coding

### Blood Pressure
- 🟢 **Normal**: < 140/90 mmHg
- 🟡 **Low**: < 90/60 mmHg
- 🔴 **High**: > 140/90 mmHg

### Blood Sugar
- 🟢 **Normal**: 70-140 mg/dL
- 🟡 **Low**: < 70 mg/dL
- 🟡 **High**: 140-200 mg/dL
- 🔴 **Very High**: > 200 mg/dL

## Emergency Contact

The emergency button is configured to call KIMS Hospital. Update the phone number in `app.js`:

```javascript
window.location.href = 'tel:+91YOUR_KIMS_NUMBER';
```

## Photo Upload Feature

Users can optionally upload photos of:
- Doctor's prescriptions
- Blood pressure machine readings
- Medication labels
- Other relevant medical documents

Photos are stored locally in the browser and included in CSV exports.

## Wedding Countdown

The app features a countdown to March 14th, 2026, serving as a motivational goal for recovery. The countdown updates automatically and displays days, hours, and minutes remaining.

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile Safari (iOS 12+)
- ✅ Chrome Mobile (Android 6+)

## Privacy & Security

- All data stored locally on device
- No external API calls or data transmission
- No third-party tracking or analytics
- Photos stored as base64 in localStorage
- CSV export is manual user-initiated

## Contributing

This is a personal health tracking application. For suggestions or improvements:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request with description of changes

## License

This project is open source and available under the MIT License.

---

**Note**: This application is designed for personal health tracking and should not replace professional medical advice. Always consult healthcare providers for medical decisions.
