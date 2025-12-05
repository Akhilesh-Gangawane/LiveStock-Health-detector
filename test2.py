
"""
HIERARCHICAL ANIMAL DISEASE PREDICTOR
- Reads cleaned_animal_disease_prediction.csv
- Preprocesses fields robustly (duration, temperature)
- Merges rare disease labels per-animal (threshold=5)
- Trains two-stage pipeline:
    1) Syndrome classifier (per-animal)
    2) Disease classifier per (animal, syndrome)
- Balances with undersampling + SMOTE where possible (safe fallbacks)
- Calibrates classifiers using a held-out calibration set via CalibratedClassifierCV(cv='prefit')
- Evaluates Top-1 and Top-3 accuracy and per-class reports
- Saves models to ./models/<Animal>/
"""
import os
import re
import warnings
from collections import Counter, defaultdict

import joblib
import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE
from imblearn.under_sampling import RandomUnderSampler
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import StratifiedShuffleSplit, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

# Try imports for XGBoost, LightGBM; handle absence gracefully
try:
    from xgboost import XGBClassifier
    XGB_AVAILABLE = True
except Exception:
    XGB_AVAILABLE = False

try:
    from lightgbm import LGBMClassifier
    LGBM_AVAILABLE = True
except Exception:
    LGBM_AVAILABLE = False

# Settings
RANDOM_STATE = 42
RARE_LABEL_THRESHOLD = 3      # merge disease labels with count < this into 'Other' (lowered from 5 to keep more diseases)
TEST_SIZE = 0.15
CALIB_SIZE = 0.15              # portion of full dataset (we will do stratified splits accordingly)
VERBOSE = True

# Suppress repeated warnings and LightGBM native spam (one-time notice)
warnings.filterwarnings("once")
if LGBM_AVAILABLE and VERBOSE:
    print("Note: LightGBM is available. Native LightGBM verbosity will be suppressed (verbosity=-1).")

# Utility functions
def parse_duration_to_days(x):
    """Robustly convert duration strings like '5 days', '1 week', '2 weeks', '10 days' to numeric days.
       If already numeric, return numeric. If NaN or unparsable, return np.nan."""
    if pd.isna(x):
        return np.nan
    if isinstance(x, (int, float)):
        return float(x)
    s = str(x).strip().lower()
    # direct numeric
    m = re.search(r'(\d+(\.\d+)?)', s)
    num = float(m.group(1)) if m else None
    if num is None:
        return np.nan
    if 'week' in s:
        return float(num * 7)
    if 'day' in s:
        return float(num)
    # fallback: assume days
    return float(num)

def parse_temperature(x):
    """Strip '°', 'C', etc. and convert to float, else np.nan"""
    if pd.isna(x):
        return np.nan
    s = str(x).replace('°', '').replace('c', '').replace('C', '').strip()
    try:
        return float(s)
    except:
        m = re.search(r'(\d+(\.\d+)?)', s)
        return float(m.group(1)) if m else np.nan

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def top_k_accuracy(y_true, y_pred_topk, k=3):
    """y_pred_topk: array-like shape (n_samples, k) — top-k predicted labels"""
    if len(y_true) == 0:
        return 0.0
    correct = 0
    for yt, preds in zip(y_true, y_pred_topk):
        if yt in preds[:k]:
            correct += 1
    return correct / len(y_true)

# Load data
df = pd.read_csv('cleaned_animal_disease_prediction.csv')
print(f"Loaded {len(df)} rows. Columns: {list(df.columns)}\n")

# Basic cleaning and parsing
# Binary encode known yes/no symptom columns if present
yesno_cols = ['Appetite_Loss', 'Vomiting', 'Diarrhea', 'Coughing', 'Labored_Breathing',
              'Lameness', 'Skin_Lesions', 'Nasal_Discharge', 'Eye_Discharge']
for c in yesno_cols:
    if c in df.columns:
        df[c] = df[c].map({'Yes': 1, 'No': 0, 'yes': 1, 'no': 0}).fillna(df[c])
        # if still non-numeric, coerce
        df[c] = pd.to_numeric(df[c], errors='coerce').fillna(0).astype(int)

