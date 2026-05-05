const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, "node_modules"),
    path.resolve(__dirname, "..", "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = withNativeWind(config, { input: "./app/global.css" });
