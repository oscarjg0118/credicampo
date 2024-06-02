const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development", // Asegúrate de cambiar a 'production' para el despliegue
  entry: {
    index: "./src/index.js",
    ingreso: "./src/ingreso.js",
    registrate: "./src/registrate.js",
    pagos: "./src/pagos.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"), // Directorio estático
    },
    hot: true, // Habilitar Hot Module Replacement
    port: 3000, // Puerto del servidor de desarrollo
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.scss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      chunks: ["index"],
      filename: "index.html",
    }),
    new HtmlWebpackPlugin({
      template: "./public/ingreso.html",
      chunks: ["ingreso"],
      filename: "ingreso.html",
    }),
    new HtmlWebpackPlugin({
      template: "./public/registrate.html",
      chunks: ["registrate"],
      filename: "registrate.html",
    }),
    new HtmlWebpackPlugin({
      template: "./public/pagos.html",
      chunks: ["pagos"],
      filename: "pagos.html",
    }),
  ],
};