# Parse duration and temperature and heart rate
if 'Duration' in df.columns:
    df['Duration_days'] = df['Duration'].apply(parse_duration_to_days)
    # fill missing with median of parsed values
    med = float(np.nanmedian(df['Duration_days'].values))
    if np.isnan(med):
        med = 3.0
    df['Duration_days'] = df['Duration_days'].fillna(med)
else:
    df['Duration_days'] = 0.0

if 'Body_Temperature' in df.columns:
    df['Body_Temperature'] = df['Body_Temperature'].apply(parse_temperature)
    med = float(np.nanmedian(df['Body_Temperature'].values))
    if np.isnan(med):
        med = 39.0
    df['Body_Temperature'] = df['Body_Temperature'].fillna(med)
else:
    df['Body_Temperature'] = 39.0

if 'Heart_Rate' in df.columns:
    df['Heart_Rate'] = pd.to_numeric(df['Heart_Rate'], errors='coerce')
    med = float(np.nanmedian(df['Heart_Rate'].values))
    if np.isnan(med):
        med = 80.0
    df['Heart_Rate'] = df['Heart_Rate'].fillna(med)
else:
    df['Heart_Rate'] = 80.0

# Ensure Age, Weight exist
df['Age'] = pd.to_numeric(df.get('Age', 0), errors='coerce').fillna(0).astype(float)
df['Weight'] = pd.to_numeric(df.get('Weight', 0), errors='coerce').fillna(0).astype(float)

# Columns present
print("After parsing fields sample:")
print(df[['Duration_days', 'Body_Temperature', 'Heart_Rate']].head())

# Create simple syndrome mapping based on symptom columns (same logic you used earlier)
def syndrome_label(row):
    resp = row.get('Coughing', 0) + row.get('Labored_Breathing', 0) + row.get('Nasal_Discharge', 0) + row.get('Eye_Discharge', 0)
    gi = row.get('Vomiting', 0) + row.get('Diarrhea', 0) + row.get('Appetite_Loss', 0)
    derm = row.get('Skin_Lesions', 0)
    neuro = row.get('Lameness', 0)
    systemic = 1 if abs(row['Body_Temperature'] - 39.0) > 0.8 or row['Heart_Rate']>140 else 0

    counts = {'Respiratory': resp, 'GI': gi, 'Dermatological': derm, 'Neurological': neuro, 'Systemic': systemic}
    # choose highest count; if multiple non-zero choose 'Multi'
    nonzero = [k for k,v in counts.items() if v>0]
    if len(nonzero) >= 2:
        return 'Multi'
    if len(nonzero) == 1:
        return nonzero[0]
    return 'Multi'

df['Syndrome_Label'] = df.apply(syndrome_label, axis=1)

print("\nSyndrome label distribution:")
print(df['Syndrome_Label'].value_counts())

# Merge rare disease labels per animal into 'Other'
def merge_rare_labels(df, threshold=RARE_LABEL_THRESHOLD):
    df = df.copy()
    grouped = {}
    merged_counts = {}
    for animal in df['Animal_Type'].unique():
        sub = df[df['Animal_Type'] == animal]
        counts = sub['Disease_Prediction'].value_counts()
        to_keep = counts[counts >= threshold].index.tolist()
        # map others to 'Other'
        df.loc[df['Animal_Type'] == animal, 'Disease_Merged'] = df.loc[df['Animal_Type'] == animal, 'Disease_Prediction'].apply(
            lambda x: x if x in to_keep else 'Other'
        )
        merged_counts[animal] = (len(sub), len(to_keep))
    return df, merged_counts

df, merged_counts = merge_rare_labels(df, threshold=RARE_LABEL_THRESHOLD)
print("\nAfter merging rare labels (per-animal):")
for animal, (samples, kept) in merged_counts.items():
    print(f"  {animal}: samples {samples}, kept disease labels {kept}")

# Label encoding of categorical features used as model inputs
cat_cols = []
for c in ['Breed', 'Gender', 'Symptom_1', 'Symptom_2', 'Symptom_3', 'Symptom_4']:
    if c in df.columns:
        cat_cols.append(c)
    else:
        # create placeholder column if not present to keep consistent features
        df[c] = 'NA'
        cat_cols.append(c)

label_encoders = {}
for c in cat_cols:
    le = LabelEncoder()
    df[c] = df[c].astype(str).fillna('NA')
    df[c] = le.fit_transform(df[c])
    label_encoders[c] = le

