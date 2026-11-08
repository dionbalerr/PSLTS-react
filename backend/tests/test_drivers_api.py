def test_list_drivers_supports_search_and_pagination(client):
    response = client.get('/api/v1/drivers?page=2&page_size=1')

    assert response.status_code == 200
    assert response.json['data'][0]['DRIVER_NO'] == 'DRV-002'
    assert response.json['pagination']['total'] == 2

    search_response = client.get('/api/v1/drivers?search=marcus')
    assert search_response.json['data'][0]['DRIVER_NO'] == 'DRV-001'

    false_search_response = client.get('/api/v1/drivers?search=false')
    assert false_search_response.json['pagination']['total'] == 0


def test_list_drivers_supports_valid_sort(client):
    response = client.get('/api/v1/drivers?sort=NAME&direction=desc')

    assert response.status_code == 200
    assert response.json['data'][0]['NAME'] == 'Marcus Vance'


def test_create_driver_returns_201(client):
    response = client.post('/api/v1/drivers', json={
        'DRIVER_NO': 'DRV-003',
        'NAME': 'Priya Patel',
    })

    assert response.status_code == 201
    assert response.json['data']['NAME'] == 'Priya Patel'


def test_create_driver_rejects_missing_required_field(client):
    response = client.post('/api/v1/drivers', json={'DRIVER_NO': 'DRV-003'})

    assert response.status_code == 400
    assert response.json['error']['code'] == 'validation_error'
    assert 'NAME' in response.json['error']['fields']


def test_create_driver_rejects_duplicate_driver_id(client):
    response = client.post('/api/v1/drivers', json={
        'DRIVER_NO': 'DRV-001',
        'NAME': 'Duplicate',
    })

    assert response.status_code == 409
    assert response.json['error']['code'] == 'duplicate_driver_no'


def test_create_driver_rejects_invalid_json(client):
    response = client.post('/api/v1/drivers', data='[]', content_type='application/json')

    assert response.status_code == 400
    assert response.json['error']['code'] == 'invalid_json'


def test_create_driver_rejects_non_string_fields(client):
    response = client.post('/api/v1/drivers', json={
        'DRIVER_NO': ['DRV-003'],
        'NAME': 'Invalid',
    })

    assert response.status_code == 400
    assert response.json['error']['fields']['DRIVER_NO'] == 'Field must be a string.'


def test_update_driver_and_get_driver(client):
    response = client.patch('/api/v1/drivers/DRV-001', json={'NAME': 'Marcus Updated'})

    assert response.status_code == 200
    assert response.json['data']['NAME'] == 'Marcus Updated'
    assert client.get('/api/v1/drivers/DRV-001').json['data']['NAME'] == 'Marcus Updated'


def test_update_driver_rejects_duplicate_id(client):
    response = client.patch('/api/v1/drivers/DRV-001', json={'DRIVER_NO': 'DRV-002'})

    assert response.status_code == 409


def test_update_driver_rejects_invalid_json(client):
    response = client.patch('/api/v1/drivers/DRV-001', data='null', content_type='application/json')

    assert response.status_code == 400
    assert response.json['error']['code'] == 'invalid_json'


def test_delete_hides_driver_and_restore_returns_it(client):
    delete_response = client.delete('/api/v1/drivers/DRV-001')
    assert delete_response.status_code == 200
    assert client.get('/api/v1/drivers/DRV-001').status_code == 404

    restore_response = client.post('/api/v1/drivers/DRV-001/restore')
    assert restore_response.status_code == 200
    assert client.get('/api/v1/drivers/DRV-001').status_code == 200


def test_create_cannot_reuse_deleted_driver_id(client):
    client.delete('/api/v1/drivers/DRV-001')

    response = client.post('/api/v1/drivers', json={
        'DRIVER_NO': 'DRV-001',
        'NAME': 'Replacement',
    })

    assert response.status_code == 409


def test_update_missing_driver_returns_404(client):
    response = client.patch('/api/v1/drivers/MISSING', json={'NAME': 'Unknown'})

    assert response.status_code == 404


def test_missing_driver_mutations_return_404(client):
    assert client.delete('/api/v1/drivers/MISSING').status_code == 404
    assert client.post('/api/v1/drivers/MISSING/restore').status_code == 404


def test_list_rejects_unsupported_sort(client):
    response = client.get('/api/v1/drivers?sort=UNKNOWN')

    assert response.status_code == 400
    assert response.json['error']['code'] == 'invalid_query'
