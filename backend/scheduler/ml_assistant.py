"""
ML Assistant for NEP-2020 Timetable Optimization
Uses scikit-learn for predictive modeling and optimization suggestions
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, mean_squared_error
from sklearn.cluster import KMeans
import joblib
import logging
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, time
import os
from django.conf import settings

logger = logging.getLogger(__name__)


class TimetableMLAssistant:
    """
    ML Assistant for intelligent timetable generation and optimization
    """
    
    def __init__(self):
        self.slot_predictor = None
        self.conflict_predictor = None
        self.preference_model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.model_path = os.path.join(settings.BASE_DIR, 'ml_models')
        os.makedirs(self.model_path, exist_ok=True)
    
    def prepare_training_data(self, historical_timetables: List[Dict]) -> pd.DataFrame:
        """
        Prepare training data from historical timetables
        """
        training_data = []
        
        for timetable in historical_timetables:
            for session in timetable.get('sessions', []):
                # Extract features for ML training
                features = {
                    'day_of_week': session.get('day', 0),
                    'time_slot': session.get('time_slot', 0),
                    'subject_type': session.get('subject_type', 'theory'),
                    'teacher_id': session.get('teacher_id', 0),
                    'room_type': session.get('room_type', 'classroom'),
                    'class_size': session.get('class_size', 30),
                    'duration_minutes': session.get('duration', 60),
                    'is_lab': 1 if session.get('subject_type') == 'lab' else 0,
                    'is_morning': 1 if session.get('time_slot', 0) < 6 else 0,  # Before 12 PM
                    'teacher_load': session.get('teacher_weekly_load', 20),
                    'room_capacity': session.get('room_capacity', 60),
                    
                    # Target variables
                    'satisfaction_score': session.get('satisfaction_score', 3.5),  # 1-5 scale
                    'conflict_occurred': session.get('conflicts', 0),
                    'attendance_rate': session.get('attendance_rate', 0.85),
                    'optimal_slot': session.get('is_optimal', 1)  # Binary: optimal or not
                }
                training_data.append(features)
        
        return pd.DataFrame(training_data)
    
    def train_slot_predictor(self, training_data: pd.DataFrame):
        """
        Train model to predict optimal time slots
        """
        logger.info("Training slot prediction model")
        
        # Prepare features
        feature_columns = [
            'subject_type', 'teacher_id', 'room_type', 'class_size', 
            'duration_minutes', 'is_lab', 'teacher_load', 'room_capacity'
        ]
        
        # Encode categorical variables
        for col in ['subject_type', 'room_type']:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
            training_data[col] = self.label_encoders[col].fit_transform(training_data[col])
        
        X = training_data[feature_columns]
        y = training_data['optimal_slot']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest model
        self.slot_predictor = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        
        self.slot_predictor.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.slot_predictor.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        logger.info(f"Slot predictor accuracy: {accuracy:.3f}")
        
        # Save model
        self.save_model('slot_predictor')
    
    def train_conflict_predictor(self, training_data: pd.DataFrame):
        """
        Train model to predict scheduling conflicts
        """
        logger.info("Training conflict prediction model")
        
        # Features for conflict prediction
        feature_columns = [
            'day_of_week', 'time_slot', 'subject_type', 'teacher_id',
            'room_type', 'class_size', 'is_lab', 'teacher_load'
        ]
        
        # Encode categorical variables
        for col in ['subject_type', 'room_type']:
            if col in training_data.columns:
                training_data[col] = self.label_encoders[col].transform(training_data[col])
        
        X = training_data[feature_columns]
        y = training_data['conflict_occurred']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model
        self.conflict_predictor = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            random_state=42,
            class_weight='balanced'
        )
        
        self.conflict_predictor.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.conflict_predictor.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        logger.info(f"Conflict predictor accuracy: {accuracy:.3f}")
        
        # Save model
        self.save_model('conflict_predictor')
    
    def train_preference_model(self, training_data: pd.DataFrame):
        """
        Train model to learn teacher preferences
        """
        logger.info("Training teacher preference model")
        
        # Features for preference learning
        feature_columns = [
            'day_of_week', 'time_slot', 'subject_type', 'duration_minutes',
            'is_morning', 'teacher_load'
        ]
        
        X = training_data[feature_columns]
        y = training_data['satisfaction_score']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train regression model for satisfaction prediction
        self.preference_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        self.preference_model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.preference_model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        logger.info(f"Preference model MSE: {mse:.3f}")
        
        # Save model
        self.save_model('preference_model')
    
    def predict_optimal_slots(self, session_data: Dict) -> List[Tuple[int, float]]:
        """
        Predict optimal time slots for a given session
        Returns list of (slot_id, probability) tuples
        """
        if not self.slot_predictor:
            self.load_model('slot_predictor')
        
        if not self.slot_predictor:
            logger.warning("Slot predictor not available, using default recommendations")
            return self._get_default_slot_recommendations(session_data)
        
        # Prepare features
        features = self._prepare_session_features(session_data)
        
        # Predict probabilities for all possible slots
        slot_predictions = []
        for slot_id in range(10):  # Assuming 10 time slots per day
            features['time_slot'] = slot_id
            features['is_morning'] = 1 if slot_id < 6 else 0
            
            feature_vector = self._vectorize_features(features)
            probability = self.slot_predictor.predict_proba([feature_vector])[0][1]  # Probability of being optimal
            
            slot_predictions.append((slot_id, probability))
        
        # Sort by probability (descending)
        slot_predictions.sort(key=lambda x: x[1], reverse=True)
        
        return slot_predictions[:5]  # Return top 5 recommendations
    
    def predict_conflicts(self, session_data: Dict) -> float:
        """
        Predict probability of conflicts for a session
        """
        if not self.conflict_predictor:
            self.load_model('conflict_predictor')
        
        if not self.conflict_predictor:
            return 0.1  # Default low conflict probability
        
        features = self._prepare_session_features(session_data)
        feature_vector = self._vectorize_features(features)
        
        conflict_probability = self.conflict_predictor.predict_proba([feature_vector])[0][1]
        return conflict_probability
    
    def get_optimization_suggestions(self, timetable_data: Dict) -> List[Dict]:
        """
        Generate ML-based optimization suggestions
        """
        suggestions = []
        
        # Analyze current timetable for improvement opportunities
        sessions = timetable_data.get('sessions', [])
        
        # Suggestion 1: Identify high-conflict sessions
        high_conflict_sessions = []
        for session in sessions:
            conflict_prob = self.predict_conflicts(session)
            if conflict_prob > 0.7:
                high_conflict_sessions.append({
                    'session': session,
                    'conflict_probability': conflict_prob,
                    'suggestion': 'Consider moving to a different time slot'
                })
        
        if high_conflict_sessions:
            suggestions.append({
                'type': 'conflict_reduction',
                'priority': 'high',
                'title': 'High Conflict Risk Sessions',
                'description': f'Found {len(high_conflict_sessions)} sessions with high conflict probability',
                'sessions': high_conflict_sessions[:5],  # Top 5
                'action': 'reschedule_sessions'
            })
        
        # Suggestion 2: Teacher workload balancing
        teacher_loads = {}
        for session in sessions:
            teacher_id = session.get('teacher_id')
            if teacher_id:
                teacher_loads[teacher_id] = teacher_loads.get(teacher_id, 0) + 1
        
        if teacher_loads:
            avg_load = np.mean(list(teacher_loads.values()))
            overloaded_teachers = [t for t, load in teacher_loads.items() if load > avg_load * 1.5]
            
            if overloaded_teachers:
                suggestions.append({
                    'type': 'workload_balancing',
                    'priority': 'medium',
                    'title': 'Teacher Workload Imbalance',
                    'description': f'{len(overloaded_teachers)} teachers are significantly overloaded',
                    'teachers': overloaded_teachers,
                    'action': 'redistribute_sessions'
                })
        
        # Suggestion 3: Optimal slot utilization
        morning_sessions = len([s for s in sessions if s.get('time_slot', 0) < 6])
        afternoon_sessions = len(sessions) - morning_sessions
        
        if morning_sessions < afternoon_sessions * 0.6:  # Less than 60% in morning
            suggestions.append({
                'type': 'slot_optimization',
                'priority': 'low',
                'title': 'Underutilized Morning Slots',
                'description': 'Consider moving more sessions to morning hours for better learning outcomes',
                'morning_sessions': morning_sessions,
                'afternoon_sessions': afternoon_sessions,
                'action': 'move_to_morning'
            })
        
        return suggestions
    
    def _prepare_session_features(self, session_data: Dict) -> Dict:
        """
        Prepare features from session data
        """
        return {
            'subject_type': session_data.get('subject_type', 'theory'),
            'teacher_id': session_data.get('teacher_id', 0),
            'room_type': session_data.get('room_type', 'classroom'),
            'class_size': session_data.get('class_size', 30),
            'duration_minutes': session_data.get('duration', 60),
            'is_lab': 1 if session_data.get('subject_type') == 'lab' else 0,
            'teacher_load': session_data.get('teacher_load', 20),
            'room_capacity': session_data.get('room_capacity', 60),
            'day_of_week': session_data.get('day_of_week', 1),
            'time_slot': session_data.get('time_slot', 0),
            'is_morning': 1 if session_data.get('time_slot', 0) < 6 else 0
        }
    
    def _vectorize_features(self, features: Dict) -> List[float]:
        """
        Convert feature dict to vector for ML prediction
        """
        # This is a simplified version - in production, you'd use proper feature engineering
        return [
            features.get('subject_type', 0) if isinstance(features.get('subject_type'), (int, float)) else 0,
            features.get('teacher_id', 0),
            features.get('room_type', 0) if isinstance(features.get('room_type'), (int, float)) else 0,
            features.get('class_size', 30),
            features.get('duration_minutes', 60),
            features.get('is_lab', 0),
            features.get('teacher_load', 20),
            features.get('room_capacity', 60)
        ]
    
    def _get_default_slot_recommendations(self, session_data: Dict) -> List[Tuple[int, float]]:
        """
        Default slot recommendations when ML model is not available
        """
        # Simple heuristic-based recommendations
        subject_type = session_data.get('subject_type', 'theory')
        
        if subject_type == 'lab':
            # Labs prefer longer afternoon slots
            return [(6, 0.9), (7, 0.8), (8, 0.7), (5, 0.6), (4, 0.5)]
        else:
            # Theory subjects prefer morning slots
            return [(2, 0.9), (3, 0.8), (1, 0.7), (4, 0.6), (0, 0.5)]
    
    def save_model(self, model_name: str):
        """
        Save trained model to disk
        """
        try:
            model_file = os.path.join(self.model_path, f'{model_name}.joblib')
            
            if model_name == 'slot_predictor' and self.slot_predictor:
                joblib.dump(self.slot_predictor, model_file)
            elif model_name == 'conflict_predictor' and self.conflict_predictor:
                joblib.dump(self.conflict_predictor, model_file)
            elif model_name == 'preference_model' and self.preference_model:
                joblib.dump(self.preference_model, model_file)
            
            # Save encoders and scaler
            encoders_file = os.path.join(self.model_path, 'encoders.joblib')
            scaler_file = os.path.join(self.model_path, 'scaler.joblib')
            
            joblib.dump(self.label_encoders, encoders_file)
            joblib.dump(self.scaler, scaler_file)
            
            logger.info(f"Model {model_name} saved successfully")
            
        except Exception as e:
            logger.error(f"Failed to save model {model_name}: {str(e)}")
    
    def load_model(self, model_name: str):
        """
        Load trained model from disk
        """
        try:
            model_file = os.path.join(self.model_path, f'{model_name}.joblib')
            
            if os.path.exists(model_file):
                if model_name == 'slot_predictor':
                    self.slot_predictor = joblib.load(model_file)
                elif model_name == 'conflict_predictor':
                    self.conflict_predictor = joblib.load(model_file)
                elif model_name == 'preference_model':
                    self.preference_model = joblib.load(model_file)
                
                # Load encoders and scaler
                encoders_file = os.path.join(self.model_path, 'encoders.joblib')
                scaler_file = os.path.join(self.model_path, 'scaler.joblib')
                
                if os.path.exists(encoders_file):
                    self.label_encoders = joblib.load(encoders_file)
                if os.path.exists(scaler_file):
                    self.scaler = joblib.load(scaler_file)
                
                logger.info(f"Model {model_name} loaded successfully")
            else:
                logger.warning(f"Model file {model_file} not found")
                
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {str(e)}")
