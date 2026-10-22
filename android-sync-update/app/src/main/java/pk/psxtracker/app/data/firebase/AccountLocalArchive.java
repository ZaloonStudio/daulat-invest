package pk.psxtracker.app.data.firebase;

import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import pk.psxtracker.app.data.local.LocalDataManager;
import pk.psxtracker.app.data.model.PortfolioHolding;
import pk.psxtracker.app.data.model.SoldTrade;

/** Device-private archives preserve old records without silently assigning them to a new account. */
final class AccountLocalArchive {
    private final SharedPreferences preferences;
    private final LocalDataManager local;
    private final Gson gson = new Gson();
    AccountLocalArchive(Context context, LocalDataManager local) {
        this.preferences = context.getSharedPreferences("daulat_account_archives", Context.MODE_PRIVATE);
        this.local = local;
    }
    synchronized boolean owns(String uid) { return uid != null && uid.equals(preferences.getString("active_uid", null)); }
    synchronized void switchTo(String uid) {
        if (owns(uid)) return;
        archive(); clear();
        String holdings = preferences.getString(uid+"/holdings", null);
        String trades = preferences.getString(uid+"/trades", null);
        Set<String> watchlist = preferences.getStringSet(uid+"/watchlist", new HashSet<>());
        if (holdings != null) local.savePortfolioHoldings(gson.fromJson(holdings, new TypeToken<List<PortfolioHolding>>(){}.getType()));
        if (trades != null) local.saveSoldTrades(gson.fromJson(trades, new TypeToken<List<SoldTrade>>(){}.getType()));
        local.setWatchlistSymbols(new HashSet<>(watchlist));
        preferences.edit().putString("active_uid", uid).commit();
    }
    synchronized void backupCurrent() { archive(); }
    synchronized void archiveAndClear() { archive(); clear(); preferences.edit().remove("active_uid").commit(); }
    private void archive() {
        String uid = preferences.getString("active_uid", null);
        if (uid == null) uid = "unassigned_"+System.currentTimeMillis();
        preferences.edit().putString(uid+"/holdings", gson.toJson(local.getPortfolioHoldings()))
                .putString(uid+"/trades", gson.toJson(local.getSoldTrades()))
                .putStringSet(uid+"/watchlist", new HashSet<>(local.getWatchlistSymbols())).commit();
    }
    private void clear() {
        local.savePortfolioHoldings(new ArrayList<>()); local.saveSoldTrades(new ArrayList<>()); local.setWatchlistSymbols(new HashSet<>());
    }
}
