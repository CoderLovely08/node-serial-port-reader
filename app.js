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
 * Common baud rates
 */
const COMMON_BAUD_RATES = [9600, 19200, 38400, 57600, 115200];

async function askBaudRate() {
  console.log(chalk.cyanBright("\n⚙️  Choose a Baud Rate:"));
  COMMON_BAUD_RATES.forEach((rate, i) => {
    console.log(`${chalk.green(i + 1)}: ${rate}`);
  });
  console.log(`${chalk.green("c")}: Custom baud rate`);

  return new Promise((resolve) => {
    rl.question(
      chalk.blue("\nEnter option number or 'c' for custom: "),
      (input) => {
        if (input.toLowerCase() === "c") {
          rl.question(
            chalk.blue("Enter custom baud rate (number): "),
            (customRate) => {
              const parsed = parseInt(customRate);
              if (isNaN(parsed) || parsed <= 0) {
                console.log(
                  chalk.red("❌ Invalid baud rate. Using default 9600.")
                );
                resolve(9600);
              } else {
                resolve(parsed);
              }
            }
          );
        } else {
          const index = parseInt(input) - 1;
          if (index >= 0 && index < COMMON_BAUD_RATES.length) {
            resolve(COMMON_BAUD_RATES[index]);
          } else {
            console.log(chalk.red("❌ Invalid selection. Using default 9600."));
            resolve(9600);
          }
        }
      }
    );
  });
}

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
        async (mode) => {
          mode = mode.trim().toLowerCase();

          /**
           * Create serial port instance and open it
           */
          const baudRate = await askBaudRate();

          const port = new SerialPort({
            path: selectedPortPath,
            baudRate,
            dataBits: 8,
            stopBits: 1,
            parity: "none",
            autoOpen: true,
          });

          port.on("open", () => {
            console.log(
              chalk.greenBright(
                `✅ Port opened on ${selectedPortPath}. Baud rate: ${baudRate}. \nPress Ctrl+C to exit.`
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
