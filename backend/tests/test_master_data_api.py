import pytest


RESOURCE_CASES = [
    (
        'delivery-sites',
        {'SITE_NO': 'SITE-001', 'ORIGINATE': 'Origin', 'DESTINATE': 'Destination', 'GROSS_PRC': '12.50', 'NET_PRC': '10.00'},
        'SITE_NO',
    ),
    (
        'suppliers',
        {'SUPPLIER_NO': 'SUP-001', 'NAME': 'Supplier', 'TELEPHONE': '01234567890', 'CURR_BAL': '1.00'},
        'SUPPLIER_NO',
    ),
    (
        'clients',
        {'CLIENT_NO': 'CLI-001', 'NAME_CO': 'Client', 'CONTACT_NO': '01234567890'},
        'CLIENT_NO',
    ),
]


@pytest.mark.parametrize('path,payload,id_field', RESOURCE_CASES)
def test_master_data_resource_supports_crud_restore(client, path, payload, id_field):
    record_id = payload[id_field]
    create_response = client.post(f'/api/v1/{path}', json=payload)

    assert create_response.status_code == 201
    assert create_response.json['data'][id_field] == record_id
    assert client.get(f'/api/v1/{path}/{record_id}').status_code == 200

    update_response = client.patch(f'/api/v1/{path}/{record_id}', json={next(
        field for field in payload if field != id_field
    ): 'Updated'})
    assert update_response.status_code == 200
    assert client.delete(f'/api/v1/{path}/{record_id}').status_code == 200
    assert client.get(f'/api/v1/{path}/{record_id}').status_code == 404
    assert client.post(f'/api/v1/{path}/{record_id}/restore').status_code == 200


@pytest.mark.parametrize('path,payload', [
    ('delivery-sites', {'SITE_NO': 'SITE-002', 'ORIGINATE': 'A', 'DESTINATE': 'B', 'GROSS_PRC': '12.345'}),
    ('suppliers', {'SUPPLIER_NO': 'SUP-002', 'NAME': 'Supplier', 'TELEPHONE': '012-345'}),
    ('clients', {'CLIENT_NO': 'CLI-002', 'NAME_CO': 'Client', 'CONTACT_NO': '012 345'}),
])
def test_master_data_validation_rejects_invalid_values(client, path, payload):
    response = client.post(f'/api/v1/{path}', json=payload)

    assert response.status_code == 400
    assert response.json['error']['code'] == 'validation_error'


@pytest.mark.parametrize('path,payload,missing_field', [
    ('delivery-sites', {'SITE_NO': 'SITE-003', 'DESTINATE': 'B'}, 'ORIGINATE'),
    ('suppliers', {'SUPPLIER_NO': 'SUP-003'}, 'NAME'),
    ('clients', {'CLIENT_NO': 'CLI-003'}, 'NAME_CO'),
])
def test_master_data_validation_rejects_missing_required_fields(client, path, payload, missing_field):
    response = client.post(f'/api/v1/{path}', json=payload)

    assert response.status_code == 400
    assert response.json['error']['fields'][missing_field]


@pytest.mark.parametrize('path,payload', [
    ('delivery-sites', {'SITE_NO': 'SITE-004', 'ORIGINATE': 'A', 'DESTINATE': 'B'}),
    ('suppliers', {'SUPPLIER_NO': 'SUP-004', 'NAME': 'Supplier'}),
    ('clients', {'CLIENT_NO': 'CLI-004', 'NAME_CO': 'Client'}),
])
def test_master_data_rejects_duplicate_business_ids(client, path, payload):
    assert client.post(f'/api/v1/{path}', json=payload).status_code == 201
    duplicate_response = client.post(f'/api/v1/{path}', json=payload)

    assert duplicate_response.status_code == 409


def test_in_memory_money_sort_is_numeric(client):
    client.post('/api/v1/delivery-sites', json={'SITE_NO': 'SITE-100', 'ORIGINATE': 'A', 'DESTINATE': 'B', 'GROSS_PRC': '100.00'})
    client.post('/api/v1/delivery-sites', json={'SITE_NO': 'SITE-020', 'ORIGINATE': 'A', 'DESTINATE': 'B', 'GROSS_PRC': '20.00'})

    response = client.get('/api/v1/delivery-sites?sort=GROSS_PRC&direction=asc')

    assert response.json['data'][0]['SITE_NO'] == 'SITE-020'
