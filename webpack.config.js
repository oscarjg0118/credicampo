const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js",
    ingreso: "./src/ingreso.js",
    registrate: "./src/registrate.js",
    pagos: "./src/pagos.js", // Agregando la entrada para registrate.js
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  devServer: {
    static: path.resolve(__dirname, "dist"),
    hot: true,
    port: 3000,
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
    }), // Instancia de HtmlWebpackPlugin para registrate.html
    new HtmlWebpackPlugin({
      template: "./public/pagos.html",
      chunks: ["pagos"],
      filename: "pagos.html",
    }),
  ],
};
