import requests
import json

def test_quick_setup():
    print('🚀 Testing Quick Setup End-to-End')
    print('=' * 50)
    
    # Authenticate
    auth_response = requests.post('http://localhost:8000/api/auth/token/', {
        'email': 'admin@demo.local',
        'password': 'Admin@1234'
    })
    
    if auth_response.status_code != 200:
        print('❌ Authentication failed')
        return
        
    token = auth_response.json().get('access')
    headers = {'Authorization': f'Bearer {token}'}
    
    # Generate variants
    print('📋 Generating timetable variants...')
    gen_data = {
        'institution_id': 1,
        'name': 'Quick Test Timetable',
        'semester': 1,
        'parameters': {
            'setup_mode': 'quick',
            'working_days': 5,
            'periods_per_day': 6,
            'period_duration': 60
        }
    }
    
    gen_response = requests.post('http://localhost:8000/api/scheduler/generate-variants/', 
                                json=gen_data, headers=headers)
    
    if gen_response.status_code != 201:
        print(f'❌ Generation failed: {gen_response.status_code}')
        print(f'Response: {gen_response.text}')
        return
        
    variants = gen_response.json().get('variants', [])
    if not variants:
        print('❌ No variants generated')
        return
        
    print(f'✅ Generated {len(variants)} variants')

    # Check if variants are different
    print('🔍 Checking variant diversity...')
    for i, variant in enumerate(variants):
        solution = variant.get('solution', {})
        sessions = solution.get('sessions', [])
        quality_score = variant.get('metrics', {}).get('quality_score', 0)
        print(f'   Variant {i+1}: {len(sessions)} sessions, Quality: {quality_score:.2f}%')

        # Check first few sessions to see if they're different
        if sessions:
            first_session = sessions[0]
            print(f'     First session: Subject {first_session.get("subject_id")}, Room {first_session.get("room_id")}, Day {first_session.get("day_of_week")}')

    # Test commit with first variant
    print('💾 Testing variant commit...')
    variant = variants[0]

    commit_data = {
        'variant': variant,
        'name': 'Quick Test Committed',
        'institution_id': 1
    }
    
    commit_response = requests.post('http://localhost:8000/api/scheduler/commit-variant/', 
                                   json=commit_data, headers=headers)
    
    print(f'Commit status: {commit_response.status_code}')
    if commit_response.status_code != 201:
        print(f'❌ Commit failed: {commit_response.text[:500]}')
    else:
        result = commit_response.json()
        print('✅ Commit successful!')
        print(f'   Timetable ID: {result.get("timetable_id")}')
        print(f'   Sessions Created: {result.get("sessions_created")}')

if __name__ == '__main__':
    test_quick_setup()
