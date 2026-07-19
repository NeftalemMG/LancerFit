// Log an activity. Rebuilt for clean, pixel-aligned mobile layout:
//   • Uniform activity tiles in a strict 2-column grid — every tile is the SAME
//     height/width, full names on two lines, image + icon overlay.
//   • Gold back button (returns to Home) via GoldBackHeader.
//   • Duration quick-picks + manual "any minutes" entry.
//   • Custom "Other" activities: add / pin / delete, persisted on the backend.

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, shadow } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { useApp } from "../context/AppContext";
import { PressScale } from "../components/ui";
import GoldBackHeader from "../components/GoldBackHeader";
import BottomSheetModal from '../components/BottomSheetModal';
import { SportIcon } from "../components/SportIcons";
import { AREAS, DURATIONS } from "../data/activityData";
import { imageForActivity } from "../data/activityImages";
import { CheckIcon } from "../components/icons";
import { logExercise } from "../services/statsApi";
import {
  fetchCustomActivities,
  createCustomActivity,
  pinCustomActivity,
  deleteCustomActivity,
} from "../services/customActivityApi";

// Two equal columns with a consistent gutter.
const H_PADDING = 18;
const GUTTER = 12;
const COL_W = (Dimensions.get("window").width - H_PADDING * 2 - GUTTER) / 2;
const TILE_H = 116;

function ActivityTile({ sub, selected, onPress }) {
  return (
    <PressScale onPress={onPress} style={{ width: COL_W }}>
      <View style={[styles.tile, selected && styles.tileSelected]}>
        <Image
          source={{ uri: imageForActivity(sub) }}
          style={styles.tileImg}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(11,26,45,0.15)", "rgba(11,26,45,0.90)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.tileIconChip}>
          <SportIcon name={sub.icon} size={15} color="#fff" />
        </View>
        {selected && (
          <View style={styles.tileCheck}>
            <CheckIcon size={13} color={colors.goldInk} strokeWidth={3} />
          </View>
        )}
        <Text style={styles.tileName} numberOfLines={2}>
          {sub.name}
        </Text>
      </View>
    </PressScale>
  );
}

