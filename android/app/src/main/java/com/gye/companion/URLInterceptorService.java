ackage com.gye.companion;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.content.Intent;
import android.content.SharedPreferences;

public class URLInterceptorService extends AccessibilityService {

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;

        // Retrieve user preferences from Capacitor storage
        SharedPreferences prefs = getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
        boolean bubbleEnabled = !"false".equals(prefs.getString("gye_bubble_enabled", "true"));
        boolean filterEnabled = !"false".equals(prefs.getString("gye_filter_enabled", "true"));

        // 1. Floating Shield Bubble Management
        if (bubbleEnabled) {
            CharSequence packageName = event.getPackageName();
            if (packageName != null && "com.android.chrome".equals(packageName.toString())) {
                Intent startBubble = new Intent(this, FloatingBubbleService.class);
                startService(startBubble);
            } else {
                Intent stopBubble = new Intent(this, FloatingBubbleService.class);
                stopService(stopBubble);
            }
        } else {
            Intent stopBubble = new Intent(this, FloatingBubbleService.class);
            stopService(stopBubble);
        }

        // 2. Interceptor / Filter Management
        if (filterEnabled) {
            AccessibilityNodeInfo nodeInfo = event.getSource();
            if (nodeInfo != null) {
                String textOnScreen = findTextOrUrl(nodeInfo);
                if (textOnScreen != null && isTriggered(textOnScreen.toLowerCase())) {
                    Intent intent = new Intent(this, MainActivity.class);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    intent.putExtra("SHOW_BLOCK_PAGE", true);
                    startActivity(intent);
                }
            }
        }
    }

    private String findTextOrUrl(AccessibilityNodeInfo node) {
        if (node == null) return null;
        if (node.getText() != null && node.getText().length() > 0) {
            return node.getText().toString();
        }
        for (int i = 0; i < node.getChildCount(); i++) {
            String childText = findTextOrUrl(node.getChild(i));
            if (childText != null) return childText;
        }
        return null;
    }

    private boolean isTriggered(String input) {
        String[] defaultBlocked = {"badterm1", "badterm2"};
        for (String term : defaultBlocked) {
            if (input.contains(term)) return true;
        }
        return false;
    }

    @Override
    public void onInterrupt() {}
}

