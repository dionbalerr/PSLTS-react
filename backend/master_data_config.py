from models.client import Client
from models.delivery_site import DeliverySite
from models.supplier import Supplier


MASTER_DATA_CONFIG = {
    'delivery_sites': {
        'model': DeliverySite,
        'id_field': 'SITE_NO',
        'id_column': DeliverySite.site_no,
        'field_map': {
            'SITE_NO': 'site_no',
            'ORIGINATE': 'originate',
            'DESTINATE': 'destinate',
            'GOODS': 'goods',
            'GROSS_PRC': 'gross_prc',
            'NET_PRC': 'net_prc',
            'CLIENT_NO': 'client_no',
        },
        'required': {'SITE_NO', 'ORIGINATE', 'DESTINATE'},
        'max_lengths': {
            'SITE_NO': 50, 'ORIGINATE': 200, 'DESTINATE': 200, 'GOODS': 200, 'CLIENT_NO': 50,
        },
        'money_fields': {'GROSS_PRC', 'NET_PRC'},
        'phone_fields': set(),
        'duplicate_code': 'duplicate_site_no',
        'duplicate_message': 'Site ID already exists.',
        'label': 'delivery site',
        'constraint': 'uq_delivery_sites_site_no',
    },
    'suppliers': {
        'model': Supplier,
        'id_field': 'SUPPLIER_NO',
        'id_column': Supplier.supplier_no,
        'field_map': {
            'SUPPLIER_NO': 'supplier_no',
            'NAME': 'name',
            'TELEPHONE': 'telephone',
            'CONTACT': 'contact',
            'GOODS': 'goods',
            'TERMS': 'terms',
            'CURR_BAL': 'curr_bal',
        },
        'required': {'SUPPLIER_NO', 'NAME'},
        'max_lengths': {
            'SUPPLIER_NO': 50, 'NAME': 200, 'TELEPHONE': 50, 'CONTACT': 200,
            'GOODS': 200, 'TERMS': 200,
        },
        'money_fields': {'CURR_BAL'},
        'phone_fields': {'TELEPHONE'},
        'duplicate_code': 'duplicate_supplier_no',
        'duplicate_message': 'Supplier ID already exists.',
        'label': 'supplier',
        'constraint': 'uq_suppliers_supplier_no',
    },
    'clients': {
        'model': Client,
        'id_field': 'CLIENT_NO',
        'id_column': Client.client_no,
        'field_map': {
            'CLIENT_NO': 'client_no',
            'NAME_CO': 'name_co',
            'CONTACT': 'contact',
            'CONTACT_NO': 'contact_no',
            'ADDRESS_1': 'address_1',
            'ADDRESS_2': 'address_2',
            'POSTCODE': 'postcode',
            'CITY': 'city',
        },
        'required': {'CLIENT_NO', 'NAME_CO'},
        'max_lengths': {
            'CLIENT_NO': 50, 'NAME_CO': 200, 'CONTACT': 200, 'CONTACT_NO': 50,
            'ADDRESS_1': 300, 'ADDRESS_2': 300, 'POSTCODE': 30, 'CITY': 100,
        },
        'money_fields': set(),
        'phone_fields': {'CONTACT_NO'},
        'duplicate_code': 'duplicate_client_no',
        'duplicate_message': 'Client ID already exists.',
        'label': 'client',
        'constraint': 'uq_clients_client_no',
    },
}
