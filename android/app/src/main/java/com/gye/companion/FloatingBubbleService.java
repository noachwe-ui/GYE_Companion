package com.gye.companion;

import android.app.Service;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;

public class FloatingBubbleService extends Service {

    private WindowManager windowManager;
    private View bubbleView;

    @Override
    public IBinder onBind(Intent intent) { 
        return null; 
    }

    @Override
    public void onCreate() {
        super.onCreate();
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        // Circular shield bubble UI
        TextView bubble = new TextView(this);
        bubble.setText("🛡️");
        bubble.setTextSize(22);
        bubble.setPadding(24, 24, 24, 24);
        bubble.setBackgroundColor(Color.parseColor("#0088CC"));
        bubbleView = bubble;

        int layoutType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O ?
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY :
                WindowManager.LayoutParams.TYPE_PHONE;

        final WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                layoutType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.START;
        params.x = 20;
        params.y = 300;

        // Drag and tap logic
        bubbleView.setOnTouchListener(new View.OnTouchListener() {
            private int initialX, initialY;
            private float initialTouchX, initialTouchY;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        params.x = initialX + (int) (event.getRawX() - initialTouchX);
                        params.y = initialY + (int) (event.getRawY() - initialTouchY);
                        windowManager.updateViewLayout(bubbleView, params);
                        return true;
                    case MotionEvent.ACTION_UP:
                        // Tap bubble to immediately open GYE Companion support interface
                        if (Math.abs(event.getRawX() - initialTouchX) < 10) {
                            Intent appIntent = new Intent(FloatingBubbleService.this, MainActivity.class);
                            appIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(appIntent);
                        }
                        return true;
                }
                return false;
            }
        });

        windowManager.addView(bubbleView, params);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (bubbleView != null) windowManager.removeView(bubbleView);
    }
}

