module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            // Required for stable Android release bundles when Reanimated/Worklets are installed.
            "react-native-reanimated/plugin",
        ],
    };
};
