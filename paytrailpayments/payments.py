
import json
import requests
from hashlib import sha256
import re

class PaytrailException(Exception):
  def __init__(self, message=None, code=None, data=None):
    self.code = code
    self.message = message
    self.data = data

  def __str__(self):
    return self.message


class PaytrailResult(object):
  ''' Result from the Paytrail payment initialization
  '''

  def __init__(self, token, url):
    self.token = token
    self.url = url


class PaytrailUrlset(object):
  ''' URLs for the Paytrail API to call back to for status updates
  '''

  def __init__(self, success_url, failure_url, notification_url, pending_url=None):
    self.success_url = success_url
    self.failure_url = failure_url
    self.notification_url = notification_url
    # pending_url is not in use according to the documentation
    self.pending_url = pending_url


class PaytrailContact(object):
  ''' Contact data structure holds information about a payment
  actor. This information is saved with the payment and is available
  with the payment in merchant's panel.
  '''

  def __init__(self, first_name, last_name, email, street, postal_code, postal_office, country, telephone='', mobile='', company=''):
    self.first_name = first_name
    self.last_name = last_name
    self.email = email
    self.street = street
    self.postal_code = postal_code
    self.postal_office = postal_office
    self.country = country
    self.telephone = telephone
    self.mobile = mobile
    self.company = company

  def get_data(self):
    return {
      'telephone': self.telephone,
      'mobile': self.mobile,
      'email': self.email,
      'firstName': self.first_name,
      'lastName': self.last_name,
      'companyName': self.company,
      'address': {
        'street': self.street,
        'postalCode': self.postal_code,
        'postalOffice': self.postal_office,
        'country': self.country,
      },
    }


class PaytrailProduct(object):
  ''' One product equals one row in the payment.
  '''

  TYPE_NORMAL = 1
  TYPE_POSTAL = 2
  TYPE_HANDLING = 3

  def __init__(self, title, product_id, price, vat, amount=1, discount=0, type=TYPE_NORMAL, berth_type=''):
    self.title = title
    self.product_id = product_id
    self.amount = amount
    self.price = price
    self.vat = vat
    self.discount = discount
    self.type = type
    self.berth_type = berth_type

  def get_data(self):
    return {
      'title': self.title,
      'code': self.product_id,
      'amount': self.amount,
      'price': self.price,
      'vat': self.vat,
      'discount': self.discount,
      'type': self.type,
      'berth_type': self.berth_type,
    }


class BasePaytrailPayment(object):

  SUPPORTED_LOCALES = ['fi_FI', 'en_US', 'sv_SE']
  SUPPORTED_CURRENCIES = ['EUR',]
  default_locale = 'fi_FI'
  default_currency = 'EUR'

  def __init__(self, order_number, urlset, description='', locale=default_locale, currency=default_currency, reference_number='', service='', product='',  product_type=''):
    self.urlset = urlset
    # "Order number is used to identify one transaction from another in web shop software."
    self.order_number = order_number
    # "Any additional written information can be sent to Payment Gateway. It can be used
    # to back up order information like customer address, product information etc.
    # Order description is only visible through Merchant's Panel."
    self.description = description
    # Locale affects on default language and how amounts are shown on payment method selection page.
    # Available cultures are "fi_FI", "sv_SE" and "en_US". The default locale is always "fi_FI".
    self.locale = locale
    # Currency. Only EUR is accepted for Finnish banks and credit cards.
    self.currency = currency
    # reference_number is autogenerated by Paytrail.
    # Paytrail recommends against using a custom reference_number
    # For use cases and more information please see the documentation:
    # http://docs.paytrail.com/en/index-all.html
    self.reference_number = reference_number

    self.service = service
    self.product = product
    self.product_type = product_type

  def get_data(self):
    return {
      'orderNumber': self.service + '+' + self.product + '+' + str(self.product_type) + '+' + str(self.order_number),
      'referenceNumber': self.reference_number,
      'currency': self.currency,
      'locale': self.locale,
      'urlSet': {
        'success': self.urlset.success_url,
        'failure': self.urlset.failure_url,
        'pending': self.urlset.pending_url,
        'notification': self.urlset.notification_url,
      },
    }


class PaytrailPaymentSimple(BasePaytrailPayment):
  ''' Simple (S1) Paytrail payment. Contains only minimal payment details.
  '''

  def __init__(self, price, **kwargs):
    super(PaytrailPaymentSimple, self).__init__(**kwargs)
    self.price = price

  def get_data(self):
    data = super(PaytrailPaymentSimple, self).get_data()
    data['price'] = self.price
    return data


class PaytrailPaymentExtended(BasePaytrailPayment):
  ''' Extended (E1) Paytrail payment. May contain multiple product rows
  and payment actor contact details.
  '''

  _products = []

  def __init__(self, contact, is_vat_included=True, **kwargs):
    super(PaytrailPaymentExtended, self).__init__(**kwargs)
    self.contact = contact
    self.is_vat_included = is_vat_included
    self._products = []

  def add_product(self, product):
    if len(self._products) >= 500:
      raise PaytrailException('Paytrail can only handle up to 500 different product rows. Please group products using product amount.')
    self._products.append(product)

  def get_data(self):
    data = super(PaytrailPaymentExtended, self).get_data()
    data['orderDetails'] = {
      'includeVat': self._get_vat_mode(),
      'contact': self.contact.get_data(),
      'products': [p.get_data() for p in self._products],
    }
    return data

  def _get_vat_mode(self):
    return 1 if self.is_vat_included else 0


