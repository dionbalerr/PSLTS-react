function textField(key, label, options = {})
{
  return { key, label, type: 'text', ...options }
}

export const masterDataConfig = {
  drivers: {
    title: 'Drivers',
    singular: 'driver',
    description: 'View and maintain driver records.',
    idField: 'DRIVER_NO',
    columns: [
      textField('DRIVER_NO', 'Driver ID', { width: '110px' }),
      textField('NAME', 'Name', { width: '220px' }),
      textField('IC_NO', 'IC No.', { width: '140px' }),
      textField('LORRY_NO', 'Lorry No.', { width: '110px' }),
      textField('COMISSION', 'Commission', { width: '100px' }),
      textField('BASIC', 'Basic', { width: '90px' }),
      textField('ROAD_TAX', 'Road Tax', { width: '100px' }),
      textField('INSPECTION', 'Inspection', { width: '100px' }),
    ],
  },
  deliverySites: {
    title: 'Delivery Sites',
    singular: 'delivery site',
    description: 'View and maintain delivery site records.',
    idField: 'SITE_NO',
    columns: [
      textField('SITE_NO', 'Site ID', { width: '110px' }),
      textField('ORIGINATE', 'Originate', { width: '180px' }),
      textField('DESTINATE', 'Destinate', { width: '180px' }),
      textField('GOODS', 'Goods', { width: '140px' }),
      textField('GROSS_PRC', 'Gross Price', { width: '95px' }),
      textField('NET_PRC', 'Net Price', { width: '95px' }),
      textField('CLIENT_NO', 'Client ID', { width: '110px' }),
    ],
  },
  suppliers: {
    title: 'Suppliers',
    singular: 'supplier',
    description: 'View and maintain supplier records.',
    idField: 'SUPPLIER_NO',
    columns: [
      textField('SUPPLIER_NO', 'Supplier ID'),
      textField('NAME', 'Name'),
      textField('TELEPHONE', 'Telephone', { type: 'phone' }),
      textField('CONTACT', 'Contact'),
      textField('GOODS', 'Goods'),
      textField('TERMS', 'Terms'),
      textField('CURR_BAL', 'Current Balance'),
    ],
  },
  clients: {
    title: 'Clients',
    singular: 'client',
    description: 'View and maintain client records.',
    idField: 'CLIENT_NO',
    columns: [
      textField('CLIENT_NO', 'Client ID'),
      textField('NAME_CO', 'Company'),
      textField('CONTACT', 'Contact'),
      textField('CONTACT_NO', 'Contact No.', { type: 'phone' }),
      textField('ADDRESS_1', 'Address 1'),
      textField('ADDRESS_2', 'Address 2'),
      textField('POSTCODE', 'Postcode'),
      textField('CITY', 'City'),
    ],
  },
}
