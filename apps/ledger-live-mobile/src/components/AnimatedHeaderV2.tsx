// TODO : Working on

import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  FlatList,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  useTheme,
  useIsFocused,
} from "@react-navigation/native";
import Animated from "react-native-reanimated";
import * as Animatable from "react-native-animatable";
import { StackNavigationProp } from "@react-navigation/stack";
import { Flex, ScrollContainer, Text } from "@ledgerhq/native-ui";
import Styles from "../navigation/styles";
import LText from "./LText";
import { width } from "../helpers/normalizeSize";
import ArrowLeft from "../icons/ArrowLeft";
import { Theme } from "../colors";

type WildcardNavigation = StackNavigationProp<
  Record<string, object | undefined>
>;

const { interpolateNode, Extrapolate } = Animated;
const AnimatedView = Animatable.View;
const hitSlop = {
  bottom: 10,
  left: 24,
  right: 24,
  top: 10,
};

export const BackButton = ({
  colors,
  navigation,
  action,
}: {
  colors: Theme["colors"];
  navigation: WildcardNavigation;
  action?: () => void;
}) => (
  <TouchableOpacity
    hitSlop={hitSlop}
    style={styles.buttons}
    onPress={() => (action ? action() : navigation.goBack())}
  >
    <ArrowLeft size={18} color={colors.darkBlue} />
  </TouchableOpacity>
);

