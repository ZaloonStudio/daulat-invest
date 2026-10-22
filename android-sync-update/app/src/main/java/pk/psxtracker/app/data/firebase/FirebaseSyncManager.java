package pk.psxtracker.app.data.firebase;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.GoogleAuthProvider;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.firestore.SetOptions;
import com.google.firebase.firestore.Source;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.json.JSONObject;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import pk.psxtracker.app.data.local.LocalDataManager;
import pk.psxtracker.app.data.model.PortfolioHolding;
import pk.psxtracker.app.data.model.SoldTrade;

public class FirebaseSyncManager {
    private static final String TAG = "FirebaseSyncManager";
    private static volatile FirebaseSyncManager instance;
    private final FirebaseAuth auth;
    private final FirebaseFirestore db;
    private final LocalDataManager localData;
    private final AccountLocalArchive archive;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final OkHttpClient http = new OkHttpClient.Builder().callTimeout(20, TimeUnit.SECONDS).build();
    private String resolvedAuthUid;
    private String resolvedOwnerUid;

    public interface AuthCallback { void onSuccess(FirebaseUser user); void onError(String message); }
    public interface SyncCallback {
        void onSyncComplete();
        default void onSyncError(String message) { Log.w(TAG, message); }
    }
    private interface OwnerCallback { void complete(String owner); void failed(String message); }
    private FirebaseSyncManager(Context context) {
        auth = FirebaseAuth.getInstance(); db = FirebaseFirestore.getInstance();
        localData = LocalDataManager.getInstance(context);
        archive = new AccountLocalArchive(context.getApplicationContext(), localData);
    }
    public static FirebaseSyncManager getInstance(Context context) {
        if (instance == null) synchronized (FirebaseSyncManager.class) {
            if (instance == null) instance = new FirebaseSyncManager(context);
        }
        return instance;
    }
    public boolean isUserSignedIn() { return auth.getCurrentUser() != null; }
    public FirebaseUser getCurrentUser() { return auth.getCurrentUser(); }
    public String getUserEmail() {
        FirebaseUser user = auth.getCurrentUser();
        return user != null && user.getEmail() != null ? user.getEmail() : "Guest";
    }
    // Never authorize a cloud path using a device email, Google ID or guessed hash.
    public String getUserId() {
        FirebaseUser user = auth.getCurrentUser();
        return user != null && user.getUid().equals(resolvedAuthUid) ? resolvedOwnerUid : null;
    }
    private boolean current(String uid, String owner) {
        FirebaseUser user = auth.getCurrentUser();
        return user != null && user.getUid().equals(uid) && owner != null && owner.equals(getUserId());
    }
    private void resolveOwner(FirebaseUser user, OwnerCallback callback) {
        final String uid = user.getUid();
        user.getIdToken(false).addOnSuccessListener(token -> {
            if (auth.getCurrentUser() == null || !uid.equals(auth.getCurrentUser().getUid())) return;
            Request request = new Request.Builder().url("https://www.daulatinvest.com/api/account-link")
                    .header("Authorization", "Bearer " + token.getToken())
                    .post(RequestBody.create("{}", MediaType.parse("application/json"))).build();
            http.newCall(request).enqueue(new Callback() {
                @Override public void onFailure(Call call, IOException error) {
                    main.post(() -> { if (auth.getCurrentUser()!=null && uid.equals(auth.getCurrentUser().getUid())) callback.failed("Signed in, but cloud connection failed. Your saved data is unchanged. Retry sync."); });
                }
                @Override public void onResponse(Call call, Response response) {
                    try (Response closeable = response) {
                        JSONObject result = new JSONObject(response.body() != null ? response.body().string() : "{}");
                        String owner = result.optString("dataOwnerUid", "");
                        if (!response.isSuccessful() || !uid.equals(result.optString("uid")) || !owner.matches("[A-Za-z0-9_-]{1,128}")) throw new IOException("Account could not be verified");
                        main.post(() -> {
                            if (auth.getCurrentUser()==null || !uid.equals(auth.getCurrentUser().getUid())) return;
                            resolvedAuthUid=uid; resolvedOwnerUid=owner;
                            archive.switchTo(uid);
                            callback.complete(owner);
                        });
                    } catch (Exception error) {
                        main.post(() -> { if(auth.getCurrentUser()!=null && uid.equals(auth.getCurrentUser().getUid())) callback.failed("Cloud account verification failed. Retry sync; no data has been moved."); });
                    }
                }
            });
        }).addOnFailureListener(error -> callback.failed("Your sign-in session needs refreshing. Sign in again."));
    }
    private void finishSignIn(FirebaseUser user, AuthCallback callback) {
        if (user == null) { callback.onError("Sign-in failed"); return; }
        syncDownUserData(new SyncCallback() {
            @Override public void onSyncComplete() { if(auth.getCurrentUser()!=null && user.getUid().equals(auth.getCurrentUser().getUid())) callback.onSuccess(user); }
            @Override public void onSyncError(String message) { callback.onError(message); }
        });
    }
    public void signIn(String email, String password, AuthCallback callback) {
        auth.signInWithEmailAndPassword(email,password).addOnSuccessListener(result -> finishSignIn(result.getUser(),callback))
                .addOnFailureListener(error -> callback.onError("Sign-in failed. Check your email and password."));
    }
    public void signUp(String email, String password, AuthCallback callback) {
        // Do not upload unassigned/previous-account local records into a new account.
        auth.createUserWithEmailAndPassword(email,password).addOnSuccessListener(result -> finishSignIn(result.getUser(),callback))
                .addOnFailureListener(error -> callback.onError("Account could not be created. Try signing in or resetting your password."));
    }
    public void signInWithGoogle(String idToken, AuthCallback callback) {
        if (idToken==null || idToken.trim().isEmpty()) { callback.onError("Google did not verify this account. Please retry Google sign-in."); return; }
        auth.signInWithCredential(GoogleAuthProvider.getCredential(idToken,null)).addOnSuccessListener(result -> finishSignIn(result.getUser(),callback))
                .addOnFailureListener(error -> callback.onError("Google sign-in could not be verified. Retry or use your existing sign-in method."));
    }
    public void handleGoogleSignInAccount(GoogleSignInAccount account, AuthCallback callback) {
        if(account==null || account.getIdToken()==null) { callback.onError("A verified Google sign-in is required. Selecting a device email alone cannot sign you in."); return; }
        signInWithGoogle(account.getIdToken(),callback);
    }
    public void signOut() {
        archive.archiveAndClear();
        auth.signOut(); resolvedAuthUid=null; resolvedOwnerUid=null; localData.clearGoogleUser();
    }
    public void syncDownUserData(SyncCallback callback) {
        FirebaseUser user=auth.getCurrentUser();
        if(user==null) { if(callback!=null)callback.onSyncError("Sign in to sync your portfolio."); return; }
        final String authUid=user.getUid();
        resolveOwner(user,new OwnerCallback() {
            @Override public void failed(String message) { if(callback!=null)callback.onSyncError(message); }
            @Override public void complete(String owner) {
                Task<QuerySnapshot> watch=db.collection("users").document(owner).collection("watchlist").get(Source.SERVER);
                Task<QuerySnapshot> holdings=db.collection("users").document(owner).collection("portfolio").get(Source.SERVER);
                Task<QuerySnapshot> trades=db.collection("users").document(owner).collection("trades").get(Source.SERVER);
                Tasks.whenAllSuccess(watch,holdings,trades).addOnSuccessListener(ignored -> {
                    if(!current(authUid,owner))return;
                    Set<String> symbols=new HashSet<>();
                    for(DocumentSnapshot document:watch.getResult()) { String symbol=document.getString("symbol"); if(symbol!=null)symbols.add(symbol.toUpperCase()); }
                    List<PortfolioHolding> cloudHoldings=new ArrayList<>();
                    for(DocumentSnapshot document:holdings.getResult()) {
                        PortfolioHolding holding=new PortfolioHolding(); holding.setId(document.getId());
                        holding.setSymbol(document.getString("symbol")); holding.setCompanyName(document.getString("companyName"));
                        holding.setShares((int)number(document,"shares")); holding.setBuyPrice(number(document,"buyPrice")); holding.setBuyDate((long)number(document,"buyDate")); cloudHoldings.add(holding);
                    }
                    List<SoldTrade> cloudTrades=new ArrayList<>();
                    for(DocumentSnapshot document:trades.getResult()) {
                        SoldTrade trade=new SoldTrade(); trade.setId(document.getId()); trade.setSymbol(document.getString("symbol"));trade.setCompanyName(document.getString("companyName"));
                        trade.setSharesSold((int)number(document,document.contains("sharesSold")?"sharesSold":"shares"));trade.setBuyPrice(number(document,"buyPrice"));trade.setSellPrice(number(document,"sellPrice"));trade.setSellDate((long)number(document,document.contains("sellDate")?"sellDate":"soldDate"));cloudTrades.add(trade);
                    }
                    archive.backupCurrent();
                    localData.setWatchlistSymbols(symbols);localData.savePortfolioHoldings(cloudHoldings);localData.saveSoldTrades(cloudTrades);
                    if(callback!=null)callback.onSyncComplete();
                }).addOnFailureListener(error -> { if(current(authUid,owner)&&callback!=null)callback.onSyncError("Cloud data could not be loaded. Your local backup is retained. Retry sync."); });
            }
        });
    }
    private static double number(DocumentSnapshot document,String field) {
        Object value=document.get(field);if(!(value instanceof Number))return 0;
        double result=((Number)value).doubleValue();return Double.isNaN(result)||Double.isInfinite(result)?0:result;
    }
    public void syncUpUserData(SyncCallback callback) {
        String owner=getUserId();FirebaseUser user=auth.getCurrentUser();
        if(user==null||owner==null||!archive.owns(user.getUid())) { if(callback!=null)callback.onSyncError("Verify your cloud account before syncing.");return; }
        List<Task<Void>> tasks=new ArrayList<>();
        for(String symbol:localData.getWatchlistSymbols()) { Map<String,Object> data=new HashMap<>();data.put("symbol",symbol);data.put("updatedAt",System.currentTimeMillis());tasks.add(db.collection("users").document(owner).collection("watchlist").document(symbol).set(data,SetOptions.merge())); }
        for(PortfolioHolding holding:localData.getPortfolioHoldings())tasks.add(db.collection("users").document(owner).collection("portfolio").document(holding.getId()).set(holdingData(holding),SetOptions.merge()));
        for(SoldTrade trade:localData.getSoldTrades())tasks.add(db.collection("users").document(owner).collection("trades").document(trade.getId()).set(tradeData(trade),SetOptions.merge()));
        Tasks.whenAll(tasks).addOnSuccessListener(ignored -> {if(callback!=null)callback.onSyncComplete();}).addOnFailureListener(error -> {if(callback!=null)callback.onSyncError("Upload failed. Your local records are retained.");});
    }
    private boolean canEditLocal() { FirebaseUser user=auth.getCurrentUser();return user==null || archive.owns(user.getUid()); }
    private Map<String,Object> holdingData(PortfolioHolding holding) {
        Map<String,Object> data=new HashMap<>();data.put("id",holding.getId());data.put("symbol",holding.getSymbol());data.put("companyName",holding.getCompanyName());data.put("shares",holding.getShares());data.put("buyPrice",holding.getBuyPrice());data.put("buyDate",holding.getBuyDate());return data;
    }
    private Map<String,Object> tradeData(SoldTrade trade) {
        Map<String,Object> data=new HashMap<>();data.put("id",trade.getId());data.put("symbol",trade.getSymbol());data.put("companyName",trade.getCompanyName());data.put("sharesSold",trade.getSharesSold());data.put("buyPrice",trade.getBuyPrice());data.put("sellPrice",trade.getSellPrice());data.put("sellDate",trade.getSellDate());return data;
    }
    public void addWatchlistSymbolCloud(String symbol) {
        if(symbol==null||!canEditLocal())return;localData.addToWatchlist(symbol);String owner=getUserId();
        if(owner!=null){Map<String,Object> data=new HashMap<>();data.put("symbol",symbol.toUpperCase());data.put("updatedAt",System.currentTimeMillis());db.collection("users").document(owner).collection("watchlist").document(symbol.toUpperCase()).set(data,SetOptions.merge());}
    }
    public void removeWatchlistSymbolCloud(String symbol) {
        if(symbol==null||!canEditLocal())return;localData.removeFromWatchlist(symbol);String owner=getUserId();if(owner!=null)db.collection("users").document(owner).collection("watchlist").document(symbol.toUpperCase()).delete();
    }
    public void saveHoldingCloud(PortfolioHolding holding) {
        if(holding==null||!canEditLocal())return;localData.addOrUpdateHolding(holding);String owner=getUserId();if(owner!=null)db.collection("users").document(owner).collection("portfolio").document(holding.getId()).set(holdingData(holding),SetOptions.merge());
    }
    public void deleteHoldingCloud(String id) {
        if(id==null||!canEditLocal())return;localData.removeHolding(id);String owner=getUserId();if(owner!=null)db.collection("users").document(owner).collection("portfolio").document(id).delete();
    }
    public void saveSoldTradeCloud(SoldTrade trade) {
        if(trade==null||!canEditLocal())return;localData.addSoldTrade(trade);String owner=getUserId();if(owner!=null)db.collection("users").document(owner).collection("trades").document(trade.getId()).set(tradeData(trade),SetOptions.merge());
    }
    public void deleteSoldTradeCloud(String id) {
        if(id==null||!canEditLocal())return;localData.removeSoldTrade(id);String owner=getUserId();if(owner!=null)db.collection("users").document(owner).collection("trades").document(id).delete();
    }
}
