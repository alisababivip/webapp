import { Image, StyleSheet, View } from "react-native";

export default function Loading() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://media.shb32.com/public/hb88/site-ttkm/09fdcfbe-277d-49f8-8918-d8b1ff8dc3e9.png" }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  image: {
    width: 300,
    height: 300,
  },
});
