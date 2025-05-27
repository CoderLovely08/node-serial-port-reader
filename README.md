````markdown
# 🔌 Node Serial Port Reader

A simple terminal utility built with Node.js that:

- Lists available serial ports on your system
- Lets you choose a port to connect
- Supports three data reading modes: `raw`, `text`, or `byte`
- Displays incoming serial data in a clean, color-coded format

---

## 📦 Prerequisites

- **Node.js Installed**
- Make sure you have the necessary permissions to access serial ports on your system.

---

## 🚀 Installation

1. Clone or download this repository.

```bash
git clone https://github.com/CoderLovely08/node-serial-port-reader
cd node-serial-port-reader
```
````

2. Install dependencies:

```bash
npm install
```

---

## 🧠 Usage

Run the script using Node:

```bash
npm start
```

You will be prompted to:

1. **Choose a serial port** from the available list.
2. **Select a data reading mode**:

   - `raw` – Show raw `Buffer` output
   - `text` – Read line-by-line as text (delimited by `\r\n`)
   - `byte` – Read fixed-length byte chunks (you choose the byte length)

---

## 📷 Example

```bash
🔌 Available Serial Ports:
1: /dev/tty.usbserial-110 - FTDI
2: /dev/tty.Bluetooth-Incoming-Port - Apple Inc.

Select a port by number: 1
Choose data reading mode (raw / text / byte): text

✅ Port opened on /dev/tty.usbserial-110
📄 Text Data: Temperature: 24.3°C
📄 Text Data: Temperature: 24.5°C

Select a port by number: 1

⚙️  Choose a Baud Rate:
1: 9600
2: 19200
3: 38400
4: 57600
5: 115200
c: Custom baud rate

Enter option number or 'c' for custom: 5
✅ Baud rate set to 115200

```

---

## ⚙️ Configuration

You can modify the baud rate and other serial port settings in `app.js`:

```js
const port = new SerialPort({
  path: selectedPortPath,
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
});
```

---

## 🛠️ Troubleshooting

- **No serial ports listed?**

  - Ensure your device is plugged in.
  - Check USB permissions on Linux/macOS.

- **Permission denied on macOS/Linux?**

  - Try running with `sudo`, or add your user to the dialout group.

---

## 📄 License

MIT License

---

## 💡 Ideas for Expansion

- Add support for saving data to a file
- Add timestamped logs
- Build a GUI with Electron or WebSocket interface