# Useful numeric features list
feature_cols = [
    'Breed', 'Age', 'Gender', 'Weight',
    'Symptom_1', 'Symptom_2', 'Symptom_3', 'Symptom_4',
    'Duration_days', 'Body_Temperature', 'Heart_Rate',
    'Appetite_Loss', 'Vomiting', 'Diarrhea', 'Coughing', 'Labored_Breathing',
    'Lameness', 'Skin_Lesions', 'Nasal_Discharge', 'Eye_Discharge'
]

# Keep only those columns that exist
feature_cols = [c for c in feature_cols if c in df.columns]

# Prepare model output directory
ensure_dir('./models')

# Helper: safe stratified split (if stratify not possible fallback)
def safe_train_calib_test_split(X, y, test_size=TEST_SIZE, calib_size=CALIB_SIZE, random_state=RANDOM_STATE):
    """Return X_train, X_calib, X_test, y_train, y_calib, y_test
       Attempt stratified splitting; if impossible (classes with only 1 sample), fall back to non-stratified."""
    # First check if we have enough samples for splitting
    n_samples = len(X)
    
    # Calculate minimum samples needed: test + calib + at least 1 train
    min_needed = max(3, int(n_samples * (test_size + calib_size)) + 1)
    
    if n_samples < min_needed:
        # Not enough samples for proper split, return all as train with empty calib and test
        if VERBOSE:
            print(f"      WARNING: Only {n_samples} samples available, using all for training")
        return X, X[:0], X[:0], y, y[:0], y[:0]
    
    # First split train+calib and test
    total_test = test_size
    try:
        X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=total_test, stratify=y, random_state=random_state)
    except Exception:
        X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=total_test, random_state=random_state)
    
    # Check if we have enough samples left for calib split
    if len(X_temp) < 2:
        # Not enough for calib split, use all as train
        return X_temp, X[:0], X_test, y_temp, y[:0], y_test
    
    # Now split X_temp into train and calib
    # calib fraction relative to remaining: calib_size / (1 - test_size)
    if 1.0 - total_test <= 0:
        raise ValueError("Invalid test_size")
    
    calib_fraction_rel = calib_size / (1.0 - total_test)
    
    # Ensure we have at least 1 sample for training after calib split
    if len(X_temp) * (1 - calib_fraction_rel) < 1:
        # Adjust calib_fraction_rel to leave at least 1 sample for training
        calib_fraction_rel = max(0.0, (len(X_temp) - 1) / len(X_temp))
    
    if calib_fraction_rel <= 0:
        # No samples for calibration
        return X_temp, X[:0], X_test, y_temp, y[:0], y_test
    
    try:
        X_train, X_calib, y_train, y_calib = train_test_split(X_temp, y_temp, test_size=calib_fraction_rel, stratify=y_temp, random_state=random_state)
    except Exception:
        X_train, X_calib, y_train, y_calib = train_test_split(X_temp, y_temp, test_size=calib_fraction_rel, random_state=random_state)
    
    return X_train, X_calib, X_test, y_train, y_calib, y_test

