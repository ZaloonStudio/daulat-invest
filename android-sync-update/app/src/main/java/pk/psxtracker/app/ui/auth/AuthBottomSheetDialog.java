package pk.psxtracker.app.ui.auth;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.tabs.TabLayout;
import com.google.firebase.auth.FirebaseUser;

import pk.psxtracker.app.R;
import pk.psxtracker.app.data.firebase.FirebaseSyncManager;

public class AuthBottomSheetDialog extends BottomSheetDialogFragment {
    private FirebaseSyncManager firebaseSync;
    private OnAuthStatusChangedListener listener;
    private GoogleSignInClient googleSignInClient;
    private ActivityResultLauncher<Intent> googleSignInLauncher;
    private ActivityResultLauncher<Intent> accountChooserLauncher;
    private TextView tvError;
    private int webClientIdRes = 0;

    public interface OnAuthStatusChangedListener {
        void onAuthStatusChanged();
    }

    public void setListener(OnAuthStatusChangedListener listener) {
        this.listener = listener;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webClientIdRes = getResources().getIdentifier("default_web_client_id", "string", requireContext().getPackageName());
        String serverClientId = webClientIdRes != 0 ? getString(webClientIdRes) : getString(R.string.google_server_client_id);
        GoogleSignInOptions options = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail().requestIdToken(serverClientId).build();
        googleSignInClient = GoogleSignIn.getClient(requireActivity(), options);
        googleSignInLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
                showGoogleError("Google sign-in was cancelled. Your existing cloud data is unchanged.");
                return;
            }
            try {
                GoogleSignInAccount account = GoogleSignIn.getSignedInAccountFromIntent(result.getData()).getResult(ApiException.class);
                firebaseSync.handleGoogleSignInAccount(account, new FirebaseSyncManager.AuthCallback() {
                    @Override public void onSuccess(FirebaseUser user) {
                        if (!isAdded()) return;
                        Toast.makeText(requireContext(), "Signed in and cloud portfolio loaded", Toast.LENGTH_SHORT).show();
                        if (listener != null) listener.onAuthStatusChanged();
                        dismiss();
                    }
                    @Override public void onError(String message) { showGoogleError(message); }
                });
            } catch (ApiException error) {
                showGoogleError(error.getStatusCode() == 10
                        ? "Google sign-in configuration needs updating for this app signing certificate. Please contact Daulat support."
                        : "Google could not verify this sign-in. Please retry.");
            }
        });
    }

    private void showGoogleError(String message) {
        if (!isAdded()) return;
        if (tvError != null) { tvError.setText(message != null ? message : "Sign-in failed"); tvError.setVisibility(View.VISIBLE); }
    }

    private void startGoogleSignInFlow() {
        if (tvError != null) tvError.setVisibility(View.GONE);
        try { googleSignInLauncher.launch(googleSignInClient.getSignInIntent()); }
        catch (Exception error) { showGoogleError("Google Play Services is required for Google sign-in. You can use email sign-in instead."); }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.dialog_auth, container, false);
    }

    @Override
    public void onStart() {
        super.onStart();
        if (getDialog() != null && getDialog().getWindow() != null) {
            View bottomSheet = getDialog().getWindow().findViewById(com.google.android.material.R.id.design_bottom_sheet);
            if (bottomSheet != null) {
                bottomSheet.setBackgroundResource(android.R.color.transparent);
            }
        }
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        firebaseSync = FirebaseSyncManager.getInstance(requireContext());

        LinearLayout llLoggedInSection = view.findViewById(R.id.llLoggedInSection);
        TextView tvUserEmail = view.findViewById(R.id.tvUserEmail);
        Button btnSignOut = view.findViewById(R.id.btnSignOut);

        LinearLayout llAuthFormSection = view.findViewById(R.id.llAuthFormSection);
        MaterialButton btnGoogleSignIn = view.findViewById(R.id.btnGoogleSignIn);
        TabLayout tabLayoutAuth = view.findViewById(R.id.tabLayoutAuth);
        EditText etEmail = view.findViewById(R.id.etAuthEmail);
        EditText etPassword = view.findViewById(R.id.etAuthPassword);
        tvError = view.findViewById(R.id.tvAuthError);
        Button btnSubmit = view.findViewById(R.id.btnSubmitAuth);

        if (btnGoogleSignIn != null) {
            btnGoogleSignIn.setOnClickListener(v -> startGoogleSignInFlow());
        }

        boolean isSignedIn = firebaseSync.isUserSignedIn();

        if (isSignedIn) {
            llLoggedInSection.setVisibility(View.VISIBLE);
            llAuthFormSection.setVisibility(View.GONE);
            tvUserEmail.setText(firebaseSync.getUserEmail());

            btnSignOut.setOnClickListener(v -> {
                firebaseSync.signOut();
                if (googleSignInClient != null) {
                    googleSignInClient.signOut();
                }
                Toast.makeText(requireContext(), "Signed out", Toast.LENGTH_SHORT).show();
                if (listener != null) listener.onAuthStatusChanged();
                dismiss();
            });
        } else {
            llLoggedInSection.setVisibility(View.GONE);
            llAuthFormSection.setVisibility(View.VISIBLE);

            tabLayoutAuth.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
                @Override
                public void onTabSelected(TabLayout.Tab tab) {
                    if (tab.getPosition() == 0) {
                        btnSubmit.setText("Sign In");
                    } else {
                        btnSubmit.setText("Create Account");
                    }
                    tvError.setVisibility(View.GONE);
                }

                @Override
                public void onTabUnselected(TabLayout.Tab tab) {}

                @Override
                public void onTabReselected(TabLayout.Tab tab) {}
            });

            btnSubmit.setOnClickListener(v -> {
                String email = etEmail.getText() != null ? etEmail.getText().toString().trim() : "";
                String password = etPassword.getText() != null ? etPassword.getText().toString().trim() : "";

                if (email.isEmpty() || !email.contains("@")) {
                    tvError.setText("Please enter a valid email address");
                    tvError.setVisibility(View.VISIBLE);
                    return;
                }

                if (password.length() < 6) {
                    tvError.setText("Password must be at least 6 characters");
                    tvError.setVisibility(View.VISIBLE);
                    return;
                }

                tvError.setVisibility(View.GONE);
                btnSubmit.setEnabled(false);
                btnSubmit.setText("Processing...");

                boolean isSignInTab = tabLayoutAuth.getSelectedTabPosition() == 0;

                FirebaseSyncManager.AuthCallback callback = new FirebaseSyncManager.AuthCallback() {
                    @Override
                    public void onSuccess(FirebaseUser user) {
                        if (!isAdded()) return;
                        Toast.makeText(requireContext(), (isSignInTab ? "Signed in as " : "Account created for ") + email, Toast.LENGTH_SHORT).show();
                        if (listener != null) listener.onAuthStatusChanged();
                        dismiss();
                    }

                    @Override
                    public void onError(String message) {
                        if (!isAdded()) return;
                        btnSubmit.setEnabled(true);
                        btnSubmit.setText(isSignInTab ? "Sign In" : "Create Account");
                        tvError.setText(message != null ? message : "Authentication failed");
                        tvError.setVisibility(View.VISIBLE);
                    }
                };

                if (isSignInTab) {
                    firebaseSync.signIn(email, password, callback);
                } else {
                    firebaseSync.signUp(email, password, callback);
                }
            });
        }
    }
}
