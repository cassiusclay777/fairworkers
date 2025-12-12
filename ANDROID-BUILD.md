# FairWorkers - Android Build Guide

## Přehled

FairWorkers nyní podporuje Android pomocí Capacitor! Tato aplikace funguje jak na webu, tak jako nativní Android aplikace.

## Požadavky pro build Android APK

### 1. Java Development Kit (JDK)
- **Verze**: JDK 17 nebo novější
- **Stažení**: https://adoptium.net/ (doporučeno)
- **Instalace**:
  - Windows: Stáhněte installer a nainstalujte
  - Nastavte `JAVA_HOME` environment variable na cestu k JDK
  - Příklad: `C:\Program Files\Eclipse Adoptium\jdk-17.0.x`

### 2. Android SDK
- **Doporučeno**: Instalovat přes Android Studio
- **Stažení**: https://developer.android.com/studio
- **Minimální SDK**: API 22 (Android 5.1)
- **Target SDK**: API 33 (Android 13)
- **Build Tools**: Verze 33.0.0 nebo novější

### 3. Node.js a pnpm
- Node.js 18+ (již máte)
- pnpm (již máte)

## Jak sestavit Android APK

### Krok 1: Nastavit environment variables

#### Windows (PowerShell):
```powershell
# Nastavte JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x"

# Nastavte ANDROID_HOME (cesta k Android SDK)
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# Přidejte do PATH
$env:PATH += ";$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

#### Windows (CMD):
```cmd
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set PATH=%PATH%;%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
```

### Krok 2: Build webové aplikace
```bash
cd frontend
pnpm install
pnpm build
```

### Krok 3: Sync s Android projektem
```bash
npx cap sync android
```

### Krok 4: Build APK

#### Debug APK (pro testování):
```bash
cd android
./gradlew assembleDebug
```

APK bude v: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

#### Release APK (pro distribuci):
```bash
cd android
./gradlew assembleRelease
```

APK bude v: `frontend/android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Krok 5: Instalace na zařízení

#### Přes ADB:
```bash
adb install frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

#### Ruční instalace:
1. Zkopírujte APK soubor na telefon
2. Povolte "Instalace z neznámých zdrojů" v Nastavení > Zabezpečení
3. Otevřete APK soubor a nainstalujte

## Vývoj a Debugování

### Otevřít v Android Studio:
```bash
cd frontend
npx cap open android
```

### Live Reload (pro vývoj):
1. Nastavte server URL v `capacitor.config.json`:
```json
{
  "server": {
    "url": "http://YOUR_IP:5173",
    "cleartext": true
  }
}
```

2. Spusťte dev server:
```bash
cd frontend
pnpm dev
```

3. Rebuild a spusťte aplikaci

### Přidat nové Capacitor pluginy:
```bash
npm install @capacitor/camera
npx cap sync android
```

## Signování APK pro Production

Pro Google Play Store potřebujete podepsaný APK:

### 1. Vytvořit keystore:
```bash
keytool -genkey -v -keystore fairworkers-release.keystore -alias fairworkers -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Nakonfigurovat signing v `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file("path/to/fairworkers-release.keystore")
            storePassword "YOUR_PASSWORD"
            keyAlias "fairworkers"
            keyPassword "YOUR_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build signed APK:
```bash
cd android
./gradlew assembleRelease
```

## Troubleshooting

### "JAVA_HOME is not set"
- Nastavte JAVA_HOME environment variable
- Restartujte terminál/IDE

### "SDK location not found"
- Vytvořte soubor `frontend/android/local.properties`:
```
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

### Build fails with "Unsupported class file major version"
- Aktualizujte JDK na verzi 17 nebo novější

### APK se neinstaluje
- Zkontrolujte, že máte povolené "Instalace z neznámých zdrojů"
- Pro Android 8+: Povolení je per-app v Nastavení

## Užitečné příkazy

```bash
# Vyčistit build
cd frontend/android
./gradlew clean

# Seznam připojených zařízení
adb devices

# Logcat (Android logy)
adb logcat

# Uninstall app
adb uninstall com.fairworkers.app

# Build všechno najednou
cd frontend && pnpm build && npx cap sync android && cd android && ./gradlew assembleDebug
```

## Struktura projektu

```
fairworkers/
├── frontend/                 # React webová aplikace
│   ├── src/                  # React komponenty
│   ├── dist/                 # Build output (webdir pro Capacitor)
│   ├── android/              # Android nativní projekt
│   │   ├── app/
│   │   │   ├── src/main/
│   │   │   │   ├── AndroidManifest.xml
│   │   │   │   ├── assets/   # Web assets se kopírují sem
│   │   │   │   └── res/      # Android resources (ikony, atd.)
│   │   │   └── build.gradle
│   │   └── build.gradle
│   ├── capacitor.config.json # Capacitor konfigurace
│   └── package.json
└── backend/                  # Node.js backend
```

## Aktualizace aplikace

Po změnách v kódu:

```bash
# 1. Build web
cd frontend
pnpm build

# 2. Sync změny do Android
npx cap sync android

# 3. (Volitelné) Otevřít v Android Studio
npx cap open android

# 4. Build nový APK
cd android
./gradlew assembleDebug
```

## Poznámky

- **Web verzuje zachována**: Můžete stále deployovat na Vercel jako dříve
- **Shared kód**: React komponenty jsou sdílené mezi web a Android verzí
- **API komunikace**: Ujistěte se, že backend API je dostupné z mobilní sítě
- **CORS**: Nakonfigurujte CORS v backendu pro mobilní přístup

## Podpora

Pro více informací o Capacitor:
- Dokumentace: https://capacitorjs.com/docs
- Android Guide: https://capacitorjs.com/docs/android