# Model training loop per animal
report_summary = {}
for animal in sorted(df['Animal_Type'].unique()):
    sub = df[df['Animal_Type'] == animal].copy()
    n = len(sub)
    if n < 8:
        print(f"\nSkipping {animal} (too few samples: {n})")
        continue
    print(f"\n==> Animal: {animal}")
    print(f"  samples={n}, unique diseases={sub['Disease_Merged'].nunique()}")
    
    # Syndrome classifier first (multi-class small set)
    Xs = sub[feature_cols]
    ys_synd = sub['Syndrome_Label'].astype(str)
    le_synd = LabelEncoder()
    y_synd_enc = le_synd.fit_transform(ys_synd)
    
    # split into train/calib/test safely
    X_train_s, X_calib_s, X_test_s, y_train_s, y_calib_s, y_test_s = safe_train_calib_test_split(Xs, y_synd_enc, test_size=TEST_SIZE, calib_size=CALIB_SIZE)
    
    # Check if we have test samples
    if len(X_test_s) == 0:
        # Create minimal train/test split with at least 1 test sample if possible
        if len(Xs) > 1:
            test_ratio = min(0.2, 1.0/len(Xs))
            X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(Xs, y_synd_enc, test_size=test_ratio, random_state=RANDOM_STATE)
            X_calib_s = X_train_s[:0]
            y_calib_s = y_train_s[:0]
        else:
            # Only 1 sample, use it for training
            X_train_s, X_test_s, y_train_s, y_test_s = Xs, Xs[:0], y_synd_enc, y_synd_enc[:0]
            X_calib_s = X_train_s[:0]
            y_calib_s = y_train_s[:0]
    
    # scale
    scaler_synd = StandardScaler()
    X_train_s_sc = scaler_synd.fit_transform(X_train_s)
    X_calib_s_sc = scaler_synd.transform(X_calib_s) if len(X_calib_s) > 0 else X_calib_s
    X_test_s_sc = scaler_synd.transform(X_test_s) if len(X_test_s) > 0 else X_test_s

    # Train base syndrome model (RandomForest) — simple & robust
    # Increased n_estimators and added max_depth for better confidence
    rf_synd = RandomForestClassifier(n_estimators=300, max_depth=15, min_samples_split=2, 
                                      class_weight='balanced', random_state=RANDOM_STATE)
    rf_synd.fit(X_train_s_sc, y_train_s)
    
    # Calibrate using held-out calibration set (cv='prefit')
    try:
        calib_synd = CalibratedClassifierCV(estimator=rf_synd, cv='prefit')
        if len(X_calib_s_sc) > 0 and len(y_calib_s) > 0:
            calib_synd.fit(X_calib_s_sc, y_calib_s)
            synd_clf = calib_synd
            if VERBOSE:
                print("  RandomForest syndrome classifier calibrated using held-out calibration set.")
        else:
            synd_clf = rf_synd
            if VERBOSE:
                print(f"  No calibration data for {animal} syndrome classifier")
    except Exception as e:
        synd_clf = rf_synd
        print(f"  Syndrome calibration failed (fallback to uncalibrated rf). Reason: {e}")

    # Evaluate syndrome classifier
    if len(X_test_s_sc) > 0 and len(y_test_s) > 0:
        ypred_s = synd_clf.predict(X_test_s_sc)
        acc_s = accuracy_score(y_test_s, ypred_s)
        print(f"    Syndrome test accuracy: {acc_s:.3f}")
        try:
            print("    Syndrome classification report:")
            print(classification_report(y_test_s, ypred_s, target_names=le_synd.classes_, zero_division=0))
        except Exception:
            print("    (skipped classification_report formatting)")
    else:
        print("    No test samples for syndrome evaluation")

    # Save syndrome artifacts
    animal_dir = os.path.join('models', animal)
    ensure_dir(animal_dir)
    joblib.dump({'classifier': synd_clf, 'scaler': scaler_synd, 'label_encoder': le_synd}, os.path.join(animal_dir, 'syndrome_clf.joblib'))

    # Now train disease classifiers per-syndrome for this animal
    disease_by_synd = defaultdict(list)
    for idx, row in sub.iterrows():
        disease_by_synd[row['Syndrome_Label']].append(idx)

    disease_models = {}
    # For easier mapping ensure label encoders for disease within this animal+syndrome
    for synd, idxs in disease_by_synd.items():
        rows = sub.loc[idxs]
        # disease target is merged version
        y_local = rows['Disease_Merged'].astype(str)
        # If only one unique disease -> trivial predictor
        uniq = y_local.unique()
        if len(uniq) == 1:
            disease_models[synd] = {
                'type': 'trivial',
                'disease': uniq[0]
            }
            if VERBOSE:
                print(f"    Syndrome '{synd}': only one disease class -> trivial '{uniq[0]}'")
            continue

        # encode labels
        le_d = LabelEncoder()
        y_local_enc = le_d.fit_transform(y_local)
        X_local = rows[feature_cols]
        
        # safe split (but may fail if classes too small)
        try:
            Xtr, Xcal, Xte, ytr, ycal, yte = safe_train_calib_test_split(X_local, y_local_enc, test_size=TEST_SIZE, calib_size=CALIB_SIZE)
        except Exception as e:
            # fallback: simple split with careful handling
            n_samples = len(X_local)
            if n_samples < 4:
                # Too few samples, use all for training
                Xtr, ytr = X_local, y_local_enc
                Xte, yte = X_local[:0], y_local_enc[:0]
                Xcal, ycal = X_local[:0], y_local_enc[:0]
                if VERBOSE:
                    print(f"      WARNING: Only {n_samples} samples for {animal}/{synd}, using all for training")
            else:
                # Try simple split
                try:
                    Xtr, Xte, ytr, yte = train_test_split(X_local, y_local_enc, test_size=0.2, random_state=RANDOM_STATE)
                except Exception:
                    # Last resort: use 80% train, 20% test if possible
                    split_idx = int(0.8 * n_samples)
                    Xtr, Xte = X_local.iloc[:split_idx], X_local.iloc[split_idx:]
                    ytr, yte = y_local_enc[:split_idx], y_local_enc[split_idx:]
                # split small portion for calibration
                if len(Xtr) >= 3:
                    try:
                        Xtr, Xcal, ytr, ycal = train_test_split(Xtr, ytr, test_size=0.15, random_state=RANDOM_STATE)
                    except Exception:
                        Xcal = Xtr[:0]
                        ycal = ytr[:0]
                else:
                    Xcal = Xtr[:0]
                    ycal = ytr[:0]

        # Check if we have training data
        if len(Xtr) == 0:
            print(f"      WARNING: No training data for {animal}/{synd}, skipping")
            disease_models[synd] = {'type': 'fallback', 'models': {}, 'label_encoder': le_d}
            continue
            
        # scaling
        scaler = StandardScaler()
        Xtr_sc = scaler.fit_transform(Xtr)
        Xcal_sc = scaler.transform(Xcal) if len(Xcal) > 0 else Xcal
        Xte_sc = scaler.transform(Xte) if len(Xte) > 0 else Xte

        # Balance: undersample majority then SMOTE
        rus = RandomUnderSampler(sampling_strategy='auto', random_state=RANDOM_STATE)
        try:
            X_res, y_res = rus.fit_resample(Xtr_sc, ytr)
            # Then SMOTE if multiple classes and small minorities
            if len(np.unique(y_res)) > 1 and min(np.bincount(y_res)) > 1:
                sm = SMOTE(random_state=RANDOM_STATE)
                X_res, y_res = sm.fit_resample(X_res, y_res)
        except Exception as e:
            # fallback: no resampling
            X_res, y_res = Xtr_sc, ytr
            if VERBOSE:
                print(f"      (resampling fallback for {animal}/{synd}: {e})")

        # Train ensemble of 3 base estimators (RF, XGB, LGBM) and average predicted probabilities
        models = {}
        # RandomForest - increased complexity for better confidence
        rf = RandomForestClassifier(n_estimators=300, max_depth=15, min_samples_split=2,
                                     class_weight='balanced', random_state=RANDOM_STATE)
        rf.fit(X_res, y_res)
        # Calibrate RF with held-out calibration set if possible
        try:
            if len(Xcal_sc) > 0 and len(ycal) > 0:
                calib = CalibratedClassifierCV(estimator=rf, cv='prefit')
                calib.fit(Xcal_sc, ycal)
                rf_clf = calib
                if VERBOSE:
                    print("      RandomForest calibrated using held-out calibration set.")
            else:
                rf_clf = rf
                if VERBOSE:
                    print("      RandomForest calibration skipped (no calibration data).")
        except Exception:
            rf_clf = rf
            if VERBOSE:
                print("      RandomForest calibration skipped/fallback to uncalibrated.")

        models['rf'] = rf_clf

        # XGBoost
        if XGB_AVAILABLE:
            try:
                xgb = XGBClassifier(n_estimators=150, use_label_encoder=False, eval_metric='mlogloss', random_state=RANDOM_STATE)
                xgb.fit(X_res, y_res)
                try:
                    if len(Xcal_sc) > 0 and len(ycal) > 0:
                        calib = CalibratedClassifierCV(estimator=xgb, cv='prefit')
                        calib.fit(Xcal_sc, ycal)
                        xgb_clf = calib
                        if VERBOSE:
                            print("      XGBoost calibrated using held-out calibration set.")
                    else:
                        xgb_clf = xgb
                        if VERBOSE:
                            print("      XGBoost calibration skipped (no calibration data).")
                except Exception:
                    xgb_clf = xgb
                    if VERBOSE:
                        print("      XGBoost calibration skipped/fallback.")
                models['xgb'] = xgb_clf
            except Exception as e:
                if VERBOSE:
                    print(f"      XGBoost train failed: {e}")
        else:
            if VERBOSE:
                print("      XGBoost not available, skipping.")

        # LightGBM
        if LGBM_AVAILABLE:
            try:
                # Suppress LightGBM native verbosity (C++ side)
                lgb = LGBMClassifier(n_estimators=150, class_weight='balanced', random_state=RANDOM_STATE, verbosity=-1)
                lgb.fit(X_res, y_res)
                try:
                    if len(Xcal_sc) > 0 and len(ycal) > 0:
                        calib = CalibratedClassifierCV(estimator=lgb, cv='prefit')
                        calib.fit(Xcal_sc, ycal)
                        lgb_clf = calib
                        if VERBOSE:
                            print("      LightGBM calibrated using held-out calibration set.")
                    else:
                        lgb_clf = lgb
                        if VERBOSE:
                            print("      LightGBM calibration skipped (no calibration data).")
                except Exception:
                    lgb_clf = lgb
                    if VERBOSE:
                        print("      LightGBM calibration skipped/fallback.")
                models['lgb'] = lgb_clf
            except Exception as e:
                if VERBOSE:
                    print(f"      LightGBM train failed: {e}")
        else:
            if VERBOSE:
                print("      LightGBM not available, skipping.")

        # Evaluate only if we have test data
        if len(yte) > 0 and len(Xte_sc) > 0:
            # Evaluate combined averaged probabilities on Xte_sc
            prob_list = []
            for mname, m in models.items():
                try:
                    p = m.predict_proba(Xte_sc)
                    prob_list.append(p)
                except Exception:
                    # if predict_proba not available, fallback to hard preds
                    p_hard = m.predict(Xte_sc)
                    # convert to one-hot
                    arr = np.zeros((len(p_hard), len(le_d.classes_)))
                    for i,pi in enumerate(p_hard):
                        arr[i,pi] = 1.0
                    prob_list.append(arr)
            
            if len(prob_list) == 0:
                print(f"      No models trained for {animal}/{synd}; skipping evaluation.")
                # store trivial fallback
                disease_models[synd] = {'type': 'fallback', 'models': {}, 'label_encoder': le_d, 'scaler': scaler}
                continue
                
            # average probabilities (align shapes)
            avgp = np.mean(np.stack(prob_list, axis=0), axis=0)
            
            # top-1
            preds_top1 = np.argmax(avgp, axis=1)
            acc_top1 = accuracy_score(yte, preds_top1)
            # top-3
            top3 = np.argsort(avgp, axis=1)[:, ::-1][:, :3]
            acc_top3 = top_k_accuracy(yte, top3, k=3)
            print(f"      Syndrome '{synd}': disease Top-1={acc_top1:.3f}, Top-3={acc_top3:.3f} (test_samples={len(yte)})")
        else:
            # No test data, but we still want to save the model
            if VERBOSE:
                print(f"      Syndrome '{synd}': trained but no test data for evaluation")
            
        # save model bundle
        disease_models[synd] = {
            'type': 'ensemble',
            'models': models,
            'label_encoder': le_d,
            'scaler': scaler
        }

        # Save per-syndrome artifact
        joblib.dump({
            'models': models,
            'label_encoder': le_d,
            'scaler': scaler
        }, os.path.join(animal_dir, f'disease_models_{synd}.joblib'))

    # Save per-animal disease_models mapping & encoders
    joblib.dump({
        'disease_models': disease_models,
        'syndrome_encoder': le_synd,
        'syndrome_scaler': scaler_synd,
        'feature_columns': feature_cols,
        'label_encoders_cat': label_encoders
    }, os.path.join(animal_dir, 'animal_artifacts.joblib'))

