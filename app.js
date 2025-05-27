const { SerialPort, ByteLengthParser, ReadlineParser } = require("serialport");
const readline = require("readline");
const chalk = require("chalk");

/**
 * Setup command line interface
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * List available ports
 */
SerialPort.list()
  .then((ports) => {
    if (ports.length === 0) {
      console.log(chalk.red("❌ No serial ports found."));
      process.exit(1);
    }

    console.log(chalk.cyanBright("🔌 Available Serial Ports:"));

    /**
     * List available ports
     */
    ports.forEach((port, index) => {
      console.log(
        `${chalk.green(index + 1)}: ${chalk.yellow(port.path)} - ${chalk.gray(
          port.manufacturer || "Unknown Manufacturer"
        )}`
      );
    });

    rl.question(chalk.blue("\nSelect a port by number: "), (answer) => {
      const portIndex = parseInt(answer) - 1;

      if (isNaN(portIndex) || portIndex < 0 || portIndex >= ports.length) {
        console.error(chalk.red("❌ Invalid selection. Exiting."));
        process.exit(1);
      }

      const selectedPortPath = ports[portIndex].path;

      rl.question(
        chalk.blue("Choose data reading mode (raw / text / byte): "),
        (mode) => {
          mode = mode.trim().toLowerCase();

          /**
           * Create serial port instance and open it
           */
          const port = new SerialPort({
            path: selectedPortPath,
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: "none",
            autoOpen: true,
          });

          port.on("open", () => {
            console.log(
              chalk.greenBright(
                `✅ Port opened on ${selectedPortPath}. Press Ctrl+C to exit.`
              )
            );
          });

          /**
           * Handle different data reading modes
           */
          switch (mode) {
            case "raw":
              port.on("data", (data) => {
                console.log(chalk.magenta("🔄 Raw Data:"), data);
              });
              break;

            case "text":
              const textParser = port.pipe(
                new ReadlineParser({ delimiter: "\r\n" })
              );
              textParser.on("data", (data) => {
                console.log(chalk.cyan("📄 Text Data:"), data);
              });
              break;

            case "byte":
              rl.question(
                chalk.blue("Enter byte length to parse: "),
                (byteLengthStr) => {
                  const byteLength = parseInt(byteLengthStr);
                  if (isNaN(byteLength) || byteLength <= 0) {
                    console.error(chalk.red("❌ Invalid byte length."));
                    process.exit(1);
                  }
                  const byteParser = port.pipe(
                    new ByteLengthParser({ length: byteLength })
                  );
                  byteParser.on("data", (data) => {
                    console.log(
                      chalk.yellow(`📦 ByteLength (${byteLength}) Data:`),
                      data
                    );
                  });
                }
              );
              break;

            default:
              console.error(chalk.red("❌ Invalid mode selected."));
              process.exit(1);
          }
        }
      );
    });
  })
  .catch((err) => {
    console.error(chalk.red("❌ Error listing serial ports:"), err);
  });
