import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
// import * as ImagePicker from "expo-image-picker";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import * as ImagePicker from "expo-image-picker";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Svg, { Line } from "react-native-svg";
import Canvas from "react-native-canvas";

const image = () => {
  const [image, setImage] = React.useState<{
    uri: string;
    height: number;
    width: number;
  } | null>(null);
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      aspect: [16, 9],
      quality: 1,
    });
    console.log(result);
    if (!result.canceled) {
      setImage({
        uri: result.assets[0].uri,
        height: result.assets[0].height,
        width: result.assets[0].width,
      });
    }
  };
  const [pins, setPins] = React.useState<{ x: number; y: number }[]>([]);
  const screenWidth = Dimensions.get("window").width;
  const handleTap = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    console.log(locationX, locationY);
    setPins((prev) => [...prev, { x: locationX, y: locationY }]);
  };
  React.useEffect(() => {
    setPins([]);
  }, [image?.uri]);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = Dimensions.get("window").width;
      canvas.height = Dimensions.get("window").height;
      drawLines(canvas);
    }
  }, [pins]);
  const drawLines = (canvas: any) => {
    if (!canvas || !pins.length) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;

    ctx.beginPath();
    pins.forEach((pin, index) => {
      if (index === 0) {
        ctx.moveTo(pin.x, pin.y);
      } else {
        ctx.lineTo(pin.x, pin.y);
      }
    });
    ctx.stroke();
  };
  const canvasRef = React.useRef(null);
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ marginBottom: 20, color: "#fff" }}>Select an image</Text>
        <ReactNativeZoomableView
          maxZoom={5}
          minZoom={0.5}
          bindToBorders={true}
          initialZoom={1}
          style={styles.zoonContainer}
        >
          {image ? (
            <View
              style={
                (styles.imageContainer,
                {
                  height: (screenWidth * image.height) / image.width,
                  width: screenWidth,
                })
              }
            >
              <TouchableOpacity
                onPress={handleTap}
                style={{
                  backgroundColor: "pink",
                  height: (screenWidth * image.height) / image.width - 0.15,
                  width: screenWidth,
                  zIndex: 1,
                }}
                activeOpacity={1}
              >
                <Image
                  source={{ uri: image?.uri }}
                  style={{
                    width: Dimensions.get("window").width,
                    height: Dimensions.get("window").height,
                    position: "relative",
                    zIndex: 2,
                    flex: 1,
                  }}
                  resizeMode="contain"
                />
                <Canvas ref={canvasRef} style={styles.canvas} />
              </TouchableOpacity>
              {pins.map((pin, index) => (
                <View
                  key={index}
                  style={[
                    styles.pin,
                    { left: pin.x - 7.5, top: pin.y - 7.5 }, // Offset to center the pin
                  ]}
                />
              ))}
              {/* <View style={{ position: "absolute", zIndex: 9 }}>
                {pins.map((pin, index) => {
                  if (index === 0) return null;
                  const prevPin = pins[index - 1];
                  return drawLine(prevPin.x, prevPin.y, pin.x, pin.y);
                })}
              </View> */}
              ;
            </View>
          ) : (
            <Text>No image selected</Text>
          )}
        </ReactNativeZoomableView>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text>Select Image</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default image;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  zoonContainer: {
    flex: 1,
    width: Dimensions.get("window").width,
    // padding: 20,
    backgroundColor: "#000",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  pin: {
    position: "absolute",
    width: 15,
    height: 15,
    backgroundColor: "red",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "white",
    zIndex: 1,
  },
  button: {
    marginVertical: 20,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 25,
  },
  canvas: {
    position: "absolute",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    backgroundColor: "transparent",
    zIndex: 5,
  },
});