type Props = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  listTitle?: React.ReactNode;
  list?: string[];
  listElementAction?: React.Dispatch<React.SetStateAction<string>>;
  hasBackButton?: boolean;
  hasCloseButton?: boolean;
  backAction?: () => void;
  closeAction?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  edges?: ("top" | "right" | "left" | "bottom")[];
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
export default function AnimatedHeaderViewV2({
  title,
  subtitle,
  listTitle,
  list,
  listElementAction,
  hasBackButton,
  backAction,
  children,
  footer,
  titleStyle,
  edges,
  style,
}: Props) {
  const { colors } = useTheme();
  const navigation = useNavigation<WildcardNavigation>();
  const [selectedListItem, setSelectedListItem] = useState("all");
  const [isReady, setReady] = useState(false);
  const onLayoutText = useCallback(() => {
    setReady(true);
  }, []);
  const [scrollY] = useState(new Animated.Value(0));
  const isFocused = useIsFocused();
  const eventArgs = [
    {
      nativeEvent: {
        contentOffset: {
          y: scrollY,
        },
      },
    },
    {
      useNativeDriver: true,
    },
  ];
  const event = Animated.event<typeof eventArgs>(eventArgs);
  // Animation
  const translateY = interpolateNode(scrollY, {
    inputRange: [0, 76],
    outputRange: [0, Platform.OS === "ios" ? -54 : -50],
    extrapolate: Extrapolate.CLAMP,
  });
  const translateYList = interpolateNode(scrollY, {
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: Extrapolate.CLAMP,
  });
  const translateX = interpolateNode(scrollY, {
    inputRange: [0, 76],
    outputRange: [0, hasBackButton ? -5 : -40],
    extrapolate: Extrapolate.CLAMP,
  });
  const scale = interpolateNode(scrollY, {
    inputRange: [0, 76],
    outputRange: [1, 0.8],
    extrapolate: Extrapolate.CLAMP,
  });
  const opacity = interpolateNode(scrollY, {
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: Extrapolate.CLAMP,
  });
  const heightHeader = interpolateNode(scrollY, {
    inputRange: [0, 100],
    outputRange: Platform.OS === "ios" ? [110, 110] : [240, 140],
    extrapolate: Extrapolate.CLAMP,
  });
  const paddingTopScrollView = interpolateNode(scrollY, {
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: Extrapolate.CLAMP,
  });
  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.header,
          {
            height: heightHeader,
          },
        ]}
      >
        <View style={styles.topHeader}>
          {hasBackButton && (
            <BackButton
              colors={colors}
              navigation={navigation}
              action={backAction}
            />
          )}
        </View>

        <Animated.View
          style={[
            styles.titleContainer,
            {
              transform: [
                {
                  translateY,
                  translateX,
                  scale,
                },
              ],
            },
          ]}
          onLayout={onLayoutText}
        >
          <LText
            variant="h1"
            bold
            style={[styles.title, titleStyle]}
            numberOfLines={4}
          >
            {title}
          </LText>
          <Animated.View style={[{ opacity }]}>
            {subtitle !== undefined ? (
              <LText
                variant="subtitle"
                numberOfLines={4}
                style={{ color: "#999" }}
              >
                {subtitle}
              </LText>
            ) : null}
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            styles.listCategory,
            {
              transform: [
                {
                  translateY: translateYList,
                },
              ],
            },
          ]}
          onLayout={onLayoutText}
        >
          {list !== undefined &&
          listElementAction !== undefined &&
          listTitle !== undefined ? (
            <>
              <Animated.View style={[{ opacity }]}>
                <LText
                  style={styles.listCategoryTitle}
                  variant="h5"
                  bold
                  numberOfLines={4}
                >
                  {listTitle}
                </LText>
              </Animated.View>
              <ScrollContainer style={styles.listScrollContainer} horizontal>
                {list.map((value: string, index) => (
                  <Flex mr={index === list.length - 1 ? 8 : 7} key={index}>
                    <View
                      style={value === selectedListItem && badgesStyle.wrapper}
                    >
                      <Text
                        onPress={() => {
                          setSelectedListItem(value);
                          listElementAction(value);
                        }}
                        style={[
                          badgesStyle.main,
                          ...(value === selectedListItem
                            ? [badgesStyle.active]
                            : []),
                        ]}
                        variant={"subtitle"}
                      >
                        {value}
                      </Text>
                    </View>
                  </Flex>
                ))}
              </ScrollContainer>
            </>
          ) : null}
        </Animated.View>
      </Animated.View>
      {children && isReady && (
        <AnimatedView
          animation="fadeInUp"
          delay={50}
          duration={300}
          style={styles.containerScrollArea}
        >
          <AnimatedFlatList
            style={[
              { paddingTop: Platform.OS === "ios" ? 60 : paddingTopScrollView },
            ]}
            onScroll={event}
            scrollEventThrottle={10}
            contentContainerStyle={[styles.scrollArea]}
            testID={isFocused ? "ScrollView" : undefined}
            data={[children]}
            renderItem={({ item, index }) => <View key={index}>{item}</View>}
          />
        </AnimatedView>
      )}
      {footer}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignContent: "center",
    height: 55,
  },
  spacer: {
    flex: 1,
  },
  header: {
    ...Styles.headerNoShadow,
    backgroundColor: "transparent",
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 0 : 40,
    flexDirection: "column",
    overflow: "visible",
    zIndex: 1,
  },
  titleContainer: {
    paddingHorizontal: 16,
    zIndex: 2,
  },
  title: {
    lineHeight: 45,
  },
  listCategory: {
    width,
    paddingTop: 20,
  },
  listCategoryTitle: {
    paddingLeft: 16,
    paddingBottom: Platform.OS === "ios" ? 10 : 5,
  },
  listScrollContainer: {
    marginTop: 4,
    paddingLeft: 16,
    paddingTop: 4,
    zIndex: 3,
    height: 50,
  },
  buttons: {
    paddingVertical: 16,
  },
  containerScrollArea: {
    marginTop: 0,
    zIndex: -10,
  },
  scrollArea: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 116,
    zIndex: -10,
  },
});

type BadgeType = "main" | "primary";

export interface BadgeProps {
  badgeVariant?: BadgeType;
  active?: boolean;
  children: React.ReactNode;
}

const badgesStyle = StyleSheet.create({
  main: {
    color: "#aaa",
    fontWeight: "bold",
    fontSize: 15,
  },
  wrapper: {
    borderBottomColor: "black",
    borderBottomWidth: 3,
  },
  active: {
    color: "black",
    paddingBottom: 4,
  },
  primary: {
    color: "primary.c90",
  },
});