import urllib
import hashlib
class PaytrailArguments(object):
  def __init__(self, **kwargs):
    self.__dict__.update(kwargs)


  def remove_special_chars(self, text):
    return re.sub('[^A-Za-z0-9- "\',()\[\]{}*\/+\-_,.:&!?@#$£=*;~]+', '_', text)

  def get_data(self):
    data = {
      'MERCHANT_AUTH_HASH': self.merchant_auth_hash,
      'MERCHANT_ID': self.merchant_id,
      'URL_SUCCESS': self.url_success,
      'URL_CANCEL': self.url_cancel,
      'URL_NOTIFY': self.url_notify,
      'ORDER_NUMBER': self.order_number,
      'PARAMS_IN': self.params_in,
      'PARAMS_OUT': self.params_out,
      'PAYMENT_METHODS': self.payment_methods,
      'ITEM_TITLE[0]': self.remove_special_chars(self.item_title),
      'ITEM_ID[0]': self.item_id,
      'ITEM_QUANTITY[0]': self.item_quantity,
      'ITEM_UNIT_PRICE[0]': self.item_unit_price,
      'ITEM_VAT_PERCENT[0]': self.item_vat_percent,
      'ITEM_DISCOUNT_PERCENT[0]': self.item_discount_percent,
      'ITEM_TYPE[0]': self.item_type,
      'PAYER_PERSON_PHONE': self.payer_person_phone,
      'PAYER_PERSON_EMAIL': self.payer_person_email,
      'PAYER_PERSON_FIRSTNAME': self.remove_special_chars(self.payer_person_firstname),
      'PAYER_PERSON_LASTNAME': self.remove_special_chars(self.payer_parson_lastname),
      'PAYER_PERSON_ADDR_STREET': self.payer_person_addr_street,
      'PAYER_PERSON_ADDR_POSTAL_CODE': self.payer_person_add_postal_code,
      'PAYER_PERSON_ADDR_TOWN': self.payer_person_addr_town,
    }

    auth_code = data['MERCHANT_AUTH_HASH'] + '|' + \
      data['MERCHANT_ID'] + '|' + \
      data['URL_SUCCESS'] + '|' + \
      data['URL_CANCEL'] + '|' + \
      data['URL_NOTIFY'] + '|' + \
      str(data['ORDER_NUMBER']) + '|' + \
      data['PARAMS_IN'] + '|' + \
      data['PARAMS_OUT'] + '|' + \
      str(data['PAYMENT_METHODS']) + '|' + \
      data['ITEM_TITLE[0]'] + '|' + \
      str(data['ITEM_ID[0]']) + '|' + \
      str(data['ITEM_QUANTITY[0]']) + '|' + \
      str(data['ITEM_UNIT_PRICE[0]']) + '|' + \
      str(data['ITEM_VAT_PERCENT[0]']) + '|' + \
      str(data['ITEM_DISCOUNT_PERCENT[0]']) + '|' + \
      str(data['ITEM_TYPE[0]']) + '|' + \
      data['PAYER_PERSON_PHONE'] + '|' + \
      data['PAYER_PERSON_EMAIL'] + '|' + \
      data['PAYER_PERSON_FIRSTNAME'] + '|' + \
      data['PAYER_PERSON_LASTNAME'] + '|' + \
      data['PAYER_PERSON_ADDR_STREET'] + '|' + \
      data['PAYER_PERSON_ADDR_POSTAL_CODE'] + '|' + \
      data['PAYER_PERSON_ADDR_TOWN']

    auth_hash = sha256()
    auth_hash.update(auth_code.encode())
    data['AUTHCODE'] = auth_hash.hexdigest().upper()
    query_string = urllib.parse.urlencode(data, doseq=True)
    return query_string
    
class PaytrailAPIClient(object):

  SERVICE_URL = 'https://payment.paytrail.com'

  def __init__(self, merchant_id, merchant_secret):
    self.merchant_id = merchant_id
    self.merchant_secret = merchant_secret

  def initialize_payment(self, payment):
    url = self.SERVICE_URL + '/api-payment/create'
    payment_data = payment.get_data()
    r = self.request(url, payment_data)
    try:
      j = r.json()
    except Exception:
      raise PaytrailException(r.text, data=payment_data)
    if r.status_code != 201:
      raise PaytrailException(j['errorMessage'], j['errorCode'], data=payment_data)
    return PaytrailResult(j['token'], j['url'])

  def request(self, url, data):
    headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Verkkomaksut-Api-Version': '1',
    }
    auth = (self.merchant_id, self.merchant_secret)
    return requests.post(url, headers=headers, auth=auth, data=json.dumps(data))

  def validate_callback_data(self, data):
    try:
      # Validate success callback
      str_to_check = '%(PAYMENT_ID)s|%(TIMESTAMP)s|%(STATUS)s' % data
      str_to_check += '|%s' % self.merchant_secret
      checksum = sha256(str_to_check.encode('utf-8')).hexdigest().upper()
      return checksum == data['RETURN_AUTHCODE']
    except KeyError:
      try:
        # Validate failure callback
        str_to_check = '%(PAYMENT_ID)s|%(TIMESTAMP)s|%(STATUS)s' % data
        str_to_check += '|%s' % self.merchant_secret
        checksum = sha256(str_to_check.encode('utf-8')).hexdigest().upper()
        return checksum == data['RETURN_AUTHCODE']
      except KeyError:
        return False