print("\n✅ Finished training for all animals.")
print("All artifacts saved to ./models\n")

# Example predict function to use artifacts
def predict_animal(animal, sample_dict):
    """sample_dict must contain feature fields used in feature_cols (or will be defaulted)"""
    art_path = os.path.join('models', animal, 'animal_artifacts.joblib')
    if not os.path.exists(art_path):
        return {'error': f'No model for {animal}'}
    art = joblib.load(art_path)
    sy_clf_bundle = joblib.load(os.path.join('models', animal, 'syndrome_clf.joblib'))
    synd_clf = sy_clf_bundle['classifier']
    synd_scaler = sy_clf_bundle['scaler']
    le_synd = art['syndrome_encoder']
    # build input df
    row = {}
    for c in feature_cols:
        if c in sample_dict:
            val = sample_dict[c]
        else:
            val = 0
        # handle categorical placeholders using label_encoders
        if c in label_encoders:
            try:
                val = label_encoders[c].transform([str(val)])[0]
            except:
                val = 0
        row[c] = val
    X = pd.DataFrame([row])[feature_cols]
    Xs = synd_scaler.transform(X)
    synd_proba = synd_clf.predict_proba(Xs)[0] if hasattr(synd_clf, 'predict_proba') else None
    synd_idx = synd_proba.argmax() if synd_proba is not None else synd_clf.predict(Xs)[0]
    synd_label = le_synd.inverse_transform([synd_idx])[0]
    synd_conf = float(synd_proba.max()) if synd_proba is not None else 1.0
    # disease stage
    dm = joblib.load(os.path.join('models', animal, 'animal_artifacts.joblib'))['disease_models']
    # find disease model for that syndrome (fallback to 'Multi' if not present)
    if synd_label not in dm:
        chosen = 'Multi' if 'Multi' in dm else list(dm.keys())[0]
    else:
        chosen = synd_label
    model_info = dm[chosen]
    if model_info['type'] == 'trivial':
        return {'animal_type': animal, 'syndrome': chosen, 'syndrome_conf': synd_conf, 'predicted_disease': model_info['disease'], 'confidence': 1.0, 'top_3': [{'disease': model_info['disease'], 'probability': 1.0}]}
    if model_info['type'] == 'fallback' or len(model_info.get('models', {})) == 0:
        return {'animal_type': animal, 'syndrome': chosen, 'syndrome_conf': synd_conf, 'predicted_disease': 'Other', 'confidence': 1.0, 'top_3': [{'disease': 'Other', 'probability': 1.0}]}
    # otherwise ensemble
    scaler = model_info['scaler']
    X_sc = scaler.transform(X)
    models = model_info['models']
    prob_list = []
    le_d = model_info['label_encoder']
    for m in models.values():
        try:
            p = m.predict_proba(X_sc)[0]
            prob_list.append(p)
        except Exception:
            pred = m.predict(X_sc)[0]
            vec = np.zeros(len(le_d.classes_)); vec[pred]=1.0
            prob_list.append(vec)
    avgp = np.mean(np.stack(prob_list, axis=0), axis=0)
    best_idx = int(np.argmax(avgp))
    predicted = le_d.inverse_transform([best_idx])[0]
    top_idx = np.argsort(avgp)[::-1][:3]
    top3 = [{'disease': le_d.inverse_transform([int(i)])[0], 'probability': float(avgp[int(i)])} for i in top_idx]
    return {'animal_type': animal, 'syndrome': chosen, 'syndrome_conf': synd_conf, 'predicted_disease': predicted, 'confidence': float(avgp[best_idx]), 'top_3': top3}

# Example usage (sample)
sample = {
    'Breed': 'Labrador', 'Age': 5, 'Gender': 'Male', 'Weight': 30,
    'Symptom_1': 'Cough', 'Symptom_2': 'Lethargy', 'Symptom_3': 'Loss of appetite', 'Symptom_4': 'Nasal discharge',
    'Duration_days': 7, 'Appetite_Loss': 1, 'Vomiting': 0, 'Diarrhea': 0, 'Coughing': 1, 'Labored_Breathing': 1,
    'Lameness': 0, 'Skin_Lesions': 0, 'Nasal_Discharge': 1, 'Eye_Discharge': 0, 'Body_Temperature': 39.8, 'Heart_Rate': 110
}
# Ensure categorical fields transformed to encoded ints where possible
for c in ['Breed','Gender','Symptom_1','Symptom_2','Symptom_3','Symptom_4']:
    if c in sample and c in label_encoders:
        try:
            sample[c] = label_encoders[c].transform([str(sample[c])])[0]
        except:
            sample[c] = 0

print("\nExample prediction (Dog):")
print(predict_animal('Dog', sample))