function CustomChip({ item, selected, onPress, onLongPress }) {
  return (
    <PressScale onPress={onPress} onLongPress={onLongPress}>
      <View style={[styles.customChip, selected && styles.customChipSelected]}>
        {item.pinned && <Text style={styles.pinDot}>📌</Text>}
        <Text
          style={[styles.customChipText, selected && { color: "#fff" }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </View>
    </PressScale>
  );
}

export default function LogScreen({ navigation }) {
  const { toast, refreshMe } = useApp();

  const [area, setArea] = useState(null);
  const [sub, setSub] = useState(null);
  const [mins, setMins] = useState(30);
  const [manual, setManual] = useState("");
  const [day, setDay] = useState("today");
  const [submitting, setSubmitting] = useState(false);

  const [customs, setCustoms] = useState([]);
  const [customSel, setCustomSel] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [manageItem, setManageItem] = useState(null);

  const loadCustoms = useCallback(async () => {
    try {
      setCustoms(await fetchCustomActivities());
    } catch {
      /* offline */
    }
  }, []);
  useEffect(() => {
    loadCustoms();
  }, [loadCustoms]);

  const manualNum = parseInt(manual, 10);
  const effectiveMins =
    Number.isFinite(manualNum) && manualNum > 0 ? manualNum : mins;
  const points = effectiveMins;
  const hasSelection = !!sub || !!customSel;

  const performedAtISO = () => {
    const d = new Date();
    if (day === "yesterday") d.setDate(d.getDate() - 1);
    return d.toISOString();
  };

  const pickCatalog = (a, s) => {
    setArea(a);
    setSub(s);
    setCustomSel(null);
  };
  const pickCustom = (c) => {
    setCustomSel(c);
    setSub(null);
    setArea(null);
  };

  const goBack = () => {
    if (navigation?.canGoBack?.()) navigation.goBack();
    else navigation?.navigate?.("home");
  };

  const commit = async () => {
    if (!hasSelection || submitting) return;
    setSubmitting(true);
    const isCustom = !!customSel;
    const name = isCustom ? customSel.name : sub.name;
    const key = isCustom ? customSel.key : sub.id;
    try {
      await logExercise({
        exerciseKey: key,
        exerciseName: name,
        areaKey: isCustom ? null : area?.id,
        durationMin: effectiveMins,
        unit: "min",
        performedAt: performedAtISO(),
        isCustom,
      });
      toast(
        `${name} logged · +${points} pts${day === "yesterday" ? " · yesterday" : ""}`,
      );
      setArea(null);
      setSub(null);
      setCustomSel(null);
      setMins(30);
      setManual("");
      setDay("today");
      loadCustoms();
      refreshMe && refreshMe();
    } catch (e) {
      toast(e?.message || "Couldn't log activity");
    } finally {
      setSubmitting(false);
    }
  };

  const addCustom = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      const created = await createCustomActivity(name);
      setNewName("");
      setShowAdd(false);
      await loadCustoms();
      pickCustom(created);
    } catch (e) {
      toast(e?.message || "Couldn't add activity");
    }
  };

  const togglePin = async (item) => {
    try {
      await pinCustomActivity(item.id, !item.pinned);
      setManageItem(null);
      loadCustoms();
    } catch (e) {
      toast(e?.message || "Couldn't update");
    }
  };

  const removeCustom = async (item) => {
    try {
      await deleteCustomActivity(item.id);
      setManageItem(null);
      if (customSel?.id === item.id) setCustomSel(null);
      loadCustoms();
    } catch (e) {
      toast(e?.message || "Couldn't delete");
    }
  };

  return (
    <View style={styles.root}>
      <GoldBackHeader
        title="Log activity"
        onBack={goBack}
        right={
          <View style={styles.dayToggle}>
            {[
              { k: "today", l: "Today" },
              { k: "yesterday", l: "Yest." },
            ].map((d) => {
              const on = day === d.k;
              return (
                <Pressable
                  key={d.k}
                  onPress={() => setDay(d.k)}
                  style={[styles.dayPill, on && styles.dayPillOn]}
                >
                  <Text
                    style={[styles.dayPillText, on && styles.dayPillTextOn]}
                  >
                    {d.l}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Custom activities */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Your activities</Text>
          <PressScale onPress={() => setShowAdd(true)}>
            <View style={styles.addBtn}>
              <Text style={styles.addLink}>+ Add</Text>
            </View>
          </PressScale>
        </View>
        <View style={styles.customRow}>
          {customs.length === 0 ? (
            <Text style={styles.customEmpty}>
              Add your own activity (e.g. Rock Climbing) with "+ Add".
              Long-press to pin or delete.
            </Text>
          ) : (
            customs.map((c) => (
              <CustomChip
                key={c.id}
                item={c}
                selected={customSel?.id === c.id}
                onPress={() => pickCustom(c)}
                onLongPress={() => setManageItem(c)}
              />
            ))
          )}
        </View>

        {/* Catalog areas — strict 2-col grid, uniform tiles */}
        {AREAS.map((a) => (
          <View key={a.id} style={styles.areaBlock}>
            <Text style={styles.areaName}>{a.name}</Text>
            <View style={styles.grid}>
              {a.subs.map((s) => (
                <ActivityTile
                  key={s.id}
                  sub={s}
                  selected={sub?.id === s.id && area?.id === a.id}
                  onPress={() => pickCatalog(a, s)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ── Activity sheet: duration picker + log button ───────────────────── */}
      <BottomSheetModal
        visible={hasSelection}
        onClose={() => {
          setSub(null);
          setCustomSel(null);
        }}
      >
        <Text style={styles.sheetTitle} numberOfLines={1}>
          {customSel ? customSel.name : sub?.name}
        </Text>
        <Text style={styles.sheetSub}>
          {day === "yesterday" ? "Logging for yesterday" : "Logging for today"}
        </Text>

        <View style={styles.durRow}>
          {DURATIONS.map((d) => {
            const on = !manual && mins === d;
            return (
              <PressScale
                key={d}
                onPress={() => {
                  setMins(d);
                  setManual("");
                  Keyboard.dismiss();
                }}
              >
                <View style={[styles.durChip, on && styles.durChipOn]}>
                  <Text style={[styles.durText, on && styles.durTextOn]}>
                    {d}
                  </Text>
                </View>
              </PressScale>
            );
          })}
          <View style={[styles.manualBox, manual ? styles.manualBoxOn : null]}>
            <TextInput
              value={manual}
              onChangeText={setManual}
              keyboardType="number-pad"
              placeholder="Custom Mins"
              placeholderTextColor={colors.text3}
              style={styles.manualInput}
              maxLength={4}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              blurOnSubmit
            />
          </View>
        </View>

        {manual !== "" && (
          <Pressable onPress={() => Keyboard.dismiss()} style={styles.kbDone}>
            <Text style={styles.kbDoneText}>Done entering minutes</Text>
          </Pressable>
        )}

        <Text style={styles.sheetPts}>+{points} points</Text>

        <PressScale onPress={commit} disabled={submitting}>
          <LinearGradient
            colors={[colors.gold, colors.goldDim]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.logBtn}
          >
            {submitting ? (
              <ActivityIndicator color={colors.goldInk} />
            ) : (
              <Text style={styles.logBtnText}>
                Log {effectiveMins} min · +{points} pts
              </Text>
            )}
          </LinearGradient>
        </PressScale>
      </BottomSheetModal>

      {/* ── Add-activity sheet ─────────────────────────────────*/}
      <BottomSheetModal
        visible={showAdd}
        onClose={() => {
          setShowAdd(false);
          setNewName("");
        }}
        maxHeightRatio={0.5}
      >
        <Text style={styles.modalTitle}>New activity</Text>
        <Text style={styles.modalSub}>
          Give it a name. You can pin or delete it later.
        </Text>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="e.g. Rock Climbing"
          placeholderTextColor={colors.text3}
          style={styles.modalInput}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={addCustom}
        />
        <View style={styles.modalBtns}>
          <PressScale
            onPress={() => {
              setShowAdd(false);
              setNewName("");
            }}
            wrapStyle={{ flex: 1 }}
          >
            <View style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </View>
          </PressScale>
          <PressScale onPress={addCustom} wrapStyle={{ flex: 1 }}>
            <LinearGradient
              colors={[colors.blue2, colors.blue]}
              style={styles.modalAdd}
            >
              <Text style={styles.modalAddText}>Add</Text>
            </LinearGradient>
          </PressScale>
        </View>
      </BottomSheetModal>

      {/* ── Manage-activity sheet: pin/delete action list ──────────────────── */}
      <BottomSheetModal
        visible={!!manageItem}
        onClose={() => setManageItem(null)}
        maxHeightRatio={0.4}
      >
        <Text style={styles.modalTitle}>{manageItem?.name}</Text>
        <PressScale onPress={() => togglePin(manageItem)}>
          <View style={styles.manageRow}>
            <Text style={styles.manageText}>
              {manageItem?.pinned ? "📌  Unpin from top" : "📌  Pin to top"}
            </Text>
          </View>
        </PressScale>
        <PressScale onPress={() => removeCustom(manageItem)}>
          <View style={styles.manageRow}>
            <Text style={[styles.manageText, { color: "#E5695B" }]}>
              🗑 Delete activity
            </Text>
          </View>
        </PressScale>
        <PressScale onPress={() => setManageItem(null)}>
          <View style={[styles.manageRow, { justifyContent: "center" }]}>
            <Text style={styles.manageCancel}>Cancel</Text>
          </View>
        </PressScale>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  body: { paddingHorizontal: H_PADDING, paddingTop: 8, paddingBottom: 140 },

  dayToggle: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 11,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.cardLine,
  },
  dayPill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  dayPillOn: { backgroundColor: colors.gold },
  dayPillText: {
    fontFamily: disp.semibold,
    fontSize: 12.5,
    color: colors.text2,
  },
  dayPillTextOn: { color: colors.goldInk },
  manualBoxOn: {
    borderColor: colors.goldLine,
    backgroundColor: colors.goldSoft,
  },
  kbDone: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.blueSoft,
    borderWidth: 1,
    borderColor: colors.blueLine,
  },
  kbDoneText: { fontFamily: disp.semibold, fontSize: 13, color: colors.blue2 },

  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: disp.bold, fontSize: 16, color: colors.text },
  addBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  addLink: { fontFamily: disp.bold, fontSize: 13, color: colors.gold },
  customRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
  },
  customEmpty: {
    fontFamily: body.regular,
    fontSize: 12.5,
    color: colors.text3,
    lineHeight: 18,
  },
  customChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardLine,
  },
  customChipSelected: {
    backgroundColor: colors.blue,
    borderColor: colors.blue2,
  },
  customChipText: {
    fontFamily: body.semibold,
    fontSize: 13,
    color: colors.text2,
    maxWidth: 160,
  },
  pinDot: { fontSize: 11 },

  areaBlock: { marginBottom: 24 },
  areaName: {
    fontFamily: disp.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GUTTER },
  tile: {
    width: "100%",
    height: TILE_H,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.cardLine,
    justifyContent: "flex-end",
  },
  tileSelected: { borderColor: colors.gold, borderWidth: 2 },
  tileImg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  tileIconChip: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.40)",
    alignItems: "center",
    justifyContent: "center",
  },
  tileCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  tileName: {
    fontFamily: disp.semibold,
    fontSize: 14,
    lineHeight: 17,
    color: "#fff",
    paddingHorizontal: 11,
    paddingBottom: 11,
  },
  sheetTitle: {
    fontFamily: disp.bold,
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.4,
  },
  sheetSub: {
    fontFamily: body.regular,
    fontSize: 13,
    color: colors.text2,
    marginVertical: 8,
  },
  sheetPts: {
    fontFamily: disp.bold,
    fontSize: 15,
    color: colors.gold,
    marginVertical: 8,
  },
  durRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  durChip: {
    width: 50,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardLine,
  },
  durChipOn: { backgroundColor: colors.goldSoft, borderColor: colors.goldLine },
  durText: { fontFamily: disp.semibold, fontSize: 13.5, color: colors.text2 },
  durTextOn: { color: colors.gold },
  manualBox: {
    minWidth: 66,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardLine,
  },
  manualInput: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontFamily: disp.semibold,
    fontSize: 13.5,
    color: colors.text,
    textAlign: "center",
  },
  logBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    ...shadow.accent("rgba(216,169,74,0.7)"),
  },
  logBtnText: { fontFamily: disp.bold, fontSize: 15, color: colors.goldInk },
  modalTitle: { fontFamily: disp.bold, fontSize: 18, color: colors.text },
  modalSub: {
    fontFamily: body.regular,
    fontSize: 13,
    color: colors.text2,
    marginVertical: 8,
  },
  modalInput: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardLine,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontFamily: body.medium,
    fontSize: 15,
    color: colors.text,
  },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 16 },
  modalCancel: {
    paddingVertical: 13,
    borderRadius: radius.md,
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardLine,
  },
  modalCancelText: {
    fontFamily: disp.semibold,
    fontSize: 14,
    color: colors.text2,
  },
  modalAdd: {
    paddingVertical: 13,
    borderRadius: radius.md,
    alignItems: "center",
  },
  modalAddText: { fontFamily: disp.bold, fontSize: 14, color: "#fff" },
  manageRow: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.cardLine,
  },
  manageText: { fontFamily: body.semibold, fontSize: 15, color: colors.text },
  manageCancel: {
    fontFamily: body.semibold,
    fontSize: 14,
    color: colors.text3,
  },
});
