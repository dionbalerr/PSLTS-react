function createDriver(index)
{
  return {
    DRIVER_NO: `DRV-${String(index).padStart(3, '0')}`,
    NAME: `Driver ${index}`,
    IC_NO: `900101-10-${String(index).padStart(4, '0')}`,
    LORRY_NO: `TRX ${String(1000 + index)}`,
    COMISSION: '5%',
    BASIC: '2500',
    ROAD_TAX: 'Valid',
    INSPECTION: 'Valid',
  }
}

function createDeliverySite(index)
{
  return {
    SITE_NO: `SITE-${String(index).padStart(3, '0')}`,
    ORIGINATE: `Origin ${index}`,
    DESTINATE: `Destination ${index}`,
    GOODS: 'General cargo',
    GROSS_PRC: `${1300 + index * 50}`,
    NET_PRC: `${1150 + index * 50}`,
    CLIENT_NO: `CLI-${String((index % 2) + 1).padStart(3, '0')}`,
  }
}

function createSupplier(index)
{
  return {
    SUPPLIER_NO: `SUP-${String(index).padStart(3, '0')}`,
    NAME: `Supplier ${index}`,
    TELEPHONE: `03-7700 ${String(3000 + index)}`,
    CONTACT: `Contact ${index}`,
    GOODS: 'Logistics supplies',
    TERMS: '30 days',
    CURR_BAL: `${index * 500}`,
  }
}

function createClient(index)
{
  return {
    CLIENT_NO: `CLI-${String(index).padStart(3, '0')}`,
    NAME_CO: `Client Company ${index}`,
    CONTACT: `Contact ${index}`,
    CONTACT_NO: `012400${String(1000 + index)}`,
    ADDRESS_1: `${index} Business Park`,
    ADDRESS_2: '',
    POSTCODE: `40${String(100 + index)}`,
    CITY: 'Kuala Lumpur',
  }
}

const drivers = [
  {
    DRIVER_NO: 'DRV-001',
    NAME: 'Ahmad Rahman',
    IC_NO: '880101-10-1234',
    LORRY_NO: 'WXY 1234',
    COMISSION: '5%',
    BASIC: '2500',
    ROAD_TAX: 'Valid',
    INSPECTION: 'Valid',
  },
  {
    DRIVER_NO: 'DRV-002',
    NAME: 'Siti Aminah',
    IC_NO: '900505-14-5678',
    LORRY_NO: 'VBC 5678',
    COMISSION: '5%',
    BASIC: '2500',
    ROAD_TAX: 'Valid',
    INSPECTION: 'Review',
  },
  {
    DRIVER_NO: 'DRIVER-IDENTIFIER-0003',
    NAME: 'Very Long Driver Name For Layout Testing',
    IC_NO: '900101-10-0003',
    LORRY_NO: 'LONG-PLATE-0003',
    COMISSION: '5%',
    BASIC: '2500',
    ROAD_TAX: 'Valid',
    INSPECTION: 'Valid',
  },
  ...Array.from({ length: 7 }, (_, index) => createDriver(index + 4)),
]

const deliverySites = [
  {
    SITE_NO: 'SITE-001',
    ORIGINATE: 'Klang',
    DESTINATE: 'Johor Bahru',
    GOODS: 'General cargo',
    GROSS_PRC: '1800',
    NET_PRC: '1600',
    CLIENT_NO: 'CLI-001',
  },
  {
    SITE_NO: 'SITE-002',
    ORIGINATE: 'Shah Alam',
    DESTINATE: 'Ipoh',
    GOODS: 'Pallets',
    GROSS_PRC: '1200',
    NET_PRC: '1050',
    CLIENT_NO: 'CLI-002',
  },
  ...Array.from({ length: 8 }, (_, index) => createDeliverySite(index + 3)),
]

const suppliers = [
  {
    SUPPLIER_NO: 'SUP-001',
    NAME: 'Westport Parts',
    TELEPHONE: '03-7788 1122',
    CONTACT: 'Lee Wei',
    GOODS: 'Vehicle parts',
    TERMS: '30 days',
    CURR_BAL: '4200',
  },
  {
    SUPPLIER_NO: 'SUP-002',
    NAME: 'RoadSafe Services',
    TELEPHONE: '03-8899 2244',
    CONTACT: 'Aina Yusuf',
    GOODS: 'Safety equipment',
    TERMS: 'COD',
    CURR_BAL: '0',
  },
  ...Array.from({ length: 8 }, (_, index) => createSupplier(index + 3)),
]

const clients = [
  {
    CLIENT_NO: 'CLI-001',
    NAME_CO: 'Acme Manufacturing',
    CONTACT: 'Marcus Tan',
    CONTACT_NO: '01234567890',
    ADDRESS_1: '12 Port Road',
    ADDRESS_2: '',
    POSTCODE: '42000',
    CITY: 'Port Klang',
  },
  {
    CLIENT_NO: 'CLI-002',
    NAME_CO: 'Northstar Retail and Distribution Services Sdn. Bhd.',
    CONTACT: 'Priya Kumar',
    CONTACT_NO: '0135550123',
    ADDRESS_1: '8 Central Avenue, Northern Industrial Logistics Park',
    ADDRESS_2: '',
    POSTCODE: '40150',
    CITY: 'Shah Alam',
  },
  ...Array.from({ length: 8 }, (_, index) => createClient(index + 3)),
]

export const masterData = {
  drivers,
  deliverySites,
  suppliers,
  clients,
}
