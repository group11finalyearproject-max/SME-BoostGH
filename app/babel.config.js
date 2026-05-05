module.exports = function (api) {
    api.cache(true);
    return {
        presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
        plugins: [
            "nativewind/babel",
            // Required for stable Android release bundles when Reanimated/Worklets are installed.
            "react-native-reanimated/plugin",
        ],
    };
};
